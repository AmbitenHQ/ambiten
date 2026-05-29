import { redis } from '../redis-manager';
import { TenraCache } from '../tenra-cache';

/**
 * Options for caching behavior.
 */
interface TenraCacheOptions {
  ttlSeconds?: number;
  prefix?: string; 
  tenantId?: string; 
  namespace?: string; 
}

/**
 * Caches a value in Redis with optional tenant and namespace scoping.
 * If the value is not found in cache, it runs the provided fetcher function
 * to get the value, caches it, and then returns it.
 *
 * @param {string} key - The cache key to use.
 * @param {() => Promise<T>} fetcher - A function that fetches the value if not cached.
 * @param {TenraCacheOptions} options - Options for caching behavior.
 * @returns {Promise<T>} - The cached or fetched value.
 * @example
 * const value = await cacheWithRedis(redisClient, 'myKey', async () => {
 *   // Fetch from database or external API
 *  return await fetchDataFromSource();
 */
export async function cacheWithRedis<T>(
  client: typeof redis,
  key: string,
  fetcher: () => Promise<T>,
  options: TenraCacheOptions = {}
): Promise<T> {
  const cache = new TenraCache(client);
  return await cache.wrap(key, fetcher, options);
}
