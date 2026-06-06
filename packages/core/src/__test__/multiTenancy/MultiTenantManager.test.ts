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
      'mongodb://localhost:27017/tenantA_db'
    );

    expect(tenant).toEqual({
      tenantId: 'tenantA',
      uri: 'mongodb://localhost:27017/tenantA_db',
      dbName: 'tenantA_db',
      client: undefined,
      lazy: true,
      metadata: undefined
    });
  });

  it('should register and retrieve tenant config', async () => {
    const client = await MultiTenantManager.registerTenant(
      'tenantA',
      'mongodb://localhost:27017/tenantA_db'
    );

    const tenant =  MultiTenantManager.getTenant('tenantA');

    expect(tenant?.tenantId).toBe('tenantA');
    expect(tenant?.uri).toBe('mongodb://localhost:27017/tenantA_db');
    expect(tenant?.dbName).toBe('tenantA_db');
    expect(tenant?.lazy).toBe(false);
    expect(tenant?.client).toBeDefined();
    await client.close();
  });

  it('should return tenant dbName', () => {
    MultiTenantManager.registerLazyTenant(
      'tenantA',
      'mongodb://localhost:27017/tenantA_db'
    );

    expect(MultiTenantManager.getTenantDbName('tenantA')).toBe('tenantA_db');
  });

  it('should return true when tenant is registered', () => {
    MultiTenantManager.registerLazyTenant(
      'tenantA',
      'mongodb://localhost:27017/tenantA_db'
    );

    expect(MultiTenantManager.hasTenant('tenantA')).toBe(true);
  });

  it('should throw when tenantId is missing', () => {
    expect(() => MultiTenantManager.getTenant('')).toThrow('Tenant ID is required.');
  });


});