import {
  getAdapterRuntimeContext
} from '@ambiten/adapter-runtime';

import {
  bindGraphqlAsyncIterable,
  runWithGraphqlContext
} from '../src/graphql-context';

import {
  toGraphqlAmbitenRequestLike
} from '../src/graphql-request';

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


// import { createApolloContextFactory } from '../src/apollo';
// import { createYogaContextFactory } from '../src/yoga';
// import { runWithAdapterContext } from '@ambiten/adapter-runtime';

// jest.mock('@ambiten/adapter-runtime', () => ({
//   runWithAdapterContext: jest.fn(),
//   getAdapterRuntimeContext: jest.fn(() => ({
//     tenantId: 'tenant-a',
//     requestId: 'req-1',
//     dbName: 'tenant-db',
//     collectionName: 'users',
//     debug: true,
//     loggerMeta: { source: 'test' },
//     meta: { secure: true }
//   }))
// }));

// describe('GraphQL adapter context factories', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();

//     (runWithAdapterContext as jest.Mock).mockImplementation(
//       async (_req, handler) => handler()
//     );
//   });

//   it('createApolloContextFactory should create Ambiten GraphQL runtime context', async () => {
//     const factory = createApolloContextFactory(
//       {
//         tenancy: { header: 'x-tenant-id' },
//         requestIdHeader: 'x-request-id'
//       },
//       async (_input, runtime) => ({
//         user: { id: 'user-1' },
//         runtimeTenant: runtime.tenantId
//       })
//     );

//     const context = await factory({
//       req: {
//         headers: {
//           'x-tenant-id': 'tenant-a',
//           'x-request-id': 'req-1'
//         },
//         url: '/graphql',
//         method: 'POST',
//         cookies: { session: 'abc' },
//         query: { operationName: 'FindUsers' },
//         body: { query: '{ users { id } }' }
//       }
//     });

//     expect(runWithAdapterContext).toHaveBeenCalledWith(
//       expect.objectContaining({
//         headers: expect.objectContaining({
//           'x-tenant-id': 'tenant-a'
//         }),
//         url: '/graphql',
//         method: 'POST',
//         cookies: { session: 'abc' },
//         query: { operationName: 'FindUsers' },
//         body: { query: '{ users { id } }' },
//         get: expect.any(Function)
//       }),
//       expect.any(Function),
//       expect.objectContaining({
//         tenancy: { header: 'x-tenant-id' },
//         requestIdHeader: 'x-request-id'
//       })
//     );

//     expect(context).toEqual(
//       expect.objectContaining({
//         tenantId: 'tenant-a',
//         requestId: 'req-1',
//         dbName: 'tenant-db',
//         collectionName: 'users',
//         debug: true,
//         loggerMeta: { source: 'test' },
//         meta: { secure: true },
//         user: { id: 'user-1' },
//         runtimeTenant: 'tenant-a',
//         request: expect.any(Object),
//         rawRequest: expect.any(Object),
//         rawInput: expect.any(Object)
//       })
//     );
//   });

//   it('createYogaContextFactory should create Ambiten GraphQL runtime context', async () => {
//     const request = new Request('https://example.com/graphql', {
//       method: 'POST',
//       headers: {
//         'x-tenant-id': 'tenant-a',
//         'x-request-id': 'req-1'
//       },
//       body: JSON.stringify({ query: '{ users { id } }' })
//     });

//     const factory = createYogaContextFactory(
//       {
//         tenancy: { header: 'x-tenant-id' },
//         requestIdHeader: 'x-request-id'
//       },
//       async (_input, runtime) => ({
//         user: { id: 'user-2' },
//         runtimeRequestId: runtime.requestId
//       })
//     );

//     const context = await factory({ request });

//     expect(runWithAdapterContext).toHaveBeenCalledWith(
//       expect.objectContaining({
//         headers: expect.objectContaining({
//           'x-tenant-id': 'tenant-a',
//           'x-request-id': 'req-1'
//         }),
//         url: 'https://example.com/graphql',
//         method: 'POST',
//         get: expect.any(Function)
//       }),
//       expect.any(Function),
//       expect.objectContaining({
//         tenancy: { header: 'x-tenant-id' },
//         requestIdHeader: 'x-request-id'
//       })
//     );

//     expect(context).toEqual(
//       expect.objectContaining({
//         tenantId: 'tenant-a',
//         requestId: 'req-1',
//         dbName: 'tenant-db',
//         collectionName: 'users',
//         debug: true,
//         user: { id: 'user-2' },
//         runtimeRequestId: 'req-1',
//         request: expect.any(Object),
//         rawRequest: request,
//         rawInput: { request }
//       })
//     );
//   });
// });