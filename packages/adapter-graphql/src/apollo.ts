import type { GraphqlAdapterOptions } from './types';
import { toGraphqlAmbitenRequestLike } from './graphql-request';
import {
  createGraphqlRuntimeContext,
  type AmbitenGraphqlRuntimeContext
} from './graphql-context';

export function createApolloContextFactory<TContext extends Record<string, unknown> = Record<string, unknown>>(
  options: GraphqlAdapterOptions = {},
  extend?: (
    input: { req?: any; request?: any },
    runtime: AmbitenGraphqlRuntimeContext
  ) => Promise<TContext> | TContext
) {
  return async (input: { req?: any; request?: any }) => {
    const rawRequest = input.req ?? input.request;

    const adaptedRequest = toGraphqlAmbitenRequestLike({
      headers: rawRequest?.headers,
      url: rawRequest?.url,
      method: rawRequest?.method,
      cookies: rawRequest?.cookies,
      query: rawRequest?.query,
      body: rawRequest?.body
    });

    return createGraphqlRuntimeContext<TContext>(
      {
        request: adaptedRequest,
        rawRequest,
        rawInput: input
      },
      options,
      async (runtime) => (extend ? await extend(input, runtime) : ({} as TContext))
    );
  };
};