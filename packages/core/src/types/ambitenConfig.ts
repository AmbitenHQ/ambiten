import { LoggerConfig } from '@ambiten/logger';
import { InitMultiTenancyOptions } from '../tanancy';
import { AmbitenModelOptions, BootstrapModelOptions } from './ambiten.model.type';
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
    headerKey?: string;
    tenants?: Record<string, string>;
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