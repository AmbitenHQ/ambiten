import { runWithAdapterContext } from '../context-runner';
// import { shutdownCoreLogger } from '@tenra/core';

describe('runWithAdapterContext', () => {
  beforeEach(async () => {
    jest.restoreAllMocks();
  });

  afterAll(async() => {
    jest.clearAllMocks();
    // await shutdownCoreLogger()
  });
  it('should resolve tenant ID and other context values, then run handler', async () => {
    const resolvers = {
      tenantId: jest.fn().mockResolvedValue('tenant-123'),
      requestId: jest.fn().mockResolvedValue('req-456'),
      dbName: jest.fn().mockResolvedValue('mydb'),
      collectionName: jest.fn().mockResolvedValue('mycollection'),
      debug: jest.fn().mockResolvedValue(true),
      loggerMeta: jest.fn().mockResolvedValue({ userId: 'user-789' }),
      meta: jest.fn().mockResolvedValue({ custom: 'value' })
    };

    const handler = jest.fn().mockResolvedValue('handler result');

    const result = await runWithAdapterContext(
      {
        headers: {
          'x-tenant-id': 'tenant-123',
          'x-request-id': 'req-456',
          'x-db-name': 'mydb',
          'x-collection-name': 'mycollection'
        },
        method: 'GET',
        url: '/api/data'
      },
      handler,
      {
        tenancy: {
          resolver: jest.fn().mockResolvedValue('tenant-123'),
          validate: jest.fn().mockResolvedValue(true)
        },
        enableTransactions: false,
        resolvers
      }
    );

    expect(result).toBe('handler result');
    expect(handler).toHaveBeenCalledTimes(1);
    expect(resolvers.tenantId).toHaveBeenCalled();
    expect(resolvers.requestId).toHaveBeenCalled();
    expect(resolvers.dbName).toHaveBeenCalled();
    expect(resolvers.collectionName).toHaveBeenCalled();
  });
});