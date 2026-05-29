import * as cron from 'node-cron';
import { colorize } from '../utils';
import type { ModelContext } from '../types';
import {
  runGarbageCollectorOnAllModels,
  type GarbageCollectorRunResult
} from './gcManager';

export interface GCOptions {
  enabled?: boolean;
  interval?: string;
  retentionPeriod?: number;
  logResults?: boolean;
  cron?: string;
  ctx?: ModelContext;
  continueOnError?: boolean;
  logger?: {
    info?: (message: string, meta?: Record<string, unknown>) => void;
    warn?: (message: string, meta?: Record<string, unknown>) => void;
    error?: (message: string, meta?: Record<string, unknown>) => void;
  };
}

export class TenraGC {
  private readonly enabled: boolean;
  private intervalMs: number;
  private intervalRef: NodeJS.Timeout | null = null;
  private cronTask: cron.ScheduledTask | null = null;

  constructor(private readonly options: GCOptions = {}) {
    this.enabled = options.enabled !== false;
    this.intervalMs = options.interval
      ? this.parseInterval(options.interval)
      : 60_000;

    if (options.retentionPeriod) {
      this.intervalMs = options.retentionPeriod * 24 * 60 * 60 * 1000;
    }

    if (!this.enabled) {
      this.log('info', '[TenraGC] Garbage Collector is disabled.');
      return;
    }

    if (options.cron) {
      this.cronTask = cron.schedule(options.cron, () => {
        void this.runOnce();
      });

      this.log('info', `[TenraGC] Cron schedule set to: ${options.cron}`);
      return;
    }

    if (options.interval) {
      this.start();
      this.log('info', `[TenraGC] Interval set to: ${options.interval}`);
      return;
    }

    this.log('info', '[TenraGC] Initialized. Manual run mode enabled.');
  }

  /**
   * Starts interval-based garbage collection.
   */
  start(): void {
    if (!this.enabled) {
      return;
    }

    if (this.intervalRef) {
      return;
    }

    this.intervalRef = setInterval(() => {
      void this.runOnce();
    }, this.intervalMs);

    this.log(
      'info',
      `[TenraGC] Started GC loop every ${this.intervalMs} ms`
    );
  }

  /**
   * Stops interval or cron-based garbage collection.
   */
  stop(): void {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
    }

    if (this.cronTask) {
      this.cronTask.stop();
      this.cronTask = null;
    }

    this.log('info', '[TenraGC] Stopped.');
  }

  /**
   * Runs garbage collection once across registered models.
   *
   * @param ctx - Optional model execution context override.
   * @returns Summary of the GC run.
   */
  async runOnce(ctx?: ModelContext): Promise<GarbageCollectorRunResult> {
    if (!this.enabled) {
      return {
        scanned: 0,
        succeeded: 0,
        failed: 0,
        models: []
      };
    }

    const result = await runGarbageCollectorOnAllModels({
      ctx: ctx ?? this.options.ctx,
      continueOnError: this.options.continueOnError ?? true
    });

    if (this.options.logResults) {
      this.log(
        result.failed > 0 ? 'warn' : 'info',
        `[TenraGC] Completed. scanned=${result.scanned}, succeeded=${result.succeeded}, failed=${result.failed}`
      );
    }

    return result;
  }

  /**
   * Parses interval strings such as "30s", "5m", "1h", or "1d".
   *
   * @param duration - Interval duration.
   * @returns Duration in milliseconds.
   * @throws {Error} When the interval format is invalid.
   */
  private parseInterval(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);

    if (!match) {
      throw new Error(`Invalid interval format: ${duration}`);
    }

    const [, num, unit] = match;
    const value = Number.parseInt(num, 10);

    switch (unit) {
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        throw new Error(`Unknown time unit: ${unit}`);
    }
  }

  private log(
    level: 'info' | 'warn' | 'error',
    message: string,
    meta?: Record<string, unknown>
  ): void {
    const logger = this.options.logger;

    if (logger?.[level]) {
      logger[level]?.(message, meta);
      return;
    }

    if (level === 'error') {
      console.error(colorize(message, 'red'), meta ?? '');
      return;
    }

    if (level === 'warn') {
      console.warn(colorize(message, 'yellow'), meta ?? '');
      return;
    }

    console.log(colorize(message, 'blue'), meta ?? '');
  }
}