import { LogEntry, Transporter } from '../types';
import { registerInterval } from '../utils';

interface BufferedTransporterOptions {
  flushInterval?: number;
  flushSize?: number;
  dropOnOverflow?: boolean;
  maxBufferSize?: number;
  onError?: (error: unknown, entry?: LogEntry) => void;
  onDrop?: (entry: LogEntry) => void;
}

interface BufferedLogEntry {
  entry: LogEntry;
  formatted: string;
}

export class BufferedTransporter implements Transporter {
  private buffer: BufferedLogEntry[] = [];
  private timer?: NodeJS.Timeout;
  private isFlushing = false;
  private isClosed = false;

  private readonly flushInterval: number;
  private readonly flushSize: number;
  private readonly maxBufferSize: number;
  private readonly dropOnOverflow: boolean;
  private readonly transporter: Transporter;
  private readonly onError?: (error: unknown, entry?: LogEntry) => void;
  private readonly onDrop?: (entry: LogEntry) => void;

  constructor(transporter: Transporter, options: BufferedTransporterOptions = {}) {
    this.transporter = transporter;
    this.flushInterval = options.flushInterval ?? 5000;
    this.flushSize = options.flushSize ?? 10;
    this.maxBufferSize = options.maxBufferSize ?? 1000;
    this.dropOnOverflow = options.dropOnOverflow ?? true;
    this.onError = options.onError;
    this.onDrop = options.onDrop;

    this.startAutoFlush();
  }

  public async write(entry: LogEntry, formatted: string): Promise<void> {
    if (this.isClosed) return;

    if (this.buffer.length >= this.maxBufferSize) {
      if (this.dropOnOverflow) {
        const dropped = this.buffer.shift();

        if (dropped) {
          this.onDrop?.(dropped.entry);
        }
      } else {
        await this.flush();
      }
    }

    this.buffer.push({ entry, formatted });

    if (this.buffer.length >= this.flushSize) {
      await this.flush();
    }
  }

  public async flush(): Promise<void> {
    if (this.isClosed) return;
    if (this.isFlushing) return;
    if (this.buffer.length === 0) return;

    this.isFlushing = true;

    const entries = this.buffer.splice(0, this.buffer.length);

    try {
      for (const item of entries) {
        try {
          await this.transporter.write(item.entry, item.formatted);
        } catch (error) {
          this.onError?.(error, item.entry);
        }
      }

      await this.transporter.flush?.();
    } finally {
      this.isFlushing = false;
    }
  }

  private startAutoFlush(): void {
    if (
      process.env.JEST_WORKER_ID !== undefined ||
      process.env.NODE_ENV === 'test'
    ) {
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

    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }

    await this.flush();

    this.isClosed = true;

    await this.transporter.close?.();
  }

  public async stop(): Promise<void> {
    await this.close();
  }
}