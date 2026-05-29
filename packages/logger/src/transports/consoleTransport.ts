import { LogEntry, Transporter } from '../types';
import { colorByLevel } from '../logger';

export const consoleTransport = (colorize = true): Transporter => ({
  write(entry: LogEntry, formatted: string): Promise<void> {
    const output = colorize
      ? colorByLevel(entry.level, formatted)
      : formatted;

    const writer =
      entry.level === 'error' || entry.level === 'fatal'
        ? console.error
        : entry.level === 'warn'
          ? console.warn
          : entry.level === 'debug' || entry.level === 'trace'
            ? console.debug
            : console.info;

    writer(output);

    return Promise.resolve();
  },
});

