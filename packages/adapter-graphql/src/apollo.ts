import {
  getAdapterRuntimeContext
} from '@ambiten/adapter-runtime';

import type {
  GraphqlAdapterOptions,
  ApolloExecuteInputLike,
  ApolloHttpGraphQLRequestLike,
  ApolloServerLike
} from './types';

import {
  assertGraphqlAdapterOptions,
  bindGraphqlAsyncIterable,
  createGraphqlContextValue,
  createGraphqlRuntimeContext,
  isAsyncIterable,
  isRecord,
  runWithGraphqlContext,
  toContextRecord,
  type AmbitenGraphqlRuntimeContext
} from './graphql-context';

import {
  toGraphqlAmbitenRequestLike
} from './graphql-request';

type ApolloExecuteFunction =
  (
    input:
      ApolloExecuteInputLike
  ) =>
    | unknown
    | Promise<unknown>;

interface InstalledApolloState {
  original:
  ApolloExecuteFunction;

  wrapped:
  ApolloExecuteFunction;
}

const installedServers =
  new WeakMap<
    object,
    InstalledApolloState
  >();

function asApolloExecuteInput(
  value: unknown
): ApolloExecuteInputLike {
  if (
    !isRecord(
      value
    )
  ) {
    throw new TypeError(
      '@ambiten/adapter-graphql: invalid Apollo execution input.'
    );
  }

  const rawRequest =
    value.httpGraphQLRequest;

  if (
    !isRecord(
      rawRequest
    )
  ) {
    throw new TypeError(
      '@ambiten/adapter-graphql: Apollo execution input is missing httpGraphQLRequest.'
    );
  }

  if (
    typeof value.context !==
    'function'
  ) {
    throw new TypeError(
      '@ambiten/adapter-graphql: Apollo execution input is missing its context factory.'
    );
  }

  const request:
    ApolloHttpGraphQLRequestLike = {
    method:
      typeof rawRequest.method ===
        'string'
        ? rawRequest.method
        : undefined,

    headers:
      rawRequest.headers,

    search:
      typeof rawRequest.search ===
        'string'
        ? rawRequest.search
        : undefined,

    body:
      rawRequest.body
  };

  return {
    ...value,

    httpGraphQLRequest:
      request,

    context:
      value.context as
      () =>
        | unknown
        | Promise<unknown>
  };
}

function normalizeSearch(
  search:
    string | undefined
):
  | URLSearchParams
  | undefined {
  if (!search) {
    return undefined;
  }

  return new URLSearchParams(
    search.startsWith('?')
      ? search.slice(1)
      : search
  );
}

function toApolloAmbitenRequest(
  request:
    ApolloHttpGraphQLRequestLike
) {
  return toGraphqlAmbitenRequestLike({
    headers:
      request.headers,

    method:
      request.method,

    query:
      normalizeSearch(
        request.search
      ),

    body:
      request.body
  });
}

function bindApolloResponse(
  response:
    unknown,

  request:
    ReturnType<
      typeof toApolloAmbitenRequest
    >,

  options:
    GraphqlAdapterOptions
): unknown {
  if (
    !isRecord(
      response
    ) ||
    !isRecord(
      response.body
    )
  ) {
    return response;
  }

  const body =
    response.body;

  if (
    body.kind !==
    'chunked' ||
    !isAsyncIterable(
      body.asyncIterator
    )
  ) {
    return response;
  }

  const snapshot =
    getAdapterRuntimeContext();

  return {
    ...response,

    body: {
      ...body,

      asyncIterator:
        bindGraphqlAsyncIterable(
          body.asyncIterator,
          request,
          options,
          snapshot
        )
    }
  };
}

function getApolloExecute(
  server:
    ApolloServerLike
): ApolloExecuteFunction {
  const candidate =
    server
      .executeHTTPGraphQLRequest;

  if (
    typeof candidate !==
    'function'
  ) {
    throw new TypeError(
      '@ambiten/adapter-graphql: expected an Apollo-compatible server exposing executeHTTPGraphQLRequest().'
    );
  }

  return candidate as unknown as
    ApolloExecuteFunction;
}

function setApolloExecute(
  server:
    ApolloServerLike,

  execute:
    ApolloExecuteFunction
): void {
  (
    server as unknown as {
      executeHTTPGraphQLRequest:
      ApolloExecuteFunction;
    }
  ).executeHTTPGraphQLRequest =
    execute;
}

export interface AmbitenApolloAdapter {
  readonly name:
  'apollo';

  install(
    server:
      ApolloServerLike,

    options?:
      GraphqlAdapterOptions
  ): () => void;
}

export function createApolloAdapter():
  AmbitenApolloAdapter {
  return {
    name:
      'apollo',

    install(
      server,
      options = {}
    ) {
      assertGraphqlAdapterOptions(
        options
      );

      if (
        installedServers.has(
          server
        )
      ) {
        throw new Error(
          '@ambiten/adapter-graphql: Ambiten is already installed on this Apollo-compatible server.'
        );
      }

      const original =
        getApolloExecute(
          server
        );

      const wrapped:
        ApolloExecuteFunction =
        async (
          rawInput
        ) => {
          const input =
            asApolloExecuteInput(
              rawInput
            );

          const adaptedRequest =
            toApolloAmbitenRequest(
              input
                .httpGraphQLRequest
            );

          return runWithGraphqlContext(
            adaptedRequest,

            async () => {
              const originalContext =
                input.context;

              const nextContext =
                async () => {
                  const applicationContext =
                    toContextRecord(
                      await originalContext()
                    );

                  return createGraphqlContextValue(
                    applicationContext,

                    {
                      request:
                        adaptedRequest,

                      rawRequest:
                        input
                          .httpGraphQLRequest,

                      rawInput:
                        input
                    }
                  );
                };

              /*
               * `input` is now a validated object type,
               * so spreading it is safe.
               */
              const nextInput:
                ApolloExecuteInputLike = {
                ...input,

                context:
                  nextContext
              };

              const response =
                await original.call(
                  server,
                  nextInput
                );

              return bindApolloResponse(
                response,
                adaptedRequest,
                options
              );
            },

            options
          );
        };

      setApolloExecute(
        server,
        wrapped
      );

      installedServers.set(
        server,
        {
          original,
          wrapped
        }
      );

      return () => {
        const state =
          installedServers.get(
            server
          );

        if (!state) {
          return;
        }

        const current =
          getApolloExecute(
            server
          );

        /*
         * Do not overwrite another wrapper installed
         * after Ambiten.
         */
        if (
          current ===
          state.wrapped
        ) {
          setApolloExecute(
            server,
            state.original
          );
        }

        installedServers.delete(
          server
        );
      };
    }
  };
}

/**
 * Legacy context-factory API.
 *
 * @deprecated
 * Context creation does not preserve AmbitenContext throughout
 * resolver execution. Use createApolloAdapter().
 */
export function createApolloContextFactory<
  TContext extends
  Record<string, unknown> =
  Record<string, unknown>
>(
  options:
    GraphqlAdapterOptions = {},

  extend?: (
    input: {
      req?: unknown;
      request?: unknown;
    },

    runtime:
      AmbitenGraphqlRuntimeContext
  ) =>
    | TContext
    | Promise<TContext>
) {
  return async (
    input: {
      req?: unknown;
      request?: unknown;
    }
  ) => {
    const rawRequest =
      input.req ??
      input.request;

    const requestRecord =
      isRecord(
        rawRequest
      )
        ? rawRequest
        : {};

    const adaptedRequest =
      toGraphqlAmbitenRequestLike({
        headers:
          requestRecord.headers,

        url:
          typeof requestRecord.url ===
            'string'
            ? requestRecord.url
            : undefined,

        method:
          typeof requestRecord.method ===
            'string'
            ? requestRecord.method
            : undefined,

        cookies:
          isRecord(
            requestRecord.cookies
          )
            ? requestRecord.cookies as
            Record<
              string,
              string | undefined
            >
            : undefined,

        query:
          requestRecord.query,

        body:
          requestRecord.body
      });

    return createGraphqlRuntimeContext(
      {
        request:
          adaptedRequest,

        rawRequest,

        rawInput:
          input
      },

      options,

      async (
        runtime
      ) =>
        extend
          ? await extend(
            input,
            runtime
          )
          : ({} as TContext)
    );
  };
}