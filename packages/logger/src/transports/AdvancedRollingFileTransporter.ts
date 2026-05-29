import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { promisify } from 'util';
import { pipeline } from 'stream';
import { clearInterval } from 'timers';

import { LogEntry, Transporter } from '../types';
import { MetricsTracker, registerInterval } from '../utils';

const streamPipeline = promisify(pipeline);

export interface RollingFileOptions {
  filename: string;
  maxSize?: number;
  backupCount?: number;
  frequency?: 'daily' | 'hourly';
  compress?: boolean;
  flushInterval?: number;
  encoding?: BufferEncoding;
  metrics?: MetricsTracker;
}

type NormalizedRollingFileOptions =
  Omit<Required<RollingFileOptions>, 'metrics'> & {
    metrics?: MetricsTracker;
  };

export class AdvancedRollingFileTransporter implements Transporter {
  private currentStream: fs.WriteStream;
  private lastRolledAt: Date;
  private flushTimer?: NodeJS.Timeout;
  private buffer: string[] = [];
  private metrics?: MetricsTracker;
  private isClosed = false;
  private isFlushing = false;

  private readonly options: NormalizedRollingFileOptions

  constructor(options: RollingFileOptions) {
    this.options = {
      filename: options.filename,
      maxSize: options.maxSize ?? 5 * 1024 * 1024,
      backupCount: options.backupCount ?? 5,
      frequency: options.frequency ?? 'daily',
      compress: options.compress ?? false,
      flushInterval: options.flushInterval ?? 3000,
      metrics: options.metrics,
      encoding: options.encoding ?? 'utf8',
    };

    this.ensureDirectoryExists();

    this.metrics = this.options.metrics;
    this.lastRolledAt = new Date();
    this.currentStream = this.createWriteStream();

    if (process.env.NODE_ENV !== 'test') {
      this.startFlusher();
    }
  }

  private createWriteStream(): fs.WriteStream {
    return fs.createWriteStream(this.options.filename, {
      flags: 'a',
      encoding: this.options.encoding,
    });
  }

  private async endCurrentStream(): Promise<void> {
    if (this.currentStream.destroyed) return;

    await new Promise<void>((resolve, reject) => {
      this.currentStream.once('error', reject);
      this.currentStream.end(() => resolve());
    });
  }

  private getTimestampSuffix(): string {
    const date = new Date();
    const pad = (value: number) => String(value).padStart(2, '0');

    const day = [
      date.getFullYear(),
      pad(date.getMonth() + 1),
      pad(date.getDate()),
    ].join('-');

    const hour = pad(date.getHours());
    const minute = pad(date.getMinutes());
    const second = pad(date.getSeconds());

    return this.options.frequency === 'daily'
      ? day
      : `${day}_${hour}-${minute}-${second}`;
  }

  private shouldRotateByTime(now: Date): boolean {
    const last = this.lastRolledAt;

    if (this.options.frequency === 'daily') {
      return (
        now.getFullYear() !== last.getFullYear() ||
        now.getMonth() !== last.getMonth() ||
        now.getDate() !== last.getDate()
      );
    }

    return (
      now.getFullYear() !== last.getFullYear() ||
      now.getMonth() !== last.getMonth() ||
      now.getDate() !== last.getDate() ||
      now.getHours() !== last.getHours()
    );
  }

  private shouldRotateBySize(nextWriteSize = 0): boolean {
    const maxSize = this.options.maxSize;

    if (!maxSize || maxSize <= 0) return false;
    if (!fs.existsSync(this.options.filename)) return false;

    const size = fs.statSync(this.options.filename).size;

    return size + nextWriteSize >= maxSize;
  }

  private getRotatedFilename(): string {
    const ext = path.extname(this.options.filename);
    const base = this.options.filename.slice(0, -ext.length);
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '-');

    return `${base}.${timestamp}${ext}`;
  }

  private async compressFile(filePath: string): Promise<void> {
    const compressedPath = `${filePath}.gz`;

    await streamPipeline(
      fs.createReadStream(filePath),
      zlib.createGzip(),
      fs.createWriteStream(compressedPath)
    );

    fs.unlinkSync(filePath);
  }

  private async rotateIfNeeded(nextWriteSize = 0): Promise<void> {
    const now = new Date();

    const shouldRotate =
      this.shouldRotateBySize(nextWriteSize) ||
      this.shouldRotateByTime(now);

    if (!shouldRotate) return;
    if (!fs.existsSync(this.options.filename)) return;

    await this.endCurrentStream();

    const rotatedFile = this.getRotatedFilename();

    fs.renameSync(this.options.filename, rotatedFile);

    if (this.options.compress === true) {
      await this.compressFile(rotatedFile);
    }

    this.cleanupOldLogs();

    this.currentStream = this.createWriteStream();
    this.lastRolledAt = now;

    this.metrics?.trackRotation?.();
  }

  private cleanupOldLogs(): void {
    const dir = path.dirname(this.options.filename);
    const ext = path.extname(this.options.filename);
    const baseName = path.basename(this.options.filename, ext);

    if (!fs.existsSync(dir)) return;

    const rotatedFiles = fs
      .readdirSync(dir)
      .filter((file) =>
        file.startsWith(`${baseName}.`) &&
        (file.endsWith(ext) || file.endsWith(`${ext}.gz`))
      )
      .map((file) => ({
        file,
        fullPath: path.join(dir, file),
        modifiedAt: fs.statSync(path.join(dir, file)).mtime.getTime(),
      }))
      .sort((a, b) => b.modifiedAt - a.modifiedAt);

    for (const item of rotatedFiles.slice(this.options.backupCount)) {
      fs.unlinkSync(item.fullPath);
    }
  }

  private startFlusher(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = registerInterval(
      setInterval(() => {
        void this.flush();
      }, this.options.flushInterval)
    );
  }

  public async write(entry: LogEntry, formatted: string): Promise<void> {
    if (this.isClosed) return;

    const line = formatted.endsWith('\n') ? formatted : `${formatted}\n`;

    this.buffer.push(line);

    const bufferedSize = Buffer.byteLength(
      this.buffer.join(''),
      this.options.encoding
    );

    if (bufferedSize >= this.options.maxSize) {
      await this.flush();
    }
  }

  public async flush(): Promise<void> {
    if (this.isClosed) return;
    if (this.isFlushing) return;
    if (this.buffer.length === 0) return;

    this.isFlushing = true;

    try {
      const payload = this.buffer.join('');
      this.buffer = [];

      const normalizedPayload = payload.endsWith('\n')
        ? payload
        : `${payload}\n`;

      const nextWriteSize = Buffer.byteLength(
        normalizedPayload,
        this.options.encoding
      );

      await this.rotateIfNeeded(nextWriteSize);

      if (this.currentStream.destroyed) {
        this.currentStream = this.createWriteStream();
      }

      await new Promise<void>((resolve, reject) => {
        this.currentStream.write(
          normalizedPayload,
          this.options.encoding,
          (error) => {
            if (error) reject(error);
            else resolve();
          }
        );
      });

      this.metrics?.trackFlush?.();
    } finally {
      this.isFlushing = false;
    }
  }

  public ensureDirectoryExists(): void {
    const dir = path.dirname(this.options.filename);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  public getLogDirectory(): string {
    return path.dirname(this.options.filename);
  }

  public async close(): Promise<void> {
    if (this.isClosed) return;

    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }

    await this.flush();

    this.isClosed = true;

    await this.endCurrentStream();
  }
};


