import type { TenraRequestLike } from '@tenra/adapter-types';
import type { LambdaRequestInput } from './types';

function normalizeHeaders(
  headers?: Record<string, string | undefined> | null,
  multiValueHeaders?: Record<string, string[] | undefined> | null
): Record<string, string | string[] | undefined> {
  const result: Record<string, string | string[] | undefined> = {};

  if (headers) {
    for (const [key, value] of Object.entries(headers)) {
      result[key.toLowerCase()] = value;
    }
  }

  if (multiValueHeaders) {
    for (const [key, value] of Object.entries(multiValueHeaders)) {
      if (value && value.length > 0) {
        result[key.toLowerCase()] = value;
      }
    }
  }

  return result;
}

function normalizeCookies(cookieHeaders?: string[]): Record<string, string> | undefined {
  if (!cookieHeaders || cookieHeaders.length === 0) {
    return undefined;
  }

  const cookies: Record<string, string> = {};

  for (const cookieHeader of cookieHeaders) {
    const parts = cookieHeader.split(';');

    for (const part of parts) {
      const [rawKey, ...rawValue] = part.split('=');
      const key = rawKey?.trim();
      const value = rawValue.join('=').trim();

      if (key) {
        cookies[key] = value;
      }
    }
  }

  return Object.keys(cookies).length > 0 ? cookies : undefined;
}

function normalizeQuery(
  queryStringParameters?: Record<string, string | undefined> | null,
  multiValueQueryStringParameters?: Record<string, string[] | undefined> | null
): Record<string, string | string[] | undefined> | undefined {
  const result: Record<string, string | string[] | undefined> = {};

  if (queryStringParameters) {
    for (const [key, value] of Object.entries(queryStringParameters)) {
      result[key] = value;
    }
  }

  if (multiValueQueryStringParameters) {
    for (const [key, value] of Object.entries(multiValueQueryStringParameters)) {
      if (value && value.length > 0) {
        result[key] = value;
      }
    }
  }

  return Object.keys(result).length > 0 ? result : undefined;
}

function normalizeBody(event: LambdaRequestInput): unknown {
  if (event.body == null) {
    return undefined;
  }

  if (!event.isBase64Encoded && typeof event.body === 'string') {
    try {
      return JSON.parse(event.body);
    } catch {
      return event.body;
    }
  }

  return event.body;
}

export function toLambdaTenraRequestLike(
  event: LambdaRequestInput
): TenraRequestLike {
  const headers = normalizeHeaders(event.headers, event.multiValueHeaders);

  const params: Record<string, string> = {};

  for (const [key, value] of Object.entries(event.pathParameters ?? {})) {
    if (typeof value === 'string') {
      params[key] = value;
    }
  }

  const method =
    event.requestContext?.http?.method ??
    event.httpMethod;

  const url =
    event.rawPath ??
    event.requestContext?.http?.path ??
    event.path;

  const cookies = normalizeCookies(event.cookies);

  const query = normalizeQuery(
    event.queryStringParameters,
    event.multiValueQueryStringParameters
  );

  const body = normalizeBody(event);

  return {
    headers,
    url,
    method,
    params,
    cookies,
    query,
    body,
    get(name: string) {
      const value = headers[name.toLowerCase()];
      return Array.isArray(value) ? value[0] : value;
    }
  };
};