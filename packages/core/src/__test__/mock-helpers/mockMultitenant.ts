import type { Collection, Db, Document, MongoClient } from 'mongodb';
import { MultiTenantManager } from '../../tanancy';

export async function registerMockTenant<T extends Document>(
  tenantId: string,
  mockCollection: Collection<T>,
  dbName = 'test-db'
) {
  if (MultiTenantManager.hasTenant(tenantId)) {
    MultiTenantManager.removeTenant(tenantId);
  }

  const mockDb = {
    collection: jest.fn().mockReturnValue(mockCollection),
    databaseName: dbName,
  } as unknown as Db;

  const mockClient = {
    db: jest.fn().mockReturnValue(mockDb),
    connect: jest.fn().mockResolvedValue(undefined),
  } as unknown as MongoClient;

  await MultiTenantManager.registerTenant(
    tenantId,
    `mongodb://localhost:27017/${dbName}`,
    {
      dbName,
      client: mockClient,
    }
  );

  return { mockDb, mockClient };
}