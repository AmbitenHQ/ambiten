import type { AmbitenRequestLike } from '@ambiten/adapter-types';

function normalizeHeaders(
  headers: unknown
): Record<string, string | string[] | undefined> {
  if (!headers) {
    return {};
  }

  if (typeof Headers !== 'undefined' && headers instanceof Headers) {
    const result: Record<string, string> = {};

    headers.forEach((value, key) => {
      result[key.toLowerCase()] = value;
    });

    return result;
  }

  if (typeof headers === 'object') {
    const result: Record<string, string | string[] | undefined> = {};

    for (const [key, value] of Object.entries(headers as Record<string, unknown>)) {
      if (typeof value === 'string' || Array.isArray(value) || value === undefined) {
        result[key.toLowerCase()] = value as string | string[] | undefined;
      } else if (value != null) {
        result[key.toLowerCase()] = String(value);
      }
    }

    return result;
  }

  return {};
}

function normalizeCookies(
  cookies: unknown
): Record<string, string> | undefined {
  if (!cookies || typeof cookies !== 'object') {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(cookies as Record<string, unknown>).map(([key, value]) => [
      key,
      value == null ? '' : String(value)
    ])
  );
}

function normalizeQuery(
  query: unknown
): Record<string, string | string[] | undefined> | undefined {
  if (!query || typeof query !== 'object') {
    return undefined;
  }

  const result: Record<string, string | string[] | undefined> = {};

  for (const [key, value] of Object.entries(query as Record<string, unknown>)) {
    if (typeof value === 'string' || value === undefined) {
      result[key] = value;
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) => String(item));
    } else if (value != null) {
      result[key] = String(value);
    }
  }

  return result;
}

export interface GraphqlRequestAdapterInput {
  headers?: unknown;
  url?: string;
  method?: string;
  cookies?: Record<string, string | undefined>;
  params?: Record<string, string | undefined>;
  query?: unknown;
  body?: unknown;
}

export function toGraphqlAmbitenRequestLike(
  input: GraphqlRequestAdapterInput
): AmbitenRequestLike {
  const headers = normalizeHeaders(input.headers);
  const cookies = normalizeCookies(input.cookies);

  const params =
    input.params && typeof input.params === 'object'
      ? Object.fromEntries(
        Object.entries(input.params).map(([key, value]) => [key, value ?? ''])
      )
      : {};

  return {
    headers,
    url: input.url,
    method: input.method,
    params,
    cookies,
    query: normalizeQuery(input.query),
    body: input.body,
    get(name: string) {
      const value = headers[name.toLowerCase()];
      return Array.isArray(value) ? value[0] : value;
    }
  };
};