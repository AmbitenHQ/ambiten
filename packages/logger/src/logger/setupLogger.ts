import { ILogger, LoggerConfig } from '../types';
import { createLogger } from './loggerFactory';

export function setupLogger(config: LoggerConfig = {}): ILogger {
  return createLogger({ ...config });
}