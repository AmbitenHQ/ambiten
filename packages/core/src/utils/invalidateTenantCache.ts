import { RedisClientType } from "redis";
import { redis } from "../redis-manager";

/**
 * Invalidates the cache for a specific tenant by deleting all keys that match the tenant ID.
 * Optionally, a namespace can be provided to further filter the keys.
 *
 * @param {RedisClientType} client - The Redis client instance.
 * @param {string} tenantId - The ID of the tenant whose cache should be invalidated.
 * @param {string} [namespace] - Optional namespace to filter keys.
 * @example
 * // Invalidate cache for tenant 'tenant123'
 * invalidateTenantCache(redisClient, 'tenant123');
 * @example
 * // Invalidate cache for tenant 'tenant123' with namespace 'users'
 * invalidateTenantCache(redisClient, 'tenant123', 'users');
 */
export async function invalidateTenantCache(
  client: typeof redis | RedisClientType,
  tenantId: string,
  namespace?: string
) {
  const pattern = namespace
    ? `TENRA:${tenantId}:${namespace}:*`
    : `TENRA:${tenantId}:*`;

  const keys = await client.keys(pattern);
  if (keys.length) {
    await client.del(keys);
    console.info(`🔁 Cleared ${keys.length} cache entries for ${tenantId}${namespace ? ` (${namespace})` : ''}`);
  }
}
