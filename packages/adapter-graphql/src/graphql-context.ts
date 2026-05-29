import {
  runWithAdapterContext,
  getAdapterRuntimeContext,
  AdapterRuntimeContextSnapshot
} from '@tenra/adapter-runtime';
import type { GraphqlAdapterOptions } from './types';
import type { TenraRequestLike } from '@tenra/adapter-types';

export interface TenraGraphqlRuntimeContext {
  tenantId?: string;
  requestId?: string;
  dbName?: string;
  collectionName?: string;
  debug?: boolean;
  loggerMeta?: Record<string, unknown>;
  meta?: AdapterRuntimeContextSnapshot['meta'];
  request: TenraRequestLike;
  rawRequest?: unknown;
  rawInput?: unknown;
}

export async function runWithGraphqlContext<T>(
  request: TenraRequestLike,
  handler: () => T | Promise<T>,
  options: GraphqlAdapterOptions = {}
): Promise<T> {
  return runWithAdapterContext(request, handler, options);
}

export async function createGraphqlRuntimeContext<TExtra extends Record<string, unknown> = Record<string, unknown>>(
  input: {
    request: TenraRequestLike;
    rawRequest?: unknown;
    rawInput?: unknown;
  },
  options: GraphqlAdapterOptions = {},
  extend?: (
    runtime: TenraGraphqlRuntimeContext
  ) => Promise<TExtra> | TExtra
): Promise<TenraGraphqlRuntimeContext & TExtra> {
  return runWithGraphqlContext(
    input.request,
    async () => {
      const ctx = getAdapterRuntimeContext();

      const runtime: TenraGraphqlRuntimeContext = {
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