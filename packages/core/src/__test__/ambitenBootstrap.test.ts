import { AmbitenBootstrapFactory } from '../lib-core';

jest.setTimeout(20_000);

jest.mock('../config/loadAmbitenConfig', () => {
  const provider = {
    connect: jest.fn().mockResolvedValue(undefined),
    close: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined),
    getCollection: jest.fn().mockReturnValue({}),
    client: {
      db: jest.fn().mockReturnValue({
        collection: jest.fn().mockReturnValue({}),
      }),
    },
  };

  return {
    loadAmbitenConfig: jest.fn().mockResolvedValue({
      projectName: 'test-app',
      provider,
      connection: {
        uri: 'mongodb://localhost:27017/Ambiten_test',
        options: { dbName: 'Ambiten_test' },
      },
      logger: {
        enabled: true,
        level: 'info',
        colorize: false,
        json: false,
        transportConfigs: [],
        enableMetrics: { enabled: false, logInterval: 60_000 },
        compress: { enabled: false },
      },
      features: { useRedisCache: false },
      multiTenant: {
        enabled: true,
        tenants: {
          tenant1: 'mongodb://localhost:27017/tenant1',
        },
        initOptions: { lazy: true },
      },
      advanced: {
        garbageCollector: { enabled: false },
        gcCron: '* * * * *',
      },
    }),
  };
});


describe('AmbitenBootstrapFactory', () => {
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('creates and initializes a Ambiten runtime through the public factory', async () => {
    const runtime = await AmbitenBootstrapFactory.create();

    expect(runtime).toBeDefined();

    expect(runtime.getLogger).toEqual(expect.any(Function));
    expect(runtime.getMongoClient).toEqual(expect.any(Function));
    expect(runtime.getModel).toEqual(expect.any(Function));
    expect(runtime.getSchema).toEqual(expect.any(Function));
    expect(runtime.registerMultiTenancy).toEqual(expect.any(Function));
    expect(runtime.shutdown).toEqual(expect.any(Function));

    expect(runtime.getLogger()).toBeDefined();
    expect(runtime.getMongoClient()).toBeDefined();
    expect(runtime.getModel()).toBeDefined();
    expect(runtime.getSchema()).toBeDefined();

    await expect(runtime.registerMultiTenancy({})).resolves.not.toThrow();

    await expect(runtime.shutdown()).resolves.not.toThrow();
  });

  it('does not expose AmbitenBootstrap constructor as the public creation API', async () => {
    const runtime = await AmbitenBootstrapFactory.create();

    expect(runtime.constructor.name).not.toBe('AmbitenBootstrapFactory');

    await runtime.shutdown();
  });
});