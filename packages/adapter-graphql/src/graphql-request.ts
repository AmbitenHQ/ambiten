import type { AmbitenRequestLike } from '@ambiten/adapter-types';

type NormalizedHeaders =
  Record<
    string,
    string |
    string[] |
    undefined
  >;

function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return Boolean(
    value &&
    typeof value === 'object' &&
    !Array.isArray(value)
  );
}

function isPairIterable(
  value: unknown
): value is Iterable<
  [unknown, unknown]
> {
  if (
    !value ||
    typeof value !== 'object'
  ) {
    return false;
  }

  const iterator =
    (
      value as Record<
        PropertyKey,
        unknown
      >
    )[Symbol.iterator];

  return typeof iterator ===
    'function';
}

function normalizeHeaderValue(
  value: unknown
):
  | string
  | string[]
  | undefined {
  if (
    value === undefined
  ) {
    return undefined;
  }

  if (
    Array.isArray(value)
  ) {
    return value.map(
      item =>
        String(item)
    );
  }

  if (
    value === null
  ) {
    return '';
  }

  return String(value);
}

function normalizeHeaders(
  headers: unknown
): NormalizedHeaders {
  if (!headers) {
    return {};
  }

  const result:
    NormalizedHeaders = {};

  /*
   * Covers:
   *
   * - WHATWG Headers
   * - Map
   * - Apollo HeaderMap
   * - other iterable header containers
   */
  if (
    isPairIterable(
      headers
    )
  ) {
    for (
      const [
        rawKey,
        rawValue
      ] of headers
    ) {
      const key =
        String(
          rawKey
        ).toLowerCase();

      result[key] =
        normalizeHeaderValue(
          rawValue
        );
    }

    return result;
  }

  if (
    isRecord(
      headers
    )
  ) {
    for (
      const [
        key,
        value
      ] of Object.entries(
        headers
      )
    ) {
      result[
        key.toLowerCase()
      ] =
        normalizeHeaderValue(
          value
        );
    }
  }

  return result;
}

function normalizeCookies(
  cookies: unknown
):
  | Record<string, string>
  | undefined {
  if (
    !isRecord(
      cookies
    )
  ) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(
      cookies
    ).map(
      ([key, value]) => [
        key,
        value == null
          ? ''
          : String(value)
      ]
    )
  );
}

function appendQueryValue(
  target:
    Record<
      string,
      string |
      string[] |
      undefined
    >,

  key:
    string,

  value:
    string
): void {
  const current =
    target[key];

  if (
    current === undefined
  ) {
    target[key] =
      value;

    return;
  }

  if (
    Array.isArray(
      current
    )
  ) {
    current.push(
      value
    );

    return;
  }

  target[key] = [
    current,
    value
  ];
}

function normalizeQuery(
  query: unknown
):
  | Record<
    string,
    string |
    string[] |
    undefined
  >
  | undefined {
  if (!query) {
    return undefined;
  }

  const result:
    Record<
      string,
      string |
      string[] |
      undefined
    > = {};

  /*
   * Covers URLSearchParams and
   * other pair iterables.
   */
  if (
    isPairIterable(
      query
    )
  ) {
    for (
      const [
        rawKey,
        rawValue
      ] of query
    ) {
      appendQueryValue(
        result,
        String(rawKey),
        String(rawValue)
      );
    }

    return result;
  }

  if (
    !isRecord(
      query
    )
  ) {
    return undefined;
  }

  for (
    const [
      key,
      value
    ] of Object.entries(
      query
    )
  ) {
    if (
      typeof value ===
      'string' ||
      value === undefined
    ) {
      result[key] =
        value;

      continue;
    }

    if (
      Array.isArray(
        value
      )
    ) {
      result[key] =
        value.map(
          item =>
            String(item)
        );

      continue;
    }

    if (
      value != null
    ) {
      result[key] =
        String(value);
    }
  }

  return result;
}

export interface GraphqlRequestAdapterInput {
  headers?: unknown;
  url?: string;
  method?: string;

  cookies?:
  Record<
    string,
    string | undefined
  >;

  params?:
  Record<
    string,
    string | undefined
  >;

  query?: unknown;
  body?: unknown;
}

export function toGraphqlAmbitenRequestLike(
  input:
    GraphqlRequestAdapterInput
): AmbitenRequestLike {
  const headers =
    normalizeHeaders(
      input.headers
    );

  const params =
    input.params &&
      typeof input.params ===
      'object'
      ? Object.fromEntries(
        Object.entries(
          input.params
        ).map(
          ([key, value]) => [
            key,
            value ?? ''
          ]
        )
      )
      : {};

  return {
    headers,

    url:
      input.url,

    method:
      input.method,

    params,

    cookies:
      normalizeCookies(
        input.cookies
      ),

    query:
      normalizeQuery(
        input.query
      ),

    body:
      input.body,

    get(name: string) {
      const value =
        headers[
        name.toLowerCase()
        ];

      return Array.isArray(
        value
      )
        ? value[0]
        : value;
    }
  };
}