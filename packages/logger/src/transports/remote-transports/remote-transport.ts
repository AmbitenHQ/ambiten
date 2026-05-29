import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { createCircuitBreaker, retryWithBackoff } from '../../utils';
import { LogEntry, RemoteTransporter } from '../../types';

export interface RemoteTransportOptions {
  headers?: Record<string, string>;
  timeout?: number;
  axiosConfig?: AxiosRequestConfig;
  client?: AxiosInstance;
}

export interface ResilientTransportOptions {
  retryAttempts?: number;
  retryDelay?: number;
  failureThreshold?: number;
  cooldownPeriod?: number;
  successThreshold?: number;
}

export function createHttpClient(options: RemoteTransportOptions = {}): AxiosInstance {
  return (
    options.client ??
    axios.create({
      timeout: options.timeout ?? 5000,
      headers: {
        'content-type': 'application/json',
        ...options.headers,
      },
      ...options.axiosConfig,
    })
  );
}

function buildPayload(formattedMessage: string, entry: LogEntry) {
  return {
    timestamp: entry.timestamp,
    level: entry.level,
    message: entry.message,
    formattedMessage,
    source: entry.source,
    meta: entry.meta,
    context: entry.context,
  };
}

export function createHttpTransport(
  url: string,
  options: RemoteTransportOptions = {}
): RemoteTransporter {
  const client = createHttpClient(options);

  return async (formattedMessage, entry) => {
    await client.post(url, buildPayload(formattedMessage, entry));
  };
};
