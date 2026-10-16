import { AmbitenBootstrapFactory } from '../lib-core';
import { redis } from '../redis-manager/redisClient';
import { createBootstrapFixture } from './mock-helpers/bootstrapFixture';

jest.mock('../redis-manager/redisClient', () => ({
	redis: {
		isOpen: false,
		get: jest.fn(),
		getClient: jest.fn(),
		disconnect: jest.fn().mockResolvedValue(undefined),
	},
}));

describe('AmbitenBootstrapFactory with the offline Redis fallback', () => {
	let runtime:
		| Awaited<ReturnType<typeof AmbitenBootstrapFactory.create>>
		| undefined;

	beforeEach(() => {
		jest.mocked(redis.get).mockResolvedValue(null);

		jest.mocked(redis.getClient).mockResolvedValue({
			isOpen: false,
		});

		jest.mocked(redis.disconnect).mockResolvedValue(undefined);
	});

	afterEach(async () => {
		try {
			await runtime?.shutdown();
		} finally {
			runtime = undefined;
			jest.clearAllMocks();
		}
	});

	it('initializes with an offline cache and shuts down cleanly', async () => {
		const { config, provider } = createBootstrapFixture();

		config.features = {
			useRedisCache: true,
			redisUri: 'redis://127.0.0.1:9999',
		};

		runtime = await AmbitenBootstrapFactory.create({ config });

		expect(redis.get).toHaveBeenCalledWith(
			config.features.redisUri
		);

		expect(redis.isOpen).toBe(false);
		expect(provider.connect).toHaveBeenCalledTimes(1);
		expect(runtime.getMongoClient()).toBe(provider);

		await runtime.shutdown();
		runtime = undefined;

		expect(provider.close).toHaveBeenCalledTimes(1);
	});
});