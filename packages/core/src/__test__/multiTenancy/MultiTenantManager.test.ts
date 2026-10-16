import { MongoClient } from "mongodb";
import { MultiTenantManager } from "../../tanancy/MultiTenantManager";

const uri = "mongodb://127.0.0.1:27017/ambiten_test";

describe("MultiTenantManager", () => {
  beforeEach(() => {
    MultiTenantManager.clearTenants();
    MultiTenantManager.clearTenantConfigResolver();
    jest
      .spyOn(MongoClient.prototype, "connect")
      .mockImplementation(async function (this: MongoClient) {
        return this;
      });
  });

  afterEach(async () => {
    try {
      const clients = MultiTenantManager.getAllTenants()
        .map((tenant) => tenant.client)
        .filter((client): client is MongoClient => client !== undefined);
      await Promise.all(clients.map((client) => client.close()));
    } finally {
      MultiTenantManager.clearTenants();
      MultiTenantManager.clearTenantConfigResolver();
      jest.restoreAllMocks();
    }
  });

  it("registers a lazy tenant without opening a connection", () => {
    const tenant = MultiTenantManager.registerLazyTenant("tenantA", uri);
    expect(tenant).toEqual({
      tenantId: "tenantA",
      uri,
      dbName: "ambiten_test",
      client: undefined,
      lazy: true,
      metadata: undefined,
    });
    expect(MongoClient.prototype.connect).not.toHaveBeenCalled();
  });

  it("registers and retrieves an eager tenant after the driver connects", async () => {
    const client = await MultiTenantManager.registerTenant("tenantA", uri);
    expect(MongoClient.prototype.connect).toHaveBeenCalledTimes(1);
    expect(MultiTenantManager.getTenant("tenantA")).toMatchObject({
      tenantId: "tenantA",
      uri,
      dbName: "ambiten_test",
      lazy: false,
      client,
    });
    await expect(MultiTenantManager.getClient("tenantA")).resolves.toBe(client);
    expect(MongoClient.prototype.connect).toHaveBeenCalledTimes(1);
  });

  it("connects a lazy tenant on first client access", async () => {
    MultiTenantManager.registerLazyTenant("tenantA", uri);
    const client = await MultiTenantManager.getClient("tenantA");
    expect(client).toBeInstanceOf(MongoClient);
    expect(MongoClient.prototype.connect).toHaveBeenCalledTimes(1);
    expect(MultiTenantManager.getTenant("tenantA")?.lazy).toBe(false);
    await expect(MultiTenantManager.getClient("tenantA")).resolves.toBe(client);
    expect(MongoClient.prototype.connect).toHaveBeenCalledTimes(1);
  });

  it("does not register an eager tenant if its connection fails", async () => {
    const failure = new Error("connection failed");
    jest.mocked(MongoClient.prototype.connect).mockRejectedValueOnce(failure);
    await expect(
      MultiTenantManager.registerTenant("tenantA", uri),
    ).rejects.toBe(failure);
    expect(MultiTenantManager.hasTenant("tenantA")).toBe(false);
  });

  it("returns the configured database name", async () => {
    MultiTenantManager.registerLazyTenant("tenantA", uri, {
      dbName: "custom_db",
    });
    await expect(MultiTenantManager.getTenantDbName("tenantA")).resolves.toBe(
      "custom_db",
    );
  });

  it("reports whether a tenant is registered", () => {
    MultiTenantManager.registerLazyTenant("tenantA", uri);
    expect(MultiTenantManager.hasTenant("tenantA")).toBe(true);
    expect(MultiTenantManager.hasTenant("missing")).toBe(false);
  });

  it("rejects a missing tenant ID", () => {
    expect(() => MultiTenantManager.getTenant("")).toThrow(
      "Tenant ID is required.",
    );
  });

  it("resolves an external tenant and preserves its database name and metadata", async () => {
    const resolver = jest.fn().mockResolvedValue({
      uri,
      dbName: "external_db",
      metadata: { region: "eu" },
    });
    MultiTenantManager.setTenantConfigResolver(resolver);
    await expect(
      MultiTenantManager.resolveTenant("external"),
    ).resolves.toMatchObject({
      tenantId: "external",
      uri,
      dbName: "external_db",
      lazy: true,
      metadata: { region: "eu" },
    });
    await MultiTenantManager.resolveTenant("external");
    expect(resolver).toHaveBeenCalledTimes(1);
    expect(MongoClient.prototype.connect).not.toHaveBeenCalled();
  });

  it("returns undefined/null for an externally unknown tenant", async () => {
    const resolver = jest.fn().mockResolvedValue(null);
    MultiTenantManager.setTenantConfigResolver(resolver);
    await expect(
      MultiTenantManager.resolveTenant("unknown"),
    ).resolves.toBeUndefined();
    await expect(MultiTenantManager.getClient("unknown")).resolves.toBeNull();
    expect(MultiTenantManager.hasTenant("unknown")).toBe(false);
  });
});