import {
  getAdapterRuntimeContext
} from '@ambiten/adapter-runtime';

import {
  createApolloAdapter
} from '../src/apollo';

import type {
  ApolloExecuteInputLike,
  ApolloServerLike
} from '../src/types';

function delay(
  milliseconds:
    number
): Promise<void> {
  return new Promise(
    resolve =>
      setTimeout(
        resolve,
        milliseconds
      )
  );
}

function createInput(
  tenantId:
    string,

  requestId:
    string
): ApolloExecuteInputLike {
  return {
    httpGraphQLRequest: {
      method:
        'POST',

      headers:
        new Map([
          [
            'x-tenant-id',
            tenantId
          ],

          [
            'x-request-id',
            requestId
          ]
        ]),

      search:
        '',

      body: {
        query:
          '{ runtime }'
      }
    },

    context:
      async () => ({
        applicationValue:
          'preserved'
      })
  };
}

describe(
  'createApolloAdapter',
  () => {
    it(
      'keeps Ambiten context active throughout Apollo execution',
      async () => {
        const execute =
          jest.fn(
            async (
              input:
                ApolloExecuteInputLike
            ) => {
              const context =
                await input
                  .context();

              const before =
                getAdapterRuntimeContext();

              await Promise.resolve();
              await delay(5);

              const after =
                getAdapterRuntimeContext();

              return {
                body: {
                  kind:
                    'complete',

                  result: {
                    before:
                      before.tenantId,

                    after:
                      after.tenantId,

                    requestId:
                      after.requestId,

                    context
                  }
                }
              };
            }
          );

        const server =
          {
            executeHTTPGraphQLRequest:
              execute
          } as unknown as
            ApolloServerLike;

        const adapter =
          createApolloAdapter();

        adapter.install(
          server,
          {
            tenancy: {
              header:
                'x-tenant-id',

              validate:
                async (
                  tenantId
                ) =>
                  tenantId ===
                  'tenant-a'
            }
          }
        );

        const result =
          await (
            server as unknown as {
              executeHTTPGraphQLRequest:
                (
                  input:
                    ApolloExecuteInputLike
                ) =>
                  Promise<any>;
            }
          )
            .executeHTTPGraphQLRequest(
              createInput(
                'tenant-a',
                'req-a'
              )
            );

        expect(
          result.body.result.before
        ).toBe(
          'tenant-a'
        );

        expect(
          result.body.result.after
        ).toBe(
          'tenant-a'
        );

        expect(
          result.body.result.requestId
        ).toBe(
          'req-a'
        );

        expect(
          result.body.result
            .context
            .applicationValue
        ).toBe(
          'preserved'
        );

        expect(
          result.body.result
            .context
            .tenantId
        ).toBe(
          'tenant-a'
        );
      }
    );

    it(
      'isolates concurrent Apollo executions',
      async () => {
        const execute =
          async (
            _input:
              ApolloExecuteInputLike
          ) => {
            const before =
              getAdapterRuntimeContext();

            await delay(
              before.tenantId ===
              'tenant-a'
                ? 20
                : 5
            );

            const after =
              getAdapterRuntimeContext();

            return {
              tenantId:
                after.tenantId,

              requestId:
                after.requestId
            };
          };

        const server =
          {
            executeHTTPGraphQLRequest:
              execute
          } as unknown as
            ApolloServerLike;

        createApolloAdapter()
          .install(
            server,
            {
              tenancy: {
                header:
                  'x-tenant-id',

                validate:
                  async () =>
                    true
              }
            }
          );

        const invoke =
          (
            server as unknown as {
              executeHTTPGraphQLRequest:
                (
                  input:
                    ApolloExecuteInputLike
                ) =>
                  Promise<{
                    tenantId?: string;
                    requestId?: string;
                  }>;
            }
          )
            .executeHTTPGraphQLRequest
            .bind(server);

        const [
          tenantA,
          tenantB
        ] =
          await Promise.all([
            invoke(
              createInput(
                'tenant-a',
                'req-a'
              )
            ),

            invoke(
              createInput(
                'tenant-b',
                'req-b'
              )
            )
          ]);

        expect(
          tenantA
        ).toEqual({
          tenantId:
            'tenant-a',

          requestId:
            'req-a'
        });

        expect(
          tenantB
        ).toEqual({
          tenantId:
            'tenant-b',

          requestId:
            'req-b'
        });
      }
    );

    it(
      'rejects invalid tenants before Apollo execution begins',
      async () => {
        const execute =
          jest.fn(
            async () => ({
              ok:
                true
            })
          );

        const server =
          {
            executeHTTPGraphQLRequest:
              execute
          } as unknown as
            ApolloServerLike;

        createApolloAdapter()
          .install(
            server,
            {
              tenancy: {
                header:
                  'x-tenant-id',

                validate:
                  async (
                    tenantId
                  ) =>
                    tenantId ===
                    'tenant-a'
              }
            }
          );

        const invoke =
          (
            server as unknown as {
              executeHTTPGraphQLRequest:
                (
                  input:
                    ApolloExecuteInputLike
                ) =>
                  Promise<unknown>;
            }
          )
            .executeHTTPGraphQLRequest;

        await expect(
          invoke(
            createInput(
              'unknown',
              'req-x'
            )
          )
        ).rejects.toThrow();

        expect(
          execute
        ).not.toHaveBeenCalled();
      }
    );

    it(
      'prevents duplicate installation',
      () => {
        const server =
          {
            executeHTTPGraphQLRequest:
              async () =>
                ({})
          } as unknown as
            ApolloServerLike;

        const adapter =
          createApolloAdapter();

        adapter.install(
          server
        );

        expect(
          () =>
            adapter.install(
              server
            )
        ).toThrow(
          /already installed/
        );
      }
    );

    it(
      'restores the original Apollo execution method',
      () => {
        const original =
          async () => ({
            original:
              true
          });

        const server =
          {
            executeHTTPGraphQLRequest:
              original
          } as unknown as
            ApolloServerLike;

        const dispose =
          createApolloAdapter()
            .install(
              server
            );

        expect(
          server
            .executeHTTPGraphQLRequest
        ).not.toBe(
          original
        );

        dispose();

        expect(
          server
            .executeHTTPGraphQLRequest
        ).toBe(
          original
        );
      }
    );

    it(
      'rejects automatic GraphQL-wide transactions',
      () => {
        const server =
          {
            executeHTTPGraphQLRequest:
              async () =>
                ({})
          } as unknown as
            ApolloServerLike;

        expect(
          () =>
            createApolloAdapter()
              .install(
                server,
                {
                  enableTransactions:
                    true
                }
              )
        ).toThrow(
          /automatic GraphQL-wide transactions/
        );
      }
    );
  }
);