import { resolveAmbitenConfig } from "../../config";
import { type ILogger } from "@ambiten/logger";
import { createBootstrapLogger } from "./bootstrapLogger";
import type { ResolvedAmbitenConfig } from "../../types/config-module";
import { AmbitenClient, createAmbitenClientModule } from "../ambitenClient";
import { AmbitenModel } from "../model/ambitenModelFactory";
import { Model } from "../model/model";
import { AmbitenSchema, Schema } from "../schema/ambitenSchema";
import { AmbitenGraphQL } from "../..";
import { redis } from "../../redis-manager";
import { cacheWithRedis, configureAmbitenContext, colorize } from "../../utils";
import {
  initMultiTenancy,
  InitMultiTenancyOptions,
  MultiTenantManager,
} from "../../tanancy";
import { AmbitenGC } from "../../gc";
import type { AmbitenAdapter } from "@ambiten/adapter-types";
import type {
  AmbitenConfig,
  BootstrapClient,
  Document,
  SchemaDefinition,
} from "../../types";
import { invalidateTenantCache } from "../../utils/invalidateTenantCache";
import { AmbitenRuntime } from "../../types/ambiten-runtime-type";


export interface RegisterMultiTenancyOptions {
  adapter?: AmbitenAdapter;
  tenants?: Record<string, string>;
  headerKey?: string;
  initOptions?: InitMultiTenancyOptions;
}

export interface AmbitenBootstrapFactoryOptions<T extends Document = Document> {
  config?: string | AmbitenConfig<T>;
  adapter?: AmbitenAdapter;
}

/**
 * AmbitenBootstrap is the main entry point for initializing
 * and managing the Ambiten application stack when you opt for the CLI.
 * It handles MongoDB, Redis, and GraphQL setup,
 * along with custom hooks for post-connection logic.
 * @example
 *
 * ```bash
 * npx Ambiten-core my-project
 * cd my-project
 * ```
 *
 * This will create a new Ambiten project in the 'my-project' directory.
 * You can then customize the configuration file and start using Ambiten in your application.
 *
 * ---
 *
 * Add flags as needed:
 *
 * ```bash
 * npx Ambiten init my-app --with-graphql --multi-tenant --with-redis
 * cd my-app
 * ```
 * This will create a new Ambiten project with Redis caching, GraphQL support, and multi-tenancy enabled.
 * enabling them in the configuration file.
 *
 * ---
 *
 * You can also use AmbitenBootstrap programmatically in your application:
 * ```ts
 * @example
 * import { AmbitenBootstrapFactory } from '@Ambiten/core';
 *  async function run() {
 *   return AmbitenBootstrapFactory.create({ config: {} });
 *
 * }
 *
 *  const runtime = await run()
 *  const client = runtime.getMongoClient();
 *  console.log('Client is ready' Boolean(client))
 *
 *  const graphql = runtime.getGraphQL();
 *  // You can now use the GraphQL instance to generate schema or start a server
 *  // or perform other GraphQL related operations
 *  graphql.generateSchema();
 *  runtime.getRedisClient();
 *  };
 * ```
 *
 *
 * @param {string} [configFilePathOrObject] - Optional path to a custom configuration file or a config object.
 * If not provided, it defaults to 'ambiten.config.json'.
 * @returns {Promise<void>} - A promise that resolves when the initialization is complete.
 *
 * // Now you can use runtime.getMongoClient(), runtime.getRedisClient(), etc.
 */
class AmbitenBootstrap<T extends Document = Document>
  implements AmbitenRuntime<T> {
  private config!: ResolvedAmbitenConfig<T>;
  private provider!: BootstrapClient;
  private model!: AmbitenModel<T>;
  private schema!: AmbitenSchema<T>;
  private graphql?: AmbitenGraphQL;
  private gc?: AmbitenGC;
  private logger!: ILogger;
  private adapter?: AmbitenAdapter;
  private readonly onConnectHooks: Array<() => void | Promise<void>> = [];
  private isConnected = false;

  constructor(adapter?: AmbitenAdapter) {
    this.adapter = adapter;
  }

  public onConnect(callback: () => void | Promise<void>): void {
    if (this.isConnected) {
      void callback();
      return;
    }
    this.onConnectHooks.push(callback);
  }
  async initialize(
    configFilePathOrObject?: string | AmbitenConfig<T>,
  ): Promise<void> {
    this.config = await resolveAmbitenConfig<T>(configFilePathOrObject);
    await this.initializeLogger();
    await this.initializeRedis();
    await this.initializeMongoProvider();
    this.initializeSchema();
    await this.initializeModel();
    await this.initializeMultiTenancy();
    await this.initializeGraphQL();
    await this.initializeGarbageCollector();
  }

  private async initializeLogger(): Promise<void> {
    this.logger = await createBootstrapLogger(this.config.logger);
    this.config.logger = {
      ...this.config.logger,
      transportConfigs: this.config.logger?.transportConfigs ?? [],
      logger: this.logger,
    };
    this.logger.info("Logger initialized", {
      source: "AmbitenBootstrap",
    });
  }

  private async initializeRedis(): Promise<void> {
    if (
      !this.config.features?.useRedisCache ||
      !this.config.features.redisUri
    ) {
      return;
    }
    await redis.get(this.config.features.redisUri);
    this.getLogger().info("Redis connected", {
      source: "AmbitenBootstrap",
    });
  }

  private async initializeMongoProvider(): Promise<void> {
    const resolvedDbName =
      this.config.connection?.options?.dbName ||
      this.config.projectName ||
      undefined;
    this.provider =
      this.config.mongoClient ??
      this.config.provider ??
      createAmbitenClientModule({
        uri: this.config.connection?.uri || "mongodb://localhost:27017",
        ...(this.config.multiTenant?.enabled
          ? { tenantResolver: MultiTenantManager }
          : {}),
        options: {
          dbName: resolvedDbName,
          ...this.config.connection?.options,
        },
      });
    await this.provider.connect();
    configureAmbitenContext(this.provider);
    this.isConnected = true;
    if (this.logger) {
      this.getLogger().info("MongoDB connected via AmbitenClientModule", {
        source: "AmbitenBootstrap",
      });
      await this.runOnConnectHooks();
    } else {
      console.log(
        colorize("MongoDB connected via AmbitenClientModule", "blue"),
      );
    }
  }

  private initializeSchema(): void {
    const definition = this.config.schema ?? ({} as SchemaDefinition<T>);
    /*
     * Schema.create() constructs the Schema instance
     * and registers the supplied definition.
     *
     * No additional registerSchema() call is required.
     */
    this.schema = Schema.create<T>(definition);
    const hasDefinition = Object.keys(definition).length > 0;
    if (hasDefinition) {
      this.getLogger().info("Schema initialized and registered", {
        source: "AmbitenBootstrap",
      });
      return;
    }
    this.getLogger().warn(
      "No schema definition provided; using the default empty schema.",
      {
        source: "AmbitenBootstrap",
      },
    );
  }

  private async initializeModel(): Promise<void> {
    const collectionName = this.config.model?.collectionName || "default";
    const schema = this.schema;
    this.model = Model<T>({
      collectionName,
      schema: this.schema,
      provider: this.provider,
      ctx: this.config.model?.ctx,
      collection: this.config.model?.collection,
      gcConfig: this.config.model?.gcConfig,
    });
    if (this.config.model) {
      await this.model.registerModel({
        ...this.config.model,
        collectionName,
        schema: schema,
        provider: this.provider,
      });
      if (this.logger) {
        this.getLogger().info(`Model registered: ${collectionName}`, {
          source: "AmbitenBootstrap",
        });
      } else {
        console.log(colorize(`Model registered: ${collectionName}`, "blue"));
      }
    }
  }

  private async initializeMultiTenancy(): Promise<void> {
    if (!this.config.multiTenant?.enabled) {
      return;
    }
    await this.registerMultiTenancy();
  }

  private async initializeGraphQL(): Promise<void> {
    if (!this.config.graphql?.enabled) {
      return;
    }
    this.graphql = new AmbitenGraphQL({
      useRedis: this.config.features?.useRedisCache ?? false,
      customTypeDefs: this.config.features?.typeDefs
        ? Array.isArray(this.config.features.typeDefs)
          ? this.config.features.typeDefs
          : [this.config.features.typeDefs]
        : [],
      customResolvers: this.config.features?.resolvers
        ? Array.isArray(this.config.features.resolvers)
          ? this.config.features.resolvers
          : [this.config.features.resolvers]
        : [],
      provider: this.provider,
    });
    await this.graphql.generateSchema();
    if (this.logger) {
      this.getLogger().info("GraphQL schema generated");
      this.getLogger().info("GraphQL initialized");
    } else {
      console.log(colorize("GraphQL schema generated", "blue"));
      console.log(colorize("GraphQL initialized", "blue"));
    }
  }

  private async runOnConnectHooks(): Promise<void> {
    const hooks = this.onConnectHooks.splice(0);
    for (const hook of hooks) {
      await hook();
    }
  }

  private async initializeGarbageCollector(): Promise<void> {
    if (!this.config.advanced?.garbageCollector?.enabled) return;
    this.gc = new AmbitenGC({
      enabled: this.config.advanced.garbageCollector.enabled ?? true,
      cron: this.config.advanced.gcCron || "0 0 * * *",
      logResults: this.config.advanced.garbageCollector.logResults ?? true,
      continueOnError: true,
    });
    console.log("✅ Garbage Collector initialized");
  }

  public async registerMultiTenancy(options?: {
    tenants?: Record<string, string>;
    lazy?: boolean;
  }): Promise<void> {
    const multiTenantConfig = this.config.multiTenant;
    const logger = this.getLogger();
    if (!multiTenantConfig?.enabled) {
      logger?.warn("Multi-tenancy is not enabled.", {
        source: "AmbitenBootstrap",
      });
      return;
    }
    const tenants = options?.tenants ?? multiTenantConfig.tenants ?? {};
    const tenantConfigResolver = multiTenantConfig.tenantConfigResolver;
    if (Object.keys(tenants).length === 0 && !tenantConfigResolver) {
      logger.warn(
        "Multi-tenancy is enabled but no static tenants or resolver were provided.",
        {
          source: "AmbitenBootstrap",
        },
      );
      return;
    }
    await initMultiTenancy(tenants, {
      ...multiTenantConfig.initOptions,
      lazy: options?.lazy ?? multiTenantConfig.initOptions?.lazy ?? false,
      config: this.config.logger,
      tenantConfigResolver,
    });
    logger.info("Multi-tenancy initialized", {
      source: "AmbitenBootstrap",
      staticTenantCount: Object.keys(tenants).length,
      registeredTenantCount: MultiTenantManager.getAllTenants().length,
      connectedTenantCount: MultiTenantManager.getAllConnectedTenants().length,
      dynamicResolver: Boolean(tenantConfigResolver),
      lazy: options?.lazy ?? multiTenantConfig.initOptions?.lazy ?? false,
    });
  }

  public async cache<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: {
      ttlSeconds?: number;
      prefix?: string;
      tenantId?: string;
      namespace?: string;
    } = {},
  ): Promise<T> {
    if (!redis) {
      throw new Error("Redis is not initialized");
    }
    return cacheWithRedis<T>(redis, key, fetcher, options);
  }

  public async invalidateCache(
    tenantId: string,
    namespace?: string,
  ): Promise<void> {
    if (!redis) {
      throw new Error("No Redis client available");
    }
    const logger = this.getLogger();
    if (!tenantId) {
      throw new Error("Tenant ID is required to invalidate cache");
    }
    logger?.info("Invalidating cache for tenant:", {
      source: "AmbitenBootstrap",
      tenantId,
      namespace: namespace,
    });
    await invalidateTenantCache(redis, tenantId, namespace);
  }

  /**
   * Returns the Redis client if Redis is enabled in the configuration.
   */
  public async getRedisClient(): Promise<typeof redis> {
    if (this.config.features?.useRedisCache && this.config.features.redisUri) {
      await redis.get(this.config.features.redisUri);
    }
    return redis;
  }

  public getMongoClient(): AmbitenClient | BootstrapClient {
    return this.provider;
  }

  public getModel(): AmbitenModel<T> {
    return this.model as AmbitenModel<T>;
  }

  public getSchema(): AmbitenSchema<T> {
    return this.schema as AmbitenSchema<T>;
  }

  public getGraphQL(): AmbitenGraphQL | undefined {
    if (!this.graphql) {
      throw new Error("GraphQL is not initialized.");
    }
    return this.graphql;
  }

  public getGCRunner(): AmbitenGC | undefined {
    if (!this.gc) {
      throw new Error("Garbage Collector is not initialized.");
    }
    return this.gc;
  }

  public getLogger(): ILogger {
    return this.logger;
  }

  public async shutdown(): Promise<void> {
    const logger = this.getLogger();
    if (redis.isOpen) {
      await redis.disconnect();
      logger?.info("🧹 Redis connection closed", {
        source: "AmbitenBootstrap",
      });
    }
    if (this.provider) {
      await this.provider.close();
      logger.info("MongoDB connection closed", { source: "AmbitenBootstrap" });
    }
    logger.info("Shutdown complete", { source: "AmbitenBootstrap" });
    // The logger shutdown hook flushes buffered file transports.
    // close() alone in @ambiten/logger 1.0.1 only stops metrics.
    if (logger.shutdown) {
      await logger.shutdown();
    } else if (logger.close) {
      await logger.close();
    } else if (logger.stop) {
      await logger.stop();
    }
  }
}

/**
 * Factory which returns the instance of the main AmbitenBootstrap and
 * Attached a method AmbitenBootstrap.create() which initializes the AmbitenBootstrap.
 * This class encapsulates the logic for initializing the Ambiten application stack,
 * including MongoDB, Multi-Tenancy, Redis, GraphQL logger etc. setup.
 * It can be used to create a fully configured Ambiten application.
 * with optional configuration parameters.
 * @example
 * const Ambiten = await AmbitenBootstrapFactory.create();
 * const db = Ambiten.getMongoClient();
 * await db.connect();
 * const graphql = await Ambiten.getGraphQL();
 * // You can now use the GraphQL instance to generate schema or start a server
 * // or perform other GraphQL related operations
 * graphql.generateSchema();
 * Ambiten.getRedisClient();
 * // or with custom config
 * const Ambiten = await AmbitenBootstrapFactory.create(customConfig);
 * @param {AmbitenConfig} [config] - Optional configuration object for Ambiten.
 * @returns {Promise<AmbitenBootstrap>} - A promise that resolves to an instance of AmbitenBootstrap.
 */
export class AmbitenBootstrapFactory {
  static async create<T extends Document = Document>(
    options: AmbitenBootstrapFactoryOptions<T> = {},
  ): Promise<AmbitenRuntime<T>> {
    const bootstrap = new AmbitenBootstrap<T>(options.adapter);
    await bootstrap.initialize(options.config);
    return bootstrap;
  }
};