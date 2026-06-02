/**
 * @packageDocumentation
 *
 * Main entry point for the Ambiten Logger package.
 *
 * Exports the logger factory, transport implementations,
 * logger types, and resilience utilities.
 */

export { createLogger } from './logger';
export { setupLogger } from './logger/setupLogger';
export { DefaultLogger } from './logger/defaultLogger';
export { SilentLogger } from './logger/silentLogger';
export { resolveLoggerTransports } from './utils/resolveLoggerTransport'

export { BufferedTransporter } from './transports/buffered-transporter';
export { consoleTransport } from './transports/consoleTransport';
export { AsyncBatchTransporter } from './transports/async-batch.transporter';
export { AdvancedRollingFileTransporter } from './transports/AdvancedRollingFileTransporter';
export { FileTransporter, createFileTransporter } from './transports/fileTransport';
export { createRotatingFileTransporter } from './transports/rotating-transporter';

export {
  createElasticTransport,
  createLokiTransport,
  createHttpTransport,
  createResilientTransporter,
} from './transports/remote-transports';

export { createCircuitBreaker } from './utils/circuitBreaker/circuitBreaker';
export { retryWithBackoff } from './utils/retry/retryWithBackoff';
export { MetricsTracker } from './utils/MetricsTracker';

export type {
  ILogger,
  LogEntry,
  LogLevel,
  LogMeta,
  LoggerConfig,
  LoggerFormatOptions,
  LoggerHooks,
  LoggerContextProvider,
  LoggerContextSnapshot,
  Transporter,
  RemoteTransporter,
  AsyncBatchTransporterOptions,
  LoggerTransportConfig
} from './types';