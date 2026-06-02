import { MetricsTracker } from "../utils";
import { LoggerConfig } from "./ambitenConfig";

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface ILogger {
  trace: (message: string, ...meta: unknown[]) => void;
  debug: (message: string, ...meta: unknown[]) => void;
  info: (message: string, ...meta: unknown[]) => void;
  warn: (message: string, ...meta: unknown[]) => void;
  error: (message: string, ...meta: unknown[]) => void;
  fatal: (message: string, ...meta: unknown[]) => void;

  log?: (level: LogLevel, message: string, ...meta: unknown[]) => void;

  getMetrics?: () => MetricsTracker;

  shutdown?: () => void | Promise<void>;
  stop?: () => void | Promise<void>;
  close?: () => void | Promise<void>;
}

export interface LogMeta {
  [key: string]: unknown;
}

export interface LoggerContextSnapshot {
  tenantId?: string;
  requestId?: string;
  dbName?: string;
  collectionName?: string;
  operation?: string;
  source?: string;
  debug?: boolean;
  meta?: Record<string, unknown>;
}

export type LoggerContextProvider = () =>
  | LoggerContextSnapshot
  | undefined
  | null;

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  meta: LogMeta;
  context?: LoggerContextSnapshot;
  source?: string;
}

export interface Transporter {
  write(entry: LogEntry, formatted: string): void | Promise<void>;
  flush?(): void | Promise<void>;
  close?(): void | Promise<void>;
}

export type RemoteTransporter = (
  formattedMessage: string,
  entry: LogEntry
) => Promise<void>;

export interface LoggerFormatOptions {
  timestamp?: boolean | (() => string);
  colorize?: boolean;
  source?: string;
  json?: boolean;
  prefix?: string;
}

export interface LoggerHooks {
  onLog?: (entry: LogEntry) => void;
  onFlush?: (entries: LogEntry[]) => void;
  onError?: (error: unknown, entry?: LogEntry | LogEntry[]) => void;
}

export interface AsyncBatchTransporterOptions {
  batchSize?: number;
  flushInterval?: number;
  sendBatch: (entries: LogEntry[]) => Promise<void>;
}

export interface MetricsSnapshot {
  totalLogs: number;
  transportDispatches: number;
  successfulTransportWrites: number;
  flushedBuffers: number;
  rotations: number;
  transportErrors: number;
  droppedLogs: number;
  logsPerInterval: number;
  startedAt: string;
  lastSnapshotAt: string;
}

export interface MetricsTrackerOptions {
  enabled?: boolean;
  interval?: number;
  reporter?: (snapshot: MetricsSnapshot) => void;
}



export interface ConsoleTransportConfig {
  type: 'console';
  options?: {
    colorize?: boolean;
  };
}

export interface FileTransportConfig {
  type: 'file';
  options: {
    filename: string;
  };
}

export interface RotatingFileTransportConfig {
  type: 'rotating-file';
  options?: {
    filename?: string;
    frequency?: 'daily' | 'hourly';
    maxSize?: number;
    backupCount?: number;
    compress?: boolean;
    flushInterval?: number;
    encoding?: BufferEncoding;
  };
}

export interface HttpTransportConfig {
  type: 'http';
  options: {
    url: string;
    resilient?: boolean;
  };
}

export interface ElasticTransportConfig {
  type: 'elasticsearch';
  options: {
    url: string;
    index: string;
    resilient?: boolean;
  };
}

export interface LokiTransportConfig {
  type: 'loki';
  options: {
    pushUrl: string;
    labels?: Record<string, string>;
    resilient?: boolean;
  };
}

export type LoggerTransportConfig =
  | ConsoleTransportConfig
  | FileTransportConfig
  | RotatingFileTransportConfig
  | HttpTransportConfig
  | ElasticTransportConfig
  | LokiTransportConfig;

export interface ResolveLoggerTransportsOptions {
  loggerConfig?: LoggerConfig;
  metrics?: MetricsTracker;
}


