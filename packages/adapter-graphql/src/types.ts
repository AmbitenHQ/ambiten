import type { AdapterContextOptions, TenraRequestLike } from '@tenra/adapter-types';

export interface GraphqlAdapterOptions extends AdapterContextOptions {}

export interface GraphqlExecutionInput {
  request: TenraRequestLike;
}

export type GraphqlContextFactory<TSource = unknown, TResult = unknown> = (
  input: TSource
) => Promise<TResult> | TResult;
