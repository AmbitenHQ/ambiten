import { LogLevel } from "../types";

export const LOG_LEVELS: Record<LogLevel, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
};


/** * Determines if a message at a given log level should be logged based on the current configuration level.
 * @param level - The log level of the message.
 * @param configLevel - The configured log level.
 * @returns True if the message should be logged, false otherwise.
 */
export function shouldLog(level: keyof typeof LOG_LEVELS, configLevel: keyof typeof LOG_LEVELS): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[configLevel];
}

/** * Retrieves the log level.
 * @param level - The log level to retrieve.
 * @returns The log level.
 */
export const getLogLevel = (level: LogLevel): LogLevel => {
  return level;
};

/** * Type guard to check if a string is a valid LogLevel.
 * @param level - The string to check.
 * @returns True if the string is a valid LogLevel, false otherwise.
 */
export const isLogLevel = (level: string): level is LogLevel => {
  return level in LOG_LEVELS;
};

/** * Retrieves the numeric priority of a given log level.
 * @param level - The log level.
 * @returns The numeric priority of the log level.
 */
export const getLogLevelPriority = (level: LogLevel): number => {
  return LOG_LEVELS[level];
};