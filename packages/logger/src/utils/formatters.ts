import { LogEntry, LoggerFormatOptions, LogLevel, LogMeta } from '../types';
import { now } from './timeUtils';

type FormatMsgMeta = LogMeta & {
  context?: LogEntry['context'];
  source?: string;
};


/** * 
 * Formats a log message based on the provided options.
 * @param level - The log level of the message.
 * @param message - The log message.
 * @param meta - Additional metadata for the log message.
 * @param options - Formatting options.
 * @returns The formatted log message as a string.
 */
export function formatMsg(
  level: LogLevel,
  message: string,
  meta: FormatMsgMeta = {},
  options?: LoggerFormatOptions
): string {
  const timestamp =
    typeof options?.timestamp === 'function'
      ? options.timestamp()
      : options?.timestamp
        ? now()
        : new Date().toISOString();

  const prefix = options?.prefix ?? '';
  const source = meta.source ?? '';
  const context = meta.context;

  if (options?.json) {
    return formatJSON({
      timestamp,
      level,
      prefix,
      source,
      message,
      meta,
      context,
    });
  }

  const contextParts = [
    context?.tenantId ? `tenant=${context.tenantId}` : '',
    context?.requestId ? `request=${context.requestId}` : '',
    context?.dbName ? `db=${context.dbName}` : '',
    context?.collectionName ? `collection=${context.collectionName}` : '',
    context?.operation ? `operation=${context.operation}` : '',
  ].filter(Boolean);

  const metaForOutput = { ...meta };
  delete metaForOutput.context;
  delete metaForOutput.source;

  const metaText =
    Object.keys(metaForOutput).length > 0
      ? JSON.stringify(metaForOutput)
      : '';

  const parts = [
    `[${timestamp}]`,
    '-',
    `[${level.toUpperCase()}]`,
    prefix,
    source,
    message,
    contextParts.length ? `{${contextParts.join(' ')}}` : '',
    metaText,
  ].filter(Boolean);

  return parts.join(' ').trim();
}

export function formatConsole(level: string, message: string, timestamp: string): string {
  return `${timestamp} [${level.toUpperCase()}] ${message}`;
};

export function formatJSON(metadata: Record<string, unknown>): string {
  return JSON.stringify(metadata, null, 2);
}

export function formatError(error: Error): string {
  return `${error.name}: ${error.message}\n${error.stack}`;
}

