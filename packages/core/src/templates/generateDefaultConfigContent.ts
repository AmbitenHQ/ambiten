import type { AmbitenConfig } from "../types";
import { jsonBootstrapDefaults } from "./jsonBootstrapDefaults";

export interface LoggerFormatOptions {
  timestamp?: boolean | (() => string); // true = ISO, function = custom
  colorize?: boolean;
  source?: string;
  json?: boolean;
  prefix?: string;
}


export function DEFAULT_CONFIG_CONTENT(options: AmbitenConfig): string {
  const config = {
    configVersion: '1.0.0',
    projectName: options.projectName ?? 'my-ambiten-app',
    connection: {
      uri: options.connection?.uri ?? 'mongodb://localhost:27017/my-ambiten-app',
      options: {
        dbName:
          options.connection?.options?.dbName ??
          options.projectName ??
          'my-ambiten-app',
      },
    },
    ...jsonBootstrapDefaults(options),
    ...(options.graphql?.enabled
      ? {
        graphql: {
          enabled: true,
          subscriptions: options.graphql.subscriptions ?? false,
          playground: options.graphql.playground ?? true,
          schemaOutputPath:
            options.graphql.schemaOutputPath ?? './src/graphql/schema.gql',
        },
      }
      : {}),
    features: {
      models: options.features?.models ?? './src/dtos/models',
      schemas: options.features?.schemas ?? './src/dtos/schemas',
      ...(options.graphql?.enabled
        ? {
          typeDefs: options.features?.typeDefs ?? './src/graphql/typeDefs',
          resolvers: options.features?.resolvers ?? './src/graphql/resolvers',
        }
        : {}),
      useRedisCache: options.features?.useRedisCache ?? false,
      redisUri: options.features?.redisUri ?? '',
    },
    advanced: {
      autoInstall: options.advanced?.autoInstall ?? false,
      circuitBreaker: {
        enabled: options.advanced?.circuitBreaker?.enabled ?? true,
        retryAttempts: options.advanced?.circuitBreaker?.retryAttempts ?? 5,
      },
      garbageCollector: {
        enabled: options.advanced?.garbageCollector?.enabled ?? false,
        retentionPeriod: options.advanced?.garbageCollector?.retentionPeriod ?? 30,
        logResults: options.advanced?.garbageCollector?.logResults ?? true,
      },
      gcCron: options.advanced?.gcCron ?? '* * * * *',
    },
  };

  return JSON.stringify(config, null, 2);
};