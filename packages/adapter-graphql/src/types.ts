import type { AdapterContextOptions, AmbitenRequestLike } from '@ambiten/adapter-types';

export type GraphqlAdapterOptions = AdapterContextOptions;

export interface GraphqlExecutionInput {
  request: AmbitenRequestLike;
}

export type GraphqlContextFactory<TSource = unknown, TResult = unknown> = (
  input: TSource
) => Promise<TResult> | TResult;
