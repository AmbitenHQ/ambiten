import { LoggerConfig } from '@ambiten/logger';
import type { InitMultiTenancyOptions } from '../tanancy';
import type { BootstrapModelOptions } from './ambiten.model.type';
import type { SchemaDefinition } from './schema.type';
import type { Document } from './document';
import type { BootstrapClient } from './bootstrapClient.type';
import type { TenantConfigResolver } from './tenant-config-resolver';


export interface AmbitenLoggerSettings extends LoggerConfig {
  enabled?: boolean; // Used only in config.json
  logger?: LoggerConfig['logger']; // Used only in config.json
  logLevel?: LoggerConfig['level'];
  useColor?: boolean;
  colorize?: LoggerConfig['colorize'];
  transportConfigs: LoggerConfig['transportConfigs'];
  transports?: LoggerConfig['transports'];
  json?: boolean;
  formatOptions?: LoggerConfig['formatOptions'];
  excludedSources?: LoggerConfig['excludedSources'];
  hooks?: LoggerConfig['hooks'];
  enrichMetadata?: LoggerConfig['enrichMetadata'];
  enableMetrics?: LoggerConfig['enableMetrics'];
  shouldLog?: LoggerConfig['shouldLog'];
  circuitBreaker?: LoggerConfig['circuitBreaker'];
  compress?: LoggerConfig['compress'];
}


export interface AmbitenConfig<
  T extends Document = any
> {
  projectName?: string;

  provider?: BootstrapClient;
  mongoClient?: BootstrapClient;

  connection?: {
    uri: string;
    options?: Record<string, any>;
  };

  model?: BootstrapModelOptions<T>;

  schema?: SchemaDefinition<T>;

  multiTenant?: {
    enabled?: boolean;

    /**
     * Header used by supported runtime integrations
     * to identify the active tenant.
     *
     * @default "x-tenant-id"
     */
    headerKey?: string;

    /**
     * Static tenant ID → MongoDB URI mappings.
     *
     * Useful for local development, tests,
     * and applications with a known tenant set.
     */
    tenants?: Record<string, string>;

    /**
     * Dynamically resolves configuration for tenants
     * that are not already registered.
     */
    tenantConfigResolver?: TenantConfigResolver;

    initOptions?: InitMultiTenancyOptions;
  };

  logger?: AmbitenLoggerSettings;

  graphql?: {
    enabled?: boolean;
    subscriptions?: boolean;
    playground?: boolean;
    schemaOutputPath?: string;
  };

  features?: {
    models?: string;
    schemas?: string;
    typeDefs?: string;
    resolvers?: Record<string, any> | Record<string, any>[];
    useRedisCache?: boolean;
    redisUri?: string;
  };

  advanced?: {
    autoInstall?: boolean;

    circuitBreaker?: {
      enabled?: boolean;
      retryAttempts?: number;
    };

    garbageCollector?: {
      enabled?: boolean;
      retentionPeriod?: number | string;
      logResults?: boolean;
    };

    gcCron?: string;
  };

  configVersion?: string;
};