import { setupLogger } from '@ambiten/logger';
import type { LoggerConfig } from '@ambiten/logger';
import type { AmbitenConfig } from '../types';

export function createBootstrapLogger(
  config: AmbitenConfig['logger'] = {
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