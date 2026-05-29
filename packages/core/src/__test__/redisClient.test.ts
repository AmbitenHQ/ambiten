/* Unit tests for the redis client wrapper. We mock the underlying 'redis' package
	 to avoid network I/O and validate that our wrapper returns a safe object when
	 the real client cannot connect. */
import { redis } from '../redis-manager/redisClient';

jest.setTimeout(10000);

// Mock the 'redis' module so createClient returns a client whose connect() rejects
jest.mock('redis', () => ({
	createClient: jest.fn().mockImplementation(() => ({
		isOpen: false,
		connect: jest.fn().mockRejectedValue(new Error('ECONNREFUSED')),
		disconnect: jest.fn().mockResolvedValue(undefined),
		publish: jest.fn().mockResolvedValue(undefined),
		subscribe: jest.fn().mockResolvedValue(undefined),
	})),
}));


// debug info when tests run in CI/local
console.log('DEBUG: redis export keys:', typeof redis, Object.keys(redis || {}));

describe('redis wrapper',() => {
	afterEach( async () => {
		await jest.clearAllMocks();
	});

	it('returns a stub or client object when createClient/connect fails', async () => {
		const client = await redis.get('redis://127.0.0.1:9999');
		// Should return some object and not throw
		expect(client).toBeDefined();
		// disconnect should be callable and not throw
		await expect(redis.disconnect()).resolves.not.toThrow();
	});
});
