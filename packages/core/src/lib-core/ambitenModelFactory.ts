import 'dotenv/config';
import {
  Collection,
  Db,
  Filter,
  OptionalUnlessRequiredId,
  UpdateFilter,
  AggregateOptions,
  ClientSession,
  AnyBulkWriteOperation,
  ChangeStreamDocument,
  ChangeStream,
  BulkWriteOptions,
  BulkWriteResult,
  ObjectId,
  FindOneAndDeleteOptions,
  WithId,
} from 'mongodb';
import type {
  User,
  Document,
  AmbitenModelOptions,
  EventType,
  DbProvider,
  ModelContext,
  ModelResult,
  ModelResultArray,
  AmbitenMiddlewareOperation,
  AmbitenMiddlewareHandler,
  AmbitenMiddlewareContext,
  QueryOptions,
  AmbitenCacheStats,
  AmbitenOperationMeta,
  AmbitenHookPayload,
  GCConfig,
} from '../types';
import { AmbitenClient } from './ambitenClient';
import { AmbitenSchema } from './ambitenSchema';
import EventEmitter from 'events';
import { PubSub } from 'graphql-subscriptions';
import { MultiTenantManager, TenantConfig } from '../tanancy';
import { redis } from '../redis-manager';
import {
  DB_CHANGE_EVENT,
  AmbitenModelRegistry,
  ErrorType,
  createAmbitenError,
} from '../utils';
import { AmbitenContext, runManualTransaction } from '../context';
import { measureQuery } from '../instrumentation';
import { debugLog } from '../debug';

const pubsub = new PubSub();


interface AmbitenCacheAdapter {
  get<R>(
    key: string,
    meta?: {
      ttlSeconds?: number;
      tenantId?: string;
      namespace?: string;
    }
  ): Promise<R | null>;
  set<R>(
    key: string,
    value: R,
    meta?: {
      ttlSeconds?: number;
      tenantId?: string;
      namespace?: string;
    }
  ): Promise<void>;
}

/**
 * A MongoDB-backed model with schema validation, middleware, multi-tenancy,
 * transactions, caching, soft-delete support, and query instrumentation.
 *
 * @typeParam T - The MongoDB document shape handled by this model.
 */
export class AmbitenModel<T extends Document> {
  private _provider!: DbProvider;
  private _collectionName!: string;
  private _collectionOverride?: Collection<T>;
  private _schema!: AmbitenSchema<T>;
  private _initialized = false;
  private _defaultCtx?: ModelContext;
  private readonly _modelGCConfig?: AmbitenModelOptions<T>['gcConfig'];
  private readonly _gcConfig?: GCConfig;
  private _gcTimer?: NodeJS.Timeout;
  private eventEmitter = new EventEmitter();

  private beforeMiddlewares = new Map<
    AmbitenMiddlewareOperation,
    AmbitenMiddlewareHandler<T>[]
  >();

  private afterMiddlewares = new Map<
    AmbitenMiddlewareOperation,
    AmbitenMiddlewareHandler<T>[]
  >();

  private _softDeleteConfig?: {
    deletedAtField: string;
    isDeletedField: string;
  };

  /**
   * Creates a new model instance.
   *
   * @param options - Model configuration including collection, schema, provider,
   * default context, and optional GC configuration.
   */
  constructor(options: AmbitenModelOptions<T>) {
    if (!options) {
      const message = 'AmbitenModel options are required.';
      throw createAmbitenError(
        ErrorType.NULL_OR_UNDEFINED,
        message,
        { details: { providedOptions: options, typeError: ErrorType.AmbitenModelError } }
      );
    }

    if (!options.collectionName) {
      const message = 'collectionName is required.';
      throw createAmbitenError(
        ErrorType.NULL_OR_UNDEFINED,
        message,
        { details: { providedOptions: options, typeError: ErrorType.AmbitenModelError } }
      );
    }

    this._collectionName = options.collectionName;
    this._schema =
      options.schema ?? new AmbitenSchema<T>({} as Record<keyof T, any>);
    this._provider = options.provider ?? AmbitenClient.init();
    this._collectionOverride = options.collection;
    this._modelGCConfig = options.gcConfig;

    if (options.ctx?.db) {
      const fixedDb = options.ctx.db;
      this._provider = { db: async () => fixedDb };
    }

    if (options.ctx?.tenantId || options.ctx?.dbName || options.ctx?.collectionName) {
      this._defaultCtx = {
        tenantId: options.ctx?.tenantId,
        dbName: options.ctx?.dbName,
        collectionName: options.ctx?.collectionName,
        db: options.ctx?.db,
        session: options.ctx?.session,
        config: options.ctx?.config,
      };
    }

    const schemaGCConfig = this.resolveSchemaGCConfig();

    if (this.isGCEnabled() || schemaGCConfig) {
      AmbitenModelRegistry.registerModel(this);
    }

    this.initMiddleware();
  }

  /**
   * Merges an explicit operation context with the model default context and the
   * current runtime context.
   *
   * @param ctx - Optional operation context.
   * @returns A merged context or `undefined` when no context values are present.
   */
  private mergeCtx(ctx?: ModelContext): ModelContext | undefined {
    const runtimeCtx = AmbitenContext.get();

    const merged: ModelContext = {
      tenantId: ctx?.tenantId ?? this._defaultCtx?.tenantId ?? runtimeCtx.tenantId,
      dbName: ctx?.dbName ?? this._defaultCtx?.dbName ?? runtimeCtx.dbName,
      db: ctx?.db ?? this._defaultCtx?.db,
      collectionName:
        ctx?.collectionName ??
        this._defaultCtx?.collectionName ??
        runtimeCtx.collectionName,
      config: ctx?.config ?? this._defaultCtx?.config,
      session: ctx?.session ?? this._defaultCtx?.session ?? runtimeCtx.session,
      withDeleted: ctx?.withDeleted,
      onlyDeleted: ctx?.onlyDeleted,
      hardDelete: ctx?.hardDelete,
    };

    return Object.values(merged).some((value) => value !== undefined)
      ? merged
      : undefined;
  }

  /**
   * Ensures a runtime Ambiten context exists before executing an instrumented action.
   *
   * This allows model methods to remain safe when invoked outside adapter-managed
   * request lifecycles while still preserving tenant-aware instrumentation.
   *
   * @param ctx - Optional model context.
   * @param action - The action to execute inside a runtime context.
   * @returns The action result.
   */
  private async runWithModelContext<R>(
    ctx: ModelContext | undefined,
    action: () => Promise<R>
  ): Promise<R> {
    if (AmbitenContext.hasActiveContext()) {
      return action();
    }

    const merged = this.mergeCtx(ctx);

    return AmbitenContext.run(
      {
        tenantId: merged?.tenantId,
        dbName: merged?.dbName,
        collectionName: merged?.collectionName ?? this._collectionName,
        session: merged?.session,
      },
      action
    );
  }

  private isGCEnabled(): boolean {
    return this._modelGCConfig?.enableGC === true;
  }

  private resolveSchemaGCConfig(): GCConfig | undefined {
    return this._schema.getGCConfig?.();
  }

  /**
   * Resolves the MongoDB collection for the current model and context.
   *
   * @param ctx - Optional model context.
   * @returns The resolved MongoDB collection.
   */
  private async getCollection(ctx?: ModelContext): Promise<Collection<T>> {
    if (this._collectionOverride) {
      return this._collectionOverride;
    }

    this.ensureConfigured();

    const db = await this.resolveDb(ctx);
    const collectionName = this.resolveCollectionName(ctx);

    debugLog('Resolved collection', {
      collectionName,
      dbName: db.databaseName,
      tenantId: this.mergeCtx(ctx)?.tenantId,
    });

    return db.collection<T>(collectionName);
  }

  /**
   * Resolves a registered tenant configuration.
   *
   * @param tenantId - The tenant identifier.
   * @returns The tenant configuration.
   */
  private getResolvedTenant(tenantId: string): TenantConfig {
    const tenant = MultiTenantManager.getTenant(tenantId);
    if (!tenant) {
      throw new Error(`Tenant "${tenantId}" is not registered.`);
    }
    return { ...tenant };
  }

  /**
   * Resolves the MongoDB database for the current operation.
   *
   * @param ctx - Optional model context.
   * @returns The resolved MongoDB database instance.
   */
  private async resolveDb(ctx?: ModelContext): Promise<Db> {
    const resolvedCtx = this.mergeCtx(ctx);

    if (resolvedCtx?.db) {
      return resolvedCtx.db;
    }

    if (resolvedCtx?.tenantId) {
      const tenant = this.getResolvedTenant(resolvedCtx.tenantId);
      const client = await MultiTenantManager.getClient(resolvedCtx.tenantId);

      if (!client) {
        throw new Error(
          `MongoClient for tenant "${resolvedCtx.tenantId}" is not available.`
        );
      }

      const dbName = resolvedCtx.dbName ?? tenant.dbName;
      if (!dbName) {
        throw new Error(
          `No database name configured for tenant "${resolvedCtx.tenantId}".`
        );
      }

      return client.db(dbName);
    }

    const db = await this._provider.db(resolvedCtx);

    if (!db || typeof (db as any).collection !== 'function') {
      throw new Error(
        `AmbitenModel: provider.db() did not return a valid Db instance for collection "${this._collectionName}".`
      );
    }

    return db;
  }

  /**
   * Resolves the collection name for the current operation.
   *
   * @param ctx - Optional model context.
   * @returns The collection name.
   */
  private resolveCollectionName(ctx?: ModelContext): string {
    const resolvedCtx = this.mergeCtx(ctx);
    const collectionName = resolvedCtx?.collectionName ?? this._collectionName;

    if (!collectionName || typeof collectionName !== 'string' || !collectionName.trim()) {
      throw new Error('AmbitenModel: collectionName is not configured.');
    }

    return collectionName.trim();
  }

  /**
   * Resolves the client session for the current operation.
   *
   * @param ctx - Optional model context.
   * @returns The MongoDB client session if available.
   */
  private resolveSession(ctx?: ModelContext): ClientSession | undefined {
    return this.mergeCtx(ctx)?.session;
  }

  /**
 * Resolves the MongoDB client session to use for an operation.
 *
 * Precedence order:
 * 1. Explicit externally supplied session
 * 2. Per-call model context session
 * 3. Active runtime session from AmbitenContext
 *
 * This ensures explicit caller intent always overrides implicit runtime state.
 *
 * @param ctx - Optional model execution context.
 * @param externalSession - Optional explicit session supplied by the caller.
 * @returns The resolved MongoDB client session, or `undefined` when no session is available.
 */
  private resolveSessionStrict(
    ctx?: ModelContext,
    externalSession?: ClientSession
  ): ClientSession | undefined {
    return externalSession ?? ctx?.session ?? AmbitenContext.getSession();
  }

  /**
   * Subscribes to a model event.
   *
   * @param event - Event type.
   * @param listener - Event listener callback.
   */
  on(event: EventType, listener: (...args: any[]) => void) {
    this.eventEmitter.on(event, listener);
  }

  /**
   * Subscribes to a model event once.
   *
   * @param event - Event type.
   * @param listener - Event listener callback.
   */
  once(event: EventType, listener: (...args: any[]) => void) {
    this.eventEmitter.once(event, listener);
  }

  /**
   * Removes a subscribed event listener.
   *
   * @param event - Event type.
   * @param listener - Event listener callback.
   */
  off(event: EventType, listener: (...args: any[]) => void) {
    this.eventEmitter.off(event, listener);
  }

  /**
   * Removes a specific event listener.
   *
   * @param event - Event type.
   * @param listener - Event listener callback.
   */
  removeListener(event: EventType, listener: (...args: any[]) => void) {
    this.eventEmitter.removeListener(event, listener);
  }

  /**
   * Ensures the model has the minimum configuration required to operate.
   */
  private ensureConfigured(): void {
    if (!this._collectionName || typeof this._collectionName !== 'string') {
      throw new Error('AmbitenModel: collectionName is not configured.');
    }

    if (!this._provider || typeof this._provider.db !== 'function') {
      throw new Error(
        'AmbitenModel: provider is not configured. Provide a valid DbProvider with a db(ctx) method.'
      );
    }
  }

  /**
   * Initializes the model by validating configuration, resolving the collection,
   * and creating the GC TTL index when enabled.
   */
  async init(): Promise<void> {
    if (this._initialized) return;

    try {
      this.ensureConfigured();

      if (!this._schema) {
        this._schema = new AmbitenSchema<T>({} as Record<keyof T, any>);
      }

      await this.getCollection();

      if (this.isGCEnabled() && this._modelGCConfig) {
        await this.ensureGCIndex(this._modelGCConfig);
      }

      this._initialized = true;
    } catch (error: any) {
      throw createAmbitenError(
        ErrorType.INITIALIZATION_ERROR,
        `Failed to initialize AmbitenModel: ${error?.message ?? String(error)}`,
        {
          details: {
            operation: 'init',
            TypeError: ErrorType.INITIALIZATION_ERROR,
          }
        }
      );
    }
  }

  /**
   * Returns a model instance bound to a default context.
   *
   * @param ctx - Context to bind to the cloned model.
   * @returns A cloned model instance with merged default context.
   */
  bind(ctx: ModelContext): AmbitenModel<T> {
    const clone = Object.create(this) as AmbitenModel<T>;
    clone._defaultCtx = { ...this._defaultCtx, ...ctx };
    return clone;
  }

  /**
   * Registers or reconfigures the model.
   *
   * @param options - Model registration options.
   */
  async registerModel(options: AmbitenModelOptions<T>): Promise<void> {
    const { ctx, collectionName, schema, collection } = options;

    if (!collectionName) {
      throw new Error('Collection name is required.');
    }

    this._collectionName = collectionName;
    this._collectionOverride = collection;
    this._schema = schema ?? new AmbitenSchema<T>({} as Record<keyof T, any>);

    if (ctx) {
      this._defaultCtx = {
        ...this._defaultCtx,
        ...ctx,
      };
    }

    this._initialized = false;
    this.ensureConfigured();
    await this.init();
  }

  /**
   * Ensures the TTL index used by the garbage collector exists.
   *
   * @param gc - GC configuration.
   */
  private async ensureGCIndex(
    gc: NonNullable<AmbitenModelOptions<T>['gcConfig']>
  ): Promise<void> {
    if (!gc.enableGC || !gc.ttl) {
      return;
    }

    const col = await this.getCollection();
    const field =
      gc.field ??
      gc.updatedAtField ??
      gc.createdAtField ??
      'updatedAt';

    await col.createIndex(
      { [field]: 1 },
      {
        expireAfterSeconds: gc.ttl,
        name: gc.indexName ?? `${this._collectionName}_${field}_ttl`,
        background: true
      }
    );
  }

  /**
   * Returns the schema attached to this model.
   */
  get schema(): AmbitenSchema<T> {
    return this._schema as AmbitenSchema<T>;
  }

  /**
   * Returns the schema attached to this model.
   */
  getSchema(): AmbitenSchema<T> {
    return this.schema;
  }

  /**
   * Validates a document against the model schema.
   * Throws an error if validation fails.
   * @param doc - Document to validate.
   */
  private validate(doc: OptionalUnlessRequiredId<T>): void {
    if (this._schema) {
      this._schema.validate(doc);
    }
  }

  /**
   * Validates a document asynchronously against the model schema.
   * Useful for schemas that perform async validation, such as checking uniqueness
   * @param doc - Document to validate.
   * @returns The validated document.
   */
  async validateAsync(doc: OptionalUnlessRequiredId<T>): Promise<T> {
    if (this._schema) {
      await this._schema.validateAsync(doc);
    }
    return doc as T;
  }

  /**
   * Initializes internal schema middleware for relationships, aggregation, and
   * change notifications. This is called during model initialization and ensures that all registered
   * middleware is set up before any operations are performed.
   */
  private initMiddleware() {
    if (!this._schema) return;

    this._schema.pre('create', async (ctx: AmbitenMiddlewareContext<T>) => {
      const doc = ctx.doc as OptionalUnlessRequiredId<T>;
      if (!doc) return;

      const relationships = this._schema.getRelationships() ?? [];

      for (const { ref, localField } of relationships) {
        const relatedCollection = (await this.getCollection()).db?.collection(ref);
        const filter = { [localField]: doc._id };

        await relatedCollection?.updateMany(filter, {
          $set: { [localField]: doc._id },
        });
      }
    });

    this._schema.post('create', async (ctx: AmbitenMiddlewareContext<T>) => {
      const doc = (ctx.result ?? ctx.doc) as T;
      if (!doc) return;

      const relationships = this._schema.getRelationships() ?? [];

      for (const { ref, localField } of relationships) {
        const relatedCollection = (await this.getCollection()).db?.collection(ref);
        const filter = { [localField]: (doc as any)._id };

        await relatedCollection?.updateOne(filter, {
          $set: { [localField]: (doc as any)._id },
        });
      }

      await pubsub.publish('DB_CHANGE', {
        dbChange: {
          action: 'create',
          doc,
        },
      });
    });

    this._schema.post('updateOne', async (ctx: AmbitenMiddlewareContext<T>) => {
      const filter = ctx.filter as Filter<T>;
      const update = ctx.update as UpdateFilter<T>;
      if (!filter || !update) return;

      const relationships = this._schema.getRelationships() ?? [];

      for (const { ref, localField } of relationships) {
        const relatedCollection = (await this.getCollection()).db?.collection(ref);
        const updateFilter = { [localField]: (update as any).$set?._id };

        await relatedCollection?.updateOne(updateFilter, {
          $set: { [localField]: (update as any).$set?._id },
        });
      }

      await pubsub.publish('DB_CHANGE', {
        dbChange: {
          action: 'updateOne',
          filter,
          update,
        },
      });
    });

    this._schema.pre('deleteOne', async (ctx: AmbitenMiddlewareContext<T>) => {
      const doc = (ctx.doc ?? ctx.result) as OptionalUnlessRequiredId<T>;
      if (!doc) return;

      const relationships = this._schema.getRelationships() ?? [];

      for (const { ref, localField } of relationships) {
        const relatedCollection = (await this.getCollection()).db?.collection(ref);
        const filter = { [localField]: doc._id };

        await relatedCollection?.deleteOne(filter);
      }
    });

    this._schema.pre('aggregate', async (ctx: AmbitenMiddlewareContext<T>) => {
      const pipeline = ctx.pipeline as Array<Record<string, any>>;
      if (!pipeline) return;

      const relationships = this._schema.getRelationships() ?? [];

      for (const { ref, localField } of relationships) {
        pipeline.unshift({
          $lookup: {
            from: ref,
            localField: localField as string,
            foreignField: '_id',
            as: ref,
          },
        });
      }
    });

    this._schema.post('aggregate', async (ctx: AmbitenMiddlewareContext<T>) => {
      const result = ctx.result as Document[];
      if (!result) return;

      const relationships = this._schema.getRelationships() ?? [];

      for (const doc of result) {
        for (const { ref } of relationships) {
          delete (doc as any)[ref];
        }
      }

      await pubsub.publish('DB_CHANGE', {
        dbChange: {
          action: 'aggregate',
          result,
        },
      });
    });
  }

  /**
   * Creates a new document in the model collection.
   *
   * This operation runs inside the active Ambiten runtime context, is instrumented
   * through {@link measureQuery}, executes registered create middlewares,
   * validates the incoming document against the model schema, triggers schema
   * create hooks, invalidates relevant cache patterns, and publishes a database
   * change event after successful insertion.
   *
   * @param doc - The document to insert.
   * @param ctx - Optional model execution context for tenant, database,
   * collection, session, and related runtime overrides.
   * @returns The created document as a normalized model result.
   * @throws {Error} When the provided document is missing or invalid.
   */
  async create(
    doc: OptionalUnlessRequiredId<T>,
    ctx?: ModelContext
  ): Promise<ModelResult<T>> {
    await this.init();

    if (!doc || typeof doc !== 'object') {
      throw new Error('Document must be a valid object.');
    }

    return this.runWithModelContext(ctx, async () =>
      measureQuery(
        {
          operation: 'create',
          collectionName: this.resolveCollectionName(ctx),
          documentCount: 1
        },
        async () => {
          const collectionName = this.resolveCollectionName(ctx);
          const session = this.resolveSession(ctx);
          const col = await this.getCollection(ctx);

          const middlewareCtx = this.buildMiddlewareContext('create', ctx, {
            doc: doc as Partial<T>
          });

          middlewareCtx.collectionName =
            middlewareCtx.collectionName ?? collectionName;

          await this.runBeforeMiddlewares('create', middlewareCtx);

          const nextDoc = (middlewareCtx.doc ?? doc) as OptionalUnlessRequiredId<T>;
          middlewareCtx.doc = nextDoc as Partial<T>;

          this.validate(nextDoc);

          await this.schema.executePre(
            'create',
            this.buildHookPayload('create', ctx, {
              collectionName: middlewareCtx.collectionName,
              tenantId: middlewareCtx.tenantId,
              dbName: middlewareCtx.dbName,
              session,
              doc: nextDoc as Partial<T>,
              meta: middlewareCtx.meta
            })
          );

          const insertResult = await col.insertOne(
            nextDoc,
            session ? { session } : undefined
          );

          const createdDoc = {
            ...nextDoc,
            _id: insertResult.insertedId
          } as WithId<T>;

          await this.schema.executePost(
            'create',
            this.buildHookPayload('create', ctx, {
              collectionName: middlewareCtx.collectionName,
              tenantId: middlewareCtx.tenantId,
              dbName: middlewareCtx.dbName,
              session,
              doc: createdDoc as Partial<T>,
              result: createdDoc,
              meta: middlewareCtx.meta
            })
          );

          const payload = this.toModelResult(createdDoc);
          middlewareCtx.result = payload;

          await this.runAfterMiddlewares('create', middlewareCtx);

          const finalResult = (middlewareCtx.result ?? payload) as ModelResult<T>;

          await this.invalidateCachePatterns('create', middlewareCtx);

          await pubsub.publish(`${DB_CHANGE_EVENT}`, {
            documentInserted: {
              action: 'create',
              collectionName: middlewareCtx.collectionName,
              doc: finalResult,
              meta: middlewareCtx.meta
            }
          });

          return finalResult;
        }
      )
    );
  }

  /**
 * Finds documents matching the provided filter.
 *
 * This operation runs inside the active Ambiten runtime context, is instrumented
 * through {@link measureQuery}, executes registered find middlewares, supports
 * optional result caching, triggers schema find hooks, and returns normalized
 * model results.
 *
 * @param filter - MongoDB filter used to match documents.
 * @param ctx - Optional model execution context for tenant, database,
 * collection, session, and related runtime overrides.
 * @param options - Optional query-level features such as caching.
 * @returns An array of normalized model results.
 * @throws {Error} When the filter is invalid.
 */
  async find(
    filter: Filter<T> = {},
    ctx?: ModelContext,
    options?: QueryOptions
  ): Promise<ModelResultArray<T>> {
    await this.init();

    if (!filter || typeof filter !== 'object') {
      throw new Error('Filter must be a valid object.');
    }

    return this.runWithModelContext(ctx, async () =>
      measureQuery(
        {
          operation: 'find',
          collectionName: this.resolveCollectionName(ctx),
          filter
        },
        async () => {
          const collectionName = this.resolveCollectionName(ctx);
          const session = this.resolveSession(ctx);
          const col = await this.getCollection(ctx);

          const middlewareCtx = this.buildMiddlewareContext('find', ctx, { filter });
          middlewareCtx.collectionName =
            middlewareCtx.collectionName ?? collectionName;

          await this.runBeforeMiddlewares('find', middlewareCtx);

          const effectiveFilter = (middlewareCtx.filter ?? filter) as Filter<T>;
          middlewareCtx.filter = effectiveFilter;

          const cache = options?.cache ? this.resolveCache(options) : null;

          await this.schema.executePre(
            'find',
            this.buildHookPayload('create', ctx, {
              collectionName: middlewareCtx.collectionName,
              tenantId: middlewareCtx.tenantId,
              dbName: middlewareCtx.dbName,
              session,
              filter: effectiveFilter,
              meta: middlewareCtx.meta
            })
          );

          let cacheKey: string | null = null;

          if (cache) {
            cacheKey = this.buildCacheKey('find', {
              collectionName: middlewareCtx.collectionName,
              filter: effectiveFilter,
              tenantId: middlewareCtx.tenantId,
              dbName: middlewareCtx.dbName
            });

            const cached = await cache.get<ModelResultArray<T>>(cacheKey, {
              ttlSeconds:
                typeof options?.cache === 'object' ? options.cache.ttl : undefined,
              tenantId: middlewareCtx.tenantId,
              namespace: middlewareCtx.collectionName
            });

            if (cached) {
              middlewareCtx.result = cached;

              await this.schema.executePost(
                'find',
                this.buildHookPayload('find', ctx, {
                  collectionName: middlewareCtx.collectionName,
                  tenantId: middlewareCtx.tenantId,
                  dbName: middlewareCtx.dbName,
                  session,
                  filter: effectiveFilter,
                  result: cached,
                  meta: {
                    ...(middlewareCtx.meta ?? {}),
                    cacheHit: true
                  }
                })
              );

              await this.runAfterMiddlewares('find', middlewareCtx);

              return (middlewareCtx.result ?? cached) as ModelResultArray<T>;
            }
          }

          const cursor = col.find(
            effectiveFilter,
            session ? { session } : undefined
          );

          const results = await cursor.toArray();
          const payload = this.toModelResults(results as WithId<T>[]);

          await this.schema.executePost(
            'find',
            this.buildHookPayload('find', ctx, {
              collectionName: middlewareCtx.collectionName,
              tenantId: middlewareCtx.tenantId,
              dbName: middlewareCtx.dbName,
              session,
              filter: effectiveFilter,
              result: payload,
              meta: middlewareCtx.meta
            })
          );

          middlewareCtx.result = payload;

          await this.runAfterMiddlewares('find', middlewareCtx);

          const finalResult = (middlewareCtx.result ?? payload) as ModelResultArray<T>;

          if (cache && cacheKey) {
            await cache.set(cacheKey, finalResult, {
              ttlSeconds:
                typeof options?.cache === 'object' ? options.cache.ttl : undefined,
              tenantId: middlewareCtx.tenantId,
              namespace: middlewareCtx.collectionName
            });
          }

          return finalResult;
        }
      )
    );
  }

  /**
 * Finds a single document matching the provided filter.
 *
 * This operation runs inside the active Ambiten runtime context, is instrumented
 * through {@link measureQuery}, executes registered findOne middlewares,
 * supports optional result caching, triggers schema find hooks, and returns a
 * normalized model result when a document is found.
 *
 * @param filter - MongoDB filter used to match the document.
 * @param ctx - Optional model execution context for tenant, database,
 * collection, session, and related runtime overrides.
 * @param options - Optional query-level features such as caching.
 * @returns The matched document as a normalized model result, or `null` if no document matched.
 * @throws {Error} When the filter is missing or invalid.
 */
  async findOne(
    filter: Filter<T>,
    ctx?: ModelContext,
    options?: QueryOptions
  ): Promise<ModelResult<T> | null> {
    await this.init();

    if (!filter || typeof filter !== 'object') {
      throw new Error('Filter must be a valid object.');
    }

    return this.runWithModelContext(ctx, async () =>
      measureQuery(
        {
          operation: 'findOne',
          collectionName: this.resolveCollectionName(ctx),
          filter
        },
        async () => {
          const collectionName = this.resolveCollectionName(ctx);
          const session = this.resolveSession(ctx);
          const col = await this.getCollection(ctx);

          const middlewareCtx = this.buildMiddlewareContext('findOne', ctx, {
            filter
          });

          middlewareCtx.collectionName =
            middlewareCtx.collectionName ?? collectionName;

          await this.runBeforeMiddlewares('findOne', middlewareCtx);

          const effectiveFilter = (middlewareCtx.filter ?? filter) as Filter<T>;
          middlewareCtx.filter = effectiveFilter;

          const cache = options?.cache ? this.resolveCache(options) : null;
          let cacheKey: string | null = null;

          await this.schema.executePre(
            'findOne',
            this.buildHookPayload('findOne', ctx, {
              collectionName: middlewareCtx.collectionName,
              tenantId: middlewareCtx.tenantId,
              dbName: middlewareCtx.dbName,
              session,
              filter: effectiveFilter,
              meta: middlewareCtx.meta
            })
          );

          if (cache) {
            cacheKey = this.buildCacheKey('findOne', {
              collectionName: middlewareCtx.collectionName,
              filter: effectiveFilter,
              tenantId: middlewareCtx.tenantId,
              dbName: middlewareCtx.dbName
            });

            const cached = await cache.get<ModelResult<T> | null>(cacheKey, {
              ttlSeconds:
                typeof options?.cache === 'object' ? options.cache.ttl : undefined,
              tenantId: middlewareCtx.tenantId,
              namespace: middlewareCtx.collectionName
            });

            if (cached !== null && cached !== undefined) {
              middlewareCtx.result = cached;

              await this.schema.executePost(
                'findOne',
                this.buildHookPayload('findOne', ctx, {
                  collectionName: middlewareCtx.collectionName,
                  tenantId: middlewareCtx.tenantId,
                  dbName: middlewareCtx.dbName,
                  session,
                  filter: effectiveFilter,
                  result: cached,
                  meta: {
                    ...(middlewareCtx.meta ?? {}),
                    cacheHit: true
                  }
                })
              );

              await this.runAfterMiddlewares('findOne', middlewareCtx);

              return (middlewareCtx.result ?? cached) as ModelResult<T> | null;
            }
          }

          const result = await col.findOne(
            effectiveFilter,
            session ? { session } : undefined
          );

          const payload = result
            ? this.toModelResult(result as WithId<T>)
            : null;

          await this.schema.executePost('findOne', {
            operation: 'findOne',
            collectionName: middlewareCtx.collectionName,
            tenantId: middlewareCtx.tenantId,
            dbName: middlewareCtx.dbName,
            session,
            filter: effectiveFilter,
            result: payload,
            meta: middlewareCtx.meta
          });

          middlewareCtx.result = payload;

          await this.runAfterMiddlewares('findOne', middlewareCtx);

          const finalResult = (middlewareCtx.result ?? payload) as ModelResult<T> | null;

          if (cache && cacheKey && finalResult !== null) {
            await cache.set(cacheKey, finalResult, {
              ttlSeconds:
                typeof options?.cache === 'object' ? options.cache.ttl : undefined,
              tenantId: middlewareCtx.tenantId,
              namespace: middlewareCtx.collectionName
            });
          }

          return finalResult;
        }
      )
    );
  }


  /**
  * Updates a single document matching the provided filter.
  *
  * This operation runs inside the active Ambiten runtime context, is instrumented
  * through {@link measureQuery}, executes registered update middlewares,
  * triggers schema update hooks, invalidates relevant cache patterns, and
  * publishes a database change event after completion.
  *
  * @param filter - MongoDB filter used to identify the document to update.
  * @param update - MongoDB update document to apply.
  * @param ctx - Optional model execution context for tenant, database,
  * collection, session, and related runtime overrides.
  * @returns A promise that resolves when the operation completes.
  * @throws {Error} When the filter is missing or invalid.
  * @throws {Error} When the update document is missing or invalid.
  */
  async updateOne(
    filter: Filter<T>,
    update: UpdateFilter<T>,
    ctx?: ModelContext
  ): Promise<void> {
    await this.init();

    if (!filter || typeof filter !== 'object') {
      throw new Error('Filter must be a valid object.');
    }

    if (!update || typeof update !== 'object') {
      throw new Error('Update must be a valid object.');
    }

    return this.runWithModelContext(ctx, async () =>
      measureQuery(
        {
          operation: 'updateOne',
          collectionName: this.resolveCollectionName(ctx),
          filter,
          update
        },
        async () => {
          const collectionName = this.resolveCollectionName(ctx);
          const session = this.resolveSession(ctx);
          const col = await this.getCollection(ctx);

          const middlewareCtx = this.buildMiddlewareContext('updateOne', ctx, {
            filter,
            update
          });

          middlewareCtx.collectionName =
            middlewareCtx.collectionName ?? collectionName;

          await this.runBeforeMiddlewares('updateOne', middlewareCtx);

          const effectiveFilter = (middlewareCtx.filter ?? filter) as Filter<T>;
          const effectiveUpdate = (middlewareCtx.update ?? update) as UpdateFilter<T>;

          middlewareCtx.filter = effectiveFilter;
          middlewareCtx.update = effectiveUpdate;

          await this.schema.executePre('updateOne', {
            operation: 'updateOne',
            collectionName: middlewareCtx.collectionName,
            tenantId: middlewareCtx.tenantId,
            dbName: middlewareCtx.dbName,
            session,
            filter: effectiveFilter,
            update: effectiveUpdate,
            meta: middlewareCtx.meta
          });

          const result = await col.updateOne(
            effectiveFilter,
            effectiveUpdate,
            session ? { session } : undefined
          );

          const updateResult = {
            acknowledged: result?.acknowledged,
            matchedCount: result?.matchedCount,
            modifiedCount: result?.modifiedCount,
            upsertedCount: result?.upsertedCount,
            upsertedId: result?.upsertedId
          };

          await this.schema.executePost('updateOne', {
            operation: 'updateOne',
            collectionName: middlewareCtx.collectionName,
            tenantId: middlewareCtx.tenantId,
            dbName: middlewareCtx.dbName,
            session,
            filter: effectiveFilter,
            update: effectiveUpdate,
            result: updateResult,
            meta: middlewareCtx.meta
          });

          middlewareCtx.result = updateResult;

          await this.runAfterMiddlewares('updateOne', middlewareCtx);
          await this.invalidateCachePatterns('updateOne', middlewareCtx);

          await pubsub.publish(`${DB_CHANGE_EVENT}`, {
            documentUpdated: {
              action: 'updateOne',
              collectionName: middlewareCtx.collectionName,
              filter: effectiveFilter,
              update: effectiveUpdate,
              result: updateResult,
              meta: middlewareCtx.meta
            }
          });
        }
      )
    );
  }

  /**
   * Inserts multiple documents into the model collection.
   *
   * This operation runs inside the active Ambiten runtime context, is instrumented
   * through {@link measureQuery}, executes registered bulkInsert middlewares,
   * validates each incoming document against the model schema, triggers schema
   * bulk insert hooks, invalidates relevant cache patterns, and publishes a
   * database change event after successful insertion.
   *
   * @param docs - The documents to insert.
   * @param ctx - Optional model execution context for tenant, database,
   * collection, session, and related runtime overrides.
   * @returns A promise that resolves when the operation completes.
   */
  async bulkInsert(
    docs: OptionalUnlessRequiredId<T>[],
    ctx?: ModelContext
  ): Promise<void> {
    await this.init();

    if (!Array.isArray(docs) || docs.length === 0) {
      return;
    }

    return this.runWithModelContext(ctx, async () =>
      measureQuery(
        {
          operation: 'bulkInsert',
          collectionName: this.resolveCollectionName(ctx),
          documentCount: docs.length
        },
        async () => {
          const collectionName = this.resolveCollectionName(ctx);
          const session = this.resolveSession(ctx);
          const col = await this.getCollection(ctx);

          const middlewareCtx = this.buildMiddlewareContext('bulkInsert', ctx, {
            docs: docs as Partial<T>[]
          });

          middlewareCtx.collectionName =
            middlewareCtx.collectionName ?? collectionName;

          await this.runBeforeMiddlewares('bulkInsert', middlewareCtx);

          const nextDocs = (middlewareCtx.docs ?? docs) as OptionalUnlessRequiredId<T>[];
          middlewareCtx.docs = nextDocs as Partial<T>[];

          if (!Array.isArray(nextDocs) || nextDocs.length === 0) {
            middlewareCtx.result = [];
            await this.runAfterMiddlewares('bulkInsert', middlewareCtx);
            return;
          }

          for (const nextDoc of nextDocs) {
            if (!nextDoc || typeof nextDoc !== 'object') {
              throw new Error('Each document must be a valid object.');
            }
            this.validate(nextDoc);
          }

          const meta = this.buildOperationMeta(middlewareCtx.meta, {
            bulkWrite: true
          })

          await this.schema.executePre(
            'bulkInsert',
            this.buildHookPayload('bulkInsert', ctx, {
              collectionName: middlewareCtx.collectionName,
              tenantId: middlewareCtx.tenantId,
              dbName: middlewareCtx.dbName,
              session,
              docs: nextDocs as Partial<T>[],
              meta
            }
            )
          );

          const result = await col.insertMany(nextDocs, {
            ordered: false,
            ...(session ? { session } : {})
          });

          const insertedDocs = nextDocs.map((doc, index) => ({
            ...doc,
            _id: result.insertedIds[index]
          })) as WithId<T>[];

          await this.schema.executePost(
            'bulkInsert',
            this.buildHookPayload('bulkInsert', ctx, {
              collectionName: middlewareCtx.collectionName,
              tenantId: middlewareCtx.tenantId,
              dbName: middlewareCtx.dbName,
              session,
              docs: insertedDocs as Partial<T>[],
              result: insertedDocs,
              meta
            })
          );

          middlewareCtx.result = this.toModelResults(insertedDocs);

          await this.runAfterMiddlewares('bulkInsert', middlewareCtx);
          await this.invalidateCachePatterns('bulkInsert', middlewareCtx);

          await pubsub.publish(`${DB_CHANGE_EVENT}`, {
            documentInserted: {
              action: 'bulkInsert',
              collectionName: middlewareCtx.collectionName,
              docs: middlewareCtx.result,
              meta
            }
          });
        }
      )
    );
  }

  /**
   * Updates multiple documents using MongoDB bulk write semantics.
   *
   * This operation runs inside the active Ambiten runtime context, is instrumented
   * through {@link measureQuery}, executes registered bulkUpdate middlewares,
   * triggers schema bulk update hooks, invalidates relevant cache patterns, and
   * publishes a database change event after completion.
   *
   * Each update entry is translated into an `updateOne` bulk operation using
   * `$set` with the provided partial update document.
   *
   * @param updates - Array of filter/update pairs to execute as bulk updates.
   * @param ctx - Optional model execution context for tenant, database,
   * collection, session, and related runtime overrides.
   * @returns A promise that resolves when the operation completes.
   * @throws {Error} When the updates payload is invalid.
   */
  async bulkUpdate(
    updates: { filter: Partial<T>; update: Partial<T> }[],
    ctx?: ModelContext
  ): Promise<void> {
    await this.init();

    if (!Array.isArray(updates)) {
      throw new Error('Updates must be a valid array.');
    }

    if (updates.length === 0) {
      return;
    }

    return this.runWithModelContext(ctx, async () =>
      measureQuery(
        {
          operation: 'bulkUpdate',
          collectionName: this.resolveCollectionName(ctx),
          documentCount: updates.length
        },
        async () => {
          const collectionName = this.resolveCollectionName(ctx);
          const session = this.resolveSession(ctx);
          const col = await this.getCollection(ctx);

          const middlewareCtx = this.buildMiddlewareContext('bulkUpdate', ctx, {
            bulkUpdates: updates
          });

          middlewareCtx.collectionName =
            middlewareCtx.collectionName ?? collectionName;

          await this.runBeforeMiddlewares('bulkUpdate', middlewareCtx);

          const nextUpdates = middlewareCtx.bulkUpdates ?? updates;
          middlewareCtx.bulkUpdates = nextUpdates;

          const meta = this.buildOperationMeta(middlewareCtx.meta, {
            bulkWrite: true
          });
          middlewareCtx.meta = meta;

          if (!Array.isArray(nextUpdates) || nextUpdates.length === 0) {
            middlewareCtx.result = {
              acknowledged: true,
              matchedCount: 0,
              modifiedCount: 0,
              upsertedCount: 0,
              insertedCount: 0,
              deletedCount: 0
            };

            await this.runAfterMiddlewares('bulkUpdate', middlewareCtx);
            return;
          }

          for (const entry of nextUpdates) {
            if (!entry || typeof entry !== 'object') {
              throw new Error('Each bulk update entry must be a valid object.');
            }

            if (!entry.filter || typeof entry.filter !== 'object') {
              throw new Error('Each bulk update filter must be a valid object.');
            }

            if (!entry.update || typeof entry.update !== 'object') {
              throw new Error('Each bulk update document must be a valid object.');
            }
          }

          const bulkOps: AnyBulkWriteOperation<T>[] = nextUpdates.map(
            ({ filter, update }) => ({
              updateOne: {
                filter: filter as Filter<T>,
                update: { $set: update } as UpdateFilter<T>
              }
            })
          );

          await this.schema.executePre(
            'bulkUpdate',
            this.buildHookPayload('bulkUpdate', ctx, {
              collectionName: middlewareCtx.collectionName,
              tenantId: middlewareCtx.tenantId,
              dbName: middlewareCtx.dbName,
              session,
              bulkUpdates: nextUpdates,
              meta
            })
          );

          const result = await col.bulkWrite(bulkOps, {
            ordered: false,
            ...(session ? { session } : {})
          });

          const bulkResult = {
            acknowledged: result?.isOk?.() ?? true,
            matchedCount: result?.matchedCount,
            modifiedCount: result?.modifiedCount,
            upsertedCount: result?.upsertedCount,
            insertedCount: result?.insertedCount,
            deletedCount: result?.deletedCount
          };

          await this.schema.executePost(
            'bulkUpdate',
            this.buildHookPayload('bulkUpdate', ctx, {
              collectionName: middlewareCtx.collectionName,
              tenantId: middlewareCtx.tenantId,
              dbName: middlewareCtx.dbName,
              session,
              bulkUpdates: nextUpdates,
              result: bulkResult,
              meta
            })
          );

          middlewareCtx.result = bulkResult;

          await this.runAfterMiddlewares('bulkUpdate', middlewareCtx);
          await this.invalidateCachePatterns('bulkUpdate', middlewareCtx);

          await pubsub.publish(`${DB_CHANGE_EVENT}`, {
            documentUpdated: {
              action: 'bulkUpdate',
              collectionName: middlewareCtx.collectionName,
              bulkUpdates: nextUpdates,
              result: bulkResult,
              meta
            }
          });
        }
      )
    );
  }


  /**
  * Deletes a single document matching the provided filter.
  *
  * This operation runs inside the active Ambiten runtime context, is instrumented
  * through {@link measureQuery}, executes registered delete middlewares,
  * supports middleware-driven soft delete flows, triggers schema delete or
  * update hooks as appropriate, invalidates relevant cache patterns, and
  * publishes a database change event after completion.
  *
  * When middleware metadata enables soft delete, the matched document is updated
  * instead of being physically removed from the collection.
  *
  * @param filter - MongoDB filter used to identify the document to delete.
  * @param ctx - Optional model execution context for tenant, database,
  * collection, session, and related runtime overrides.
  * @returns A promise that resolves when the operation completes.
  * @throws {Error} When the filter is missing or invalid.
  * @throws {Error} When soft delete is enabled but no softDeleteUpdate payload is provided.
  */
  async deleteOne(
    filter: Filter<T>,
    ctx?: ModelContext
  ): Promise<void> {
    await this.init();

    if (!filter || typeof filter !== 'object') {
      throw new Error('Filter must be a valid object.');
    }

    return this.runWithModelContext(ctx, async () =>
      measureQuery(
        {
          operation: 'deleteOne',
          collectionName: this.resolveCollectionName(ctx),
          filter
        },
        async () => {
          const collectionName = this.resolveCollectionName(ctx);
          const session = this.resolveSession(ctx);
          const col = await this.getCollection(ctx);

          const middlewareCtx = this.buildMiddlewareContext('deleteOne', ctx, {
            filter
          });

          middlewareCtx.collectionName =
            middlewareCtx.collectionName ?? collectionName;

          await this.runBeforeMiddlewares('deleteOne', middlewareCtx);

          const effectiveFilter = (middlewareCtx.filter ?? filter) as Filter<T>;
          middlewareCtx.filter = effectiveFilter;

          const doc = await col.findOne(
            effectiveFilter,
            session ? { session } : undefined
          );

          if (!doc) {
            middlewareCtx.result = null;
            await this.runAfterMiddlewares('deleteOne', middlewareCtx);
            return;
          }

          const payload = this.toModelResult(doc as WithId<T>);
          middlewareCtx.result = payload;

          const meta = this.buildOperationMeta(middlewareCtx.meta);
          middlewareCtx.meta = meta;

          if (meta.softDelete === true) {
            const softDeleteUpdate = middlewareCtx.update;

            if (!softDeleteUpdate) {
              throw new Error(
                'Soft delete is enabled but no soft delete update payload was provided.'
              );
            }

            await this.schema.executePre(
              'updateOne',
              this.buildHookPayload('deleteOne', ctx, {
                collectionName: middlewareCtx.collectionName,
                tenantId: middlewareCtx.tenantId,
                dbName: middlewareCtx.dbName,
                session,
                filter: effectiveFilter,
                update: softDeleteUpdate,
                result: payload,
                meta
              })
            );

            await col.updateOne(
              effectiveFilter,
              softDeleteUpdate,
              session ? { session } : undefined
            );

            await this.schema.executePost(
              'updateOne',
              this.buildHookPayload('deleteOne', ctx, {
                collectionName: middlewareCtx.collectionName,
                tenantId: middlewareCtx.tenantId,
                dbName: middlewareCtx.dbName,
                session,
                filter: effectiveFilter,
                update: softDeleteUpdate,
                result: payload,
                meta
              })
            );
          } else {
            await this.schema.triggerMiddleware('pre', 'deleteOne', {
              operation: 'deleteOne',
              collectionName: middlewareCtx.collectionName,
              ...payload
            });

            await this.schema.executePre(
              'deleteOne',
              this.buildHookPayload('deleteOne', ctx, {
                collectionName: middlewareCtx.collectionName,
                tenantId: middlewareCtx.tenantId,
                dbName: middlewareCtx.dbName,
                session,
                doc: payload as Partial<T>,
                result: payload,
                meta
              })
            );

            await col.deleteOne(
              effectiveFilter,
              session ? { session } : undefined
            );

            await this.schema.triggerMiddleware('post', 'deleteOne', {
              operation: 'deleteOne',
              collectionName: middlewareCtx.collectionName,
              ...payload
            });

            await this.schema.executePost(
              'deleteOne',
              this.buildHookPayload('deleteOne', ctx, {
                collectionName: middlewareCtx.collectionName,
                tenantId: middlewareCtx.tenantId,
                dbName: middlewareCtx.dbName,
                session,
                doc: payload as Partial<T>,
                result: payload,
                meta
              })
            );
          }

          await this.runAfterMiddlewares('deleteOne', middlewareCtx);
          await this.invalidateCachePatterns('deleteOne', middlewareCtx);

          await pubsub.publish(`${DB_CHANGE_EVENT}`, {
            documentDeleted: {
              action: meta.softDelete ? 'softDelete' : 'deleteOne',
              collectionName: middlewareCtx.collectionName,
              filter: effectiveFilter,
              meta: middlewareCtx.meta
            }
          });
        }
      )
    );
  }

  /**
  * Deletes multiple documents matching the provided filter.
  *
  * This operation runs inside the active Ambiten runtime context, is instrumented
  * through {@link measureQuery}, executes registered deleteMany middlewares,
  * supports middleware-driven soft delete flows, triggers schema delete or
  * update hooks as appropriate, invalidates relevant cache patterns, and
  * publishes a database change event after completion.
  *
  * When middleware metadata enables soft delete, matched documents are updated
  * instead of being physically removed from the collection.
  *
  * @param filter - MongoDB filter used to identify the documents to delete.
  * @param ctx - Optional model execution context for tenant, database,
  * collection, session, and related runtime overrides.
  * @returns A promise that resolves when the operation completes.
  * @throws {Error} When the filter is missing or invalid.
  * @throws {Error} When soft delete is enabled but no softDeleteUpdate payload is provided.
  */
  async deleteMany(
    filter: Filter<T>,
    ctx?: ModelContext
  ): Promise<void> {
    await this.init();

    if (!filter || typeof filter !== 'object') {
      throw new Error('Filter must be a valid object.');
    }

    return this.runWithModelContext(ctx, async () =>
      measureQuery(
        {
          operation: 'deleteMany',
          collectionName: this.resolveCollectionName(ctx),
          filter
        },
        async () => {
          const collectionName = this.resolveCollectionName(ctx);
          const session = this.resolveSession(ctx);
          const col = await this.getCollection(ctx);

          const middlewareCtx = this.buildMiddlewareContext('deleteMany', ctx, {
            filter
          });

          middlewareCtx.collectionName =
            middlewareCtx.collectionName ?? collectionName;

          await this.runBeforeMiddlewares('deleteMany', middlewareCtx);

          const effectiveFilter = (middlewareCtx.filter ?? filter) as Filter<T>;
          middlewareCtx.filter = effectiveFilter;

          const meta = this.buildOperationMeta(middlewareCtx.meta);
          middlewareCtx.meta = meta;

          const docs = await col.find(
            effectiveFilter,
            session ? { session } : undefined
          ).toArray();

          if (docs.length === 0) {
            middlewareCtx.result = {
              deletedCount: 0,
              docs: []
            };

            await this.runAfterMiddlewares('deleteMany', middlewareCtx);
            return;
          }

          const existingDocs = this.toModelResults(docs as WithId<T>[]);

          if (meta.softDelete === true) {
            const softDeleteUpdate = middlewareCtx.update;

            if (!softDeleteUpdate) {
              throw new Error(
                'Soft delete is enabled but no soft delete update payload was provided.'
              );
            }

            const softDeleteMeta = this.buildOperationMeta(meta, {
              softDelete: true
            });

            await this.schema.executePre(
              'updateMany',
              this.buildHookPayload('deleteMany', ctx, {
                collectionName: middlewareCtx.collectionName,
                tenantId: middlewareCtx.tenantId,
                dbName: middlewareCtx.dbName,
                session,
                filter: effectiveFilter,
                update: softDeleteUpdate,
                docs: docs as Partial<T>[],
                result: existingDocs,
                meta: softDeleteMeta
              })
            );

            const result = await col.updateMany(
              effectiveFilter,
              softDeleteUpdate,
              session ? { session } : undefined
            );

            const softDeleteResult = {
              deletedCount: result.modifiedCount,
              docs: existingDocs,
              softDeleted: true
            };

            await this.schema.executePost(
              'updateMany',
              this.buildHookPayload('deleteMany', ctx, {
                collectionName: middlewareCtx.collectionName,
                tenantId: middlewareCtx.tenantId,
                dbName: middlewareCtx.dbName,
                session,
                filter: effectiveFilter,
                update: softDeleteUpdate,
                docs: docs as Partial<T>[],
                result: softDeleteResult,
                meta: softDeleteMeta
              })
            );

            middlewareCtx.result = softDeleteResult;
          } else {
            await this.schema.triggerMiddleware('pre', 'deleteMany', {
              operation: 'deleteMany',
              collectionName: middlewareCtx.collectionName,
              docs: docs as Partial<T>[]
            });

            await this.schema.executePre(
              'deleteMany',
              this.buildHookPayload('deleteMany', ctx, {
                collectionName: middlewareCtx.collectionName,
                tenantId: middlewareCtx.tenantId,
                dbName: middlewareCtx.dbName,
                session,
                docs: docs as Partial<T>[],
                result: existingDocs,
                meta
              })
            );

            const result = await col.deleteMany(
              effectiveFilter,
              session ? { session } : undefined
            );

            const deleteResult = {
              deletedCount: result?.deletedCount ?? 0,
              docs: existingDocs
            };

            await this.schema.triggerMiddleware('post', 'deleteMany', {
              operation: 'deleteMany',
              collectionName: middlewareCtx.collectionName,
              docs: docs as Partial<T>[]
            });

            await this.schema.executePost(
              'deleteMany',
              this.buildHookPayload('deleteMany', ctx, {
                collectionName: middlewareCtx.collectionName,
                tenantId: middlewareCtx.tenantId,
                dbName: middlewareCtx.dbName,
                session,
                docs: docs as Partial<T>[],
                result: deleteResult,
                meta
              })
            );

            middlewareCtx.result = deleteResult;
          }

          await this.runAfterMiddlewares('deleteMany', middlewareCtx);
          await this.invalidateCachePatterns('deleteMany', middlewareCtx);

          await pubsub.publish(`${DB_CHANGE_EVENT}`, {
            documentDeleted: {
              action: meta.softDelete ? 'softDeleteMany' : 'deleteMany',
              collectionName: middlewareCtx.collectionName,
              filter: effectiveFilter,
              result: middlewareCtx.result,
              meta: middlewareCtx.meta
            }
          });
        }
      )
    );
  }

  /**
   * Populates a single reference field on a document by resolving the related
   * document from another model.
   *
   * This helper performs a follow-up lookup using the referenced field value as
   * the `_id` of the related document. If the target field is empty or
   * undefined, the original document is returned unchanged.
   *
   * @typeParam K - The related model document type.
   * @param doc - The source document containing the reference field.
   * @param field - The field on the source document that stores the related document identifier.
   * @param relatedModel - The model used to resolve the related document.
   * @returns The source document with the populated field replaced by the related
   * document result, or `null` when the input document is invalid.
   */
  async populateOne<K extends Document>(
    doc: T,
    field: keyof T,
    relatedModel: AmbitenModel<K>
  ): Promise<(T & Record<string, unknown>) | null> {
    await this.init();

    if (!doc || typeof doc !== 'object') {
      return null;
    }

    const referenceValue = doc[field];

    if (referenceValue === undefined || referenceValue === null) {
      return doc as T & Record<string, unknown>;
    }

    const relatedDoc = await relatedModel.findOne({
      _id: referenceValue
    } as Filter<K>);

    return {
      ...doc,
      [field]: relatedDoc
    } as T & Record<string, unknown>;
  }

  /**
  * Populates an array reference field on a document by resolving the related
  * documents from another model.
  *
  * This helper performs a follow-up lookup using the referenced field values as
  * `_id` values of the related documents. If the target field is empty,
  * undefined, or not an array, the original document is returned unchanged.
  *
  * @typeParam K - The related model document type.
  * @param doc - The source document containing the reference array field.
  * @param field - The field on the source document that stores related document identifiers.
  * @param relatedModel - The model used to resolve the related documents.
  * @returns The source document with the populated field replaced by the related
  * document results, or `null` when the input document is invalid.
  */
  async populateMany<K extends Document>(
    doc: T,
    field: keyof T,
    relatedModel: AmbitenModel<K>
  ): Promise<(T & Record<string, unknown>) | null> {
    await this.init();

    if (!doc || typeof doc !== 'object') {
      return null;
    }

    const referenceValues = doc[field];

    if (!Array.isArray(referenceValues) || referenceValues.length === 0) {
      return doc as T & Record<string, unknown>;
    }

    const relatedDocs = await relatedModel.find({
      _id: { $in: referenceValues }
    } as Filter<K>);

    return {
      ...doc,
      [field]: relatedDocs
    } as T & Record<string, unknown>;
  }

  /**
 * Creates a new document inside a transaction-aware runtime context.
 *
 * This transactional variant runs within the active Ambiten runtime context,
 * executes registered create middlewares, validates the incoming document,
 * triggers schema create hooks with transactional metadata, invalidates
 * relevant cache patterns, and publishes a database change event after
 * successful insertion.
 *
 * @param doc - The document to insert.
 * @param ctx - Optional model execution context for tenant, database,
 * collection, session, and transaction-aware runtime overrides.
 * @returns The created document as a normalized model result.
 * @throws {Error} When the provided document is missing or invalid.
 */
  async createWithTransaction(
    doc: OptionalUnlessRequiredId<T>,
    ctx?: ModelContext
  ): Promise<ModelResult<T>> {
    await this.init();

    if (!doc || typeof doc !== 'object') {
      throw new Error('Document must be a valid object.');
    }

    return this.runWithModelContext(ctx, async () =>
      this.withTransaction(
        async () =>
          measureQuery(
            {
              operation: 'create',
              collectionName: this.resolveCollectionName(ctx),
              documentCount: 1
            },
            async () => {
              const collectionName = this.resolveCollectionName(ctx);
              const session = this.resolveSession(ctx);
              const col = await this.getCollection(ctx);

              const middlewareCtx = this.buildMiddlewareContext('create', ctx, {
                doc: doc as Partial<T>,
                meta: { transactional: true }
              });

              middlewareCtx.collectionName =
                middlewareCtx.collectionName ?? collectionName;

              await this.runBeforeMiddlewares('create', middlewareCtx);

              const nextDoc = (middlewareCtx.doc ?? doc) as OptionalUnlessRequiredId<T>;
              middlewareCtx.doc = nextDoc as Partial<T>;

              const meta = this.buildOperationMeta(middlewareCtx.meta, {
                transactional: true
              })

              this.validate(nextDoc);

              await this.schema.executePre(
                'create',
                this.buildHookPayload('create', ctx, {
                  collectionName: middlewareCtx.collectionName,
                  tenantId: middlewareCtx.tenantId,
                  dbName: middlewareCtx.dbName,
                  session,
                  doc: nextDoc as Partial<T>,
                  meta
                })
              );

              const result = await col.insertOne(
                nextDoc,
                session ? { session } : undefined
              );

              const createdDoc = {
                ...nextDoc,
                _id: result.insertedId
              } as WithId<T>;

              await this.schema.executePost(
                'create',
                this.buildHookPayload('create', ctx, {
                  operation: 'create',
                  collectionName: middlewareCtx.collectionName,
                  tenantId: middlewareCtx.tenantId,
                  dbName: middlewareCtx.dbName,
                  session,
                  doc: createdDoc as Partial<T>,
                  result: createdDoc,
                  meta
                })
              );

              const payload = this.toModelResult(createdDoc);
              middlewareCtx.result = payload;

              await this.runAfterMiddlewares('create', middlewareCtx);
              await this.invalidateCachePatterns('create', middlewareCtx);

              const finalResult = (middlewareCtx.result ?? payload) as ModelResult<T>;

              await pubsub.publish(`${DB_CHANGE_EVENT}`, {
                documentInserted: {
                  action: 'create',
                  collectionName: middlewareCtx.collectionName,
                  doc: finalResult,
                  meta
                }
              });

              return finalResult;
            }
          ),
        ctx
      )
    );
  }


  /**
 * Executes multiple MongoDB bulk write operations inside a transaction-aware
 * runtime context.
 *
 * This transactional variant runs within the active Ambiten runtime context,
 * executes registered bulk update middlewares, triggers schema bulk update
 * hooks with transactional metadata, invalidates relevant cache patterns, and
 * publishes a database change event after completion.
 *
 * @param operations - MongoDB bulk write operations to execute.
 * @param options - Optional MongoDB bulk write options.
 * @param ctx - Optional model execution context for tenant, database,
 * collection, session, and transaction-aware runtime overrides.
 * @returns The MongoDB bulk write result.
 * @throws {Error} When the operations payload is missing or invalid.
 */
  async bulkWriteWithTransaction(
    operations: AnyBulkWriteOperation<T>[],
    options: BulkWriteOptions = {},
    ctx?: ModelContext
  ): Promise<BulkWriteResult> {
    await this.init();

    if (!Array.isArray(operations)) {
      throw new Error('Operations must be a valid array.');
    }

    if (operations.length === 0) {
      throw new Error('Operations array must not be empty.');
    }

    return this.runWithModelContext(ctx, async () =>
      this.withTransaction(
        async () =>
          measureQuery(
            {
              operation: 'bulkWrite',
              collectionName: this.resolveCollectionName(ctx),
              documentCount: operations.length,
              extra: {
                bulkWrite: true
              }
            },
            async () => {
              const collectionName = this.resolveCollectionName(ctx);
              const session = this.resolveSession(ctx);
              const col = await this.getCollection(ctx);

              const middlewareCtx = this.buildMiddlewareContext('bulkUpdate', ctx, {
                bulkOperations: operations,
                meta: {
                  transactional: true,
                  bulkWrite: true
                }
              });

              middlewareCtx.collectionName =
                middlewareCtx.collectionName ?? collectionName;

              await this.runBeforeMiddlewares('bulkUpdate', middlewareCtx);

              const nextOperations = middlewareCtx.bulkOperations ?? operations;
              middlewareCtx.bulkOperations = nextOperations;

              const meta = this.buildOperationMeta(middlewareCtx.meta, {
                transactional: true,
                bulkWrite: true
              });
              middlewareCtx.meta = meta;

              await this.schema.executePre(
                'bulkUpdate',
                this.buildHookPayload('bulkUpdate', ctx, {
                  collectionName: middlewareCtx.collectionName,
                  tenantId: middlewareCtx.tenantId,
                  dbName: middlewareCtx.dbName,
                  session,
                  bulkOperations: nextOperations,
                  meta
                })
              );

              const result = await col.bulkWrite(nextOperations, {
                ...options,
                ...(session ? { session } : {})
              });

              const bulkResultSummary = {
                acknowledged: result?.isOk?.() ?? true,
                matchedCount: result?.matchedCount,
                modifiedCount: result?.modifiedCount,
                upsertedCount: result?.upsertedCount,
                insertedCount: result?.insertedCount,
                deletedCount: result?.deletedCount
              };

              await this.schema.executePost(
                'bulkUpdate',
                this.buildHookPayload('bulkUpdate', ctx, {
                  collectionName: middlewareCtx.collectionName,
                  tenantId: middlewareCtx.tenantId,
                  dbName: middlewareCtx.dbName,
                  session,
                  bulkOperations: nextOperations,
                  result: bulkResultSummary,
                  meta
                })
              );

              middlewareCtx.result = bulkResultSummary;

              await this.runAfterMiddlewares('bulkUpdate', middlewareCtx);
              await this.invalidateCachePatterns('bulkWrite', middlewareCtx);

              await pubsub.publish(`${DB_CHANGE_EVENT}`, {
                bulkWrite: {
                  action: 'bulkWrite',
                  collectionName: middlewareCtx.collectionName,
                  result: bulkResultSummary,
                  meta
                }
              });

              return result;
            }
          ),
        ctx
      )
    );
  }

  /**
 * Deletes a single document inside a transaction-aware runtime context.
 *
 * This transactional variant runs within the active Ambiten runtime context,
 * executes registered delete middlewares, triggers schema delete hooks with
 * transactional metadata, invalidates relevant cache patterns, and publishes a
 * database change event after completion.
 *
 * @param filter - MongoDB filter used to identify the document to delete.
 * @param ctx - Optional model execution context for tenant, database,
 * collection, session, and transaction-aware runtime overrides.
 * @returns `true` when a document was deleted, otherwise `false`.
 * @throws {Error} When the filter is missing or invalid.
 */
  async deleteWithTransaction(
    filter: Filter<T>,
    ctx?: ModelContext
  ): Promise<boolean> {
    await this.init();

    if (!filter || typeof filter !== 'object') {
      throw new Error('Filter must be a valid object.');
    }

    return this.runWithModelContext(ctx, async () =>
      this.withTransaction(
        async () =>
          measureQuery(
            {
              operation: 'deleteOne',
              collectionName: this.resolveCollectionName(ctx),
              filter
            },
            async () => {
              const collectionName = this.resolveCollectionName(ctx);
              const session = this.resolveSession(ctx);
              const col = await this.getCollection(ctx);

              const meta = {
                transactional: true
              };

              const middlewareCtx = this.buildMiddlewareContext('deleteOne', ctx, {
                filter,
                meta
              });

              middlewareCtx.collectionName =
                middlewareCtx.collectionName ?? collectionName;

              await this.runBeforeMiddlewares('deleteOne', middlewareCtx);

              const effectiveFilter = (middlewareCtx.filter ?? filter) as Filter<T>;
              middlewareCtx.filter = effectiveFilter;

              const existingDoc = await col.findOne(
                effectiveFilter,
                session ? { session } : undefined
              );

              if (!existingDoc) {
                middlewareCtx.result = null;
                await this.runAfterMiddlewares('deleteOne', middlewareCtx);
                return false;
              }

              const payload = this.toModelResult(existingDoc as WithId<T>);
              middlewareCtx.result = payload;

              await this.schema.triggerMiddleware('pre', 'deleteOne', {
                operation: 'deleteOne',
                collectionName: middlewareCtx.collectionName,
                ...payload
              });

              await this.schema.executePre('deleteOne', {
                operation: 'deleteOne',
                collectionName: middlewareCtx.collectionName,
                tenantId: middlewareCtx.tenantId,
                dbName: middlewareCtx.dbName,
                session,
                doc: existingDoc as Partial<T>,
                result: payload,
                meta
              });

              const result = await col.deleteOne(
                effectiveFilter,
                session ? { session } : undefined
              );

              await this.schema.triggerMiddleware('post', 'deleteOne', {
                operation: 'deleteOne',
                collectionName: middlewareCtx.collectionName,
                ...payload
              });

              await this.schema.executePost('deleteOne', {
                operation: 'deleteOne',
                collectionName: middlewareCtx.collectionName,
                tenantId: middlewareCtx.tenantId,
                dbName: middlewareCtx.dbName,
                session,
                doc: existingDoc as Partial<T>,
                result: payload,
                meta
              });

              await this.runAfterMiddlewares('deleteOne', middlewareCtx);
              await this.invalidateCachePatterns('deleteOne', middlewareCtx);

              await pubsub.publish(`${DB_CHANGE_EVENT}`, {
                documentDeleted: {
                  action: 'deleteOne',
                  collectionName: middlewareCtx.collectionName,
                  filter: effectiveFilter,
                  meta
                }
              });

              return result.deletedCount === 1;
            }
          ),
        ctx
      )
    );
  }

  /**
  * Updates a single document inside a transaction-aware runtime context.
  *
  * This transactional variant runs within the active Ambiten runtime context,
  * executes registered update middlewares, validates the projected updated
  * document, triggers schema update hooks with transactional metadata,
  * invalidates relevant cache patterns, and publishes a database change event
  * after completion.
  *
  * @param filter - MongoDB filter used to identify the document to update.
  * @param update - MongoDB update document to apply.
  * @param ctx - Optional model execution context for tenant, database,
  * collection, session, and transaction-aware runtime overrides.
  * @returns The updated document as a normalized model result, or `null` if no
  * document matched the filter.
  * @throws {Error} When the filter is missing or invalid.
  * @throws {Error} When the update document is missing or invalid.
  */
  async updateWithTransaction(
    filter: Filter<T>,
    update: UpdateFilter<T>,
    ctx?: ModelContext
  ): Promise<ModelResult<T> | null> {
    await this.init();

    if (!filter || typeof filter !== 'object') {
      throw new Error('Filter must be a valid object.');
    }

    if (!update || typeof update !== 'object') {
      throw new Error('Update must be a valid object.');
    }

    return this.runWithModelContext(ctx, async () =>
      this.withTransaction(
        async () =>
          measureQuery(
            {
              operation: 'updateOne',
              collectionName: this.resolveCollectionName(ctx),
              filter,
              update
            },
            async () => {
              const collectionName = this.resolveCollectionName(ctx);
              const session = this.resolveSession(ctx);
              const col = await this.getCollection(ctx);

              const meta = {
                transactional: true
              };

              const middlewareCtx = this.buildMiddlewareContext('updateOne', ctx, {
                filter,
                update,
                meta
              });

              middlewareCtx.collectionName =
                middlewareCtx.collectionName ?? collectionName;

              await this.runBeforeMiddlewares('updateOne', middlewareCtx);

              const effectiveFilter = (middlewareCtx.filter ?? filter) as Filter<T>;
              const effectiveUpdate = (middlewareCtx.update ?? update) as UpdateFilter<T>;

              middlewareCtx.filter = effectiveFilter;
              middlewareCtx.update = effectiveUpdate;

              const existingDoc = await col.findOne(
                effectiveFilter,
                session ? { session } : undefined
              );

              if (!existingDoc) {
                middlewareCtx.result = null;
                await this.runAfterMiddlewares('updateOne', middlewareCtx);
                return null;
              }

              const projectedUpdatedDoc = {
                ...existingDoc,
                ...((effectiveUpdate as UpdateFilter<T>).$set ?? {})
              } as OptionalUnlessRequiredId<T>;

              this.validate(projectedUpdatedDoc);

              await this.schema.executePre('updateOne', {
                operation: 'updateOne',
                collectionName: middlewareCtx.collectionName,
                tenantId: middlewareCtx.tenantId,
                dbName: middlewareCtx.dbName,
                session,
                filter: effectiveFilter,
                update: effectiveUpdate,
                meta
              });

              await col.updateOne(
                effectiveFilter,
                effectiveUpdate,
                session ? { session } : undefined
              );

              const result = await col.findOne(
                effectiveFilter,
                session ? { session } : undefined
              );

              const payload = result
                ? this.toModelResult(result as WithId<T>)
                : null;

              await this.schema.executePost('updateOne', {
                operation: 'updateOne',
                collectionName: middlewareCtx.collectionName,
                tenantId: middlewareCtx.tenantId,
                dbName: middlewareCtx.dbName,
                session,
                filter: effectiveFilter,
                update: effectiveUpdate,
                result: payload,
                meta
              });

              middlewareCtx.result = payload;

              await this.runAfterMiddlewares('updateOne', middlewareCtx);
              await this.invalidateCachePatterns('updateOne', middlewareCtx);

              await pubsub.publish(`${DB_CHANGE_EVENT}`, {
                documentUpdated: {
                  action: 'updateOne',
                  collectionName: middlewareCtx.collectionName,
                  filter: effectiveFilter,
                  update: effectiveUpdate,
                  result: payload,
                  meta
                }
              });

              return (middlewareCtx.result ?? payload) as ModelResult<T> | null;
            }
          ),
        ctx
      )
    );
  }


  /**
 * Finds a single document matching the provided filter and updates it.
 *
 * This operation runs inside the active Ambiten runtime context, is instrumented
 * through {@link measureQuery}, executes registered findOneAndUpdate
 * middlewares, triggers schema update hooks, invalidates relevant cache
 * patterns, and publishes a database change event after completion.
 *
 * The updated document is returned in its post-update state when a matching
 * document is found.
 *
 * @param filter - MongoDB filter used to identify the document to update.
 * @param update - MongoDB update document to apply.
 * @param ctx - Optional model execution context for tenant, database,
 * collection, session, and related runtime overrides.
 * @returns The updated document as a normalized model result, or `null` if no
 * document matched the filter.
 * @throws {Error} When the filter is missing or invalid.
 * @throws {Error} When the update document is missing or invalid.
 */
  async findOneAndUpdate(
    filter: Filter<T>,
    update: UpdateFilter<T>,
    ctx?: ModelContext
  ): Promise<ModelResult<T> | null> {
    await this.init();

    if (!filter || typeof filter !== 'object') {
      throw new Error('Filter must be a valid object.');
    }

    if (!update || typeof update !== 'object') {
      throw new Error('Update must be a valid object.');
    }

    return this.runWithModelContext(ctx, async () =>
      measureQuery(
        {
          operation: 'findOneAndUpdate',
          collectionName: this.resolveCollectionName(ctx),
          filter,
          update
        },
        async () => {
          const collectionName = this.resolveCollectionName(ctx);
          const session = this.resolveSession(ctx);
          const col = await this.getCollection(ctx);

          const middlewareCtx = this.buildMiddlewareContext(
            'findOneAndUpdate',
            ctx,
            {
              filter,
              update
            }
          );

          middlewareCtx.collectionName =
            middlewareCtx.collectionName ?? collectionName;

          await this.runBeforeMiddlewares('findOneAndUpdate', middlewareCtx);

          const effectiveFilter = (middlewareCtx.filter ?? filter) as Filter<T>;
          const effectiveUpdate = (middlewareCtx.update ?? update) as UpdateFilter<T>;

          middlewareCtx.filter = effectiveFilter;
          middlewareCtx.update = effectiveUpdate;

          await this.schema.executePre('updateOne', {
            operation: 'findOneAndUpdate',
            collectionName: middlewareCtx.collectionName,
            tenantId: middlewareCtx.tenantId,
            dbName: middlewareCtx.dbName,
            session,
            filter: effectiveFilter,
            update: effectiveUpdate,
            meta: middlewareCtx.meta
          });

          const updateResult = await col.findOneAndUpdate(
            effectiveFilter,
            effectiveUpdate,
            {
              returnDocument: 'after',
              ...(session ? { session } : {})
            }
          );

          const updatedDoc =
            updateResult &&
              typeof updateResult === 'object' &&
              'value' in updateResult
              ? (updateResult.value as WithId<T> | null)
              : (updateResult as WithId<T> | null);

          const payload = updatedDoc
            ? this.toModelResult(updatedDoc)
            : null;

          await this.schema.executePost('updateOne', {
            operation: 'findOneAndUpdate',
            collectionName: middlewareCtx.collectionName,
            tenantId: middlewareCtx.tenantId,
            dbName: middlewareCtx.dbName,
            session,
            filter: effectiveFilter,
            update: effectiveUpdate,
            result: payload,
            meta: middlewareCtx.meta
          });

          middlewareCtx.result = payload;

          await this.runAfterMiddlewares('findOneAndUpdate', middlewareCtx);
          await this.invalidateCachePatterns('findOneAndUpdate', middlewareCtx);

          await pubsub.publish(`${DB_CHANGE_EVENT}`, {
            documentUpdated: {
              action: 'findOneAndUpdate',
              collectionName: middlewareCtx.collectionName,
              filter: effectiveFilter,
              update: effectiveUpdate,
              result: payload,
              meta: middlewareCtx.meta
            }
          });

          return (middlewareCtx.result ?? payload) as ModelResult<T> | null;
        }
      )
    );
  }

  /**
 * Finds a single document matching the provided filter and deletes it.
 *
 * Supports both hard delete and middleware-driven soft delete flows.
 * When soft delete is enabled via middleware metadata, the matched document
 * is updated using the provided soft-delete update operation instead of being
 * physically removed from the collection.
 *
 * The operation:
 * - runs within the active Ambiten runtime context
 * - is instrumented through {@link measureQuery}
 * - executes registered before/after model middlewares
 * - triggers schema delete/update hooks as appropriate
 * - invalidates relevant cache patterns after mutation
 * - publishes a database change event through PubSub
 *
 * @param filter - MongoDB filter used to identify the document to delete.
 * @param ctx - Optional model execution context for tenant, database,
 * session, cache, and collection overrides.
 * @returns The deleted document as a model result, or `null` if no document matched.
 * @throws {Error} When the filter is missing or invalid.
 */
  async findOneAndDelete(
    filter: Filter<T>,
    ctx?: ModelContext
  ): Promise<ModelResult<T> | null> {
    await this.init();

    if (!filter || typeof filter !== 'object') {
      throw new Error('Filter must be a valid object.');
    }

    return this.runWithModelContext(ctx, async () =>
      measureQuery(
        {
          operation: 'findOneAndDelete',
          collectionName: this.resolveCollectionName(ctx),
          filter
        },
        async () => {
          const collectionName = this.resolveCollectionName(ctx);
          const session = this.resolveSession(ctx);
          const col = await this.getCollection(ctx);

          const middlewareCtx = this.buildMiddlewareContext(
            'findOneAndDelete',
            ctx,
            { filter }
          );

          middlewareCtx.collectionName =
            middlewareCtx.collectionName ?? collectionName;

          await this.runBeforeMiddlewares('findOneAndDelete', middlewareCtx);

          const effectiveFilter = (middlewareCtx.filter ?? filter) as Filter<T>;
          middlewareCtx.filter = effectiveFilter;

          const meta = this.buildOperationMeta(middlewareCtx.meta);
          middlewareCtx.meta = meta;

          const existingDoc = await col.findOne(
            effectiveFilter,
            session ? { session } : undefined
          );

          if (!existingDoc) {
            middlewareCtx.result = null;
            await this.runAfterMiddlewares('findOneAndDelete', middlewareCtx);
            return null;
          }

          const existingPayload = this.toModelResult(existingDoc as WithId<T>);
          middlewareCtx.result = existingPayload;

          if (meta.softDelete === true) {
            const softDeleteUpdate =
              middlewareCtx.update ?? this.buildSoftDeleteUpdate();

            middlewareCtx.update = softDeleteUpdate;

            const softDeleteMeta = this.buildOperationMeta(meta, {
              softDelete: true
            });

            await this.schema.executePre(
              'updateOne',
              this.buildHookPayload('findOneAndDelete', ctx, {
                collectionName: middlewareCtx.collectionName,
                tenantId: middlewareCtx.tenantId,
                dbName: middlewareCtx.dbName,
                session,
                filter: effectiveFilter,
                update: softDeleteUpdate,
                result: existingPayload,
                meta: softDeleteMeta
              })
            );

            await col.updateOne(
              effectiveFilter,
              softDeleteUpdate,
              session ? { session } : undefined
            );

            await this.schema.executePost(
              'updateOne',
              this.buildHookPayload('findOneAndDelete', ctx, {
                collectionName: middlewareCtx.collectionName,
                tenantId: middlewareCtx.tenantId,
                dbName: middlewareCtx.dbName,
                session,
                filter: effectiveFilter,
                update: softDeleteUpdate,
                result: existingPayload,
                meta: softDeleteMeta
              })
            );

            await this.runAfterMiddlewares('findOneAndDelete', middlewareCtx);
            await this.invalidateCachePatterns('findOneAndDelete', middlewareCtx);

            await pubsub.publish(`${DB_CHANGE_EVENT}`, {
              documentDeleted: {
                action: 'softDeleteOne',
                collectionName: middlewareCtx.collectionName,
                filter: effectiveFilter,
                meta: softDeleteMeta
              }
            });

            return (middlewareCtx.result ?? existingPayload) as ModelResult<T> | null;
          }

          await this.schema.triggerMiddleware('pre', 'deleteOne', {
            operation: 'findOneAndDelete',
            collectionName: middlewareCtx.collectionName,
            ...existingPayload
          });

          await this.schema.executePre(
            'deleteOne',
            this.buildHookPayload('findOneAndDelete', ctx, {
              collectionName: middlewareCtx.collectionName,
              tenantId: middlewareCtx.tenantId,
              dbName: middlewareCtx.dbName,
              session,
              doc: existingDoc as Partial<T>,
              result: existingPayload,
              meta
            })
          );

          const deleteOptions: FindOneAndDeleteOptions = session ? { session } : {};
          const deleteResult = await col.findOneAndDelete(
            effectiveFilter,
            deleteOptions
          );

          const deletedDoc =
            deleteResult &&
              typeof deleteResult === 'object' &&
              'value' in deleteResult
              ? (deleteResult.value as WithId<T> | null)
              : (deleteResult as WithId<T> | null);

          const finalPayload = deletedDoc
            ? this.toModelResult(deletedDoc)
            : existingPayload;

          await this.schema.triggerMiddleware('post', 'deleteOne', {
            operation: 'findOneAndDelete',
            collectionName: middlewareCtx.collectionName,
            ...(finalPayload ?? {})
          });

          await this.schema.executePost(
            'deleteOne',
            this.buildHookPayload('findOneAndDelete', ctx, {
              collectionName: middlewareCtx.collectionName,
              tenantId: middlewareCtx.tenantId,
              dbName: middlewareCtx.dbName,
              session,
              doc: existingDoc as Partial<T>,
              result: finalPayload,
              meta
            })
          );

          middlewareCtx.result = finalPayload;

          await this.runAfterMiddlewares('findOneAndDelete', middlewareCtx);
          await this.invalidateCachePatterns('findOneAndDelete', middlewareCtx);

          await pubsub.publish(`${DB_CHANGE_EVENT}`, {
            documentDeleted: {
              action: 'findOneAndDelete',
              collectionName: middlewareCtx.collectionName,
              filter: effectiveFilter,
              result: finalPayload,
              meta
            }
          });

          return (middlewareCtx.result ?? finalPayload) as ModelResult<T> | null;
        }
      )
    );
  }


  /**
  * Finds a single document matching the provided filter and replaces it with the
  * supplied replacement document.
  *
  * This operation runs inside the active Ambiten runtime context, executes model
  * middlewares, triggers schema update hooks, invalidates relevant cache entries,
  * and publishes a database change event after a successful replacement.
  *
  * The replacement document is fully validated before being persisted.
  *
  * @param filter - MongoDB filter used to identify the document to replace.
  * @param replacement - The full replacement document that will overwrite the matched document.
  * @param ctx - Optional model execution context for tenant, database,
  * collection, session, and related runtime overrides.
  * @returns The replaced document in its updated form, or `null` if no document matched the filter.
  * @throws {Error} When the filter is missing or invalid.
  * @throws {Error} When the replacement document fails validation.
  */
  async findOneAndReplace(
    filter: Filter<T>,
    replacement: T,
    ctx?: ModelContext
  ): Promise<ModelResult<T> | null> {
    await this.init();

    if (!filter || typeof filter !== 'object') {
      throw new Error('Filter must be a valid object.');
    }

    if (!replacement || typeof replacement !== 'object') {
      throw new Error('Replacement document must be a valid object.');
    }

    return this.runWithModelContext(ctx, async () =>
      measureQuery(
        {
          operation: 'findOneAndReplace',
          collectionName: this.resolveCollectionName(ctx),
          filter
        },
        async () => {
          const collectionName = this.resolveCollectionName(ctx);
          const session = this.resolveSession(ctx);
          const col = await this.getCollection(ctx);

          const middlewareCtx = this.buildMiddlewareContext(
            'findOneAndReplace',
            ctx,
            {
              filter,
              doc: replacement
            }
          );

          middlewareCtx.collectionName =
            middlewareCtx.collectionName ?? collectionName;

          await this.runBeforeMiddlewares('findOneAndReplace', middlewareCtx);

          const effectiveFilter = (middlewareCtx.filter ?? filter) as Filter<T>;
          const nextReplacement = (middlewareCtx.doc ?? replacement) as T;

          middlewareCtx.filter = effectiveFilter;
          middlewareCtx.doc = nextReplacement;

          this.validate(nextReplacement as OptionalUnlessRequiredId<T>);

          await this.schema.executePre('updateOne', {
            operation: 'findOneAndReplace',
            collectionName: middlewareCtx.collectionName,
            filter: effectiveFilter,
            doc: nextReplacement
          });

          const replaceResult = await col.findOneAndReplace(
            effectiveFilter,
            nextReplacement,
            {
              returnDocument: 'after',
              ...(session ? { session } : {})
            }
          );

          const replacedDoc =
            replaceResult &&
              typeof replaceResult === 'object' &&
              'value' in replaceResult
              ? (replaceResult.value as WithId<T> | null)
              : (replaceResult as WithId<T> | null);

          const payload = replacedDoc
            ? this.toModelResult(replacedDoc)
            : null;

          await this.schema.executePost('updateOne', {
            operation: 'findOneAndReplace',
            collectionName: middlewareCtx.collectionName,
            filter: effectiveFilter,
            doc: nextReplacement,
            result: replacedDoc
          });

          middlewareCtx.result = payload;

          await this.runAfterMiddlewares('findOneAndReplace', middlewareCtx);
          await this.invalidateCachePatterns('findOneAndReplace', middlewareCtx);

          await pubsub.publish(`${DB_CHANGE_EVENT}`, {
            documentUpdated: {
              action: 'findOneAndReplace',
              filter: effectiveFilter,
              replacement: nextReplacement
            }
          });

          return (middlewareCtx.result ?? payload) as ModelResult<T> | null;
        }
      )
    );
  }

  /**
  * Finds a single document matching the provided filter and updates it. If no
  * matching document exists, a new one is inserted using MongoDB upsert
  * semantics.
  *
  * This operation runs within the active Ambiten runtime context, is instrumented
  * through {@link measureQuery}, executes registered model middlewares, triggers
  * schema update hooks, invalidates relevant cache patterns, and publishes a
  * database change event after completion.
  *
  * @param filter - MongoDB filter used to identify the document to update or insert.
  * @param update - MongoDB update document applied to the matched document or to the inserted document during upsert.
  * @param ctx - Optional model execution context for tenant, database,
  * collection, session, and related runtime overrides.
  * @returns The updated or newly upserted document in its final state, or `null`
  * if no document could be resolved from the operation result.
  * @throws {Error} When the filter is missing or invalid.
  * @throws {Error} When the update document is missing or invalid.
  */
  async findOneAndUpsert(
    filter: Filter<T>,
    update: UpdateFilter<T>,
    ctx?: ModelContext
  ): Promise<ModelResult<T> | null> {
    await this.init();

    if (!filter || typeof filter !== 'object') {
      throw new Error('Filter must be a valid object.');
    }

    if (!update || typeof update !== 'object') {
      throw new Error('Update must be a valid object.');
    }

    return this.runWithModelContext(ctx, async () =>
      measureQuery(
        {
          operation: 'findOneAndUpsert',
          collectionName: this.resolveCollectionName(ctx),
          filter,
          update
        },
        async () => {
          const collectionName = this.resolveCollectionName(ctx);
          const session = this.resolveSession(ctx);
          const col = await this.getCollection(ctx);

          const middlewareCtx = this.buildMiddlewareContext(
            'findOneAndUpsert',
            ctx,
            {
              filter,
              update
            }
          );

          middlewareCtx.collectionName =
            middlewareCtx.collectionName ?? collectionName;

          await this.runBeforeMiddlewares('findOneAndUpsert', middlewareCtx);

          const effectiveFilter = (middlewareCtx.filter ?? filter) as Filter<T>;
          const effectiveUpdate = (middlewareCtx.update ?? update) as UpdateFilter<T>;

          middlewareCtx.filter = effectiveFilter;
          middlewareCtx.update = effectiveUpdate;

          await this.schema.executePre('updateOne', {
            operation: 'findOneAndUpsert',
            collectionName: middlewareCtx.collectionName,
            filter: effectiveFilter,
            update: effectiveUpdate
          });

          const upsertResult = await col.findOneAndUpdate(
            effectiveFilter,
            effectiveUpdate,
            {
              upsert: true,
              returnDocument: 'after',
              ...(session ? { session } : {})
            }
          );

          const updatedDoc =
            upsertResult &&
              typeof upsertResult === 'object' &&
              'value' in upsertResult
              ? (upsertResult.value as WithId<T> | null)
              : (upsertResult as WithId<T> | null);

          const payload = updatedDoc
            ? this.toModelResult(updatedDoc)
            : null;

          await this.schema.executePost('updateOne', {
            operation: 'findOneAndUpsert',
            collectionName: middlewareCtx.collectionName,
            filter: effectiveFilter,
            update: effectiveUpdate,
            result: updatedDoc
          });

          middlewareCtx.result = payload;

          await this.runAfterMiddlewares('findOneAndUpsert', middlewareCtx);
          await this.invalidateCachePatterns('findOneAndUpsert', middlewareCtx);

          await pubsub.publish(`${DB_CHANGE_EVENT}`, {
            documentUpdated: {
              action: 'findOneAndUpsert',
              filter: effectiveFilter,
              update: effectiveUpdate
            }
          });

          return (middlewareCtx.result ?? payload) as ModelResult<T> | null;
        }
      )
    );
  }

  /**
   * Finds a single document matching the provided filter and updates it inside a
   * transaction. If no document matches, a new one is inserted using MongoDB
   * upsert semantics.
   *
   * This transactional variant runs inside the active Ambiten runtime context,
   * executes registered model middlewares, triggers schema update hooks with
   * transactional metadata, invalidates relevant cache patterns, and publishes a
   * database change event after completion.
   *
   * @param filter - MongoDB filter used to identify the document to update or insert.
   * @param update - MongoDB update document applied to the matched document or inserted document.
   * @param ctx - Optional model execution context for tenant, database,
   * collection, session, and transaction-aware runtime overrides.
   * @returns The updated or newly inserted document in its final state, or `null`
   * if no document could be resolved from the operation result.
   * @throws {Error} When the filter is missing or invalid.
   * @throws {Error} When the update document is missing or invalid.
   */
  async findOneAndUpsertWithTransaction(
    filter: Filter<T>,
    update: UpdateFilter<T>,
    ctx?: ModelContext
  ): Promise<ModelResult<T> | null> {
    await this.init();

    if (!filter || typeof filter !== 'object') {
      throw new Error('Filter must be a valid object.');
    }

    if (!update || typeof update !== 'object') {
      throw new Error('Update must be a valid object.');
    }

    return this.runWithModelContext(ctx, async () =>
      this.withTransaction(async () => {
        const collectionName = this.resolveCollectionName(ctx);
        const col = await this.getCollection(ctx);
        const session = this.resolveSession(ctx);

        const middlewareCtx = this.buildMiddlewareContext(
          'findOneAndUpsert',
          ctx,
          {
            filter,
            update,
            meta: {
              transactional: true
            }
          }
        );

        middlewareCtx.collectionName =
          middlewareCtx.collectionName ?? collectionName;

        await this.runBeforeMiddlewares('findOneAndUpsert', middlewareCtx);

        const effectiveFilter = (middlewareCtx.filter ?? filter) as Filter<T>;
        const effectiveUpdate = (middlewareCtx.update ?? update) as UpdateFilter<T>;

        middlewareCtx.filter = effectiveFilter;
        middlewareCtx.update = effectiveUpdate;

        await this.schema.executePre('updateOne', {
          operation: 'findOneAndUpsert',
          collectionName: middlewareCtx.collectionName,
          filter: effectiveFilter,
          update: effectiveUpdate,
          meta: {
            transactional: true
          }
        });

        const upsertResult = await col.findOneAndUpdate(
          effectiveFilter,
          effectiveUpdate,
          {
            upsert: true,
            returnDocument: 'after',
            ...(session ? { session } : {})
          }
        );

        const updatedDoc =
          upsertResult &&
            typeof upsertResult === 'object' &&
            'value' in upsertResult
            ? (upsertResult.value as WithId<T> | null)
            : (upsertResult as WithId<T> | null);

        const payload = updatedDoc
          ? this.toModelResult(updatedDoc)
          : null;

        await this.schema.executePost('updateOne', {
          operation: 'findOneAndUpsert',
          collectionName: middlewareCtx.collectionName,
          filter: effectiveFilter,
          update: effectiveUpdate,
          result: updatedDoc,
          meta: {
            transactional: true
          }
        });

        middlewareCtx.result = payload;

        await this.runAfterMiddlewares('findOneAndUpsert', middlewareCtx);
        await this.invalidateCachePatterns('findOneAndUpsert', middlewareCtx);

        await pubsub.publish(`${DB_CHANGE_EVENT}`, {
          documentUpdated: {
            action: 'findOneAndUpsert',
            filter: effectiveFilter,
            update: effectiveUpdate,
            meta: {
              transactional: true
            }
          }
        });

        return (middlewareCtx.result ?? payload) as ModelResult<T> | null;
      }, ctx)
    );
  }

  /**
  * Finds a single document matching the provided filter and updates it inside a
  * secure transaction. If no document matches, a new one is inserted using
  * MongoDB upsert semantics.
  *
  * This secure transactional variant enforces an admin-only authorization rule
  * before performing the operation. It runs inside the active Ambiten runtime
  * context, executes registered model middlewares, triggers schema update hooks
  * with transactional and security metadata, invalidates relevant cache patterns,
  * and publishes a database change event after completion.
  *
  * @param filter - MongoDB filter used to identify the document to update or insert.
  * @param update - MongoDB update document applied to the matched document or inserted document.
  * @param user - Authenticated user performing the operation. Must have the `admin` role.
  * @param ctx - Optional model execution context for tenant, database,
  * collection, session, and transaction-aware runtime overrides.
  * @returns The updated or newly inserted document in its final state, or `null`
  * if no document could be resolved from the operation result.
  * @throws {Error} When the user is not authorized to perform the operation.
  * @throws {Error} When the filter is missing or invalid.
  * @throws {Error} When the update document is missing or invalid.
  */
  async findOneAndUpsertWithTransactionSecure(
    filter: Filter<T>,
    update: UpdateFilter<T>,
    user: User,
    ctx?: ModelContext
  ): Promise<ModelResult<T> | null> {
    await this.init();

    if (!filter || typeof filter !== 'object') {
      throw new Error('Filter must be a valid object.');
    }

    if (!update || typeof update !== 'object') {
      throw new Error('Update must be a valid object.');
    }

    if (!user) {
      throw new Error('User is required.');
    }

    return this.runWithModelContext(ctx, async () =>
      this.withTransaction(async () => {
        if (user.role !== 'admin') {
          throw new Error('Unauthorized');
        }

        const meta = {
          transactional: true,
          secure: true,
          userId: user.id,
          userRole: user.role
        };

        const collectionName = this.resolveCollectionName(ctx);
        const col = await this.getCollection(ctx);
        const session = this.resolveSession(ctx);

        const middlewareCtx = this.buildMiddlewareContext(
          'findOneAndUpsert',
          ctx,
          {
            filter,
            update,
            meta
          }
        );

        middlewareCtx.collectionName =
          middlewareCtx.collectionName ?? collectionName;

        await this.runBeforeMiddlewares('findOneAndUpsert', middlewareCtx);

        const effectiveFilter = (middlewareCtx.filter ?? filter) as Filter<T>;
        const effectiveUpdate = (middlewareCtx.update ?? update) as UpdateFilter<T>;

        middlewareCtx.filter = effectiveFilter;
        middlewareCtx.update = effectiveUpdate;

        await this.schema.executePre('updateOne', {
          operation: 'findOneAndUpsert',
          collectionName: middlewareCtx.collectionName,
          filter: effectiveFilter,
          update: effectiveUpdate,
          meta
        });

        const upsertResult = await col.findOneAndUpdate(
          effectiveFilter,
          effectiveUpdate,
          {
            upsert: true,
            returnDocument: 'after',
            ...(session ? { session } : {})
          }
        );

        const updatedDoc =
          upsertResult &&
            typeof upsertResult === 'object' &&
            'value' in upsertResult
            ? (upsertResult.value as WithId<T> | null)
            : (upsertResult as WithId<T> | null);

        const payload = updatedDoc
          ? this.toModelResult(updatedDoc)
          : null;

        await this.schema.executePost('updateOne', {
          operation: 'findOneAndUpsert',
          collectionName: middlewareCtx.collectionName,
          filter: effectiveFilter,
          update: effectiveUpdate,
          result: updatedDoc,
          meta
        });

        middlewareCtx.result = payload;

        await this.runAfterMiddlewares('findOneAndUpsert', middlewareCtx);
        await this.invalidateCachePatterns('findOneAndUpsert', middlewareCtx);

        await pubsub.publish(`${DB_CHANGE_EVENT}`, {
          documentUpdated: {
            action: 'findOneAndUpsert',
            filter: effectiveFilter,
            update: effectiveUpdate,
            meta
          }
        });

        return (middlewareCtx.result ?? payload) as ModelResult<T> | null;
      }, ctx)
    );
  }

  /**
   * Deletes a single document matching the provided filter using an admin-only
   * secure operation.
   *
   * This method enforces authorization before executing the delete flow. It runs
   * inside the active Ambiten runtime context, is instrumented through
   * {@link measureQuery}, executes registered model middlewares, triggers schema
   * delete hooks with security metadata, invalidates relevant cache patterns, and
   * publishes a database change event after a successful deletion.
   *
   * @param filter - MongoDB filter used to identify the document to delete.
   * @param user - Authenticated user performing the operation. Must have the `admin` role.
   * @param ctx - Optional model execution context for tenant, database,
   * collection, session, and related runtime overrides.
   * @returns A promise that resolves when the operation completes.
   * @throws {Error} When the user is not authorized to perform the operation.
   * @throws {Error} When the filter is missing or invalid.
   * @throws {Error} When the user payload is missing.
   */
  async deleteSecure(
    filter: Filter<T>,
    user: User,
    ctx?: ModelContext
  ): Promise<void> {
    await this.init();

    if (!filter || typeof filter !== 'object') {
      throw new Error('Filter must be a valid object.');
    }

    if (!user) {
      throw new Error('User is required.');
    }

    return this.runWithModelContext(ctx, async () =>
      measureQuery(
        {
          operation: 'deleteOne',
          collectionName: this.resolveCollectionName(ctx),
          filter
        },
        async () => {
          if (user.role !== 'admin') {
            throw new Error('Unauthorized');
          }

          const meta = {
            secure: true,
            userId: user.id,
            userRole: user.role
          };

          const collectionName = this.resolveCollectionName(ctx);
          const col = await this.getCollection(ctx);
          const session = this.resolveSession(ctx);

          const middlewareCtx = this.buildMiddlewareContext('deleteOne', ctx, {
            filter,
            meta
          });

          middlewareCtx.collectionName =
            middlewareCtx.collectionName ?? collectionName;

          await this.runBeforeMiddlewares('deleteOne', middlewareCtx);

          const effectiveFilter = (middlewareCtx.filter ?? filter) as Filter<T>;
          middlewareCtx.filter = effectiveFilter;

          const doc = await col.findOne(
            effectiveFilter,
            session ? { session } : undefined
          );

          if (!doc) {
            middlewareCtx.result = null;
            await this.runAfterMiddlewares('deleteOne', middlewareCtx);
            return;
          }

          const payload = this.toModelResult(doc as WithId<T>);
          middlewareCtx.result = payload;

          await this.schema.executePre('deleteOne', {
            operation: 'deleteOne',
            collectionName: middlewareCtx.collectionName,
            ...doc,
            meta
          });

          await col.deleteOne(
            effectiveFilter,
            session ? { session } : undefined
          );

          await this.schema.executePost('deleteOne', {
            operation: 'deleteOne',
            collectionName: middlewareCtx.collectionName,
            ...doc,
            meta
          });

          await this.runAfterMiddlewares('deleteOne', middlewareCtx);
          await this.invalidateCachePatterns('deleteOne', middlewareCtx);

          await pubsub.publish(`${DB_CHANGE_EVENT}`, {
            documentDeleted: {
              action: 'deleteOne',
              filter: effectiveFilter,
              meta
            }
          });
        }
      )
    );
  }

  /**
   * Executes an aggregation pipeline against the model collection.
   *
   * This operation runs inside the active Ambiten runtime context, is instrumented
   * through {@link measureQuery}, executes registered aggregate middlewares,
   * supports optional query-result caching, and publishes a database change event
   * after execution.
   *
   * When caching is enabled through {@link QueryOptions}, the aggregation result
   * is stored and reused using a tenant-aware cache key derived from the
   * collection, pipeline, options, and runtime context.
   *
   * @typeParam U - The aggregation result document shape.
   * @param pipeline - MongoDB aggregation pipeline stages.
   * @param options - Optional MongoDB aggregation options.
   * @param externalSession - Optional explicit client session to use for the aggregation.
   * @param ctx - Optional model execution context for tenant, database,
   * collection, session, and related runtime overrides.
   * @param queryOptions - Optional query-level features such as caching.
   * @returns The aggregation result array.
   * @throws {Error} When the pipeline is missing or invalid.
   */
  async aggregate<U extends Document>(
    pipeline: object[],
    options: AggregateOptions = {},
    externalSession?: ClientSession,
    ctx?: ModelContext,
    queryOptions?: QueryOptions
  ): Promise<U[]> {
    await this.init();

    if (!Array.isArray(pipeline)) {
      throw new Error('Pipeline must be a valid array.');
    }

    return this.runWithModelContext(ctx, async () =>
      measureQuery(
        {
          operation: 'aggregate',
          collectionName: this.resolveCollectionName(ctx),
          pipeline
        },
        async () => {
          const collectionName = this.resolveCollectionName(ctx);
          const col = await this.getCollection(ctx);
          const resolvedSession = this.resolveSessionStrict(ctx, externalSession);

          const middlewareCtx = this.buildMiddlewareContext('aggregate', ctx, {
            pipeline
          });

          middlewareCtx.collectionName =
            middlewareCtx.collectionName ?? collectionName;

          await this.runBeforeMiddlewares('aggregate', middlewareCtx);

          const effectivePipeline = (middlewareCtx.pipeline ?? pipeline) as object[];
          middlewareCtx.pipeline = effectivePipeline;

          const cache = queryOptions?.cache
            ? this.resolveCache(queryOptions)
            : null;

          await this.schema.executePre('aggregate', {
            operation: 'aggregate',
            collectionName: middlewareCtx.collectionName,
            tenantId: middlewareCtx.tenantId,
            dbName: middlewareCtx.dbName,
            session: resolvedSession,
            pipeline: effectivePipeline,
            meta: middlewareCtx.meta
          });

          let cacheKey: string | null = null;

          if (cache) {
            cacheKey = this.buildCacheKey('aggregate', {
              collectionName: middlewareCtx.collectionName,
              pipeline: effectivePipeline,
              options,
              tenantId: middlewareCtx.tenantId,
              dbName: middlewareCtx.dbName
            });

            const cached = await cache.get<U[]>(cacheKey, {
              ttlSeconds:
                typeof queryOptions?.cache === 'object'
                  ? queryOptions.cache.ttl
                  : undefined,
              tenantId: middlewareCtx.tenantId,
              namespace: middlewareCtx.collectionName
            });

            if (cached) {
              middlewareCtx.result = cached as any;
              await this.runAfterMiddlewares('aggregate', middlewareCtx);
              return (middlewareCtx.result ?? cached) as U[];
            }
          }

          const cursor = col.aggregate<U>(effectivePipeline, {
            ...options,
            ...(resolvedSession ? { session: resolvedSession } : {})
          });

          const result = await cursor.toArray();

          await this.schema.executePost('aggregate', {
            operation: 'aggregate',
            collectionName: middlewareCtx.collectionName,
            tenantId: middlewareCtx.tenantId,
            dbName: middlewareCtx.dbName,
            session: resolvedSession,
            pipeline: effectivePipeline,
            result,
            meta: middlewareCtx.meta
          });

          middlewareCtx.result = result as any;

          await this.runAfterMiddlewares('aggregate', middlewareCtx);

          const finalResult = (middlewareCtx.result ?? result) as U[];

          if (cache && cacheKey) {
            await cache.set(cacheKey, finalResult, {
              ttlSeconds:
                typeof queryOptions?.cache === 'object'
                  ? queryOptions.cache.ttl
                  : undefined,
              tenantId: middlewareCtx.tenantId,
              namespace: middlewareCtx.collectionName
            });
          }

          await pubsub.publish(`${DB_CHANGE_EVENT}`, {
            dbChange: {
              action: 'aggregate',
              pipeline: effectivePipeline
            }
          });

          return finalResult;
        }
      )
    );
  }

  /**
   * Executes an aggregation pipeline inside a transaction-aware runtime context.
   *
   * This transactional variant runs within the active Ambiten runtime context,
   * executes registered aggregate middlewares, triggers schema aggregate hooks,
   * instruments the query through {@link measureQuery}, and publishes a database
   * change event after execution.
   *
   * @typeParam U - The aggregation result document shape.
   * @param pipeline - MongoDB aggregation pipeline stages.
   * @param options - Optional MongoDB aggregation options.
   * @param ctx - Optional model execution context for tenant, database,
   * collection, session, and transaction-aware runtime overrides.
   * @returns The aggregation result array.
   * @throws {Error} When the pipeline is missing or invalid.
   */
  async aggregateWithTransaction<U extends Document>(
    pipeline: object[],
    options: AggregateOptions = {},
    ctx?: ModelContext
  ): Promise<U[]> {
    await this.init();

    if (!Array.isArray(pipeline)) {
      throw new Error('Pipeline must be a valid array.');
    }

    return this.runWithModelContext(ctx, async () =>
      this.withTransaction(
        async () =>
          measureQuery(
            {
              operation: 'aggregate',
              collectionName: this.resolveCollectionName(ctx),
              pipeline
            },
            async () => {
              const collectionName = this.resolveCollectionName(ctx);
              const col = await this.getCollection(ctx);
              const session = this.resolveSession(ctx);

              const middlewareCtx = this.buildMiddlewareContext('aggregate', ctx, {
                pipeline,
                meta: {
                  transactional: true
                }
              });

              middlewareCtx.collectionName =
                middlewareCtx.collectionName ?? collectionName;

              await this.runBeforeMiddlewares('aggregate', middlewareCtx);

              const effectivePipeline = (middlewareCtx.pipeline ?? pipeline) as object[];
              middlewareCtx.pipeline = effectivePipeline;

              await this.schema.executePre('aggregate', {
                operation: 'aggregate',
                collectionName: middlewareCtx.collectionName,
                tenantId: middlewareCtx.tenantId,
                dbName: middlewareCtx.dbName,
                session,
                pipeline: effectivePipeline,
                meta: {
                  ...(middlewareCtx.meta ?? {}),
                  transactional: true
                }
              });

              const cursor = col.aggregate<U>(effectivePipeline, {
                ...options,
                ...(session ? { session } : {})
              });

              const result = await cursor.toArray();

              await this.schema.executePost('aggregate', {
                operation: 'aggregate',
                collectionName: middlewareCtx.collectionName,
                tenantId: middlewareCtx.tenantId,
                dbName: middlewareCtx.dbName,
                session,
                pipeline: effectivePipeline,
                result,
                meta: {
                  ...(middlewareCtx.meta ?? {}),
                  transactional: true
                }
              });

              middlewareCtx.result = result as any;

              await this.runAfterMiddlewares('aggregate', middlewareCtx);

              const finalResult = (middlewareCtx.result ?? result) as U[];

              await pubsub.publish(`${DB_CHANGE_EVENT}`, {
                dbChange: {
                  action: 'aggregate',
                  pipeline: effectivePipeline,
                  meta: {
                    transactional: true
                  }
                }
              });

              return finalResult;
            }
          ),
        ctx
      )
    );
  }

  /**
  * Executes the provided operation within a transaction-aware runtime context.
  *
  * Resolution order:
  * 1. Reuse an existing session from the merged model context when available.
  * 2. Start a provider-managed session when the active database provider
  *    exposes a session factory.
  * 3. Fall back to {@link AmbitenContext.withTransaction} to resolve a client
  *    and execute the operation inside a transaction.
  *
  * When an existing session is supplied, the current transaction boundary is
  * reused and no new transaction is started.
  *
  * @typeParam R - The operation result type.
  * @param operation - Callback executed with the resolved MongoDB client session.
  * @param ctx - Optional model execution context used to resolve tenant,
  * database, collection, and session overrides.
  * @returns The resolved operation result.
  */
  private async withTransaction<R>(
    operation: (session: ClientSession) => Promise<R>,
    ctx?: ModelContext
  ): Promise<R> {
    const baseCtx = this.mergeCtx(ctx) ?? {};
    const collectionName = baseCtx.collectionName ?? this._collectionName;
    const existingSession = baseCtx.session;

    const runtimeBase = {
      tenantId: baseCtx.tenantId,
      dbName: baseCtx.dbName,
      collectionName
    };

    if (existingSession) {
      return AmbitenContext.run(
        {
          ...runtimeBase,
          session: existingSession
        },
        async () => operation(existingSession)
      );
    }

    if (this._provider?.startSession) {
      const session = await this.getSession(baseCtx);

      return await AmbitenContext.run(
        {
          ...runtimeBase,
          session
        },
        async () => runManualTransaction(session, operation)
      );
    }

    return AmbitenContext.run(
      runtimeBase,
      async () => AmbitenContext.withTransaction(operation)
    );
  }

  /**
 * Executes the provided operation inside a transaction-aware Ambiten runtime context.
 *
 * This helper ensures the operation runs with a resolved MongoDB client session
 * and within the active Ambiten runtime context for the current tenant,
 * database, and collection. If a session already exists in the merged model
 * context, that session is reused and no new transaction boundary is created.
 *
 * Use this method when multiple model operations must be executed atomically
 * within a single transactional unit of work.
 *
 * @typeParam R - The operation result type.
 * @param operation - Callback executed with the resolved MongoDB client session.
 * @param ctx - Optional model execution context for tenant, database,
 * collection, and session overrides.
 * @returns The resolved result of the transactional operation.
 */
  async runInTransaction<R>(
    operation: (session: ClientSession) => Promise<R>,
    ctx?: ModelContext
  ): Promise<R> {
    await this.init();

    if (typeof operation !== 'function') {
      throw new Error('Operation must be a valid function.');
    }

    return this.runWithModelContext(ctx, async () =>
      this.withTransaction(async (session) => operation(session), ctx)
    );
  }

  private async getSession(ctx?: ModelContext): Promise<ClientSession> {
    if (!this._provider?.startSession) {
      throw new Error(
        'Transaction support is not available. Provider does not implement startSession().'
      );
    }

    return this._provider.startSession(this.mergeCtx(ctx));
  }


  /**
   * Creates a readable stream for an aggregation pipeline.
   *
   * This method runs inside the active Ambiten runtime context, is instrumented
   * through {@link measureQuery}, executes registered aggregate middlewares,
   * triggers schema aggregate hooks, and publishes a database change event after
   * the aggregation stream is created.
   *
   * This method instruments stream creation only. It does not track the full
   * lifecycle of stream consumption unless additional listeners are attached by
   * the caller or by a higher-level observability layer.
   *
   * @typeParam U - The aggregation result document shape.
   * @param pipeline - MongoDB aggregation pipeline stages.
   * @param options - Optional MongoDB aggregation options.
   * @param ctx - Optional model execution context for tenant, database,
   * collection, session, and related runtime overrides.
   * @returns A readable stream for the aggregation result set.
   * @throws {Error} When the pipeline is missing or invalid.
   */
  async streamAggregation<U extends Document>(
    pipeline: object[],
    options: AggregateOptions = {},
    ctx?: ModelContext
  ) {
    await this.init();

    if (!Array.isArray(pipeline)) {
      throw new Error('Pipeline must be a valid array.');
    }

    return this.runWithModelContext(ctx, async () =>
      measureQuery(
        {
          operation: 'aggregate',
          collectionName: this.resolveCollectionName(ctx),
          pipeline,
          extra: {
            streaming: true
          }
        },
        async () => {
          const collectionName = this.resolveCollectionName(ctx);
          const session = this.resolveSession(ctx);
          const col = await this.getCollection(ctx);

          const middlewareCtx = this.buildMiddlewareContext('aggregate', ctx, {
            pipeline,
            meta: {
              streaming: true
            }
          });

          middlewareCtx.collectionName =
            middlewareCtx.collectionName ?? collectionName;

          await this.runBeforeMiddlewares('aggregate', middlewareCtx);

          const effectivePipeline = (middlewareCtx.pipeline ?? pipeline) as object[];
          middlewareCtx.pipeline = effectivePipeline;

          const meta = {
            ...(middlewareCtx.meta ?? {}),
            streaming: true
          };

          await this.schema.triggerMiddleware('pre', 'aggregate', {
            operation: 'aggregate',
            collectionName: middlewareCtx.collectionName,
            pipeline: effectivePipeline,
            meta
          });

          await this.schema.executePre('aggregate', {
            operation: 'aggregate',
            collectionName: middlewareCtx.collectionName,
            tenantId: middlewareCtx.tenantId,
            dbName: middlewareCtx.dbName,
            session,
            pipeline: effectivePipeline,
            meta
          });

          const stream = col.aggregate<U>(effectivePipeline, {
            ...options,
            ...(session ? { session } : {})
          }).stream();

          await this.schema.triggerMiddleware('post', 'aggregate', {
            operation: 'aggregate',
            collectionName: middlewareCtx.collectionName,
            result: stream,
            meta
          });

          await this.schema.executePost('aggregate', {
            operation: 'aggregate',
            collectionName: middlewareCtx.collectionName,
            tenantId: middlewareCtx.tenantId,
            dbName: middlewareCtx.dbName,
            session,
            pipeline: effectivePipeline,
            result: stream,
            meta
          });

          middlewareCtx.result = stream as any;

          await this.runAfterMiddlewares('aggregate', middlewareCtx);

          await pubsub.publish(`${DB_CHANGE_EVENT}`, {
            dbChange: {
              action: 'aggregateStream',
              collectionName: middlewareCtx.collectionName,
              pipeline: effectivePipeline,
              meta
            }
          });

          return stream;
        }
      )
    );
  }

  /**
   * Aggregates documents in the collection using a pipeline with caching.
   * @param {object[]} pipeline - The aggregation pipeline.
   * @param {string} cacheKey - The cache key.
   * @param {number} [cacheDuration=300] - The cache duration in seconds.
   * @returns {Promise<T[]>} The aggregation result as an array.
   * @throws {Error} If the pipeline is not valid or the cache key is not a string.
   */
  async aggregateWithCache(
    pipeline: object[],
    cacheKey: string,
    cacheDuration = 300
  ): Promise<T[]> {
    await this.init();
    if (!Array.isArray(pipeline)) {
      throw new Error('Pipeline must be an array of objects.');
    }
    const cachedResult = await redis.get(cacheKey);

    if (cachedResult) {
      console.info(`[info]: Cache hit: ${cacheKey}`);
      return JSON.parse(cachedResult) as T[];
    } else if (typeof cacheKey !== 'string') {
      throw new Error('Cache key must be a string.');
    } else {
      console.info(`[info]: Cache miss: ${cacheKey}`);
    }


    const col = await this.getCollection();

    const result = await col.aggregate<T>(pipeline).toArray();
    await redis.set(cacheKey, JSON.stringify(result) || '');
    await redis.expire(cacheKey, cacheDuration);

    console.info('Cache set:', cacheKey);

    this.schema.triggerMiddleware('post', 'aggregate', {
      operation: 'aggregate',
      collectionName: this.resolveCollectionName(col),
      result: [result]
    });
    await pubsub.publish("DB_CHANGE", { dbChange: { action: "aggregate", result } });
    return result as T[] || [];
  }

  /**
   * Cursor-based pagination using _id comparison instead of skip.
   * @param filter - The filter for documents.
   * @param pageSize - Number of documents per page.
   * @param lastId - Last document _id from the previous page.
   * @returns {Promise<T[]>} Array of documents for the current page.
   * This method uses the _id field for pagination, which is more efficient than using skip.
   * 
   */
  async paginatedFind(
    filter: Partial<T>,
    pageSize: number,
    lastId?: string): Promise<T[]> {
    await this.init();
    const query: any = filter;

    if (lastId) {
      query._id = { $gt: new ObjectId(lastId) }; // Fetch only newer documents
    }

    const col = await this.getCollection();
    const results = await col.find(query).limit(pageSize).toArray();
    return results.map(({ _id, ...rest }) => rest as unknown as T);
  };

  /**
   * Opens a MongoDB change stream on the model collection and registers a change
   * callback.
   *
   * This helper initializes the model, resolves the collection within the active
   * Ambiten runtime context, creates a change stream, and subscribes the provided
   * callback to `"change"` events.
   *
   * The method is intentionally lightweight: it manages change stream creation,
   * but does not yet instrument the full lifecycle of emitted change events. That
   * can be added later by higher-level observability or evidence collection
   * layers.
   *
   * @param callback - Function invoked whenever a change event is emitted by the collection change stream.
   * @param ctx - Optional model execution context for tenant, database,
   * collection, session, and related runtime overrides.
   * @returns The active MongoDB change stream.
   * @throws {Error} When the callback is not a valid function.
   */
  async watchChanges(
    callback: (change: ChangeStreamDocument<T>) => void,
    ctx?: ModelContext
  ): Promise<ChangeStream<T>> {
    await this.init();

    if (typeof callback !== 'function') {
      throw new Error('Callback must be a valid function.');
    }

    return this.runWithModelContext(ctx, async () => {
      const collectionName = this.resolveCollectionName(ctx);
      const col = await this.getCollection(ctx);
      const changeStream = col.watch();

      changeStream.on('change', callback);

      await pubsub.publish(`${DB_CHANGE_EVENT}`, {
        dbChange: {
          action: 'watchChanges',
          collectionName
        }
      });

      return changeStream;
    });
  }

  /**
  * Creates an index on the model collection.
  *
  * @param fields - Index field specification where each key maps to ascending
  * (`1`) or descending (`-1`) index order.
  * @param ctx - Optional model execution context for tenant, database,
  * collection, session, and related runtime overrides.
  * @returns A promise that resolves when the index has been created.
  * @throws {Error} When the field specification is missing or invalid.
  */
  async createIndex(
    fields: Partial<Record<keyof T, 1 | -1>>,
    ctx?: ModelContext
  ): Promise<void> {
    await this.init();

    if (!fields || typeof fields !== 'object') {
      throw new Error('Index fields must be a valid object.');
    }

    const entries = Object.entries(fields) as [string, 1 | -1][];

    if (entries.length === 0) {
      throw new Error('Index fields must contain at least one entry.');
    }

    for (const [, direction] of entries) {
      if (direction !== 1 && direction !== -1) {
        throw new Error('Index direction must be either 1 or -1.');
      }
    }

    return this.runWithModelContext(ctx, async () => {
      const col = await this.getCollection(ctx);
      await col.createIndex(fields as Record<string, 1 | -1>);
    });
  }

  /**
   * Drops an index from the collection by its name.
   * @param {string} indexName - The name of the index to drop.
   * @returns {Promise<void>} Resolves when the index is dropped.
   */
  async dropIndex(indexName: string): Promise<void> {
    await this.init();
    const col = await this.getCollection();
    await col.dropIndex(indexName);
  }

  // ============== Invalidation ==============//

  private async invalidateCachePatterns(
    operation: AmbitenMiddlewareOperation,
    ctx: AmbitenMiddlewareContext<T>
  ): Promise<void> {
    const tenantId = ctx.tenantId ?? 'default';
    const dbName = ctx.dbName ?? 'default';
    const collectionName = ctx.collectionName ?? this._collectionName;

    const basePatterns = [
      `Ambiten:${tenantId}:${dbName}:${collectionName}:find:*`,
      `Ambiten:${tenantId}:${dbName}:${collectionName}:findOne:*`
    ];

    const patterns =
      operation === 'aggregate'
        ? [
          ...basePatterns,
          `Ambiten:${tenantId}:${dbName}:${collectionName}:aggregate:*`
        ]
        : [
          ...basePatterns,
          `Ambiten:${tenantId}:${dbName}:${collectionName}:aggregate:*`
        ];

    await Promise.all(
      [...new Set(patterns)].map((pattern) =>
        AmbitenModel.invalidatePattern(pattern)
      )
    );
  }

  /**
   * Invalidates all cache entries matching the provided Redis key pattern.
   *
   * This method uses Redis `SCAN` to iterate over matching keys in batches and
   * deletes them using a pipelined multi-operation for better efficiency.
   *
   * @param pattern - Redis key pattern to invalidate.
   * @returns The number of successfully deleted keys.
   * @throws {Error} When the pattern is invalid or cache invalidation fails.
   */

  static async invalidatePattern(pattern: string): Promise<number> {
    if (typeof pattern !== 'string' || pattern.trim().length === 0) {
      throw new Error('Pattern must be a non-empty string.');
    }

    const normalizedPattern = pattern.trim();
    const scanCount = 100;

    let deletedCount = 0;
    let cursor = 0;

    try {
      do {
        const result = await redis.scan(cursor, {
          MATCH: normalizedPattern,
          COUNT: scanCount
        });

        const nextCursor = Array.isArray(result) ? Number(result[0]) : 0;
        const keys = Array.isArray(result) ? result[1] : [];

        if (Array.isArray(keys) && keys.length > 0) {
          const multi = redis.multi();

          for (const key of keys) {
            multi.del(key);
          }

          const execResult = await multi.exec();

          if (Array.isArray(execResult)) {
            deletedCount += execResult.filter((entry: any) => {
              if (Array.isArray(entry)) {
                const [err, value] = entry;
                return !err && value === 1;
              }

              return entry === 1;
            }).length;
          }
        }

        cursor = nextCursor;
      } while (cursor !== 0);

      return deletedCount;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);

      throw new Error(
        `Failed to invalidate cache pattern "${normalizedPattern}": ${message}`
      );
    }
  }

  getContext(): { ctx: ModelContext } {
    return { ctx: {} as ModelContext };
  }

  /**
   * Invalidates cache entries for the current model scope using a pattern.
   *
   * This helper resolves tenant, database, and collection scope from the
   * provided context and applies the pattern within the Ambiten cache namespace.
   *
   * @param pattern - Partial cache pattern (e.g. "find:*", "aggregate:*").
   * @param ctx - Optional model execution context.
   * @returns Number of deleted cache entries.
   * @throws {Error} When the pattern is invalid.
   */
  async invalidateModelPattern(
    pattern: string,
    ctx?: ModelContext
  ): Promise<number> {
    await this.init();

    if (typeof pattern !== 'string' || pattern.trim().length === 0) {
      throw new Error('Pattern must be a non-empty string.');
    }

    return this.runWithModelContext(ctx, async () => {
      const tenantId = ctx?.tenantId ?? 'default';
      const dbName = ctx?.dbName ?? 'default';
      const collectionName =
        ctx?.collectionName ?? this._collectionName;

      const fullPattern = `Ambiten:${tenantId}:${dbName}:${collectionName}:${pattern.trim()}`;

      return AmbitenModel.invalidatePattern(fullPattern);
    });
  }

  /**
   * Invalidates cache entries related to a specific document within the current
   * model scope.
   *
   * This helper is useful only when document-specific cache keys are part of the
   * active cache strategy.
   *
   * @param doc - The document whose cache entries should be invalidated.
   * @param ctx - Optional model execution context.
   * @returns A promise that resolves when invalidation completes.
   * @throws {Error} When the document is missing a valid `_id`.
   */
  async invalidateDocumentCache(
    doc: T,
    ctx?: ModelContext
  ): Promise<number> {
    await this.init();

    if (!doc || typeof doc !== 'object' || !('_id' in doc) || !doc._id) {
      throw new Error('Document must contain a valid _id.');
    }

    return this.runWithModelContext(ctx, async () => {
      const merged = this.mergeCtx(ctx);
      const tenantId = merged?.tenantId ?? 'default';
      const dbName = merged?.dbName ?? 'default';
      const collectionName = merged?.collectionName ?? this._collectionName;

      const pattern = `Ambiten:${tenantId}:${dbName}:${collectionName}:*${String(doc._id)}*`;

      return AmbitenModel.invalidatePattern(pattern);
    });
  }

  /**
   * Returns cache statistics for the active Redis cache backend.
   *
   * This helper retrieves Redis memory and keyspace statistics, along with Ambiten
   * cache hit/miss counters. When a tenant identifier is provided, it also counts
   * cache keys scoped to that tenant within the Ambiten cache namespace.
   *
   * @param tenantId - Optional tenant identifier used to count tenant-scoped cache keys.
   * @returns Cache statistics for the current Redis backend.
   * @throws {Error} When cache statistics cannot be retrieved.
   */
  static async getCacheStats(tenantId?: string): Promise<AmbitenCacheStats> {
    try {
      const memoryInfo = await redis.info('memory');
      const keyspaceInfo = await redis.info('keyspace');

      const matches = Array.from(
        keyspaceInfo.matchAll(/db\d+:keys=(\d+)/g)
      ) as RegExpMatchArray[];

      const totalKeys = matches.reduce((sum, match) => {
        return sum + Number(match[1] ?? 0);
      }, 0);

      const memoryMatch = memoryInfo.match(/used_memory:(\d+)/);
      const memoryUsageBytes = memoryMatch ? Number(memoryMatch[1]) : 0;

      const hitsRaw = (await redis.get('Ambiten:cache:stats:hits')) ?? '0';
      const missesRaw = (await redis.get('Ambiten:cache:stats:misses')) ?? '0';

      const totalHits = Number.parseInt(hitsRaw, 10) || 0;
      const totalMisses = Number.parseInt(missesRaw, 10) || 0;
      const totalRequests = totalHits + totalMisses;

      const hitRate =
        totalRequests > 0
          ? Math.round((totalHits / totalRequests) * 100)
          : 0;

      const missRate =
        totalRequests > 0
          ? Math.round((totalMisses / totalRequests) * 100)
          : 0;

      let tenantKeys: number | undefined;

      if (tenantId) {
        const pattern = `Ambiten:${tenantId}:*`;
        let cursor = 0;
        let count = 0;

        do {
          const result = await redis.scan(cursor, {
            MATCH: pattern,
            COUNT: 100
          });

          const nextCursor = Array.isArray(result) ? Number(result[0]) : 0;
          const keys = Array.isArray(result) ? result[1] : [];

          if (Array.isArray(keys)) {
            count += keys.length;
          }

          cursor = nextCursor;
        } while (cursor !== 0);

        tenantKeys = count;
      }

      return {
        totalKeys,
        tenantKeys,
        memoryUsageMb: Math.round(memoryUsageBytes / 1024 / 1024),
        memoryUsageBytes,
        hitRate,
        missRate,
        totalHits,
        totalMisses,
        totalRequests,
        tenantId: tenantId ?? null,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);

      throw new Error(`Failed to get cache stats: ${message}`);
    }
  }

  /**
   * Runs a custom command on the collection.
   * @param {string} command - The command to run.
   * @param {...any} args - The arguments for the command.
   * @returns {Promise<any>} The result of the command.
   */
  async runCommand(command: string, ...args: any[]): Promise<any> {
    await this.init();
    const dbCommand = { [command]: 1, ...args };
    const col = await this.getCollection();
    return col.db.command(dbCommand);
  }

  /**
   * Runs garbage collection for expired documents in the model collection.
   *
   * This operation uses the model GC configuration to locate expired documents
   * and either soft-delete them or permanently delete them. When configured,
   * expired documents may be archived before deletion.
   *
   * The operation runs inside the active Ambiten runtime context, is instrumented
   * through {@link measureQuery}, executes registered GC-related middlewares,
   * triggers schema update/delete hooks as appropriate, invalidates relevant
   * cache patterns, and publishes a garbage collection event after completion.
   *
   * @param ctx - Optional model execution context for tenant, database,
   * collection, session, and related runtime overrides.
   * @returns A promise that resolves when garbage collection completes.
   */
  async runGC(ctx?: ModelContext): Promise<void> {
    await this.init();

    const config = this.resolveSchemaGCConfig();
    if (!config || !config.ttlField || !config.expiresIn) {
      return;
    }

    return this.runWithModelContext(ctx, async () =>
      measureQuery(
        {
          operation: 'runGC',
          collectionName: this.resolveCollectionName(ctx)
        },
        async () => {
          const collectionName = this.resolveCollectionName(ctx);
          const session = this.resolveSession(ctx);
          const col = await this.getCollection(ctx);

          const meta = {
            gc: true
          };

          const middlewareCtx = this.buildMiddlewareContext(
            'runGC' as AmbitenMiddlewareOperation,
            ctx,
            { meta }
          );

          middlewareCtx.collectionName =
            middlewareCtx.collectionName ?? collectionName;

          await this.runBeforeMiddlewares(
            'runGC' as AmbitenMiddlewareOperation,
            middlewareCtx
          );

          const expireDate = new Date(Date.now() - Number(config.expiresIn));

          const gcFilter: Filter<T> = {
            [config.ttlField]: { $lt: expireDate }
          } as Filter<T>;

          const effectiveFilter = (middlewareCtx.filter ?? gcFilter) as Filter<T>;
          middlewareCtx.filter = effectiveFilter;

          const expiredDocs = await col.find(
            effectiveFilter,
            session ? { session } : undefined
          ).toArray();

          if (expiredDocs.length === 0) {
            middlewareCtx.result = {
              scanned: 0,
              affected: 0,
              archived: 0,
              deleted: 0,
              softDeleted: 0
            };

            await this.runAfterMiddlewares(
              'runGC' as AmbitenMiddlewareOperation,
              middlewareCtx
            );
            return;
          }

          let archived = 0;
          let deleted = 0;
          let softDeleted = 0;

          if (config.softDelete) {
            const softDeleteUpdate = {
              $set: {
                deletedAt: new Date(),
                isDeleted: true
              } as UpdateFilter<T>
            } as UpdateFilter<T>;

            await this.schema.executePre('updateMany', {
              operation: 'runGC',
              collectionName: middlewareCtx.collectionName,
              tenantId: middlewareCtx.tenantId,
              dbName: middlewareCtx.dbName,
              session,
              filter: effectiveFilter,
              update: softDeleteUpdate,
              docs: expiredDocs as Partial<T>[],
              meta: {
                ...(middlewareCtx.meta ?? {}),
                gc: true,
                softDelete: true
              }
            });

            const result = await col.updateMany(
              effectiveFilter,
              softDeleteUpdate,
              session ? { session } : undefined
            );

            softDeleted = result.modifiedCount;

            await this.schema.executePost('updateMany', {
              operation: 'runGC',
              collectionName: middlewareCtx.collectionName,
              tenantId: middlewareCtx.tenantId,
              dbName: middlewareCtx.dbName,
              session,
              filter: effectiveFilter,
              update: softDeleteUpdate,
              docs: expiredDocs as Partial<T>[],
              result: {
                scanned: expiredDocs.length,
                affected: softDeleted,
                archived: 0,
                deleted: 0,
                softDeleted
              },
              meta: {
                ...(middlewareCtx.meta ?? {}),
                gc: true,
                softDelete: true
              }
            });
          } else {
            if (config.archiveBeforeDelete) {
              const archiveDocs = expiredDocs.map((doc) => ({
                ...doc,
                _archivedAt: new Date(),
                _from: col.collectionName
              }));

              await col.db.collection('Ambiten_archives').insertMany(
                archiveDocs,
                session ? { session } : undefined
              );

              archived = archiveDocs.length;
            }

            await this.schema.triggerMiddleware('pre', 'deleteMany', {
              operation: 'runGC',
              collectionName: middlewareCtx.collectionName,
              docs: expiredDocs as Partial<T>[]
            });

            await this.schema.executePre('deleteMany', {
              operation: 'runGC',
              collectionName: middlewareCtx.collectionName,
              tenantId: middlewareCtx.tenantId,
              dbName: middlewareCtx.dbName,
              session,
              docs: expiredDocs as Partial<T>[],
              result: this.toModelResults(expiredDocs as WithId<T>[]),
              meta: {
                ...(middlewareCtx.meta ?? {}),
                gc: true
              }
            });

            const result = await col.deleteMany(
              effectiveFilter,
              session ? { session } : undefined
            );

            deleted = result.deletedCount ?? 0;

            await this.schema.triggerMiddleware('post', 'deleteMany', {
              operation: 'runGC',
              collectionName: middlewareCtx.collectionName,
              docs: expiredDocs as Partial<T>[]
            });

            await this.schema.executePost('deleteMany', {
              operation: 'runGC',
              collectionName: middlewareCtx.collectionName,
              tenantId: middlewareCtx.tenantId,
              dbName: middlewareCtx.dbName,
              session,
              docs: expiredDocs as Partial<T>[],
              result: {
                scanned: expiredDocs.length,
                affected: deleted,
                archived,
                deleted,
                softDeleted: 0
              },
              meta: {
                ...(middlewareCtx.meta ?? {}),
                gc: true
              }
            });
          }

          const gcResult = {
            scanned: expiredDocs.length,
            affected: softDeleted || deleted,
            archived,
            deleted,
            softDeleted
          };

          middlewareCtx.result = gcResult;

          await this.runAfterMiddlewares(
            'runGC' as AmbitenMiddlewareOperation,
            middlewareCtx
          );

          await this.invalidateCachePatterns(
            'runGC' as AmbitenMiddlewareOperation,
            middlewareCtx
          );

          await pubsub.publish(`${DB_CHANGE_EVENT}`, {
            garbageCollection: {
              action: 'runGC',
              collectionName: middlewareCtx.collectionName,
              ...gcResult,
              meta: {
                ...(middlewareCtx.meta ?? {}),
                gc: true
              }
            }
          });
        }
      )
    );
  }

  /**
   * Starts the automatic garbage collection process.
   * @param {number} intervalMs - The interval in milliseconds for the garbage collection to run.
   */
  startAutoGC(intervalMs = 3600000): void {
    setInterval(() => this.runGC().catch(console.error), intervalMs);
  }

  /**
 * Resolves instrumentation context for model operations by combining explicit
 * model context with the active runtime context.
 *
 * This helper is used to provide stable metadata for logging, observers,
 * tracing, and query instrumentation.
 *
 * @param ctx - Optional model execution context.
 * @returns Resolved instrumentation metadata for the current operation.
 */
  private resolveInstrumentationContext(
    ctx?: ModelContext
  ): {
    tenantId?: string;
    dbName?: string;
    collectionName: string;
    session?: ClientSession;
    requestId?: string;
  } {
    const runtimeCtx = AmbitenContext.get();
    const merged = this.mergeCtx(ctx);

    return {
      tenantId: merged?.tenantId,
      dbName: merged?.dbName,
      collectionName: merged?.collectionName ?? this._collectionName,
      session: merged?.session,
      requestId: runtimeCtx.requestId
    };
  }


  /**
 * Builds normalized operation metadata by merging existing middleware metadata
 * with operation-specific overrides.
 *
 * @param base - Existing operation metadata.
 * @param overrides - Additional metadata flags or values to apply.
 * @returns Normalized operation metadata.
 */
  private buildOperationMeta(
    base?: AmbitenOperationMeta,
    overrides?: Partial<AmbitenOperationMeta>
  ): AmbitenOperationMeta {
    return {
      ...(base ?? {}),
      ...(overrides ?? {}),
      extra: {
        ...(base?.extra ?? {}),
        ...(overrides?.extra ?? {})
      }
    };
  }

  /**
 * Builds a normalized hook payload for schema middleware and instrumentation.
 *
 * @param operation - Operation name.
 * @param ctx - Optional model execution context.
 * @param payload - Additional hook payload fields.
 * @returns Normalized hook payload.
 */
  private buildHookPayload(
    operation: AmbitenMiddlewareOperation,
    ctx?: ModelContext,
    payload: Partial<AmbitenHookPayload<T>> = {}
  ): AmbitenHookPayload<T> {
    const instrumentation = this.resolveInstrumentationContext(ctx);

    return {
      operation,
      collectionName:
        payload.collectionName ?? instrumentation.collectionName,
      tenantId: payload.tenantId ?? instrumentation.tenantId,
      dbName: payload.dbName ?? instrumentation.dbName,
      session: payload.session ?? instrumentation.session,
      filter: payload.filter,
      update: payload.update,
      doc: payload.doc,
      docs: payload.docs,
      pipeline: payload.pipeline,
      result: payload.result,
      meta: payload.meta
    };
  }

  //=============== Cache ====================//

  /**
 * Resolves a cache adapter for the current query options.
 *
 * This helper returns a lightweight Redis-backed cache interface when caching
 * is enabled in the provided query options. Cache failures are treated as
 * non-fatal so query execution can continue even when Redis is unavailable or
 * a cache payload is invalid.
 *
 * @param options - Optional query options that may enable caching.
 * @returns A cache adapter when caching is enabled, otherwise `null`.
 */
  private resolveCache(options?: QueryOptions): AmbitenCacheAdapter | null {
    if (!options?.cache) {
      return null;
    }

    return {
      get: async <R>(
        key: string,
        meta?: {
          ttlSeconds?: number;
          tenantId?: string;
          namespace?: string;
        }
      ): Promise<R | null> => {
        try {
          const cached = await redis.get(key);

          if (!cached) {
            await AmbitenModel.trackCacheMiss();
            return null;
          }

          const parsed = JSON.parse(cached) as R;

          await AmbitenModel.trackCacheHit();
          return parsed;
        } catch {
          return null;
        }
      },

      set: async <R>(
        key: string,
        value: R,
        meta?: {
          ttlSeconds?: number;
          tenantId?: string;
          namespace?: string;
        }
      ): Promise<void> => {
        try {
          const ttl = meta?.ttlSeconds ?? 300;
          await redis.set(key, JSON.stringify(value), {
            EX: ttl
          });
        } catch {
          // Best-effort cache write. Intentionally ignored.
        }
      }
    };
  }

  /**
 * Builds a deterministic cache key for a query operation.
 *
 * The cache key is scoped by tenant, database, collection, and operation, and
 * uses a normalized serialized payload to ensure stable cache identity across
 * semantically equivalent query inputs.
 *
 * @param operation - Query operation name.
 * @param payload - Cache identity payload for the operation.
 * @returns A deterministic tenant-aware cache key.
 */
  private buildCacheKey(
    operation: string,
    payload: Record<string, unknown>
  ): string {
    const tenantId = String(payload.tenantId ?? 'default');
    const dbName = String(payload.dbName ?? 'default');
    const collectionName = String(payload.collectionName ?? this._collectionName);

    const {
      tenantId: _tenantId,
      dbName: _dbName,
      collectionName: _collectionName,
      ...rest
    } = payload;

    const normalizedPayload = this.sortObjectDeep(rest);
    const serialized = JSON.stringify(normalizedPayload);

    return `Ambiten:${tenantId}:${dbName}:${collectionName}:${operation}:${serialized}`;
  }

  private static async trackCacheMiss(): Promise<void> {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const retentionSeconds = 86400 * 7;

      const pipeline = redis.multi();
      pipeline.incr('Ambiten:cache:stats:misses');
      pipeline.incr(`Ambiten:cache:stats:misses:${today}`);
      pipeline.expire(`Ambiten:cache:stats:misses:${today}`, retentionSeconds);

      await pipeline.exec();
    } catch {
      // Best-effort telemetry. Intentionally ignored.
    }
  }


  private static async trackCacheHit(): Promise<void> {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const retentionSeconds = 86400 * 7;

      const pipeline = redis.multi();
      pipeline.incr('Ambiten:cache:stats:hits');
      pipeline.incr(`Ambiten:cache:stats:hits:${today}`);
      pipeline.expire(`Ambiten:cache:stats:hits:${today}`, retentionSeconds);

      await pipeline.exec();
    } catch {
      // Best-effort telemetry. Intentionally ignored.
    }
  }

  static async cacheResult<R>(
    key: string,
    data: R,
    ttl = 3600
  ): Promise<void> {
    if (typeof key !== 'string' || key.trim().length === 0) {
      throw new Error('Cache key must be a non-empty string.');
    }

    if (!Number.isFinite(ttl) || ttl <= 0) {
      throw new Error('TTL must be a positive number.');
    }

    try {
      await redis.set(key, JSON.stringify(data));
      await redis.expire(key, ttl);
    } catch {
      // Best-effort cache write. Intentionally ignored.
    }
  }

  /**
   * Clears a cached result by its key.
   * @param {string} key - The cache key.
   * @returns {Promise<void>} Resolves when the cache is cleared.
   */
  static async clearCache(key: string): Promise<void> {
    if (!key || typeof key !== 'string') {
      throw new Error('Cache key must be a non-empty string');
    }

    try {
      await redis.del(key);
    } catch (error) {
      console.error('Error clearing cache:', error);
      throw new Error(`Failed to clear cache for key "${key}": ${error}`);
    }
  }

  /**
 * Warms cache entries for selected model queries.
 *
 * When query definitions are provided, this helper executes the corresponding
 * `find` operations and stores the results using Ambiten's scoped cache key
 * strategy. When no queries are provided, it warms a default collection-wide
 * `find({})` cache entry, subject to a safety threshold for large collections.
 *
 * This helper is best suited for controlled cache priming scenarios such as
 * startup warmup, scheduled maintenance, or high-traffic query preparation.
 *
 * @param queries - Optional list of query definitions to warm.
 * @param defaultTtl - Default TTL in seconds for warmed entries.
 * @param ctx - Optional model execution context for tenant, database,
 * collection, session, and related runtime overrides.
 * @returns A promise that resolves when cache warming completes.
 * @throws {Error} When cache warming fails.
 */
  async warmCache(
    queries?: { filter?: Partial<T>; ttl?: number }[],
    defaultTtl = 3600,
    ctx?: ModelContext
  ): Promise<void> {
    await this.init();

    if (!Number.isFinite(defaultTtl) || defaultTtl <= 0) {
      throw new Error('Default TTL must be a positive number.');
    }

    return this.runWithModelContext(ctx, async () => {
      const cache = this.resolveCache({ cache: { ttl: defaultTtl } } as QueryOptions);

      if (!cache) {
        return;
      }

      const instrumentation = this.resolveInstrumentationContext(ctx);
      const col = await this.getCollection(ctx);
      const session = this.resolveSession(ctx);

      const warmQueries =
        queries && queries.length > 0
          ? queries
          : [{ filter: {} as Partial<T>, ttl: defaultTtl }];

      if ((!queries || queries.length === 0)) {
        const totalDocs = await col.countDocuments(
          {},
          session ? { session } : undefined
        );

        if (totalDocs > 1000) {
          return;
        }
      }

      for (const query of warmQueries) {
        const filter = (query.filter ?? {}) as Filter<T>;
        const ttl = query.ttl ?? defaultTtl;

        const docs = await col.find(
          filter,
          session ? { session } : undefined
        ).toArray();

        const payload = this.toModelResults(docs as WithId<T>[]);

        const cacheKey = this.buildCacheKey('find', {
          collectionName: instrumentation.collectionName,
          filter,
          tenantId: instrumentation.tenantId,
          dbName: instrumentation.dbName
        });

        await cache.set(cacheKey, payload, {
          ttlSeconds: ttl,
          tenantId: instrumentation.tenantId,
          namespace: instrumentation.collectionName
        });
      }
    });
  }

  // We want to avoids cache-key drift from key ordering.
  private sortObjectDeep(value: any): any {
    if (Array.isArray(value)) {
      return value.map((item) => this.sortObjectDeep(item));
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (value && typeof value === 'object') {
      return Object.keys(value)
        .sort()
        .reduce((acc, key) => {
          acc[key] = this.sortObjectDeep(value[key]);
          return acc;
        }, {} as Record<string, any>);
    }

    return value;
  }

  private toModelResult(doc: WithId<T>): ModelResult<T> {
    const { _id, ...rest } = doc;

    return {
      ...rest,
      _id: _id.toString()
    } as ModelResult<T>;
  }

  private toModelResults(docs: WithId<T>[] = []): ModelResultArray<T> {
    return docs.map((doc) => this.toModelResult(doc));
  }

  /**
  * Restores a single soft-deleted document matching the provided filter.
  *
  * This operation runs inside the active Ambiten runtime context, is instrumented
  * through {@link measureQuery}, executes registered restore middlewares,
  * triggers schema update hooks, invalidates relevant cache patterns, and
  * publishes a document restoration event after completion.
  *
  * The actual restore behavior is driven by the update document returned from
  * {@link buildRestoreUpdate}.
  *
  * @param filter - MongoDB filter used to identify the document to restore.
  * @param ctx - Optional model execution context for tenant, database,
  * collection, session, and related runtime overrides.
  * @returns A promise that resolves when the operation completes.
  * @throws {Error} When the filter is missing or invalid.
  */
  async restoreOne(
    filter: Filter<T>,
    ctx?: ModelContext
  ): Promise<void> {
    await this.init();

    if (!filter || typeof filter !== 'object') {
      throw new Error('Filter must be a valid object.');
    }

    return this.runWithModelContext(ctx, async () =>
      measureQuery(
        {
          operation: 'restoreOne',
          collectionName: this.resolveCollectionName(ctx),
          filter
        },
        async () => {
          const collectionName = this.resolveCollectionName(ctx);
          const session = this.resolveSession(ctx);
          const col = await this.getCollection(ctx);

          const meta = {
            restore: true
          };

          const middlewareCtx = this.buildMiddlewareContext(
            'restoreOne' as AmbitenMiddlewareOperation,
            ctx,
            {
              filter,
              meta
            }
          );

          middlewareCtx.collectionName =
            middlewareCtx.collectionName ?? collectionName;

          await this.runBeforeMiddlewares(
            'restoreOne' as AmbitenMiddlewareOperation,
            middlewareCtx
          );

          const effectiveFilter = (middlewareCtx.filter ?? filter) as Filter<T>;
          middlewareCtx.filter = effectiveFilter;

          const restoreUpdate = this.buildRestoreUpdate();

          const existingDoc = await col.findOne(
            effectiveFilter,
            session ? { session } : undefined
          );

          if (!existingDoc) {
            middlewareCtx.result = null;
            await this.runAfterMiddlewares(
              'restoreOne' as AmbitenMiddlewareOperation,
              middlewareCtx
            );
            return;
          }

          await this.schema.executePre('restoreOne', {
            operation: 'restoreOne',
            collectionName: middlewareCtx.collectionName,
            tenantId: middlewareCtx.tenantId,
            dbName: middlewareCtx.dbName,
            session,
            filter: effectiveFilter,
            update: restoreUpdate,
            meta
          });

          const result = await col.updateOne(
            effectiveFilter,
            restoreUpdate,
            session ? { session } : undefined
          );

          const restoredDoc = await col.findOne(
            effectiveFilter,
            session ? { session } : undefined
          );

          const restoreResult = {
            acknowledged: result.acknowledged,
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount,
            upsertedCount: result.upsertedCount,
            upsertedId: result.upsertedId,
            restored: restoredDoc
              ? this.toModelResult(restoredDoc as WithId<T>)
              : null
          };

          await this.schema.executePost('restoreOne', {
            operation: 'restoreOne',
            collectionName: middlewareCtx.collectionName,
            tenantId: middlewareCtx.tenantId,
            dbName: middlewareCtx.dbName,
            session,
            filter: effectiveFilter,
            update: restoreUpdate,
            result: restoreResult,
            meta
          });

          middlewareCtx.result = restoreResult;

          await this.runAfterMiddlewares(
            'restoreOne' as AmbitenMiddlewareOperation,
            middlewareCtx
          );

          await this.invalidateCachePatterns(
            'restoreOne' as AmbitenMiddlewareOperation,
            middlewareCtx
          );

          await pubsub.publish(`${DB_CHANGE_EVENT}`, {
            documentRestored: {
              action: 'restoreOne',
              collectionName: middlewareCtx.collectionName,
              filter: effectiveFilter,
              result: restoreResult,
              meta
            }
          });
        }
      )
    );
  }

  /**
   * Restores multiple soft-deleted documents matching the provided filter.
   *
   * This operation runs inside the active Ambiten runtime context, is instrumented
   * through {@link measureQuery}, executes registered restore middlewares,
   * triggers schema update hooks, invalidates relevant cache patterns, and
   * publishes a document restoration event after completion.
   *
   * The actual restore behavior is driven by the update document returned from
   * {@link buildRestoreUpdate}.
   *
   * @param filter - MongoDB filter used to identify the documents to restore.
   * @param ctx - Optional model execution context for tenant, database,
   * collection, session, and related runtime overrides.
   * @returns A promise that resolves when the operation completes.
   * @throws {Error} When the filter is missing or invalid.
   */
  async restoreMany(
    filter: Filter<T>,
    ctx?: ModelContext
  ): Promise<void> {
    await this.init();

    if (!filter || typeof filter !== 'object') {
      throw new Error('Filter must be a valid object.');
    }

    return this.runWithModelContext(ctx, async () =>
      measureQuery(
        {
          operation: 'restoreMany',
          collectionName: this.resolveCollectionName(ctx),
          filter
        },
        async () => {
          const collectionName = this.resolveCollectionName(ctx);
          const session = this.resolveSession(ctx);
          const col = await this.getCollection(ctx);

          const meta = {
            restore: true
          };

          const middlewareCtx = this.buildMiddlewareContext(
            'restoreMany',
            ctx,
            {
              filter,
              meta
            }
          );

          middlewareCtx.collectionName =
            middlewareCtx.collectionName ?? collectionName;

          await this.runBeforeMiddlewares(
            'restoreMany',
            middlewareCtx
          );

          const effectiveFilter = (middlewareCtx.filter ?? filter) as Filter<T>;
          middlewareCtx.filter = effectiveFilter;

          const restoreUpdate = this.buildRestoreUpdate();

          const existingDocs = await col.find(
            effectiveFilter,
            session ? { session } : undefined
          ).toArray();

          if (existingDocs.length === 0) {
            middlewareCtx.result = {
              restoredCount: 0,
              docs: []
            };

            await this.runAfterMiddlewares(
              'restoreMany',
              middlewareCtx
            );
            return;
          }

          await this.schema.executePre('updateMany', {
            operation: 'restoreMany',
            collectionName: middlewareCtx.collectionName,
            tenantId: middlewareCtx.tenantId,
            dbName: middlewareCtx.dbName,
            session,
            filter: effectiveFilter,
            update: restoreUpdate,
            docs: existingDocs as Partial<T>[],
            meta
          });

          const result = await col.updateMany(
            effectiveFilter,
            restoreUpdate,
            session ? { session } : undefined
          );

          const restoredDocs = await col.find(
            effectiveFilter,
            session ? { session } : undefined
          ).toArray();

          const restoreResult = {
            acknowledged: result.acknowledged,
            matchedCount: existingDocs.length,
            modifiedCount: result.modifiedCount,
            restoredCount: result.modifiedCount,
            docs: this.toModelResults(restoredDocs as WithId<T>[])
          };

          await this.schema.executePost('updateMany', {
            operation: 'restoreMany',
            collectionName: middlewareCtx.collectionName,
            tenantId: middlewareCtx.tenantId,
            dbName: middlewareCtx.dbName,
            session,
            filter: effectiveFilter,
            update: restoreUpdate,
            docs: restoredDocs as Partial<T>[],
            result: restoreResult,
            meta
          });

          middlewareCtx.result = restoreResult;

          await this.runAfterMiddlewares(
            'restoreMany',
            middlewareCtx
          );

          await this.invalidateCachePatterns(
            'restoreMany',
            middlewareCtx
          );

          await pubsub.publish(`${DB_CHANGE_EVENT}`, {
            documentRestored: {
              action: 'restoreMany',
              collectionName: middlewareCtx.collectionName,
              filter: effectiveFilter,
              result: restoreResult,
              meta
            }
          });
        }
      )
    );
  }

  private buildRestoreUpdate(): UpdateFilter<T> {
    const deletedAtField = this._softDeleteConfig?.deletedAtField ?? 'deletedAt';
    const isDeletedField = this._softDeleteConfig?.isDeletedField ?? 'isDeleted';

    return {
      $set: {
        [deletedAtField]: null,
        [isDeletedField]: false
      } as Partial<T>
    } as UpdateFilter<T>;
  }

  //================ Middleware Context and Execution =================//
  private buildMiddlewareContext(
    operation: AmbitenMiddlewareOperation,
    ctx?: ModelContext,
    payload: Partial<AmbitenMiddlewareContext<T>> = {}
  ): AmbitenMiddlewareContext<T> {
    const merged = this.mergeCtx(ctx);

    return {
      operation,
      modelName: this.constructor.name,
      collectionName:
        payload.collectionName ??
        merged?.collectionName ??
        this._collectionName,
      tenantId: payload.tenantId ?? merged?.tenantId,
      dbName: payload.dbName ?? merged?.dbName,
      session: payload.session ?? merged?.session,

      withDeleted: payload.withDeleted ?? merged?.withDeleted,
      onlyDeleted: payload.onlyDeleted ?? merged?.onlyDeleted,
      hardDelete: payload.hardDelete ?? merged?.hardDelete,

      filter: payload.filter,
      update: payload.update,
      doc: payload.doc,
      docs: payload.docs,
      pipeline: payload.pipeline,
      bulkUpdates: payload.bulkUpdates,
      bulkOperations: payload.bulkOperations,
      result: payload.result,
      meta: payload.meta
    };
  }

  setSoftDeleteConfig(config: {
    deletedAtField: string;
    isDeletedField: string
  }): void {
    this._softDeleteConfig = config;
  }

  /**
 * Builds the update document used for soft delete operations.
 *
 * The generated update sets the configured deleted timestamp field and
 * deleted-state flag field to mark the document as logically deleted without
 * physically removing it from the collection.
 *
 * @returns MongoDB update document for soft delete flows.
 */
  private buildSoftDeleteUpdate(): UpdateFilter<T> {
    const deletedAtField = this._softDeleteConfig?.deletedAtField ?? 'deletedAt';
    const isDeletedField = this._softDeleteConfig?.isDeletedField ?? 'isDeleted';

    return {
      $set: {
        [deletedAtField]: new Date(),
        [isDeletedField]: true
      } as Partial<T>
    } as UpdateFilter<T>;
  }

  // Middleware runners/execution methods
  private async runBeforeMiddlewares(
    operation: AmbitenMiddlewareOperation,
    ctx: AmbitenMiddlewareContext<T>
  ): Promise<void> {
    const handlers = this.beforeMiddlewares.get(operation) ?? [];
    for (const handler of handlers) {
      await handler(ctx);
    }
  }

  private async runAfterMiddlewares(
    operation: AmbitenMiddlewareOperation,
    ctx: AmbitenMiddlewareContext<T>
  ): Promise<void> {
    const handlers = this.afterMiddlewares.get(operation) ?? [];
    for (const handler of handlers) {
      await handler(ctx);
    }
  }

  // Middleware registration methods
  before(
    operation: AmbitenMiddlewareOperation,
    handler: AmbitenMiddlewareHandler<T>
  ): this {
    const existing = this.beforeMiddlewares.get(operation) ?? [];
    existing.push(handler);
    this.beforeMiddlewares.set(operation, existing);
    return this;
  }

  after(
    operation: AmbitenMiddlewareOperation,
    handler: AmbitenMiddlewareHandler<T>
  ): this {
    const existing = this.afterMiddlewares.get(operation) ?? [];
    existing.push(handler);
    this.afterMiddlewares.set(operation, existing);
    return this;
  }

  beforeFind(handler: AmbitenMiddlewareHandler<T>): this {
    return this.before('find', handler);
  }

  afterFind(handler: AmbitenMiddlewareHandler<T>): this {
    return this.after('find', handler);
  }

  beforeFindOne(handler: AmbitenMiddlewareHandler<T>): this {
    return this.before('findOne', handler);
  }

  afterFindOne(handler: AmbitenMiddlewareHandler<T>): this {
    return this.after('findOne', handler);
  }

  beforeSave(handler: AmbitenMiddlewareHandler<T>): this {
    return this.before('create', handler);
  }

  afterSave(handler: AmbitenMiddlewareHandler<T>): this {
    return this.after('create', handler);
  }

  beforeUpdateOne(handler: AmbitenMiddlewareHandler<T>): this {
    return this.before('updateOne', handler);
  }

  afterUpdateOne(handler: AmbitenMiddlewareHandler<T>): this {
    return this.after('updateOne', handler);
  }

  beforeDeleteOne(handler: AmbitenMiddlewareHandler<T>): this {
    return this.before('deleteOne', handler);
  }

  afterDeleteOne(handler: AmbitenMiddlewareHandler<T>): this {
    return this.after('deleteOne', handler);
  }

  beforeDeleteMany(handler: AmbitenMiddlewareHandler<T>): this {
    return this.before('deleteMany', handler);
  }

  afterDeleteMany(handler: AmbitenMiddlewareHandler<T>): this {
    return this.after('deleteMany', handler);
  }

  beforeBulkInsert(handler: AmbitenMiddlewareHandler<T>): this {
    return this.before('bulkInsert', handler);
  }

  afterBulkInsert(handler: AmbitenMiddlewareHandler<T>): this {
    return this.after('bulkInsert', handler);
  }

  beforeBulkUpdate(handler: AmbitenMiddlewareHandler<T>): this {
    return this.before('bulkUpdate', handler);
  }

  afterBulkUpdate(handler: AmbitenMiddlewareHandler<T>): this {
    return this.after('bulkUpdate', handler);
  }

  beforeAggregate(handler: AmbitenMiddlewareHandler<T>): this {
    return this.before('aggregate', handler);
  }

  afterAggregate(handler: AmbitenMiddlewareHandler<T>): this {
    return this.after('aggregate', handler);
  }

  beforeFindOneAndUpdate(handler: AmbitenMiddlewareHandler<T>): this {
    return this.before('findOneAndUpdate', handler);
  }

  afterFindOneAndUpdate(handler: AmbitenMiddlewareHandler<T>): this {
    return this.after('findOneAndUpdate', handler);
  }

  beforeFindOneAndDelete(handler: AmbitenMiddlewareHandler<T>): this {
    return this.before('findOneAndDelete', handler);
  }

  afterFindOneAndDelete(handler: AmbitenMiddlewareHandler<T>): this {
    return this.after('findOneAndDelete', handler);
  }

  beforeFindOneAndReplace(handler: AmbitenMiddlewareHandler<T>): this {
    return this.before('findOneAndReplace', handler);
  }

  afterFindOneAndReplace(handler: AmbitenMiddlewareHandler<T>): this {
    return this.after('findOneAndReplace', handler);
  }

  beforeFindOneAndUpsert(handler: AmbitenMiddlewareHandler<T>): this {
    return this.before('findOneAndUpsert', handler);
  }

  afterFindOneAndUpsert(handler: AmbitenMiddlewareHandler<T>): this {
    return this.after('findOneAndUpsert', handler);
  }

};