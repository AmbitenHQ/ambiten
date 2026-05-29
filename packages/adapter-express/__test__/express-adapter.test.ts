import { createExpressAdapter } from '../src/express-adapter';
import { runWithAdapterContext } from '@tenra/adapter-runtime';

jest.mock('@tenra/adapter-runtime', () => ({
  runWithAdapterContext: jest.fn()
}));

describe('createExpressAdapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (runWithAdapterContext as jest.Mock).mockImplementation(
      async (_req, handler) => handler()
    );
  });

  it('should install Express middleware and run with Tenra adapter context', async () => {
    let registeredMiddleware: any;

    const app = {
      use: jest.fn((middleware) => {
        registeredMiddleware = middleware;
      })
    };

    const adapter = createExpressAdapter();

    const options = {
      tenancy: {
        header: 'x-tenant-id'
      },
      requestIdHeader: 'x-request-id'
    };

    adapter.install(app as any, options);

    expect(app.use).toHaveBeenCalledTimes(1);
    expect(typeof registeredMiddleware).toBe('function');

    const headers: Record<string, string> = {
      'x-tenant-id': 'tenant-a',
      'x-request-id': 'req-1'
    };

    const req = {
      headers,
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
      },
      get: jest.fn((name: string): string | undefined => {
        return headers[name.toLowerCase()];
      })
    };

    const res = {};
    const next = jest.fn();

    await registeredMiddleware(req, res, next);

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

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should pass runtime errors to next', async () => {
    const error = new Error('Context failed');

    (runWithAdapterContext as jest.Mock).mockRejectedValueOnce(error);

    let registeredMiddleware: any;

    const app = {
      use: jest.fn((middleware) => {
        registeredMiddleware = middleware;
      })
    };

    const adapter = createExpressAdapter();
    adapter.install(app as any);

    const req = {
      headers: {},
      url: '/users',
      method: 'GET',
      params: {},
      query: {},
      cookies: {},
      body: undefined,
      get: jest.fn()
    };

    const next = jest.fn();

    await registeredMiddleware(req, {}, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});