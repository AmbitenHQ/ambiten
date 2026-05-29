import { ILogger, LogLevel } from '../types';
import { MetricsTracker } from '../utils';


export const DefaultLogger: ILogger = {
  log(level: LogLevel, message: string, ...meta: unknown[]) {
    const writer =
      level === 'error' || level === 'fatal'
        ? console.error
        : level === 'warn'
          ? console.warn
          : level === 'debug' || level === 'trace'
            ? console.debug
            : console.info;

    writer(message, ...meta);
  },

  trace(message: string, ...meta: unknown[]) {
    console.debug(message, ...meta);
  },

  debug(message: string, ...meta: unknown[]) {
    console.debug(message, ...meta);
  },

  info(message: string, ...meta: unknown[]) {
    console.info(message, ...meta);
  },

  warn(message: string, ...meta: unknown[]) {
    console.warn(message, ...meta);
  },

  error(message: string, ...meta: unknown[]) {
    console.error(message, ...meta);
  },

  fatal(message: string, ...meta: unknown[]) {
    console.error(message, ...meta);
  },

  getMetrics() {
    return new MetricsTracker();
  },

  async shutdown() { },
  async stop() { },
  async close() { },
};