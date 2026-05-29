import { loadTenraConfig } from '../../config';
import { ILogger, setupLogger, type LoggerTransportConfig } from '@tenra/logger';
import {
  TenraClient,
  createTenraClientModule,
  TenraModel,
  TenraSchema,
  Schema
} from '../index';
import { TenraGraphQL } from '../..';
import { redis } from '../../redis-manager';
import {
  cacheWithRedis,
  configureTenraContext,
  Model,
  colorize,
} from '../../utils';
import { initMultiTenancy, InitMultiTenancyOptions } from '../../tanancy';
import { TenraGC } from '../../gc';
import type { TenraAdapter } from '@tenra/adapter-types';
import type { TenraConfig, BootstrapClient, Document, SchemaDefinition } from '../../types';
import { invalidateTenantCache } from '../../utils/invalidateTenantCache';
import { TenraRuntime } from '../../types/tenra-runtime-type';


type OnConnectHook = () => Promise<void> | void;
type ConnectCallbacks = () => Promise<void> | void;


export interface RegisterMultiTenancyOptions {
  adapter?: TenraAdapter;
  tenants?: Record<string, string>;
  headerKey?: string;
  initOptions?: InitMultiTenancyOptions;
}

export interface TenraBootstrapFactoryOptions {
  config?: string | TenraConfig;
  adapter?: TenraAdapter;
}


/**
 * TenraBootstrap is the main entry point for initializing
 * and managing the Tenra application stack when you opt for the CLI.
 * It handles MongoDB, Redis, and GraphQL setup,
 * along with custom hooks for post-connection logic.
 * @example
 * 
 * ```bash
 * npx Tenra-core my-project 
 * cd my-project
 * ```
 * 
 * This will create a new Tenra project in the 'my-project' directory.
 * You can then customize the configuration file and start using Tenra in your application.
 * 
 * ---
 * 
 * Add flags as needed:
 * 
 * ```bash
 * npx tenra init my-app --with-graphql --multi-tenant --with-redis
 * cd my-app
 * ```
 * This will create a new Tenra project with Redis caching, GraphQL support, and multi-tenancy enabled.
 * enabling them in the configuration file.
 * 
 * ---
 * 
 * You can also use TenraBootstrap programmatically in your application:
 * ```ts
 * @example
 * import { TenraBootstrapFactory } from '@tenra/core';
 *  async function start() {
 *   const tenra = await TenraBootstrapFactory.create({
 *    config: './tenra.config.json' // Optional, will look for Tenra.config.json in the root directory by default
 *    adapter: customAdapter // Optional, only needed if you want to use multi-tenancy with a specific adapter
 * });
 *   const db = tenra.getMongoClient();
 *   await db.connect();
 *   const graphql = await tenra.getGraphQL();
 *   // You can now use the GraphQL instance to generate schema or start a server
 *   // or perform other GraphQL related operations
 *  graphql.generateSchema();
 *  tenra.getRedisClient();
 *  }
 * start();
 * ```
 *
 * @example
 * // With custom configuration file
 * import { TenraBootstrapFactory } from '@Tenra/core';
 * export async function start() {
 *  const tenra = await TenraBootstrapFactory.create('path/to/custom-Tenra.config.json');
 * const db = tenra.getMongoClient();
 * await db.connect();
 *  const graphql = await tenra.getGraphQL();
 *  // You can now use the GraphQL instance to generate schema or start a server
 * // or perform other GraphQL related operations
 * graphql.generateSchema();
 * tenra.getRedisClient();
 * };
  * @param {string} [configFilePathOrObject] - Optional path to a custom configuration file or a config object.
 * If not provided, it defaults to 'Tenra.config.json'.
 * @returns {Promise<void>} - A promise that resolves when the initialization is complete.
 * 
 * // Now you can use tenra.getMongoClient(), tenra.getRedisClient(), etc.
 */
class TenraBootstrap<T extends Document = Document> implements TenraRuntime<T> {
  private config!: TenraConfig;
  private provider!: BootstrapClient;
  private model!: TenraModel<T>;
  private schema!: TenraSchema<T>;
  private graphql?: TenraGraphQL;
  private gc?: TenraGC;

  // public logCfgProperty!: ReturnType<typeof setupLogger>;
  private logger!: ILogger;


  private adapter?: TenraAdapter;
  private onConnectHooks: OnConnectHook[] = [];
  private connectCallbacks: ConnectCallbacks[] = [];

  private isConnected?: true

  constructor(adapter?: TenraAdapter) {
    this.adapter = adapter;
  }

  /**
   * Register a hook to be called after the connection is established.
   */
  // public onConnect(hook: OnConnectHook): void {
  //   this.onConnectHooks.push(hook);
  // }

  public onConnect(callback: () => void): void {
    if (!this.isConnected) {
      callback();
      return;
    }

    this.connectCallbacks.push(callback);
  }

  /**
   * Initializes the Tenra application stack.
   */
  async initialize(configFilePathOrObject?: string | TenraConfig): Promise<void> {
    this.config =
      configFilePathOrObject && typeof configFilePathOrObject === 'object'
        ? (configFilePathOrObject as TenraConfig)
        : await loadTenraConfig(configFilePathOrObject as string | undefined);

    this.initializeLogger();
    await this.initializeRedis();
    await this.initializeMongoProvider();
    this.initializeSchema();
    await this.initializeModel();
    await this.initializeMultiTenancy();
    await this.initializeGraphQL();
    await this.runOnConnectHooks();
    await this.initializeGarbageCollector();
  }

  private initializeLogger(): void {
    const loggerConfig = this.config.logger;

    const defaultTransportConfigs: LoggerTransportConfig[] = [
      { type: 'console', options: {} },
      {
        type: 'rotating-file',
        options: {
          filename: './logs/tenra.log',
          frequency: 'daily',
          compress: false,
          flushInterval: 1000,
        },
      },
    ];

    this.logger = setupLogger({
      ...loggerConfig,
      transports: undefined,
      transportConfigs:
        loggerConfig?.transportConfigs?.length
          ? loggerConfig.transportConfigs
          : defaultTransportConfigs,
    });

    this.logger.info('Logger initialized', {
      source: 'TenraBootstrap',
    });
  }

  private async initializeRedis(): Promise<void> {
    if (!this.config.features?.useRedisCache || !this.config.features.redisUri) {
      return;
    }

    await redis.get(this.config.features.redisUri);

    this.getLogger().info('Redis connected', {
      source: 'TenraBootstrap'
    })
  }

  private async initializeMongoProvider(): Promise<void> {
    const resolvedDbName =
      this.config.connection?.options?.dbName ||
      this.config.projectName ||
      undefined;

    this.provider =
      this.config.mongoClient ??
      this.config.provider ??
      createTenraClientModule({
        uri: this.config.connection?.uri!,
        options: {
          dbName: resolvedDbName,
          ...this.config.connection?.options,
        },
      });

    await this.provider.connect();

    configureTenraContext(this.provider);

    if (this.logger) {
      this.getLogger().info('MongoDB connected via TenraClientModule', {
        source: 'TenraBootstrap'
      });
    } else {
      console.log(colorize('MongoDB connected via TenraClientModule', 'blue'));
    }
  }

  private initializeSchema(): void {
    this.schema = new Schema<T>(
      typeof this.config.schema === 'object'
        ? this.config.schema as SchemaDefinition<T>
        : {} as SchemaDefinition<T>

    );

    if (this.config.schema) {
      this.schema.registerSchema(this.config.schema as SchemaDefinition<T>);
      this.getLogger().info('Schema registered', { source: 'TenraBootstrap' });
    } else {
      this.getLogger().warn('No schema provided, using default schema', { source: 'TenraBootstrap' });
    }
  }

  private async initializeModel(): Promise<void> {
    const collectionName = this.config.model?.collectionName || 'default';

    this.model = Model<T>({
      collectionName,
      schema: this.schema,
      provider: this.provider,
      ctx: this.config.model?.ctx,
      collection: this.config.model?.collection,
      gcConfig: this.config.model?.gcConfig,
    })

    if (this.config.model) {
      await this.model.registerModel({
        ...this.config.model,
        collectionName,
        schema: this.schema,
        provider: this.provider,
      });

      if (this.logger) {
        this.getLogger().info(`Model registered: ${collectionName}`, {
          source: 'TenraBootstrap'
        });
      } else {
        console.log(colorize(`Model registered: ${collectionName}`, 'blue'));
      }
    }
  }

  private async initializeMultiTenancy(): Promise<void> {
    if (!this.config.multiTenant?.enabled) return;

    const tenants = this.config.multiTenant.tenants || {};
    const initOptions = this.config.multiTenant.initOptions || {};

    await initMultiTenancy(tenants, initOptions);

    this.getLogger().info('Multi-tenancy initialized', {
      source: 'TenraBootstrap',
      tenantCount: Object.keys(tenants).length,
      lazy: initOptions.lazy ?? false,
    });
  }

  private async initializeGraphQL(): Promise<void> {
    if (!this.config.graphql?.enabled) {
      return;
    }

    this.graphql = new TenraGraphQL({
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
      provider: this.provider
    });

    await this.graphql.generateSchema();

    if (this.logger) {
      this.getLogger().info('GraphQL schema generated');
      this.getLogger().info('GraphQL initialized');
    } else {
      console.log(colorize('GraphQL schema generated', 'blue'));
      console.log(colorize('GraphQL initialized', 'blue'));
    }
  }

  private async runOnConnectHooks(): Promise<void> {
    for (const hook of this.onConnectHooks) {
      await hook();
    }
  }

  private async initializeGarbageCollector(): Promise<void> {
    if (!this.config.advanced?.garbageCollector?.enabled) return;

    this.gc = new TenraGC({
      enabled: this.config.advanced.garbageCollector.enabled ?? true,
      cron: this.config.advanced.gcCron || '0 0 * * *',
      logResults: this.config.advanced.garbageCollector.logResults ?? true,
      continueOnError: true
    });

    console.log('✅ Garbage Collector initialized');
  }

  public async registerMultiTenancy(options?: {
    tenants?: Record<string, string>;
    lazy?: boolean;
  }): Promise<void> {
    const multiTenantConfig = this.config.multiTenant;

    const logger = this.config.logger?.logger

    if (!multiTenantConfig?.enabled) {
      logger?.warn('Multi-tenancy is not enabled.', {
        source: 'TenraBootstrap',
      });
      return;
    }

    const tenants = options?.tenants ?? multiTenantConfig.tenants;

    if (!tenants || Object.keys(tenants).length === 0) {
      logger?.warn('Multi-tenancy is enabled but no tenants were provided.', {
        source: 'TenraBootstrap',
      });
      return;
    }

    await initMultiTenancy(tenants, {
      lazy: options?.lazy ?? multiTenantConfig.initOptions?.lazy ?? true,
      config: this.config.logger,
    });

    logger?.info('Multi-tenancy registered successfully.', {
      source: 'TenraBootstrap',
      tenantCount: Object.keys(tenants).length,
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
    } = {}
  ): Promise<T> {
    if (!redis) {
      throw new Error('Redis is not initialized');
    }

    return cacheWithRedis<T>(redis, key, fetcher, options);
  }

  public async invalidateCache(tenantId: string, namespace?: string): Promise<void> {
    if (!redis) {
      throw new Error('No Redis client available');
    }

    const logger = this.config.logger?.logger

    if (!tenantId) {
      throw new Error('Tenant ID is required to invalidate cache');
    }

    logger?.info('Invalidating cache for tenant:', {
      source: 'TenraBootstrap',
      tenantId,
      namespace: namespace
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

  public getMongoClient(): TenraClient | BootstrapClient {
    return this.provider;
  }

  public getModel(): TenraModel<T> {
    return this.model as TenraModel<T>;
  }

  public getSchema(): TenraSchema<T> {
    return this.schema as TenraSchema<T>;
  }

  public getGraphQL(): TenraGraphQL | undefined {
    if (!this.graphql) {
      throw new Error('GraphQL is not initialized.');
    }
    return this.graphql;
  }

  public getGCRunner(): TenraGC | undefined {
    if (!this.gc) {
      throw new Error('Garbage Collector is not initialized.');
    }
    return this.gc;
  }

  public getLogger(): ILogger {
    return this.logger
  }

  public async shutdown(): Promise<void> {
    const logger = this.config.logger?.logger

    if (redis.isOpen) {
      await redis.disconnect();
      logger?.info('🧹 Redis connection closed', {
        source: 'TenraBootstrap'
      });
    }

    if (this.provider) {
      await this.provider.close();
      logger?.log?.('info', 'MongoDB connection closed')
    }

    logger?.log?.('info', 'Shutdown complete');
  }
};



/**
 * Factory class to create an instance of TenraBootstrap.
 * This class encapsulates the logic for initializing the Tenra application stack,
 * including MongoDB, Multi-Tenancy, Redis, GraphQL logger etc. setup.
 * It can be used to create a fully configured Tenra instance
 * with optional configuration parameters.
 * @example
 * const tenra = await TenraBootstrapFactory.create({
 * adapter: customAdapter,
 * config: './tenraConfig.json' // Do this only if you want to use a custom config file, otherwise it will look for tenraConfig.json in the root directory by default
 * });
 * const db = tenra.getMongoClient();
 * await db.connect();
 * const graphql = await tenra.getGraphQL();
 * // You can now use the GraphQL instance to generate schema or start a server
 * // or perform other GraphQL related operations
 * graphql.generateSchema();
 * tenra.getRedisClient();
 * // or with custom config
 * const tenra = await TenraBootstrapFactory.create(customConfig);
 * @param {tenraConfig} [config] - Optional configuration object for Tenra.
 * @returns {Promise<TenraBootstrap>} - A promise that resolves to an instance of TenraBootstrap.
 */
export class TenraBootstrapFactory {
  static async create(
    options: TenraBootstrapFactoryOptions = {}
  ): Promise<TenraRuntime> {
    const bootstrap = new TenraBootstrap(options.adapter);
    await bootstrap.initialize(options.config);
    return bootstrap;
  }
}

