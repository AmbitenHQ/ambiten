import type { AdapterContextOptions } from '@ambiten/adapter-types';

export type LambdaAdapterOptions = AdapterContextOptions;

export interface LambdaHandlerLike<TEvent = unknown, TResult = unknown> {
  (event: TEvent, context?: unknown): Promise<TResult> | TResult;
}

export interface LambdaRequestInput {
  headers?: Record<string, string | undefined> | null;
  multiValueHeaders?: Record<string, string[] | undefined> | null;

  pathParameters?: Record<string, string | undefined> | null;

  queryStringParameters?: Record<string, string | undefined> | null;
  multiValueQueryStringParameters?: Record<string, string[] | undefined> | null;

  requestContext?: {
    http?: {
      method?: string;
      path?: string;
    };
  };

  rawPath?: string;
  path?: string;
  httpMethod?: string;

  cookies?: string[];

  body?: string | null;
  isBase64Encoded?: boolean;
}