import {
  runWithAdapterContext,
  getAdapterRuntimeContext,
  AdapterRuntimeContextSnapshot
} from '@ambiten/adapter-runtime';
import type { GraphqlAdapterOptions } from './types';
import type { AmbitenRequestLike } from '@ambiten/adapter-types';

export interface AmbitenGraphqlRuntimeContext {
  tenantId?: string;
  requestId?: string;
  dbName?: string;
  collectionName?: string;
  debug?: boolean;
  loggerMeta?: Record<string, unknown>;
  meta?: AdapterRuntimeContextSnapshot['meta'];
  request: AmbitenRequestLike;
  rawRequest?: unknown;
  rawInput?: unknown;
}

export async function runWithGraphqlContext<T>(
  request: AmbitenRequestLike,
  handler: () => T | Promise<T>,
  options: GraphqlAdapterOptions = {}
): Promise<T> {
  return runWithAdapterContext(request, handler, options);
}

export async function createGraphqlRuntimeContext<TExtra extends Record<string, unknown> = Record<string, unknown>>(
  input: {
    request: AmbitenRequestLike;
    rawRequest?: unknown;
    rawInput?: unknown;
  },
  options: GraphqlAdapterOptions = {},
  extend?: (
    runtime: AmbitenGraphqlRuntimeContext
  ) => Promise<TExtra> | TExtra
): Promise<AmbitenGraphqlRuntimeContext & TExtra> {
  return runWithGraphqlContext(
    input.request,
    async () => {
      const ctx = getAdapterRuntimeContext();

      const runtime: AmbitenGraphqlRuntimeContext = {
        tenantId: ctx.tenantId,
        requestId: ctx.requestId,
        dbName: ctx.dbName,
        collectionName: ctx.collectionName,
        debug: ctx.debug,
        loggerMeta: ctx.loggerMeta,
        meta: ctx.meta,
        request: input.request,
        rawRequest: input.rawRequest,
        rawInput: input.rawInput
      };

      const extra = extend ? await extend(runtime) : ({} as TExtra);

      return {
        ...runtime,
        ...extra
      };
    },
    options
  );
}