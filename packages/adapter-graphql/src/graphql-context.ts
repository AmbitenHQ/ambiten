import {
  getAdapterRuntimeContext,
  runWithAdapterContext
} from '@ambiten/adapter-runtime';

import type {
  AdapterRuntimeContextSnapshot
} from '@ambiten/adapter-runtime';

import type {
  AmbitenRequestLike
} from '@ambiten/adapter-types';

import type {
  GraphqlAdapterOptions,
  GraphqlContextRecord
} from './types';

export interface AmbitenGraphqlRuntimeContext {
  tenantId?: string;
  requestId?: string;
  dbName?: string;
  collectionName?: string;
  debug?: boolean;

  loggerMeta?:
  Record<string, unknown>;

  meta?:
  Record<string, unknown>;

  request:
  AmbitenRequestLike;

  rawRequest?:
  unknown;

  rawInput?:
  unknown;
}
// export interface AmbitenGraphqlRuntimeContext {
//   tenantId?: string;
//   requestId?: string;
//   dbName?: string;
//   collectionName?: string;
//   debug?: boolean;

//   loggerMeta?:
//   Record<string, unknown>;

//   meta?:
//   AdapterRuntimeContextSnapshot[
//   'meta'
//   ];

//   request:
//   AmbitenRequestLike;

//   rawRequest?:
//   unknown;

//   rawInput?:
//   unknown;
// }

export interface GraphqlRuntimeInput {
  request:
  AmbitenRequestLike;

  rawRequest?:
  unknown;

  rawInput?:
  unknown;
}

/**
 * Converts core/runtime operation metadata into the
 * transport-neutral metadata shape used by adapter resolvers.
 *
 * The adapter layer intentionally does not depend on the
 * concrete AmbitenOperationMeta type.
 */
function normalizeRuntimeMeta(
  meta:
    AdapterRuntimeContextSnapshot['meta']
): Record<string, unknown> | undefined {
  if (!meta) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(meta)
  );
}

export function isRecord(
  value: unknown
): value is GraphqlContextRecord {
  return Boolean(
    value &&
    typeof value === 'object' &&
    !Array.isArray(value)
  );
}

export function toContextRecord(
  value: unknown
): GraphqlContextRecord {
  return isRecord(
    value
  )
    ? value
    : {};
}

/**
 * GraphQL-wide automatic transactions are intentionally
 * rejected.
 *
 * A GraphQL execution may resolve successfully while
 * reporting resolver failures inside ExecutionResult.errors.
 *
 * The generic adapter runtime therefore cannot safely infer
 * commit/rollback semantics for an entire GraphQL operation.
 *
 * Applications should place explicit transaction boundaries
 * around the mutation/service workflow requiring atomicity.
 */
export function assertGraphqlAdapterOptions(
  options:
    GraphqlAdapterOptions
): void {
  if (
    options.enableTransactions
  ) {
    throw new Error(
      '@ambiten/adapter-graphql: automatic GraphQL-wide transactions are not supported. ' +
      'Use an explicit transaction boundary inside the mutation or application service.'
    );
  }
}

/**
 * Establishes the Ambiten runtime around real GraphQL
 * execution.
 */
export function runWithGraphqlContext<T>(
  request:
    AmbitenRequestLike,

  handler:
    () =>
      | T
      | Promise<T>,

  options:
    GraphqlAdapterOptions = {}
): Promise<T> {
  assertGraphqlAdapterOptions(
    options
  );

  return runWithAdapterContext(
    request,
    handler,
    options
  );
}

/**
 * Builds the GraphQL-visible context value from the currently
 * active Ambiten execution.
 *
 * This function does NOT establish an execution boundary.
 */
export async function createGraphqlContextValue<
  TBase extends
  GraphqlContextRecord =
  GraphqlContextRecord,

  TExtra extends
  GraphqlContextRecord =
  GraphqlContextRecord
>(
  base:
    TBase,

  input:
    GraphqlRuntimeInput,

  extend?: (
    runtime:
      AmbitenGraphqlRuntimeContext
  ) =>
    | TExtra
    | Promise<TExtra>
): Promise<
  TBase &
  TExtra &
  AmbitenGraphqlRuntimeContext
> {
  const ctx =
    getAdapterRuntimeContext();

  const runtime:
    AmbitenGraphqlRuntimeContext = {
    tenantId:
      ctx.tenantId,

    requestId:
      ctx.requestId,

    dbName:
      ctx.dbName,

    collectionName:
      ctx.collectionName,

    debug:
      ctx.debug,

    loggerMeta:
      ctx.loggerMeta,

    meta:
      normalizeRuntimeMeta(
        ctx.meta
      ),

    request:
      input.request,

    rawRequest:
      input.rawRequest,

    rawInput:
      input.rawInput
  };

  const extra =
    extend
      ? await extend(
        runtime
      )
      : ({} as TExtra);

  /*
   * Runtime state wins intentionally.
   *
   * Application context cannot accidentally replace
   * tenantId/requestId/dbName/etc.
   */
  return {
    ...base,
    ...extra,
    ...runtime
  } as
    TBase &
    TExtra &
    AmbitenGraphqlRuntimeContext;
}

export function isAsyncIterable<T>(
  value: unknown
): value is AsyncIterable<T> {
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
    )[Symbol.asyncIterator];

  return typeof iterator ===
    'function';
}

/**
 * Creates adapter options from an already-resolved,
 * already-validated runtime snapshot.
 *
 * Tenant validation is intentionally not repeated for every
 * streamed payload.
 */
function optionsFromSnapshot(
  options:
    GraphqlAdapterOptions,

  snapshot:
    AdapterRuntimeContextSnapshot
): GraphqlAdapterOptions {
  return {
    ...options,

    enableTransactions:
      false,

    /*
     * This execution identity has already passed the original
     * ingress resolution/validation boundary.
     */
    tenancy:
      undefined,

    resolvers: {
      ...options.resolvers,

      tenantId:
        () =>
          snapshot.tenantId,

      requestId:
        () =>
          snapshot.requestId,

      dbName:
        () =>
          snapshot.dbName,

      collectionName:
        () =>
          snapshot.collectionName,

      debug:
        () =>
          snapshot.debug,

      loggerMeta:
        () =>
          snapshot.loggerMeta,

      meta:
        () =>
          normalizeRuntimeMeta(
            snapshot.meta
          )
    }
  };
}

/**
 * Re-establishes the same resolved Ambiten execution snapshot
 * whenever a streaming GraphQL iterator advances.
 */
export function bindGraphqlAsyncIterable<T>(
  source:
    AsyncIterable<T>,

  request:
    AmbitenRequestLike,

  options:
    GraphqlAdapterOptions,

  snapshot:
    AdapterRuntimeContextSnapshot
): AsyncIterableIterator<T> {
  const iterator =
    source[
      Symbol.asyncIterator
    ]();

  const stableOptions =
    optionsFromSnapshot(
      options,
      snapshot
    );

  const run =
    <R>(
      operation:
        () =>
          | R
          | Promise<R>
    ): Promise<R> =>
      runWithAdapterContext(
        request,
        operation,
        stableOptions
      );

  return {
    async next(
      value?: unknown
    ): Promise<
      IteratorResult<T>
    > {
      return run(
        () =>
          (
            iterator.next as (
              value?: unknown
            ) =>
              Promise<
                IteratorResult<T>
              >
          )(value)
      );
    },

    async return(
      value?: unknown
    ): Promise<
      IteratorResult<T>
    > {
      if (
        typeof iterator.return !==
        'function'
      ) {
        return {
          done: true,
          value:
            value as T
        };
      }

      return run(
        () =>
          (
            iterator.return as (
              value?: unknown
            ) =>
              Promise<
                IteratorResult<T>
              >
          )(value)
      );
    },

    async throw(
      error?: unknown
    ): Promise<
      IteratorResult<T>
    > {
      if (
        typeof iterator.throw !==
        'function'
      ) {
        throw error;
      }

      return run(
        () =>
          (
            iterator.throw as (
              error?: unknown
            ) =>
              Promise<
                IteratorResult<T>
              >
          )(error)
      );
    },

    [Symbol.asyncIterator]() {
      return this;
    }
  };
}

/**
 * Legacy compatibility helper.
 *
 * @deprecated
 * Creating a GraphQL context value is not equivalent to
 * wrapping resolver execution. Prefer createApolloAdapter()
 * or createYogaAdapter().
 */
export function createGraphqlRuntimeContext<
  TExtra extends
  GraphqlContextRecord =
  GraphqlContextRecord
>(
  input:
    GraphqlRuntimeInput,

  options:
    GraphqlAdapterOptions = {},

  extend?: (
    runtime:
      AmbitenGraphqlRuntimeContext
  ) =>
    | TExtra
    | Promise<TExtra>
): Promise<
  AmbitenGraphqlRuntimeContext &
  TExtra
> {
  return runWithGraphqlContext(
    input.request,

    () =>
      createGraphqlContextValue(
        {},
        input,
        extend
      ),

    options
  );
}