import {
  AdvancedRollingFileTransporter,
  consoleTransport,
  createFileTransporter,
  createHttpTransport,
  createElasticTransport,
  createLokiTransport,
  createResilientTransporter,
} from '../transports';

import type {
  Transporter,
  RemoteTransporter,
	LoggerTransportConfig,
	ResolveLoggerTransportsOptions,
} from '../types';



export function resolveLoggerTransports(
  transportConfigs: LoggerTransportConfig[] = [],
  options: ResolveLoggerTransportsOptions = {}
): Array<Transporter | RemoteTransporter> {
  const loggerConfig = options.loggerConfig;
  const metrics = options.metrics;

  const globalCompress =
    loggerConfig?.compress?.enabled === true;

  return transportConfigs.map((transportConfig) => {
    switch (transportConfig.type) {
      case 'console': {
        return consoleTransport(
          transportConfig.options?.colorize ??
            loggerConfig?.colorize ??
            true
        );
      }

      case 'file': {
        return createFileTransporter(
          transportConfig.options.filename
        );
      }

      case 'rotating-file': {
        const transportOptions = transportConfig.options ?? {};

        return new AdvancedRollingFileTransporter({
          filename: transportOptions.filename ?? './logs/tenra.log',
          frequency: transportOptions.frequency ?? 'daily',
          maxSize: transportOptions.maxSize ?? 5 * 1024 * 1024,
          backupCount: transportOptions.backupCount ?? 10,
          compress:
            typeof transportOptions.compress === 'boolean'
              ? transportOptions.compress
              : globalCompress,
          flushInterval: transportOptions.flushInterval ?? 3000,
          encoding: transportOptions.encoding ?? 'utf8',
          metrics,
        });
      }

      case 'http': {
        const baseTransport = createHttpTransport(
          transportConfig.options.url
        );

        return transportConfig.options.resilient
          ? createResilientTransporter(baseTransport)
          : baseTransport;
      }

      case 'elasticsearch': {
        const baseTransport = createElasticTransport(
          transportConfig.options.url,
          transportConfig.options.index
        );

        return transportConfig.options.resilient
          ? createResilientTransporter(baseTransport)
          : baseTransport;
      }

      case 'loki': {
        const baseTransport = createLokiTransport(
          transportConfig.options.pushUrl,
          transportConfig.options.labels ?? {}
        );

        return transportConfig.options.resilient
          ? createResilientTransporter(baseTransport)
          : baseTransport;
      }

      default: {
        const exhaustiveCheck: never = transportConfig;
        throw new Error(
          `Unsupported logger transport type: ${(exhaustiveCheck as any).type}`
        );
      }
    }
  });
}