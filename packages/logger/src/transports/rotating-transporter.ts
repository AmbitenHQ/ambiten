import path from 'path';
import { AdvancedRollingFileTransporter } from './AdvancedRollingFileTransporter';
import { BufferedTransporter } from './buffered-transporter';
import { Transporter } from '../types';
import { MetricsTracker } from '../utils';

export interface RotatingFileTransporterOptions {
  filename?: string;
  maxSize?: number;
  backupCount?: number;
  frequency?: 'daily' | 'hourly';
  compress?: boolean;
  flushInterval?: number;
  flushSize?: number;
  maxBufferSize?: number;
  dropOnOverflow?: boolean;
  encoding?: BufferEncoding;
  metrics: MetricsTracker
}

export function createRotatingFileTransporter(
  options?: RotatingFileTransporterOptions & {
    metrics?: MetricsTracker
  }
): Transporter {
  const filename =
    options?.filename ??
    path.resolve(process.cwd(), 'logs', 'tenra.log');

  const rollingTransport = new AdvancedRollingFileTransporter({
    filename,
    frequency: options?.frequency ?? 'daily',
    maxSize: options?.maxSize ?? 5 * 1024 * 1024,
    backupCount: options?.backupCount ?? 10,
    compress: options?.compress ?? false,
    flushInterval: options?.flushInterval ?? 3000,
    encoding: options?.encoding ?? 'utf8',
    metrics: options?.metrics
  });

  return new BufferedTransporter(rollingTransport, {
    flushInterval: options?.flushInterval ?? 3000,
    flushSize: options?.flushSize ?? 20,
    maxBufferSize: options?.maxBufferSize ?? 1000,
    dropOnOverflow: options?.dropOnOverflow ?? true
  });
}