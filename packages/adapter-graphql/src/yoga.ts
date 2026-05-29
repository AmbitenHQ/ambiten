import type { GraphqlAdapterOptions } from './types';
import { toGraphqlTenraRequestLike } from './graphql-request';
import {
  createGraphqlRuntimeContext,
  type TenraGraphqlRuntimeContext
} from './graphql-context';

export function createYogaContextFactory<TContext extends Record<string, unknown> = Record<string, unknown>>(
  options: GraphqlAdapterOptions = {},
  extend?: (
    input: { request: Request },
    runtime: TenraGraphqlRuntimeContext
  ) => Promise<TContext> | TContext
) {
  return async (input: { request: Request }) => {
    const adaptedRequest = toGraphqlTenraRequestLike({
      headers: input.request.headers,
      url: input.request.url,
      method: input.request.method
    });

    return createGraphqlRuntimeContext<TContext>(
      {
        request: adaptedRequest,
        rawRequest: input.request,
        rawInput: input
      },
      options,
      async (runtime) => (extend ? await extend(input, runtime) : ({} as TContext))
    );
  };
};