import {
  getAdapterRuntimeContext
} from '@ambiten/adapter-runtime';

import type {
  GraphqlAdapterOptions,
  GraphqlExecutionArgsLike,
  YogaPluginLike
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

type GraphqlExecuteFunction =
  (
    args:
      GraphqlExecutionArgsLike
  ) =>
    | unknown
    | Promise<unknown>;

interface YogaExecutionHookLike {
  executeFn:
  GraphqlExecuteFunction;

  setExecuteFn:
  (
    execute:
      GraphqlExecuteFunction
  ) => void;
}

interface YogaSubscriptionHookLike {
  subscribeFn:
  GraphqlExecuteFunction;

  setSubscribeFn:
  (
    subscribe:
      GraphqlExecuteFunction
  ) => void;
}

function asExecutionArgs(
  value: unknown
): GraphqlExecutionArgsLike {
  if (
    !isRecord(
      value
    )
  ) {
    throw new TypeError(
      '@ambiten/adapter-graphql: invalid GraphQL execution arguments.'
    );
  }

  return value;
}

function asExecuteHook(
  value: unknown
): YogaExecutionHookLike {
  if (
    !isRecord(
      value
    ) ||
    typeof value.executeFn !==
    'function' ||
    typeof value.setExecuteFn !==
    'function'
  ) {
    throw new TypeError(
      '@ambiten/adapter-graphql: invalid Yoga execute hook.'
    );
  }

  return {
    executeFn:
      value.executeFn as
      GraphqlExecuteFunction,

    setExecuteFn:
      value.setExecuteFn as
      (
        execute:
          GraphqlExecuteFunction
      ) => void
  };
}

function asSubscribeHook(
  value: unknown
): YogaSubscriptionHookLike {
  if (
    !isRecord(
      value
    ) ||
    typeof value.subscribeFn !==
    'function' ||
    typeof value.setSubscribeFn !==
    'function'
  ) {
    throw new TypeError(
      '@ambiten/adapter-graphql: invalid Yoga subscribe hook.'
    );
  }

  return {
    subscribeFn:
      value.subscribeFn as
      GraphqlExecuteFunction,

    setSubscribeFn:
      value.setSubscribeFn as
      (
        subscribe:
          GraphqlExecuteFunction
      ) => void
  };
}

function resolveYogaRequest(
  contextValue:
    unknown
): {
  rawRequest:
  Record<string, unknown>;

  request:
  ReturnType<
    typeof toGraphqlAmbitenRequestLike
  >;
} {
  if (
    !isRecord(
      contextValue
    )
  ) {
    throw new Error(
      '@ambiten/adapter-graphql: Yoga execution context is unavailable.'
    );
  }

  const raw =
    contextValue.request;

  if (
    !isRecord(
      raw
    )
  ) {
    throw new Error(
      '@ambiten/adapter-graphql: Yoga execution context does not expose a request.'
    );
  }

  const requestUrl =
    typeof raw.url ===
      'string'
      ? raw.url
      : undefined;

  let query:
    URLSearchParams |
    undefined;

  if (requestUrl) {
    try {
      query =
        new URL(
          requestUrl
        ).searchParams;
    } catch {
      query =
        undefined;
    }
  }

  return {
    rawRequest:
      raw,

    request:
      toGraphqlAmbitenRequestLike({
        headers:
          raw.headers,

        url:
          requestUrl,

        method:
          typeof raw.method ===
            'string'
            ? raw.method
            : undefined,

        query
      })
  };
}

async function executeWithAmbiten(
  original:
    GraphqlExecuteFunction,

  rawArgs:
    unknown,

  options:
    GraphqlAdapterOptions
): Promise<unknown> {
  const args =
    asExecutionArgs(
      rawArgs
    );

  const {
    rawRequest,
    request
  } =
    resolveYogaRequest(
      args.contextValue
    );

  return runWithGraphqlContext(
    request,

    async () => {
      const contextValue =
        await createGraphqlContextValue(
          toContextRecord(
            args.contextValue
          ),

          {
            request,

            rawRequest,

            rawInput:
              args
          }
        );

      const nextArgs:
        GraphqlExecutionArgsLike = {
        ...args,

        contextValue
      };

      const result =
        await original(
          nextArgs
        );

      if (
        !isAsyncIterable(
          result
        )
      ) {
        return result;
      }

      const snapshot =
        getAdapterRuntimeContext();

      return bindGraphqlAsyncIterable(
        result,
        request,
        options,
        snapshot
      );
    },

    options
  );
}

export function createYogaAdapter(
  options:
    GraphqlAdapterOptions = {}
): YogaPluginLike {
  assertGraphqlAdapterOptions(
    options
  );

  return {
    onExecute(
      rawHook
    ) {
      const {
        executeFn,
        setExecuteFn
      } =
        asExecuteHook(
          rawHook
        );

      setExecuteFn(
        rawArgs =>
          executeWithAmbiten(
            executeFn,
            rawArgs,
            options
          )
      );
    },

    onSubscribe(
      rawHook
    ) {
      const {
        subscribeFn,
        setSubscribeFn
      } =
        asSubscribeHook(
          rawHook
        );

      setSubscribeFn(
        rawArgs =>
          executeWithAmbiten(
            subscribeFn,
            rawArgs,
            options
          )
      );
    }
  };
}

/**
 * Legacy context-factory API.
 *
 * @deprecated
 * Use createYogaAdapter(). Context creation alone does not
 * preserve AmbitenContext throughout resolver execution.
 */
export function createYogaContextFactory<
  TContext extends
  Record<string, unknown> =
  Record<string, unknown>
>(
  options:
    GraphqlAdapterOptions = {},

  extend?: (
    input: {
      request:
      unknown;
    },

    runtime:
      AmbitenGraphqlRuntimeContext
  ) =>
    | TContext
    | Promise<TContext>
) {
  return async (
    input: {
      request:
      unknown;
    }
  ) => {
    const rawRequest =
      isRecord(
        input.request
      )
        ? input.request
        : {};

    const requestUrl =
      typeof rawRequest.url ===
        'string'
        ? rawRequest.url
        : undefined;

    let query:
      URLSearchParams |
      undefined;

    if (requestUrl) {
      try {
        query =
          new URL(
            requestUrl
          ).searchParams;
      } catch {
        query =
          undefined;
      }
    }

    const adaptedRequest =
      toGraphqlAmbitenRequestLike({
        headers:
          rawRequest.headers,

        url:
          requestUrl,

        method:
          typeof rawRequest.method ===
            'string'
            ? rawRequest.method
            : undefined,

        query
      });

    return createGraphqlRuntimeContext(
      {
        request:
          adaptedRequest,

        rawRequest:
          input.request,

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