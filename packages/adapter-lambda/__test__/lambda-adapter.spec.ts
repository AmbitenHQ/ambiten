// __test__/lambda-adapter.test.ts
import { createLambdaAdapter } from '../src/lambda-adapter';
import { runWithAdapterContext } from '@tenra/adapter-runtime';

jest.mock('@tenra/adapter-runtime', () => ({
  runWithAdapterContext: jest.fn()
}));

describe('createLambdaAdapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    (runWithAdapterContext as jest.Mock).mockImplementation(
      async (_req, handler) => handler()
    );
  });

  it('should wrap Lambda handler with Tenra adapter context', async () => {
    const handler = jest.fn().mockResolvedValue({
      statusCode: 200,
      body: 'ok'
    });

    const wrapped = createLambdaAdapter(handler, {
      tenancy: { header: 'x-tenant-id' },
      requestIdHeader: 'x-request-id'
    });

    const event = {
      headers: {
        'x-tenant-id': 'tenant-a',
        'x-request-id': 'req-1'
      },
      multiValueHeaders: null,
      pathParameters: { id: '123' },
      queryStringParameters: { search: 'alice' },
      multiValueQueryStringParameters: null,
      requestContext: {
        http: {
          method: 'GET',
          path: '/users/123'
        }
      },
      rawPath: '/users/123',
      cookies: ['session=abc'],
      body: JSON.stringify({ active: true }),
      isBase64Encoded: false
    };

    const result = await wrapped(event as any, {});

    expect(result).toEqual({
      statusCode: 200,
      body: 'ok'
    });

    expect(runWithAdapterContext).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-tenant-id': 'tenant-a',
          'x-request-id': 'req-1'
        }),
        url: '/users/123',
        method: 'GET',
        params: { id: '123' },
        cookies: { session: 'abc' },
        query: { search: 'alice' },
        body: { active: true },
        get: expect.any(Function)
      }),
      expect.any(Function),
      expect.objectContaining({
        tenancy: { header: 'x-tenant-id' },
        requestIdHeader: 'x-request-id'
      })
    );

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should propagate handler result through runtime context', async () => {
    const handler = jest.fn().mockReturnValue('lambda-result');
    const wrapped = createLambdaAdapter(handler);

    const result = await wrapped({
      headers: {},
      multiValueHeaders: null,
      pathParameters: null,
      requestContext: {
        http: {
          method: 'POST',
          path: '/graphql'
        }
      },
      rawPath: '/graphql',
      body: null,
      isBase64Encoded: false
    } as any);

    expect(result).toBe('lambda-result');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('should propagate runtime errors', async () => {
    const error = new Error('Context failed');

    (runWithAdapterContext as jest.Mock).mockRejectedValueOnce(error);

    const handler = jest.fn();
    const wrapped = createLambdaAdapter(handler);

    await expect(
      wrapped({
        headers: {},
        multiValueHeaders: null,
        pathParameters: null,
        requestContext: {
          http: {
            method: 'GET',
            path: '/'
          }
        },
        rawPath: '/',
        body: null,
        isBase64Encoded: false
      } as any)
    ).rejects.toThrow('Context failed');

    expect(handler).not.toHaveBeenCalled();
  });
});