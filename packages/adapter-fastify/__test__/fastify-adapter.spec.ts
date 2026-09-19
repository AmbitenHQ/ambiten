import {
  createFastifyAdapter
} from '../src/fastify-adapter';

import {
  runWithAdapterContext
} from '@ambiten/adapter-runtime';

jest.mock(
  '@ambiten/adapter-runtime',
  () => ({
    runWithAdapterContext:
      jest.fn()
  })
);

const mockedRunWithAdapterContext =
  runWithAdapterContext as jest.MockedFunction<
    typeof runWithAdapterContext
  >;

describe(
  'createFastifyAdapter',
  () => {
    beforeEach(() => {
      jest.clearAllMocks();

      mockedRunWithAdapterContext
        .mockImplementation(
          async (
            _request,
            handler
          ) => {
            return await handler();
          }
        );
    });

    function createRequest(
      headers:
        Record<
          string,
          string
        > = {
          'x-tenant-id':
            'tenant-a'
        }
    ) {
      return {
        headers,
        method:
          'GET',
        url:
          '/users',
        params: {},
        query: {},
        body:
          undefined
      };
    }

    it(
      'should install Fastify onRoute hook and run the route handler with Ambiten adapter context',
      async () => {
        const app = {
          addHook:
            jest.fn()
        };

        const options = {
          tenancy: {
            header:
              'x-tenant-id'
          }
        };

        const adapter =
          createFastifyAdapter();

        adapter.install(
          app as any,
          options
        );

        expect(
          app.addHook
        ).toHaveBeenCalledWith(
          'onRoute',
          expect.any(
            Function
          )
        );

        const onRoute =
          app.addHook.mock
            .calls[0][1];

        const originalHandler =
          jest.fn(
            async () => ({
              ok: true
            })
          );

        const routeOptions = {
          handler:
            originalHandler
        };

        /*
         * Simulate Fastify registering
         * the route.
         */
        onRoute(
          routeOptions
        );

        expect(
          routeOptions.handler
        ).not.toBe(
          originalHandler
        );

        const request =
          createRequest();

        const reply = {};

        const result =
          await routeOptions
            .handler(
              request as any,
              reply as any
            );

        expect(
          mockedRunWithAdapterContext
        ).toHaveBeenCalledTimes(
          1
        );

        expect(
          mockedRunWithAdapterContext
        ).toHaveBeenCalledWith(
          expect.objectContaining({
            method:
              'GET',

            url:
              '/users',

            headers:
              request.headers
          }),

          expect.any(
            Function
          ),

          options
        );

        expect(
          originalHandler
        ).toHaveBeenCalledTimes(
          1
        );

        expect(
          result
        ).toEqual({
          ok: true
        });
      }
    );

    it(
      'should support get(name) from normalized Fastify headers',
      async () => {
        const app = {
          addHook:
            jest.fn()
        };

        const adapter =
          createFastifyAdapter();

        adapter.install(
          app as any,
          {}
        );

        const onRoute =
          app.addHook.mock
            .calls[0][1];

        const originalHandler =
          jest.fn(
            async () => ({
              ok: true
            })
          );

        const routeOptions = {
          handler:
            originalHandler
        };

        onRoute(
          routeOptions
        );

        const request = {
          ...createRequest({
            'x-tenant-id':
              'tenant-a',

            'x-request-id':
              'request-123'
          })
        };

        await routeOptions
          .handler(
            request as any,
            {} as any
          );

        const adaptedRequest =
          mockedRunWithAdapterContext
            .mock.calls[0][0];

        expect(
          adaptedRequest.get?.(
            'x-tenant-id'
          )
        ).toBe(
          'tenant-a'
        );

        expect(
          adaptedRequest.get?.(
            'X-Tenant-Id'
          )
        ).toBe(
          'tenant-a'
        );

        expect(
          adaptedRequest.get?.(
            'x-request-id'
          )
        ).toBe(
          'request-123'
        );
      }
    );

    it(
      'should propagate runtime errors from runWithAdapterContext',
      async () => {
        const app = {
          addHook:
            jest.fn()
        };

        const runtimeError =
          new Error(
            'Tenant resolution failed.'
          );

        mockedRunWithAdapterContext
          .mockRejectedValueOnce(
            runtimeError
          );

        const adapter =
          createFastifyAdapter();

        adapter.install(
          app as any,
          {
            tenancy: {
              header:
                'x-tenant-id'
            }
          }
        );

        const onRoute =
          app.addHook.mock
            .calls[0][1];

        const originalHandler =
          jest.fn(
            async () => ({
              ok: true
            })
          );

        const routeOptions = {
          handler:
            originalHandler
        };

        onRoute(
          routeOptions
        );

        await expect(
          routeOptions.handler(
            createRequest() as any,
            {} as any
          )
        ).rejects.toThrow(
          'Tenant resolution failed.'
        );

        /*
         * Runtime failure happens before
         * application execution.
         */
        expect(
          originalHandler
        ).not.toHaveBeenCalled();
      }
    );

    it(
      'should execute the actual route handler inside runWithAdapterContext',
      async () => {
        const app = {
          addHook:
            jest.fn()
        };

        let insideRuntime =
          false;

        mockedRunWithAdapterContext
          .mockImplementation(
            async (
              _request,
              handler
            ) => {
              insideRuntime =
                true;

              try {
                return await handler();
              } finally {
                insideRuntime =
                  false;
              }
            }
          );

        const adapter =
          createFastifyAdapter();

        adapter.install(
          app as any,
          {}
        );

        const onRoute =
          app.addHook.mock
            .calls[0][1];

        const originalHandler =
          jest.fn(
            async () => {
              expect(
                insideRuntime
              ).toBe(true);

              await Promise.resolve();

              expect(
                insideRuntime
              ).toBe(true);

              return {
                ok: true
              };
            }
          );

        const routeOptions = {
          handler:
            originalHandler
        };

        onRoute(
          routeOptions
        );

        await routeOptions.handler(
          createRequest() as any,
          {} as any
        );

        expect(
          insideRuntime
        ).toBe(false);
      }
    );

    it(
      'should reuse an existing wrapper for the same route handler',
      () => {
        const app = {
          addHook:
            jest.fn()
        };

        const adapter =
          createFastifyAdapter();

        adapter.install(
          app as any,
          {}
        );

        const onRoute =
          app.addHook.mock
            .calls[0][1];

        const originalHandler =
          jest.fn();

        const firstRoute = {
          handler:
            originalHandler
        };

        onRoute(
          firstRoute
        );

        const wrapper =
          firstRoute.handler;

        const secondRoute = {
          handler:
            originalHandler
        };

        onRoute(
          secondRoute
        );

        expect(
          secondRoute.handler
        ).toBe(
          wrapper
        );
      }
    );
  }
);