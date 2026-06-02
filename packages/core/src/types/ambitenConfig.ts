import { LoggerConfig } from '@ambiten/logger';
import { InitMultiTenancyOptions } from '../tanancy';
import { AmbitenModelOptions } from './ambiten.model.type';
import { SchemaDefinition } from './schema.type';
import { Document } from './document';
import { BootstrapClient } from './bootstrapClient.type';


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


export interface AmbitenConfig {
  projectName?: string;

  /**
   * Optional externally provided bootstrap client/provider.
   * If provided, bootstrap uses this instead of creating one from connection config.
   */
  provider?: BootstrapClient;
  mongoClient?: BootstrapClient;

  /**
   * Connection settings used when no provider/mongoClient is supplied.
   */
  connection?: {
    uri: string;
    options?: Record<string, any>;
  };

  /**
   * Optional default model/schema bootstrap config.
   * These are runtime-facing defaults, not request resolver functions.
   */
  model?: AmbitenModelOptions;
  schema?: SchemaDefinition<Document>;

  /**
   * Multi-tenant runtime configuration.
   */
  multiTenant?: {
    enabled?: boolean;
    headerKey?: string;
    tenants?: Record<string, string>;
    initOptions?: InitMultiTenancyOptions;
  };

  /**
   * Logger configuration.
   */
  logger?: AmbitenLoggerSettings;

  /**
   * Optional GraphQL auto-generation/bootstrap feature.
   * Primarily useful for playgrounds, prototyping, and generated GraphQL flows.
   */
  graphql?: {
    enabled?: boolean;
    subscriptions?: boolean;
    playground?: boolean;
    schemaOutputPath?: string;
  };

  /**
   * Optional feature paths and integrations.
   * These are especially useful for generated project structures and bootstrap discovery.
   */
  features?: {
    models?: string;
    schemas?: string;
    typeDefs?: string;
    resolvers?: Record<string, any> | Record<string, any>[];
    useRedisCache?: boolean;
    redisUri?: string;
  };

  /**
   * Advanced runtime configuration.
   */
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

  /**
   * Optional config metadata/versioning.
   * Useful for generated config files and forward compatibility.
   */
  configVersion?: string;
};