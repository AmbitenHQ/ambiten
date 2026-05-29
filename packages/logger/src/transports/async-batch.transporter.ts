import { clearAllTimers, registerInterval } from '../utils';
import {
  AsyncBatchTransporterOptions,
  LogEntry,
  LogMeta,
  Transporter,
} from '../types';

export interface AsyncBatchTransporterConfig
  extends AsyncBatchTransporterOptions {
  tag?: string;
  maxBufferSize?: number;
  dropOnOverflow?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
  startImmediately?: boolean;
  enableTimerInTest?: boolean;
  onError?: (error: unknown, entries?: LogEntry[]) => void;
  onDrop?: (entry: LogEntry) => void;
}

export class AsyncBatchTransporter implements Transporter {
  private buffer: LogEntry[] = [];
  private timer?: NodeJS.Timeout;
  private isFlushing = false;
  private isClosed = false;

  private readonly batchSize: number;
  private readonly flushInterval: number;
  private readonly maxBufferSize: number;
  private readonly dropOnOverflow: boolean;
  private readonly retryAttempts: number;
  private readonly retryDelay: number;
  private readonly enableTimerInTest: boolean;
  private readonly sendBatch: (entries: LogEntry[]) => Promise<void>;
  private readonly tag?: string;
  private readonly onError?: (error: unknown, entries?: LogEntry[]) => void;
  private readonly onDrop?: (entry: LogEntry) => void;

  constructor(options: AsyncBatchTransporterConfig) {
    this.batchSize = options.batchSize ?? 10;
    this.flushInterval = options.flushInterval ?? 5000;
    this.maxBufferSize = options.maxBufferSize ?? 1000;
    this.dropOnOverflow = options.dropOnOverflow ?? true;
    this.enableTimerInTest = options.enableTimerInTest ?? false;
    this.retryAttempts = options.retryAttempts ?? 2;
    this.retryDelay = options.retryDelay ?? 500;
    this.sendBatch = options.sendBatch;
    this.tag = options.tag;
    this.onError = options.onError;
    this.onDrop = options.onDrop;

    if (options.startImmediately ?? true) {
      this.start();
    }
  }

  public async write(entry: LogEntry, _formatted: string): Promise<void> {
    if (this.isClosed) return;

    const nextEntry = this.tag
      ? this.withTag(entry, this.tag)
      : entry;

    if (this.buffer.length >= this.maxBufferSize) {
      if (this.dropOnOverflow) {
        const dropped = this.buffer.shift();

        if (dropped) {
          this.onDrop?.(dropped);
        }
      } else {
        await this.flush();
      }
    }

    this.buffer.push(nextEntry);

    if (this.buffer.length >= this.batchSize) {
      await this.flush();
    }
  }

  private withTag(entry: LogEntry, tag: string): LogEntry {
    return {
      ...entry,
      meta: {
        ...entry.meta,
        type: tag,
      } satisfies LogMeta,
    };
  }

  public async flush(): Promise<void> {
    if (this.isClosed) return;
    if (this.isFlushing) return;
    if (this.buffer.length === 0) return;

    this.isFlushing = true;

    const entries = this.buffer.splice(0, this.buffer.length);

    try {
      await this.sendWithRetry(entries);
    } catch (error) {
      this.onError?.(error, entries);
    } finally {
      this.isFlushing = false;
    }
  }

  private async sendWithRetry(entries: LogEntry[]): Promise<void> {
    let attempt = 0;

    while (attempt <= this.retryAttempts) {
      try {
        await this.sendBatch(entries);
        return;
      } catch (error) {
        attempt++;

        if (attempt > this.retryAttempts) {
          throw error;
        }

        await new Promise((resolve) => {
          setTimeout(resolve, this.retryDelay);
        });
      }
    }
  }

  public start(): void {
    if (this.timer) return;

    const isTest =
      process.env.JEST_WORKER_ID !== undefined ||
      process.env.NODE_ENV === 'test';

    if (isTest && !this.enableTimerInTest) {
      return;
    }

    this.timer = registerInterval(
      setInterval(() => {
        void this.flush();
      }, this.flushInterval)
    );
  }

  public async close(): Promise<void> {
    if (this.isClosed) return;

    this.isClosed = true;

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }

    const pending = this.buffer.splice(0, this.buffer.length);

    if (pending.length > 0) {
      try {
        await this.sendWithRetry(pending);
      } catch (error) {
        this.onError?.(error, pending);
      }
    }

    await clearAllTimers();
  }

  public async stop(): Promise<void> {
    await this.close();
  }
}