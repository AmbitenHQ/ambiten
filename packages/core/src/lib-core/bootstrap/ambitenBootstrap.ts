import { loadAmbitenConfig } from '../../config';
import { ILogger, setupLogger, type LoggerTransportConfig } from '@ambiten/logger';
import {
  AmbitenClient,
  createAmbitenClientModule,
  AmbitenModel,
  AmbitenSchema,
  Schema
} from '../index';
import { AmbitenGraphQL } from '../..';
import { redis } from '../../redis-manager';
import {
  cacheWithRedis,
  configureAmbitenContext,
  Model,
  colorize,
} from '../../utils';
import { initMultiTenancy, InitMultiTenancyOptions } from '../../tanancy';
import { AmbitenGC } from '../../gc';
import type { AmbitenAdapter } from '@ambiten/adapter-types';
import type { AmbitenConfig, BootstrapClient, Document, SchemaDefinition } from '../../types';
import { invalidateTenantCache } from '../../utils/invalidateTenantCache';
import { AmbitenRuntime } from '../../types/ambiten-runtime-type';


type OnConnectHook = () => Promise<void> | void;
type ConnectCallbacks = () => Promise<void> | void;


export interface RegisterMultiTenancyOptions {
  adapter?: AmbitenAdapter;
  tenants?: Record<string, string>;
  headerKey?: string;
  initOptions?: InitMultiTenancyOptions;
}

export interface AmbitenBootstrapFactoryOptions {
  config?: string | AmbitenConfig;
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
 *  async function start() {
 *   const Ambiten = await AmbitenBootstrapFactory.create();
 *   const db = Ambiten.getMongoClient();
 *   await db.connect();
 *   const graphql = await Ambiten.getGraphQL();
 *   // You can now use the GraphQL instance to generate schema or start a server
 *   // or perform other GraphQL related operations
 *  graphql.generateSchema();
 *  Ambiten.getRedisClient();
 *  }
 * start();
 * ```
 *
 * 
  * @param {string} [configFilePathOrObject] - Optional path to a custom configuration file or a config object.
 * If not provided, it defaults to 'Ambiten.config.json'.
 * @returns {Promise<void>} - A promise that resolves when the initialization is complete.
 * 
 * // Now you can use Ambiten.getMongoClient(), Ambiten.getRedisClient(), etc.
 */
class AmbitenBootstrap<T extends Document = Document> implements AmbitenRuntime<T> {
  private config!: AmbitenConfig;
  private provider!: BootstrapClient;
  private model!: AmbitenModel<T>;
  private schema!: AmbitenSchema<T>;
  private graphql?: AmbitenGraphQL;
  private gc?: AmbitenGC;
  private logger!: ILogger;
  private adapter?: AmbitenAdapter;
  private onConnectHooks: OnConnectHook[] = [];
  private connectCallbacks: ConnectCallbacks[] = [];

  private isConnected?: true

  constructor(adapter?: AmbitenAdapter) {
    this.adapter = adapter;
  }

  public onConnect(callback: () => void): void {
    if (!this.isConnected) {
      callback();
      return;
    }

    this.connectCallbacks.push(callback);
  }

  /**
   * Initializes the Ambiten application stack.
   */
  async initialize(configFilePathOrObject?: string | AmbitenConfig): Promise<void> {
    this.config =
      configFilePathOrObject && typeof configFilePathOrObject === 'object'
        ? (configFilePathOrObject as AmbitenConfig)
        : await loadAmbitenConfig(configFilePathOrObject as string | undefined);

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
          filename: './logs/ambiten.log',
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
      source: 'AmbitenBootstrap',
    });
  }

  private async initializeRedis(): Promise<void> {
    if (!this.config.features?.useRedisCache || !this.config.features.redisUri) {
      return;
    }

    await redis.get(this.config.features.redisUri);

    this.getLogger().info('Redis connected', {
      source: 'AmbitenBootstrap'
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
      createAmbitenClientModule({
        uri: this.config.connection?.uri || 'mongodb://localhost:27017',
        options: {
          dbName: resolvedDbName,
          ...this.config.connection?.options,
        },
      });

    await this.provider.connect();

    configureAmbitenContext(this.provider);

    if (this.logger) {
      this.getLogger().info('MongoDB connected via AmbitenClientModule', {
        source: 'AmbitenBootstrap'
      });
    } else {
      console.log(colorize('MongoDB connected via AmbitenClientModule', 'blue'));
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
      this.getLogger().info('Schema registered', { source: 'AmbitenBootstrap' });
    } else {
      this.getLogger().warn('No schema provided, using default schema', { source: 'AmbitenBootstrap' });
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
          source: 'AmbitenBootstrap'
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
      source: 'AmbitenBootstrap',
      tenantCount: Object.keys(tenants).length,
      lazy: initOptions.lazy ?? false,
    });
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

    this.gc = new AmbitenGC({
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
        source: 'AmbitenBootstrap',
      });
      return;
    }

    const tenants = options?.tenants ?? multiTenantConfig.tenants;

    if (!tenants || Object.keys(tenants).length === 0) {
      logger?.warn('Multi-tenancy is enabled but no tenants were provided.', {
        source: 'AmbitenBootstrap',
      });
      return;
    }

    await initMultiTenancy(tenants, {
      lazy: options?.lazy ?? multiTenantConfig.initOptions?.lazy ?? true,
      config: this.config.logger,
    });

    logger?.info('Multi-tenancy registered successfully.', {
      source: 'AmbitenBootstrap',
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
      source: 'AmbitenBootstrap',
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
      throw new Error('GraphQL is not initialized.');
    }
    return this.graphql;
  }

  public getGCRunner(): AmbitenGC | undefined {
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
        source: 'AmbitenBootstrap'
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
 * Factory class to create an instance of AmbitenBootstrap.
 * This class encapsulates the logic for initializing the Ambiten application stack,
 * including MongoDB, Multi-Tenancy, Redis, GraphQL logger etc. setup.
 * It can be used to create a fully configured Ambiten instance
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
  static async create(
    options: AmbitenBootstrapFactoryOptions = {}
  ): Promise<AmbitenRuntime> {
    const bootstrap = new AmbitenBootstrap(options.adapter);
    await bootstrap.initialize(options.config);
    return bootstrap;
  }
}

