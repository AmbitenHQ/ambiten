import {
  getAdapterRuntimeContext
} from '@ambiten/adapter-runtime';

import {
  createYogaAdapter
} from '../src/yoga';

import type {
  GraphqlExecutionArgsLike
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

function createRequest(
  tenantId:
    string,

  requestId:
    string
) {
  return {
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

    url:
      'http://localhost/graphql',

    method:
      'POST'
  };
}

describe(
  'createYogaAdapter',
  () => {
    it(
      'keeps Ambiten context active throughout Yoga execution',
      async () => {
        let wrappedExecute:
          (
            args:
              GraphqlExecutionArgsLike
          ) => Promise<unknown>;

        const originalExecute =
          jest.fn(
            async (
              args:
                GraphqlExecutionArgsLike
            ) => {
              const before =
                getAdapterRuntimeContext();

              await Promise.resolve();
              await delay(5);

              const after =
                getAdapterRuntimeContext();

              return {
                before:
                  before.tenantId,

                after:
                  after.tenantId,

                requestId:
                  after.requestId,

                context:
                  args.contextValue
              };
            }
          );

        const plugin =
          createYogaAdapter({
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
          });

        plugin.onExecute?.({
          executeFn:
            originalExecute,

          setExecuteFn(
            fn:
              (
                args:
                  GraphqlExecutionArgsLike
              ) => Promise<unknown>
          ) {
            wrappedExecute =
              fn;
          }
        });

        const result =
          await wrappedExecute!({
            contextValue: {
              request:
                createRequest(
                  'tenant-a',
                  'req-a'
                ),

              applicationValue:
                'preserved'
            }
          }) as {
            before?: string;
            after?: string;
            requestId?: string;

            context?:
              Record<
                string,
                unknown
              >;
          };

        expect(
          result.before
        ).toBe(
          'tenant-a'
        );

        expect(
          result.after
        ).toBe(
          'tenant-a'
        );

        expect(
          result.requestId
        ).toBe(
          'req-a'
        );

        expect(
          result
            .context
            ?.applicationValue
        ).toBe(
          'preserved'
        );

        expect(
          result
            .context
            ?.tenantId
        ).toBe(
          'tenant-a'
        );
      }
    );

    it(
      'isolates concurrent Yoga executions',
      async () => {
        let wrappedExecute:
          (
            args:
              GraphqlExecutionArgsLike
          ) =>
            Promise<unknown>;

        const originalExecute =
          async () => {
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

        const plugin =
          createYogaAdapter({
            tenancy: {
              header:
                'x-tenant-id',

              validate:
                async () =>
                  true
            }
          });

        plugin.onExecute?.({
          executeFn:
            originalExecute,

          setExecuteFn(
            fn:
              (
                args:
                  GraphqlExecutionArgsLike
              ) =>
                Promise<unknown>
          ) {
            wrappedExecute =
              fn;
          }
        });

        const [
          tenantA,
          tenantB
        ] =
          await Promise.all([
            wrappedExecute!({
              contextValue: {
                request:
                  createRequest(
                    'tenant-a',
                    'req-a'
                  )
              }
            }),

            wrappedExecute!({
              contextValue: {
                request:
                  createRequest(
                    'tenant-b',
                    'req-b'
                  )
              }
            })
          ]) as Array<{
            tenantId?: string;
            requestId?: string;
          }>;

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
      'does not execute Yoga operation when tenant validation fails',
      async () => {
        let wrappedExecute:
          (
            args:
              GraphqlExecutionArgsLike
          ) =>
            Promise<unknown>;

        const originalExecute =
          jest.fn(
            async () => ({
              executed:
                true
            })
          );

        const plugin =
          createYogaAdapter({
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
          });

        plugin.onExecute?.({
          executeFn:
            originalExecute,

          setExecuteFn(
            fn:
              (
                args:
                  GraphqlExecutionArgsLike
              ) =>
                Promise<unknown>
          ) {
            wrappedExecute =
              fn;
          }
        });

        await expect(
          wrappedExecute!({
            contextValue: {
              request:
                createRequest(
                  'unknown',
                  'req-x'
                )
            }
          })
        ).rejects.toThrow();

        expect(
          originalExecute
        ).not.toHaveBeenCalled();
      }
    );

    it(
      'wraps subscription execution',
      async () => {
        let wrappedSubscribe:
          (
            args:
              GraphqlExecutionArgsLike
          ) =>
            Promise<unknown>;

        const originalSubscribe =
          jest.fn(
            async () => {
              const ctx =
                getAdapterRuntimeContext();

              return {
                tenantId:
                  ctx.tenantId
              };
            }
          );

        const plugin =
          createYogaAdapter({
            tenancy: {
              header:
                'x-tenant-id',

              validate:
                async () =>
                  true
            }
          });

        plugin.onSubscribe?.({
          subscribeFn:
            originalSubscribe,

          setSubscribeFn(
            fn:
              (
                args:
                  GraphqlExecutionArgsLike
              ) =>
                Promise<unknown>
          ) {
            wrappedSubscribe =
              fn;
          }
        });

        const result =
          await wrappedSubscribe!({
            contextValue: {
              request:
                createRequest(
                  'tenant-a',
                  'req-a'
                )
            }
          });

        expect(
          result
        ).toEqual({
          tenantId:
            'tenant-a'
        });
      }
    );

    it(
      'rejects automatic GraphQL-wide transactions',
      () => {
        expect(
          () =>
            createYogaAdapter({
              enableTransactions:
                true
            })
        ).toThrow(
          /automatic GraphQL-wide transactions/
        );
      }
    );
  }
);