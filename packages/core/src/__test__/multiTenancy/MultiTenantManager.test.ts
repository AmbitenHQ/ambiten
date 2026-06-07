import { MultiTenantManager } from '../../tanancy';


describe('MultiTenantManager', () => {
  beforeEach(() => {
    MultiTenantManager.clearTenants();
    jest.resetAllMocks();
  });

  afterEach(async () => {
    MultiTenantManager.clearTenants();
    jest.clearAllMocks();
  });

  it('should register a lazy tenant with dbName', () => {
    const tenant = MultiTenantManager.registerLazyTenant(
      'tenantA',
      process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/ambiten_test'
    );

    expect(tenant).toEqual({
      tenantId: 'tenantA',
      uri: process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/ambiten_test',
      dbName: 'ambiten_test',
      client: undefined,
      lazy: true,
      metadata: undefined
    });
  });

  it('should register and retrieve tenant config', async () => {
    const client = await MultiTenantManager.registerTenant(
      'tenantA',
      process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/ambiten_test'
    );

    const tenant =  MultiTenantManager.getTenant('tenantA');

    expect(tenant?.tenantId).toBe('tenantA');
    expect(tenant?.uri).toBe('mongodb://127.0.0.1:27017/ambiten_test');
    expect(tenant?.dbName).toBe('ambiten_test');
    expect(tenant?.lazy).toBe(false);
    expect(tenant?.client).toBeDefined();
    await client.close();
  });

  it('should return tenant dbName', () => {
    MultiTenantManager.registerLazyTenant(
      'tenantA',
      process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/ambiten_test'
    );

    expect(MultiTenantManager.getTenantDbName('tenantA')).toBe('ambiten_test');
  });

  it('should return true when tenant is registered', () => {
    MultiTenantManager.registerLazyTenant(
      'tenantA',
      process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/ambiten_test'
    );

    expect(MultiTenantManager.hasTenant('tenantA')).toBe(true);
  });

  it('should throw when tenantId is missing', () => {
    expect(() => MultiTenantManager.getTenant('')).toThrow('Tenant ID is required.');
  });


});