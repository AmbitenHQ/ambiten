import fs from 'fs-extra';
import path from 'path';
import Ajv, { type ValidateFunction } from 'ajv';
import type { AmbitenConfig } from '../types';
import configSchema from './ambiten.config.schema.json';

const ajv = new Ajv({
  allErrors: true,
  useDefaults: true,
  strict: false,
  coerceTypes: true,
});

let validate: ValidateFunction | null = null;

const DEFAULT_CONFIG_FILENAME = 'ambiten.config.json';

function normalizeAmbitenConfig(rawConfig: any): AmbitenConfig {
  const cfg = { ...rawConfig };

  if (typeof cfg.logger === 'boolean') {
    cfg.logger = { enabled: cfg.logger };
  }

  if (cfg.logger && typeof cfg.logger === 'object') {
    if (typeof cfg.logger.enableMetrics === 'boolean') {
      cfg.logger.enableMetrics = {
        enabled: cfg.logger.enableMetrics,
        logInterval: 60000,
      };
    }

    if (!cfg.logger.enableMetrics) {
      cfg.logger.enableMetrics = {
        enabled: false,
        logInterval: 60000,
      };
    }

    if (typeof cfg.logger.compressLogFiles === 'boolean') {
      cfg.logger.compressLogFiles = {
        enabled: cfg.logger.compressLogFiles,
      };
    }

    if (!cfg.logger.compressLogFiles) {
      cfg.logger.compressLogFiles = {
        enabled: false,
      };
    }
  }

  if (typeof cfg.graphql === 'boolean') {
    cfg.graphql = { enabled: cfg.graphql };
  }

  if (typeof cfg.advanced === 'boolean') {
    cfg.advanced = {
      garbageCollector: { enabled: cfg.advanced },
    };
  }

  if (cfg.advanced && typeof cfg.advanced.garbageCollector === 'boolean') {
    cfg.advanced.garbageCollector = {
      enabled: cfg.advanced.garbageCollector,
    };
  }

  if (!cfg.features) {
    cfg.features = {};
  }

  if (typeof cfg.features.useRedisCache === 'undefined') {
    cfg.features.useRedisCache = false;
  }

  return cfg as AmbitenConfig;
}

function assertValidAmbitenConfig(config: AmbitenConfig): void {
  if (!config.connection?.uri) {
    throw new Error('Invalid config: "connection.uri" is required.');
  }

  if (
    config.multiTenant?.enabled &&
    config.multiTenant.tenants &&
    typeof config.multiTenant.tenants !== 'object'
  ) {
    throw new Error('Invalid config: "multiTenant.tenants" must be a tenant-to-URI map.');
  }
}

export async function loadAmbitenConfig(configPath?: string): Promise<AmbitenConfig> {
  const candidates = configPath
    ? [path.resolve(configPath)]
    : [
      path.resolve(process.cwd(), DEFAULT_CONFIG_FILENAME),
      path.resolve(process.cwd(), 'config', DEFAULT_CONFIG_FILENAME),
      path.resolve(process.cwd(), 'src', 'config', DEFAULT_CONFIG_FILENAME),
      path.resolve(__dirname, DEFAULT_CONFIG_FILENAME),
      path.resolve(__dirname, '..', DEFAULT_CONFIG_FILENAME),
    ];

  let finalPath: string | undefined;

  for (const candidate of candidates) {
    if (await fs.pathExists(candidate)) {
      finalPath = candidate;
      break;
    }
  }

  if (!finalPath) {
    throw new Error(`Config file not found at any of: ${candidates.join(', ')}`);
  }

  let parsed: AmbitenConfig;

  try {
    const raw = await fs.readFile(finalPath, 'utf-8');
    parsed = normalizeAmbitenConfig(JSON.parse(raw));
  } catch (err) {
    throw new Error(`[Ambiten] Failed to parse config file: ${err}`);
  }

  if (!validate) {
    validate = ajv.compile(configSchema);
  }

  const isValid = validate(parsed);

  if (!isValid) {
    console.error(JSON.stringify(validate.errors, null, 2));

    const errors = validate.errors
      ?.map((e) => {
        const location = e.instancePath || '(root)';
        const extra =
          e.keyword === 'additionalProperties'
            ? `: ${(e.params as any).additionalProperty}`
            : '';

        return `${location} ${e.message}${extra}`;
      })
      .join('; ');

    throw new Error(`[Ambiten] Invalid configuration: ${errors}`);
  }

  assertValidAmbitenConfig(parsed);

  parsed.graphql ??= { enabled: false };
  parsed.features ??= { useRedisCache: false };
  parsed.advanced ??= {
    circuitBreaker: { enabled: false },
    garbageCollector: { enabled: false },
  };

  return parsed;
};