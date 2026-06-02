import { Db } from 'mongodb';
import { AmbitenClient } from '../../lib-core';

const dbCache: Map<string, Db> = new Map();

/**
 * Retrieves the database instance for a specific tenant.
 * If the database is already cached, it returns the cached instance. 
 * Otherwise, it initializes a new database connection for the tenant, caches it, and returns it.
 *
 * @param {string} tenantId - The ID of the tenant whose database is to be retrieved.
 * @returns {Promise<Db>} A promise that resolves to the MongoDB database instance for the tenant.
 * @throws {Error} If the database for the specified tenant is not found.
 */
export const getTenantDB = async (tenantId: string): Promise<Db> => {
  if (dbCache.has(tenantId)) {
    return dbCache.get(tenantId)!;
  }

  const db = AmbitenClient.init().withDatabase(tenantId);
  if (!db) throw new Error(`Database not found for tenant: ${tenantId}`);
  dbCache.set(tenantId, await db.db());
  return await db.db();
}