import {
  LoggerFormatOptions,
  LoggerHooks,
  LogLevel,
  ILogger,
  Transporter,
  LoggerContextProvider,
  LogEntry,
  LoggerTransportConfig,
} from "./logger.types";
import { RemoteTransporter } from '../types';
import { MetricsSnapshot } from "./logger.types";



export interface LoggerMetricsOptions {
  enabled?: boolean;
  logInterval?: number;
  reporter?: (snapshot: MetricsSnapshot) => void;
}

export interface LoggerConfig {
  logger?: ILogger;
  level?: LogLevel;
  colorize?: boolean;
  json?: boolean;
  transportConfigs?: LoggerTransportConfig[];
  transports?: Array<Transporter | RemoteTransporter>;
  excludedSources?: string[];
  formatOptions?: LoggerFormatOptions;
  hooks?: LoggerHooks;

  /**
   * Allows @ambiten/core to inject AmbitenContext.get()
   * without @ambiten/logger importing @ambiten/core.
   */
  contextProvider?: LoggerContextProvider;

  /**
   * Allows users to enrich structured metadata.
   */
  enrichMetadata?: (entry: LogEntry) => LogEntry;

  /**
   * Allows advanced filtering by level, entry, tenant, source, etc.
   */
  shouldLog?: (level: LogLevel, entry: LogEntry) => boolean;

  circuitBreaker?: {
    enabled?: boolean;
    retryAttempts?: number;
    retryDelay?: number;
  };

  enableMetrics?: LoggerMetricsOptions

  compress?: {
    enabled?: boolean;
  };
}

