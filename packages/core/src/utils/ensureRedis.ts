import { redis } from '../redis-manager';

export async function ensureRedis(this: any) {
	let self = this;
	let publisher = this.publisher;
	let subscriber = this.subscriber;

	try {
		const client: any = await redis.get();
		if (!client) {
			console.log('⚠️ Redis client not available from redis manager; skipping Redis initialization');
			return;
		}

		if (!client.isOpen && typeof client.connect === 'function') {
			await client.connect();
		}

		if (!publisher) {
			publisher = typeof client.duplicate === 'function' ? client.duplicate() : client;
			if (publisher && typeof publisher.connect === 'function') {
				await publisher.connect();
			}
		}

		if (!subscriber) {
			subscriber = typeof client.duplicate === 'function' ? client.duplicate() : client;
			if (subscriber && typeof subscriber.connect === 'function') {
				await subscriber.connect();
			}
		}

		console.log('[info] Ensuring Redis connection...');
		console.log('[info] Redis connection established');
		return self;
	} catch (err: any) {
		console.log('[info] ⚠️ Redis connection skipped or failed:', (err as any)?.message || String(err));
	}
}