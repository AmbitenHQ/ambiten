import prompts from 'prompts';
import type { TenraConfig } from '../types';
import type { BootstrapCliOptions } from './types';


function normalizeProjectName(name: string): string {
  return name.trim().replace(/\s+/g, '-').toLowerCase();
}

function wasProvided(value: unknown): boolean {
  return typeof value !== 'undefined';
}

function printScaffoldSummary(config: TenraConfig): void {
  const lines = [
    '',
    'Scaffold summary:',
    `  Project: ${config.projectName}`,
    `  MongoDB URI: ${config.connection?.uri ?? '(none)'}`,
    `  GraphQL: ${config.graphql?.enabled ? 'enabled' : 'disabled'}`,
    `  Multi-tenancy: ${config.multiTenant?.enabled ? 'enabled' : 'disabled'}`,
    `  Logger: ${config.logger?.enabled ? 'enabled' : 'disabled'}`,
    `  Redis Cache: ${config.features?.useRedisCache ? 'enabled' : 'disabled'}`,
    `  Garbage Collector: ${config.advanced?.garbageCollector?.enabled ? 'enabled' : 'disabled'}`,
    `  Auto-install: ${config.advanced?.autoInstall ? 'enabled' : 'disabled'}`,
    '',
  ];

  console.log(lines.join('\n'));
}

export async function buildInteractiveConfig(
  projectNameArg: string | undefined,
  options: BootstrapCliOptions
): Promise<TenraConfig> {
  const response = await prompts(
    [
      {
        type: projectNameArg ? null : 'text',
        name: 'projectName',
        message: 'Project name',
        initial: 'Tenra-app',
        validate: (value: string) =>
          value.trim().length > 0 ? true : 'Project name is required',
      },
      {
        type: wasProvided(options.uri) ? null : 'text',
        name: 'uri',
        message: 'MongoDB URI',
        initial: (_prev: unknown, values: Record<string, any>) => {
          const rawName = projectNameArg || values.projectName || 'Tenra-app';
          const projectName = normalizeProjectName(rawName);
          return `mongodb://localhost:27017/${projectName}`;
        },
        validate: (value: string) =>
          value.trim().length > 0 ? true : 'MongoDB URI is required',
      },
      {
        type: wasProvided(options.withGraphql) ? null : 'toggle',
        name: 'withGraphql',
        message: 'Include GraphQL starter support?',
        initial: false,
        active: 'yes',
        inactive: 'no',
      },
      {
        type: wasProvided(options.multiTenant) ? null : 'toggle',
        name: 'multiTenant',
        message: 'Enable multi-tenancy?',
        initial: false,
        active: 'yes',
        inactive: 'no',
      },
      {
        type: wasProvided(options.logger) ? null : 'toggle',
        name: 'logger',
        message: 'Enable logger configuration?',
        initial: true,
        active: 'yes',
        inactive: 'no',
      },
      {
        type: wasProvided(options.withRedis) ? null : 'toggle',
        name: 'withRedis',
        message: 'Enable Redis cache defaults?',
        initial: false,
        active: 'yes',
        inactive: 'no',
      },
      {
        type: wasProvided(options.withGarbageCollector) ? null : 'toggle',
        name: 'withGarbageCollector',
        message: 'Enable garbage collector starter files?',
        initial: false,
        active: 'yes',
        inactive: 'no',
      },
      {
        type: wasProvided(options.install) ? null : 'toggle',
        name: 'install',
        message: 'Install dependencies after scaffold?',
        initial: false,
        active: 'yes',
        inactive: 'no',
      },
    ],
    {
      onCancel: () => {
        throw new Error('CLI initialization cancelled by user.');
      },
    }
  );

  const projectName = normalizeProjectName(
    projectNameArg || response.projectName || 'Tenra-app'
  );

  const uri =
    options.uri ||
    response.uri ||
    `mongodb://localhost:27017/${projectName}`;

  const useGraphql = wasProvided(options.withGraphql)
    ? Boolean(options.withGraphql)
    : Boolean(response.withGraphql);

  const useMultiTenant = wasProvided(options.multiTenant)
    ? Boolean(options.multiTenant)
    : Boolean(response.multiTenant);

  const useLogger = wasProvided(options.logger)
    ? Boolean(options.logger)
    : Boolean(response.logger);

  const useRedis = wasProvided(options.withRedis)
    ? Boolean(options.withRedis)
    : Boolean(response.withRedis);

  const useGarbageCollector = wasProvided(options.withGarbageCollector)
    ? Boolean(options.withGarbageCollector)
    : Boolean(response.withGarbageCollector);

  const autoInstall = wasProvided(options.install)
    ? Boolean(options.install)
    : Boolean(response.install);

  const config: TenraConfig = {
    projectName,
    connection: {
      uri,
      options: {
        dbName: projectName,
      },
    },
    features: {
      useRedisCache: useRedis,
      redisUri: useRedis ? 'redis://localhost:6379' : '',
    },
    advanced: {
      autoInstall,
      garbageCollector: {
        enabled: useGarbageCollector,
      },
    },
  };

  if (useGraphql) {
    config.graphql = {
      enabled: true,
      subscriptions: false,
      playground: true,
      schemaOutputPath: './src/graphql/schema.gql',
    };
  }

  if (useLogger) {
    config.logger = {
      enabled: true,
      level: 'info',
      colorize: true,
      json: false,
      transports: [
        {
          type: 'console',
          options: {},
        },
      ],
    } as any;
  }

  if (useMultiTenant) {
    config.multiTenant = {
      enabled: true,
      headerKey: 'x-tenant-id',
      tenants: {
        tenant1: `mongodb://localhost:27017/${projectName}_tenant1`,
      },
      initOptions: {
        lazy: true,
      },
    };
  }

  if (options.rbac) {
    config.features = {
      ...config.features,
    };
  }

  printScaffoldSummary(config);

  const confirmResponse = await prompts(
  {
    type: 'toggle',
    name: 'proceed',
    message: 'Proceed with project generation?',
    initial: true,
    active: 'yes',
    inactive: 'no',
  },
  {
    onCancel: () => {
      throw new Error('Project generation cancelled by user.');
    },
  }
);

if (!confirmResponse.proceed) {
  throw new Error('Project generation cancelled by user.');
}

  return config;
}