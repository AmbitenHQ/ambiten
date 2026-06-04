import { redis } from '../redis-manager';

type RedisRuntimeTarget = {
  publisher?: any;
  subscriber?: any;
};

export async function ensureRedis(
  this: RedisRuntimeTarget
): Promise<RedisRuntimeTarget | undefined> {
  let publisher = this.publisher;
  let subscriber = this.subscriber;

  try {
    const client: any = await redis.get();

    if (!client) {
      console.log('⚠️ Redis client not available from redis manager; skipping Redis initialization');
      return this;
    }

    if (!client.isOpen && typeof client.connect === 'function') {
      await client.connect();
    }

    if (!publisher) {
      publisher = typeof client.duplicate === 'function' ? client.duplicate() : client;

      if (publisher && typeof publisher.connect === 'function') {
        await publisher.connect();
      }

      this.publisher = publisher;
    }

    if (!subscriber) {
      subscriber = typeof client.duplicate === 'function' ? client.duplicate() : client;

      if (subscriber && typeof subscriber.connect === 'function') {
        await subscriber.connect();
      }

      this.subscriber = subscriber;
    }

    console.log('[info] Ensuring Redis connection...');
    console.log('[info] Redis connection established');

    return this;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);

    console.log('[info] ⚠️ Redis connection skipped or failed:', message);

    return this;
  }
}