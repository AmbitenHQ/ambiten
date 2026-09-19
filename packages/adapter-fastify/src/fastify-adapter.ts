import type {
  FastifyInstance,
  FastifyRequest,
  RouteHandlerMethod
} from 'fastify';

import type {
  AmbitenAdapter,
  AdapterContextOptions,
  AmbitenRequestLike
} from '@ambiten/adapter-types';

import {
  runWithAdapterContext
} from '@ambiten/adapter-runtime';

/**
 * Normalizes Fastify route params into the transport-neutral
 * shape expected by the Ambiten adapter runtime.
 */
function normalizeParams(
  params: FastifyRequest['params']
): Record<string, string> {
  if (
    !params ||
    typeof params !== 'object'
  ) {
    return {};
  }

  const normalized:
    Record<string, string> = {};

  for (
    const [key, value]
    of Object.entries(
      params as Record<
        string,
        unknown
      >
    )
  ) {
    if (
      typeof value === 'string'
    ) {
      normalized[key] =
        value;

      continue;
    }

    if (
      Array.isArray(value)
    ) {
      const first =
        value[0];

      normalized[key] =
        first == null
          ? ''
          : String(first);

      continue;
    }

    if (
      value != null
    ) {
      normalized[key] =
        String(value);
    }
  }

  return normalized;
}

/**
 * Normalizes cookies when a Fastify cookie plugin has
 * decorated the request with a cookies object.
 */
function normalizeCookies(
  cookies: unknown
):
  | Record<string, string>
  | undefined {
  if (
    !cookies ||
    typeof cookies !== 'object'
  ) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(
      cookies as Record<
        string,
        unknown
      >
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

/**
 * Normalizes Fastify query values into the common
 * adapter request contract.
 */
function normalizeQuery(
  query: FastifyRequest['query']
):
  | Record<
      string,
      string
        | string[]
        | undefined
    >
  | undefined {
  if (
    !query ||
    typeof query !== 'object'
  ) {
    return undefined;
  }

  const normalized:
    Record<
      string,
      string
        | string[]
        | undefined
    > = {};

  for (
    const [key, value]
    of Object.entries(
      query as Record<
        string,
        unknown
      >
    )
  ) {
    if (
      typeof value === 'string' ||
      value === undefined
    ) {
      normalized[key] =
        value;

      continue;
    }

    if (
      Array.isArray(value)
    ) {
      normalized[key] =
        value.map(
          item =>
            String(item)
        );

      continue;
    }

    if (
      value != null
    ) {
      normalized[key] =
        String(value);
    }
  }

  return normalized;
}

/**
 * Converts a Fastify request into the framework-neutral
 * request representation consumed by adapter-runtime.
 */
function toAmbitenRequestLike(
  req: FastifyRequest
): AmbitenRequestLike {
  return {
    headers:
      req.headers as Record<
        string,
        string
          | string[]
          | undefined
      >,

    url:
      req.url,

    method:
      req.method,

    params:
      normalizeParams(
        req.params
      ),

    cookies:
      normalizeCookies(
        (req as any)
          .cookies
      ),

    query:
      normalizeQuery(
        req.query
      ),

    body:
      req.body,

    get(name: string) {
      const value =
        req.headers?.[
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

/**
 * Creates the Ambiten Fastify adapter.
 *
 * The adapter wraps Fastify route handlers in the shared
 * Ambiten adapter runtime. This keeps execution-scoped
 * state active for the complete application handler chain,
 * including nested asynchronous services and model calls.
 */
export function createFastifyAdapter():
  AmbitenAdapter<
    FastifyInstance
  > {
  /*
   * Fastify can reuse route handlers, including when
   * generating related routes such as HEAD.
   *
   * Preserve the original → wrapped relationship so the
   * same handler is never wrapped multiple times.
   */
  const wrappedHandlers =
    new WeakMap<
      RouteHandlerMethod,
      RouteHandlerMethod
    >();

  return {
    name:
      'fastify',

    install(
      app:
        FastifyInstance,

      options:
        AdapterContextOptions = {}
    ): void {
      app.addHook(
        'onRoute',

        routeOptions => {
          const originalHandler =
            routeOptions.handler;

          const existingWrapper =
            wrappedHandlers.get(
              originalHandler
            );

          if (
            existingWrapper
          ) {
            routeOptions.handler =
              existingWrapper;

            return;
          }

          const wrappedHandler:
            RouteHandlerMethod =
            function (
              request,
              reply
            ) {
              const adaptedRequest =
                toAmbitenRequestLike(
                  request
                );

              return runWithAdapterContext(
                adaptedRequest,

                () =>
                  originalHandler.call(
                    this,
                    request,
                    reply
                  ),

                options
              );
            };

          wrappedHandlers.set(
            originalHandler,
            wrappedHandler
          );

          /*
           * Also recognize the wrapped function itself if
           * Fastify exposes it again through onRoute.
           */
          wrappedHandlers.set(
            wrappedHandler,
            wrappedHandler
          );

          routeOptions.handler =
            wrappedHandler;
        }
      );
    }
  };
}