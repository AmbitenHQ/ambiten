import 'dotenv/config';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { gql } from 'graphql-tag';
import type { GraphQLSchema } from 'graphql';
import { ObjectId } from 'mongodb';
import { redis } from '../redis-manager';
import { DB_CHANGE_EVENT } from '../utils';
import type {
  BootstrapClient,
  ModelContext,
  ResolverObject,
  TenraGraphQLOptions,
  TenraGraphQLContext
} from '../types';


export class TenraGraphQL {
  private typeDefs: string[] = [];
  private resolvers: ResolverObject[] = [];
  private readonly useRedis: boolean;
  private readonly provider: BootstrapClient;
  private subscriber: any = null;
  private publisher: any = null;

  constructor(private readonly options: TenraGraphQLOptions) {
    this.useRedis = options.useRedis !== false;
    this.typeDefs = options.customTypeDefs ?? [];
    this.resolvers = options.customResolvers ?? [];
    this.provider = options.provider;
  }

  customTypeDefs(schema: string | string[]): this {
    if (Array.isArray(schema)) {
      this.typeDefs.push(...schema);
    } else {
      this.typeDefs.push(schema);
    }
    return this;
  }

  customResolvers(resolver: Record<string, any>): this {
    this.resolvers.push(resolver);
    return this;
  }

  private toModelContext(
    context: TenraGraphQLContext,
    collectionName?: string
  ): ModelContext {
    return {
      tenantId: context.tenantId,
      dbName: context.dbName,
      collectionName: collectionName ?? context.collectionName,
      session: context.session
    };
  }

  private async getCollection(
    context: TenraGraphQLContext,
    collectionName: string
  ) {
    const ctx = this.toModelContext(context, collectionName);
    return context.provider.collection(collectionName, ctx);
  }

  private async ensureRedis(): Promise<void> {
    if (!this.useRedis) {
      return;
    }

    const client: any = await redis.get();
    if (!client) {
      return;
    }

    if (!client.isOpen && typeof client.connect === 'function') {
      await client.connect();
    }

    if (!this.publisher) {
      this.publisher = typeof client.duplicate === 'function' ? client.duplicate() : client;
      if (this.publisher?.connect && !this.publisher.isOpen) {
        await this.publisher.connect();
      }
    }

    if (!this.subscriber) {
      this.subscriber = typeof client.duplicate === 'function' ? client.duplicate() : client;
      if (this.subscriber?.connect && !this.subscriber.isOpen) {
        await this.subscriber.connect();
      }
    }
  }

  private async publishEvent(channel: string, payload: unknown): Promise<void> {
    if (!this.useRedis) {
      return;
    }

    await this.ensureRedis();

    const client: any = await redis.get();
    if (this.publisher?.publish) {
      await this.publisher.publish(channel, JSON.stringify(payload));
      return;
    }

    if (client?.publish) {
      await client.publish(channel, JSON.stringify(payload));
    }
  }

  private defaultTypeDefs() {
    return gql`
      scalar JSON

      type Document {
        _id: ID!
      }

      type Query {
        findOne(collection: String!, id: ID!): JSON
        findAll(collection: String!): [JSON!]!
      }

      type Mutation {
        insertOne(collection: String!, data: JSON!): JSON
        updateOne(collection: String!, id: ID!, data: JSON!): JSON
        deleteOne(collection: String!, id: ID!): Boolean
      }

      type Subscription {
        documentInserted(collection: String!): JSON
        documentUpdated(collection: String!): JSON
        documentDeleted(collection: String!): JSON
      }
    `;
  }

  private defaultResolvers() {
    return {
      Query: {
        findOne: async (
          _: unknown,
          { collection, id }: { collection: string; id: string },
          context: TenraGraphQLContext
        ) => {
          const col = await this.getCollection(context, collection);
          return col.findOne({ _id: new ObjectId(id) });
        },

        findAll: async (
          _: unknown,
          { collection }: { collection: string },
          context: TenraGraphQLContext
        ) => {
          const col = await this.getCollection(context, collection);
          return col.find({}).toArray();
        }
      },

      Mutation: {
        insertOne: async (
          _: unknown,
          { collection, data }: { collection: string; data: Record<string, unknown> },
          context: TenraGraphQLContext
        ) => {
          const col = await this.getCollection(context, collection);
          const result = await col.insertOne(data);
          const newDoc = await col.findOne({ _id: result.insertedId });

          await this.publishEvent(`${DB_CHANGE_EVENT}`, {
            documentInserted: {
              action: 'insertOne',
              collectionName: collection,
              doc: newDoc,
              tenantId: context.tenantId
            }
          });

          return newDoc;
        },

        updateOne: async (
          _: unknown,
          { collection, id, data }: { collection: string; id: string; data: Record<string, unknown> },
          context: TenraGraphQLContext
        ) => {
          const col = await this.getCollection(context, collection);

          await col.updateOne(
            { _id: new ObjectId(id) },
            { $set: data }
          );

          const updatedDoc = await col.findOne({ _id: new ObjectId(id) });

          await this.publishEvent(`${DB_CHANGE_EVENT}`, {
            documentUpdated: {
              action: 'updateOne',
              collectionName: collection,
              doc: updatedDoc,
              tenantId: context.tenantId
            }
          });

          return updatedDoc;
        },

        deleteOne: async (
          _: unknown,
          { collection, id }: { collection: string; id: string },
          context: TenraGraphQLContext
        ) => {
          const col = await this.getCollection(context, collection);
          const result = await col.deleteOne({ _id: new ObjectId(id) });

          if (result.deletedCount === 1) {
            await this.publishEvent(`${DB_CHANGE_EVENT}`, {
              documentDeleted: {
                action: 'deleteOne',
                collectionName: collection,
                id,
                tenantId: context.tenantId
              }
            });
            return true;
          }

          return false;
        }
      },

      Subscription: {
        documentInserted: {
          subscribe: async () => {
            if (!this.useRedis) {
              return null;
            }

            await this.ensureRedis();
            return this.subscriber;
          }
        },
        documentUpdated: {
          subscribe: async () => {
            if (!this.useRedis) {
              return null;
            }

            await this.ensureRedis();
            return this.subscriber;
          }
        },
        documentDeleted: {
          subscribe: async () => {
            if (!this.useRedis) {
              return undefined;
            }

            await this.ensureRedis();
            return this.subscriber;
          }
        }
      }
    };
  }

  subscriptions(): boolean {
    return this.useRedis;
  }

  async generateSchema(): Promise<GraphQLSchema> {
    await this.ensureRedis();

    return makeExecutableSchema({
      typeDefs: [this.defaultTypeDefs(), ...this.typeDefs],
      resolvers: [this.defaultResolvers(), ...this.resolvers]
    });
  }
};