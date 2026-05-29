// __test__/fastify-adapter.test.ts
import { createFastifyAdapter } from '../src/fastify-adapter';
import { runWithAdapterContext } from '@tenra/adapter-runtime';

jest.mock('@tenra/adapter-runtime', () => ({
  runWithAdapterContext: jest.fn()
}));

describe('createFastifyAdapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (runWithAdapterContext as jest.Mock).mockImplementation(
      async (_req, handler) => handler()
    );
  });

  it('should install Fastify preHandler hook and run with Tenra adapter context', async () => {
    let registeredHook: any;

    const app = {
      addHook: jest.fn((_name, hook) => {
        registeredHook = hook;
      })
    };

    const adapter = createFastifyAdapter();

    const options = {
      tenancy: {
        header: 'x-tenant-id'
      },
      requestIdHeader: 'x-request-id'
    };

    adapter.install(app as any, options);

    expect(app.addHook).toHaveBeenCalledWith(
      'preHandler',
      expect.any(Function)
    );

    const request = {
      headers: {
        'x-tenant-id': 'tenant-a',
        'x-request-id': 'req-1'
      },
      url: '/users',
      method: 'GET',
      params: {
        id: '123'
      },
      query: {
        search: 'alice'
      },
      cookies: {
        session: 'abc'
      },
      body: {
        active: true
      }
    };

    const reply = {};

    await registeredHook(request, reply);

    expect(runWithAdapterContext).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-tenant-id': 'tenant-a',
          'x-request-id': 'req-1'
        }),
        url: '/users',
        method: 'GET',
        params: {
          id: '123'
        },
        cookies: {
          session: 'abc'
        },
        query: {
          search: 'alice'
        },
        body: {
          active: true
        },
        get: expect.any(Function)
      }),
      expect.any(Function),
      options
    );
  });

  it('should support get(name) from normalized Fastify headers', async () => {
    let registeredHook: any;

    const app = {
      addHook: jest.fn((_name, hook) => {
        registeredHook = hook;
      })
    };

    createFastifyAdapter().install(app as any);

    const request = {
      headers: {
        'x-tenant-id': 'tenant-a'
      },
      url: '/users',
      method: 'GET',
      params: {},
      query: {},
      body: undefined
    };

    await registeredHook(request, {});

    const adaptedRequest = (runWithAdapterContext as jest.Mock).mock.calls[0][0];

    expect(adaptedRequest.get('x-tenant-id')).toBe('tenant-a');
  });

  it('should propagate runtime errors from runWithAdapterContext', async () => {
    const error = new Error('Context failed');

    (runWithAdapterContext as jest.Mock).mockRejectedValueOnce(error);

    let registeredHook: any;

    const app = {
      addHook: jest.fn((_name, hook) => {
        registeredHook = hook;
      })
    };

    createFastifyAdapter().install(app as any);

    const request = {
      headers: {},
      url: '/users',
      method: 'GET',
      params: {},
      query: {},
      body: undefined
    };

    await expect(registeredHook(request, {})).rejects.toThrow('Context failed');
  });
});