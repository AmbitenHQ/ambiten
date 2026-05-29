import { redis } from '../redis-manager';
import { TenraContext } from '../context';

export interface TenraCacheOptions {
  ttlSeconds?: number;
  prefix?: string;
  namespace?: string;
  tenantId?: string;
}

export interface TenraCacheClient {
  get(key: string): Promise<string | null>;
  set(
    key: string,
    value: string,
    options?: { EX?: number }
  ): Promise<unknown>;
  del(key: string | string[]): Promise<unknown>;
  scan?(
    cursor: number,
    options?: {
      MATCH?: string;
      COUNT?: number;
    }
  ): Promise<[string, string[]] | { cursor: number; keys: string[] }>;
}

export class TenraCache {
  constructor(private readonly client: TenraCacheClient = redis) {}

  /**
   * Builds a tenant-aware cache key.
   * Key format: {prefix}:{tenantId}:{namespace}:{key}
   * - prefix: Optional string to namespace cache keys (default: "tenra")
   * - tenantId: Resolved tenant ID for multi-tenancy (explicit > context > "default")
   * - namespace: Optional string to further namespace keys (default: "cache")
   * - key: The original cache key provided by the caller
   * 
   * Resolution priority:
   * 1. Explicit tenantId from options
   * 2. Active Tenra runtime tenantId
   * 3. "default"
   */
  private buildKey(key: string, options: TenraCacheOptions = {}): string {
    const ctx = TenraContext.get();

    const prefix = options.prefix ?? 'tenra';
    const tenantId = options.tenantId ?? ctx.tenantId ?? 'default';
    const namespace = options.namespace ?? 'cache';

    return [prefix, tenantId, namespace, key]
      .filter(Boolean)
      .join(':');
  }

  /**
   * Reads and deserializes a cached value.
   */
  async get<T>(key: string, options?: TenraCacheOptions): Promise<T | null> {
    const namespacedKey = this.buildKey(key, options);
    const cached = await this.client.get(namespacedKey);

    if (cached === null || cached === undefined) {
      this.emit('miss', namespacedKey);
      return null;
    }

    try {
      this.emit('hit', namespacedKey);
      return JSON.parse(cached) as T;
    } catch {
      await this.client.del(namespacedKey);
      this.emit('corrupt', namespacedKey);
      return null;
    }
  }

  /**
   * Serializes and writes a cached value.
   */
  async set<T>(
    key: string,
    value: T,
    options: TenraCacheOptions = {}
  ): Promise<void> {
    const namespacedKey = this.buildKey(key, options);

    await this.client.set(
      namespacedKey,
      JSON.stringify(value),
      { EX: options.ttlSeconds ?? 60 }
    );

    this.emit('set', namespacedKey);
  }

  /**
   * Returns cached value if available, otherwise computes, stores, and returns it.
   */
  async wrap<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: TenraCacheOptions = {}
  ): Promise<T> {
    const existing = await this.get<T>(key, options);

    if (existing !== null) {
      return existing;
    }

    const result = await fetcher();
    await this.set(key, result, options);

    return result;
  }

  /**
   * Invalidates one cache key.
   */
  async invalidate(key: string, options?: TenraCacheOptions): Promise<void> {
    const namespacedKey = this.buildKey(key, options);
    await this.client.del(namespacedKey);
    this.emit('invalidate', namespacedKey);
  }

  /**
   * Invalidates cache keys by pattern using SCAN.
   */
  async invalidatePattern(pattern: string): Promise<number> {
    if (!pattern || typeof pattern !== 'string') {
      throw new Error('Pattern must be a non-empty string.');
    }

    if (!this.client.scan) {
      throw new Error('Cache client does not support scan().');
    }

    let cursor = 0;
    let deletedCount = 0;

    do {
      const result = await this.client.scan(cursor, {
        MATCH: pattern,
        COUNT: 100
      });

      const nextCursor = Array.isArray(result)
        ? Number(result[0])
        : result.cursor;

      const keys = Array.isArray(result)
        ? result[1]
        : result.keys;

      if (keys.length > 0) {
        await this.client.del(keys);
        deletedCount += keys.length;
      }

      cursor = nextCursor;
    } while (cursor !== 0);

    if (deletedCount > 0) {
      this.emit('invalidatePattern', pattern);
    }

    return deletedCount;
  }

  /**
   * Internal event hook point for future observability and policy integrations.
   */
  private emit(event: string, key: string): void {
    void event;
    void key;
  }
}

export function createTenraCache(client: TenraCacheClient = redis): TenraCache {
  return new TenraCache(client);
}