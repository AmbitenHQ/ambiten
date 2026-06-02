import { runWithAdapterContext } from '@ambiten/adapter-runtime';
import type {
  LambdaAdapterOptions,
  LambdaHandlerLike,
  LambdaRequestInput
} from './types';
import { toLambdaAmbitenRequestLike } from './lambda-request';

export function createLambdaAdapter<TEvent extends LambdaRequestInput, TResult>(
  handler: LambdaHandlerLike<TEvent, TResult>,
  options: LambdaAdapterOptions = {}
): LambdaHandlerLike<TEvent, TResult> {
  return async (event: TEvent, context?: unknown): Promise<TResult> => {
    const adaptedRequest = toLambdaAmbitenRequestLike(event);

    return runWithAdapterContext(
      adaptedRequest,
      async () => handler(event, context),
      options
    );
  };
};