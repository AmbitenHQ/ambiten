import type { AdapterContextOptions, AmbitenRequestLike } from '@ambiten/adapter-types';

export type GraphqlAdapterOptions = AdapterContextOptions;

export type GraphqlContextRecord =
  Record<string, unknown>;
  
export interface GraphqlExecutionInput {
  request: AmbitenRequestLike;
}

export type GraphqlContextFactory<TSource = unknown, TResult = unknown> = (
  input: TSource
) => Promise<TResult> | TResult;


/**
 * Minimum structural contract Ambiten requires from
 * Apollo Server.
 *
 * `never[]` intentionally allows framework-specific
 * method signatures to remain assignable without
 * importing Apollo's rapidly changing type surface.
 *
 * Internally the method is narrowed only after the
 * incoming invocation has been validated.
 */
export interface ApolloServerLike {
  executeHTTPGraphQLRequest:
    (...args: never[]) => unknown;
}

export interface ApolloHttpGraphQLRequestLike {
  method?: string;
  headers?: unknown;
  search?: string;
  body?: unknown;
}

export type ApolloExecuteInputLike =
  Record<string, unknown> & {
    httpGraphQLRequest:
      ApolloHttpGraphQLRequestLike;

    context:
      () =>
        | unknown
        | Promise<unknown>;
  };

/**
 * Structural Yoga plugin contract.
 *
 * The hook payload is deliberately unknown here.
 * Each hook validates and narrows it internally.
 */
export interface YogaPluginLike {
  onExecute?:
    (payload: unknown) => void;

  onSubscribe?:
    (payload: unknown) => void;
}

export type GraphqlExecutionArgsLike =
  Record<string, unknown> & {
    contextValue?: unknown;
  };