import { LogLevel } from '../types';

type Platform = 'blue' | 'cyan' | 'green' | 'magenta' | 'red' | 'yellow' | 'silver';

/** 
 * Colorizes a log message based on its level.
 * @param level - The log level (e.g., 'info', 'debug', 'warn', 'error', 'fatal', 'trace').
 * @param message - The log message to colorize.
 * @returns A string with the colored log message.
 */
export function colorByLevel(level: LogLevel, message: string): string {
  switch (level) {
    case 'info': return colorize(message, 'blue');
    case 'debug': return colorize(message, 'silver');
    case 'warn': return colorize(message, 'yellow');
    case 'error': return colorize(message, 'red');
    case 'fatal': return colorize(message, 'red');
    case 'trace': return colorize(message, 'magenta');
    default: return message;
  }
};



export const colorize = (text: string, platform: Platform) => {
	switch (platform) {
		case 'red':
			return `\x1b[31m${text}\x1b[0m`; // Red color
		case 'green':
			return `\x1b[32m${text}\x1b[0m`; // Green color
		case 'magenta':
			return `\x1b[35m${text}\x1b[0m`; // Magenta color
		case 'cyan':
			return `\x1b[36m${text}\x1b[0m`; // Cyan color
		case 'yellow':
			return `\x1b[33m${text}\x1b[0m`; // Yellow color
		case 'blue':
      return `\x1b[34m${text}\x1b[0m`; // Blue color
    case 'silver':
      return `\x1b[90m${text}\x1b[0m`; // Gray color
		default:
			break;
	}

	return `\x1b[36m${text}\x1b[0m`;
}
