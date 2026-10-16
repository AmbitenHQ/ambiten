import prompts from 'prompts';

import type {
  AmbitenConfig,
  BootstrapModelOptions,
  Document,
  SchemaDefinition,
} from '../types';
import type { ConfigModuleReference } from '../types/config-module';
import type { BootstrapCliOptions } from './types';

import { normalizeProjectName } from './prompt';

function wasProvided(value: unknown): boolean {
  return value !== undefined;
}

function resolveFlag(
  optionValue: boolean | undefined,
  promptValue: unknown
): boolean {
  return optionValue ?? promptValue === true;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isConfigModuleReference(
  value: unknown
): value is ConfigModuleReference {
  return isRecord(value) && typeof value.path === 'string';
}

function moduleSummary(reference: ConfigModuleReference): string {
  return `module ${reference.path} (export: ${reference.exportName ?? 'default'})`;
}

function isValidProjectName(value: string): boolean {
  const normalized = normalizeProjectName(value);

  return /^[a-z0-9][a-z0-9._-]*$/.test(normalized);
}

function isValidMongoUri(value: string): boolean {
  return /^mongodb(?:\+srv)?:\/\/\S+$/i.test(value.trim());
}

/**
 * Validate the outer shape of SchemaDefinition<T>.
 *
 * This does not perform schema-engine validation or
 * convert JSON descriptors into JS constructors.
 */
function parseSchemaDefinition(input: string): SchemaDefinition<Document> {
  let parsed: unknown;

  try {
    parsed = JSON.parse(input);
  } catch {
    throw new Error('Schema must contain valid JSON.');
  }

  if (!isRecord(parsed)) {
    throw new Error('Schema must be a JSON object.');
  }

  for (const [key, definition] of Object.entries(parsed)) {
    if (!isRecord(definition)) {
      throw new Error(`Schema entry "${key}" must be an object.`);
    }
  }

  return parsed as SchemaDefinition<Document>;
}

function validateSchemaInput(input: string): true | string {
  try {
    parseSchemaDefinition(input);
    return true;
  } catch (error) {
    return error instanceof Error
      ? error.message
      : 'Invalid schema definition.';
  }
}

function optionalString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  return value.trim() || undefined;
}

function safeUriForSummary(uri: string | undefined): string {
  if (!uri) {
    return '(none)';
  }

  //This avoids printing URI credentials to the terminal.
  return uri.replace(/(mongodb(?:\+srv)?:\/\/)[^/@]+@/i, '$1***@');
}

function printScaffoldSummary(config: AmbitenConfig): void {
  // This is a scaffold preview. Module exports are loaded by bootstrap later.
  const schema = config.schema;
  const model = config.model;

  const schemaStatus =
    schema === undefined
      ? 'disabled'
      : isConfigModuleReference(schema)
        ? moduleSummary(schema)
        : Object.keys(schema).length === 0
          ? 'enabled (empty definition)'
          : 'configured';

  const modelStatus =
    model === undefined
      ? 'disabled'
      : isConfigModuleReference(model)
        ? moduleSummary(model)
        : model.collectionName;

  const modelGcStatus =
    model === undefined
      ? 'disabled'
      : isConfigModuleReference(model)
        ? 'resolved from module at startup'
        : model.gcConfig
          ? 'configured'
          : 'disabled';

  const lines = [
    '',
    'Scaffold summary:',
    `  Project: ${config.projectName}`,
    `  MongoDB URI: ${safeUriForSummary(config.connection?.uri)}`,
    `  Schema: ${schemaStatus}`,
    `  Model: ${modelStatus}`,
    `  Model GC: ${modelGcStatus}`,
    `  GraphQL: ${config.graphql?.enabled ? 'enabled' : 'disabled'}`,

    `  Multi-tenancy: ${config.multiTenant?.enabled ? 'enabled' : 'disabled'}`,

    `  Logger: ${config.logger?.enabled ? 'enabled' : 'disabled'}`,

    `  Redis Cache: ${config.features?.useRedisCache ? 'enabled' : 'disabled'}`,

    `  Project Garbage Collector: ${config.advanced?.garbageCollector?.enabled ? 'enabled' : 'disabled'
    }`,

    `  Auto-install: ${config.advanced?.autoInstall ? 'enabled' : 'disabled'}`,

    '',
  ];

  console.log(lines.join('\n'));
}

function onPromptCancel(): never {
  throw new Error('CLI initialization cancelled by user.');
}

/**
 * Builds a typed Ambiten configuration using CLI flags
 * and interactive prompts.
 */
export async function buildInteractiveConfig(
  projectNameArg: string | undefined,
  options: BootstrapCliOptions
): Promise<AmbitenConfig> {
  const response = await prompts(
    [
      {
        type: projectNameArg !== undefined ? null : 'text',
        name: 'projectName',
        message: 'Project name',
        initial: 'Ambiten-app',
        validate: (value: string) =>
          isValidProjectName(value)
            ? true
            : 'Use a valid project name containing letters, digits, dots, underscores or hyphens.',
      },
      {
        type: wasProvided(options.uri) ? null : 'text',
        name: 'uri',
        message: 'MongoDB URI',
        initial: (_prev: unknown, values: Record<string, unknown>) => {
          const rawName =
            projectNameArg ?? String(values.projectName ?? 'Ambiten-app');
          const projectName = normalizeProjectName(rawName);

          return `mongodb://localhost:27017/${projectName}`;
        },
        validate: (value: string) =>
          isValidMongoUri(value)
            ? true
            : 'Provide a valid mongodb:// or mongodb+srv:// URI.',
      },

      {
        type: wasProvided(options.schema) ? null : 'toggle',
        name: 'schema',
        message: 'Configure bootstrap schema definitions?',
        initial: false,
        active: 'yes',
        inactive: 'no',
      },

      {
        type: wasProvided(options.model) ? null : 'toggle',
        name: 'model',
        message: 'Configure bootstrap model options?',
        initial: false,
        active: 'yes',
        inactive: 'no',
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
        message: 'Enable project garbage collector?',
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
      onCancel: onPromptCancel,
    }
  );

  /*
   * Resolve and validate flags and prompt answers.
   */
  const projectName = normalizeProjectName(
    projectNameArg ?? String(response.projectName ?? 'Ambiten-app')
  );

  if (!isValidProjectName(projectName)) {
    throw new Error(`Invalid project name: "${projectName}".`);
  }

  const uri = String(
    options.uri ?? response.uri ?? `mongodb://localhost:27017/${projectName}`
  ).trim();

  if (!isValidMongoUri(uri)) {
    throw new Error(
      'Invalid MongoDB URI. Expected mongodb:// or mongodb+srv://.'
    );
  }

  const useSchema = resolveFlag(options.schema, response.schema);
  const useModel = resolveFlag(options.model, response.model);
  const useGraphql = resolveFlag(options.withGraphql, response.withGraphql);
  const useMultiTenant = resolveFlag(options.multiTenant, response.multiTenant);
  const useLogger = resolveFlag(options.logger, response.logger);
  const useRedis = resolveFlag(options.withRedis, response.withRedis);
  const useGarbageCollector = resolveFlag(
    options.withGarbageCollector,
    response.withGarbageCollector
  );
  const autoInstall = resolveFlag(options.install, response.install);

  /*
   * Collect schema/model configuration only
   * when the corresponding feature was selected.
   */
  const details: Record<string, unknown> =
    useSchema || useModel
      ? await prompts(
        [
          {
            type: useSchema ? 'text' : null,
            name: 'schemaJson',
            message: 'Bootstrap schema definition (JSON object)',
            initial: '{}',
            validate: validateSchemaInput,
          },
          {
            type: useModel ? 'text' : null,
            name: 'collectionName',
            message: 'Bootstrap model collection name',
            initial: 'users',
            validate: (value: string) =>
              value.trim().length > 0 && !value.includes('\0')
                ? true
                : 'Collection name is required.',
          },
          {
            type: useModel ? 'toggle' : null,
            name: 'includeModelGc',
            message: 'Configure model-specific gcConfig?',
            initial: false,
            active: 'yes',
            inactive: 'no',
          },
        ],
        {
          onCancel: onPromptCancel,
        }
      )
      : {};

  /*
   * Construct one AmbitenConfig instance.
   */
  const config: AmbitenConfig = {
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

  /*
   * Schema configuration.
   */
  if (useSchema) {
    config.schema = parseSchemaDefinition(String(details.schemaJson ?? '{}'));
  }

  /*
   * Model configuration.
   */
  if (useModel) {
    const collectionName = String(details.collectionName ?? '').trim();

    if (!collectionName || collectionName.includes('\0')) {
      throw new Error('Invalid bootstrap model collection name.');
    }

    const model: BootstrapModelOptions<Document> = {
      collectionName,
    };

    /*
     * Optional model-level GC.
     *
     * Note: This is independent from the project-level
     * advanced.garbageCollector switch.
     */
    if (details.includeModelGc === true) {
      const gc = await prompts(
        [
          {
            type: 'number',
            name: 'ttl',
            message:
              'Model GC TTL (in the units expected by your model runtime)',
            initial: 30,
            validate: (value: number) =>
              Number.isFinite(value) && value >= 0
                ? true
                : 'TTL must be a non-negative finite number.',
          },

          {
            type: 'toggle',
            name: 'enableGC',
            message: 'Enable model garbage collection?',
            initial: true,
            active: 'yes',
            inactive: 'no',
          },

          {
            type: 'text',
            name: 'indexName',
            message: 'GC index name (optional)',
            initial: '',
          },

          {
            type: 'text',
            name: 'field',
            message: 'GC field (optional)',
            initial: '',
          },

          {
            type: 'text',
            name: 'createdAtField',
            message: 'Created-at field (optional)',
            initial: '',
          },

          {
            type: 'text',
            name: 'updatedAtField',
            message: 'Updated-at field (optional)',
            initial: '',
          },
        ],
        {
          onCancel: onPromptCancel,
        }
      );

      const ttl = Number(gc.ttl);

      if (!Number.isFinite(ttl) || ttl < 0) {
        throw new Error('Model GC TTL must be a non-negative finite number.');
      }

      const indexName = optionalString(gc.indexName);
      const field = optionalString(gc.field);
      const createdAtField = optionalString(gc.createdAtField);
      const updatedAtField = optionalString(gc.updatedAtField);

      model.gcConfig = {
        ttl,
        enableGC: gc.enableGC === true,
        ...(indexName ? { indexName } : {}),
        ...(field ? { field } : {}),
        ...(createdAtField ? { createdAtField } : {}),
        ...(updatedAtField ? { updatedAtField } : {}),
      };
    }

    config.model = model;
  }

  /*
   * Other feature configuration.
   */
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

      transportConfigs: [
        {
          type: 'console',
          options: {},
        },
      ],
    };
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

  /*
   * Final confirmation.
   */
  printScaffoldSummary(config);

  const confirmation = await prompts(
    {
      type: 'toggle',
      name: 'proceed',
      message: 'Proceed with project generation?',
      initial: true,
      active: 'yes',
      inactive: 'no',
    },
    {
      onCancel: onPromptCancel,
    }
  );

  if (confirmation.proceed !== true) {
    throw new Error('Project generation cancelled by user.');
  }

  return config;
};