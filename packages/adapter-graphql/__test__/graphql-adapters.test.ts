import { getAdapterRuntimeContext } from '@ambiten/adapter-runtime';
import {
  bindGraphqlAsyncIterable,
  runWithGraphqlContext
} from '../src/graphql-context';
import { toGraphqlAmbitenRequestLike } from '../src/graphql-request';


describe(
  'GraphQL streaming runtime',
  () => {
    it(
      're-enters the same resolved context for iterator advancement',
      async () => {
        let requestIdCalls =
          0;

        const request =
          toGraphqlAmbitenRequestLike({
            headers: {
              'x-tenant-id':
                'tenant-a'
            }
          });

        const options = {
          tenancy: {
            header:
              'x-tenant-id',

            validate:
              async () =>
                true
          },

          resolvers: {
            requestId:
              () => {
                requestIdCalls +=
                  1;

                return `req-${requestIdCalls}`;
              }
          }
        };

        let count =
          0;

        const source:
          AsyncIterableIterator<
            string
          > = {
          async next() {
            count += 1;

            if (
              count > 2
            ) {
              return {
                done: true,
                value:
                  undefined as never
              };
            }

            const context =
              getAdapterRuntimeContext();

            return {
              done: false,

              value:
                [
                  context.tenantId,
                  context.requestId
                ].join('|')
            };
          },

          [Symbol.asyncIterator]() {
            return this;
          }
        };

        let bound:
          AsyncIterableIterator<
            string
          > | undefined;

        await runWithGraphqlContext(
          request,

          async () => {
            const snapshot =
              getAdapterRuntimeContext();

            bound =
              bindGraphqlAsyncIterable(
                source,
                request,
                options,
                snapshot
              );
          },

          options
        );

        expect(
          requestIdCalls
        ).toBe(1);

        const first =
          await bound!.next();

        const second =
          await bound!.next();

        expect(
          first.value
        ).toBe(
          'tenant-a|req-1'
        );

        expect(
          second.value
        ).toBe(
          'tenant-a|req-1'
        );

        /*
         * Streaming does not re-run the original
         * request ID resolver.
         */
        expect(
          requestIdCalls
        ).toBe(1);
      }
    );
  }
);