import { setupLogger } from '@tenra/logger';
import type { LoggerConfig } from '@tenra/logger';
import type { TenraConfig } from '../types';

export function createBootstrapLogger(
  config: TenraConfig['logger'] = {
    transportConfigs: []
  }
) {
  if (!config?.enabled) {
    return setupLogger({
      level: 'warn',
      colorize: false,
    });
  }

  const loggerConfig: LoggerConfig = {
    level: config.level ?? 'info',
    colorize: config.colorize ?? true,
    json: config.json ?? false,
    transports: config.transports ?? [],
    formatOptions: config.formatOptions,
    hooks: config.hooks,
    contextProvider: config.contextProvider,
    enableMetrics: config.enableMetrics ?? { enabled: false },
    circuitBreaker: config.circuitBreaker,
    compress: config.compress ?? { enabled: false },
  };

  return setupLogger(loggerConfig);
}


// import { setupLogger } from '@tenra/logger';
// import type { TenraConfig } from '../types';

// /**
//  * Initialize and return the project logger.
//  * This function is defensive about the shape of the passed config so callers
//  * can pass booleans or partial objects without causing runtime errors.
//  */
// export function setLogger(
//   loggerConfig: Partial<TenraConfig['logger'] & TenraConfig['advanced']> = {}
// ) {
//   const cfg = loggerConfig as any || {};

//   // Defensive coercions: accept boolean shorthand for nested logger settings
//   if (typeof cfg.logger === 'boolean') cfg.logger = { enabled: cfg.logger };
//   if (!cfg.logger) cfg.logger = {};

//   if (typeof cfg.compress === 'boolean') cfg.compress = { enabled: cfg.compress };
//   if (!cfg.compress) cfg.compress = { enabled: false };

//   if (typeof cfg.enableMetrics === 'boolean') cfg.enableMetrics = { enabled: cfg.enableMetrics };
//   if (!cfg.enableMetrics) cfg.enableMetrics = { enabled: false };

//   if (typeof cfg.circuitBreaker === 'boolean') cfg.circuitBreaker = { enabled: cfg.circuitBreaker };
//   if (!cfg.circuitBreaker) cfg.circuitBreaker = { enabled: false };

//   if (typeof cfg.garbageCollector === 'boolean') cfg.garbageCollector = { enabled: cfg.garbageCollector };
//   if (!cfg.garbageCollector) cfg.garbageCollector = { enabled: false };

//   const advancedOptions = {
//     enableCircuitBreaker: {
//       enabled: cfg?.circuitBreaker ?? undefined,
//       retryAttempts: cfg?.circuitBreaker?.retryAttempts ?? 3,
//     },
//     garbageCollector: cfg?.garbageCollector?.enabled
//       ? { enabled: true, retentionDays: 30, logResults: true }
//       : { enabled: Boolean(cfg?.garbageCollector?.enabled) },
//     gcCron: cfg?.gcCron || '0 0 * * *',
//   };

//   const compress = {
//     compress: { enabled: cfg?.compress?.enabled ?? false },
//   };

//   return setupLogger({
//     ...cfg,
//     ...advancedOptions,
//     ...compress,
//   });
// }
