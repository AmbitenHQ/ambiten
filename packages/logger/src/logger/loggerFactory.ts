import {
  ILogger,
  LogEntry,
  LoggerConfig,
  LogLevel,
  LogMeta,
  RemoteTransporter,
  Transporter,
} from '../types';
import { colorByLevel } from './colorizer';
import { LOG_LEVELS } from './levels';
import { DefaultLogger } from './defaultLogger';
import { MetricsTracker, formatJSON, formatMsg, now, resolveLoggerTransports } from '../utils';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeMeta(meta: unknown[]): LogMeta {
  if (meta.length === 0) return {};
  if (meta.length === 1 && isPlainObject(meta[0])) return meta[0];

  return {
    args: meta,
  };
}

function resolveSource(
  meta: LogMeta,
  fallback?: string
): string | undefined {
  const source = meta.source;

  if (typeof source === 'string') return source;
  return fallback;
}

function shouldLogLevel(
  configuredLevel: LogLevel,
  currentLevel: LogLevel
): boolean {
  return LOG_LEVELS[currentLevel] >= LOG_LEVELS[configuredLevel];
}

function isRemoteTransporter(
  transport: Transporter | RemoteTransporter
): transport is RemoteTransporter {
  return typeof transport === 'function';
}

export function createLogger(config: LoggerConfig = {}): ILogger {
  const {
    level = 'info',
    colorize = true,
    json = false,
    excludedSources = [],
    formatOptions,
    hooks,
    contextProvider,
    circuitBreaker,
    logger = DefaultLogger,
  } = config;

  const metrics = new MetricsTracker({
    enabled: config.enableMetrics?.enabled ?? false,
    interval: config.enableMetrics?.logInterval ?? 60_000,
    reporter: config.enableMetrics?.reporter,
  });

  const transports =
    config.transports?.length
      ? config.transports
      : resolveLoggerTransports(config.transportConfigs ?? [], {
        loggerConfig: config,
        metrics,
      });

  const isTest = process.env.NODE_ENV === 'test';

  if (!isTest && config.enableMetrics?.enabled === true) {
    metrics.start(config.enableMetrics.logInterval ?? 60000);
  }

  const buildEntry = (
    levelKey: LogLevel,
    message: string,
    metaArgs: unknown[]
  ): LogEntry => {
    const rawMeta = normalizeMeta(metaArgs);
    const context = contextProvider?.() ?? undefined;

    const mergedMeta: LogMeta = {
      ...(context?.meta ?? {}),
      ...rawMeta,
    };

    const source = resolveSource(
      mergedMeta,
      context?.source ?? formatOptions?.source
    );

    const entry: LogEntry = {
      timestamp:
        typeof formatOptions?.timestamp === 'function'
          ? formatOptions.timestamp()
          : now(),
      level: levelKey,
      message,
      meta: mergedMeta,
      context,
      source,
    };

    return config.enrichMetadata ? config.enrichMetadata(entry) : entry;
  };

  const formatEntry = (entry: LogEntry): string => {
    if (json || formatOptions?.json) {
      return formatJSON({
        timestamp: entry.timestamp,
        level: entry.level,
        message: entry.message,
        meta: entry.meta,
        context: entry.context,
        source: entry.source,
        prefix: formatOptions?.prefix,
      });
    }

    return formatMsg(
      entry.level,
      entry.message,
      {
        ...entry.meta,
        context: entry.context,
        source: entry.source,
      },
      formatOptions
    );
  };

  const writeToTransports = async (
    entry: LogEntry,
    formatted: string
  ): Promise<void> => {
    for (const transport of transports) {
      metrics.trackTransportDispatch();

      try {
        if (typeof transport === 'function') {
          await transport(formatted, entry);
        } else {
          await transport.write(entry, formatted);
        }

        metrics.trackSuccessfulTransportWrite();
      } catch (error) {
        metrics.trackTransportError();
        hooks?.onError?.(error, entry);
      }
    }
  };

  const writeWithRetry = async (
    entry: LogEntry,
    formatted: string
  ): Promise<void> => {
    if (!circuitBreaker?.enabled) {
      await writeToTransports(entry, formatted);
      return;
    }

    const maxAttempts = circuitBreaker.retryAttempts ?? 3;
    const retryDelay = circuitBreaker.retryDelay ?? 1000;

    let attempt = 0;

    while (attempt <= maxAttempts) {
      try {
        await writeToTransports(entry, formatted);
        return;
      } catch (error) {
        attempt++;

        if (attempt > maxAttempts) {
          hooks?.onError?.(
            new Error(`Logger transport failed after ${maxAttempts} attempts`),
            entry
          );
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  };

  const emitToExternalLogger = (
    entry: LogEntry,
    formatted: string
  ): void => {
    const externalLog = logger.log;

    if (typeof externalLog === 'function') {
      externalLog(entry.level, formatted, entry.meta, entry.context);
      return;
    }

    const levelMethod = logger[entry.level];

    if (typeof levelMethod === 'function') {
      levelMethod(formatted, entry.meta, entry.context);
    }
  };

  const log =
    (levelKey: LogLevel) =>
      (message: string, ...metaArgs: unknown[]): void => {
        const entry = buildEntry(levelKey, message, metaArgs);

        if (entry.source && excludedSources.includes(entry.source)) return;

        if (!shouldLogLevel(level, levelKey)) return;

        if (typeof config.shouldLog === 'function') {
          const allowed = config.shouldLog(levelKey, entry);
          if (!allowed) return;
        }

        const formatted = formatEntry(entry);

        const output =
          colorize || formatOptions?.colorize
            ? colorByLevel(levelKey, formatted)
            : formatted;

        metrics.trackLog();

        hooks?.onLog?.(entry)

        /** 
         * We can call external logger here if we like but the createLogger() 
         * will log with side effect by logging twice per log
         */
        // emitToExternalLogger(entry, output);

        void writeWithRetry(entry, output);
      };

  const shutdown = async (): Promise<void> => {
    metrics.stop?.();

    for (const transport of transports) {
      try {
        if (!transport || isRemoteTransporter(transport)) continue;

        await transport.flush?.();
        await transport.close?.();
      } catch (error) {
        hooks?.onError?.(error);
      }
    }

    await config.logger?.shutdown?.()
    await logger.shutdown?.();
    await logger.stop?.();
    await logger.close?.();
  };

  return {
    trace: log('trace'),
    debug: log('debug'),
    info: log('info'),
    warn: log('warn'),
    error: log('error'),
    fatal: log('fatal'),

    getMetrics: () => metrics,

    stop: async () => {
      await metrics.stop();
    },

    close: async () => {
      await metrics.stop();
    },

    shutdown,
  };
};