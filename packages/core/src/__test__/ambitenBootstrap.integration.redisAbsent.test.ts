/* Integration test: ensure AmbitenBootstrap.initialize completes when Redis is absent.
	 This test mocks the Redis layer to simulate an unreachable Redis server and
	 verifies that initialize() resolves (doesn't hang or throw). */
import { AmbitenBootstrapFactory } from '../lib-core';
import { MongoClient } from 'mongodb';


jest.setTimeout(20000);

// Mock the redis manager so calls to redis.get(...) will reject / fail
jest.mock('../redis-manager/redisClient', () => ({
	redis: {
		get: jest.fn().mockResolvedValue({
			isOpen: false,
			connect: jest.fn().mockRejectedValue(new Error('ECONNREFUSED')),
			disconnect: jest.fn(),
			publish: jest.fn(),
		}),
		isOpen: false,
		disconnect: jest.fn(),
	},
}));

// Mock the config loader to provide a minimal config that enables Redis
jest.mock('../config/loadAmbitenConfig', () => ({
	loadAmbitenConfig: jest.fn().mockResolvedValue({
		projectName: 'test-app',
		mongoClient: {
			connect: jest.fn().mockResolvedValue(undefined),
			close: jest.fn().mockResolvedValue(undefined),
			client: jest.fn().mockResolvedValue({
				collectionName: jest.fn(),
				dbName: jest.fn()
			}),
			collection: jest.fn()
		},
		provider: {
			connect: jest.fn().mockResolvedValue(undefined),
			close: jest.fn().mockResolvedValue(undefined),
			client: jest.fn().mockResolvedValue({
				collectionName: jest.fn(),
				dbName: jest.fn()
			}),
			collection: jest.fn()
		},
		connection: {
			uri: 'mongodb://localhost:27017/Ambiten_test',
			options: { dbName: 'Ambiten_test' },
		},
		features: {
			useRedisCache: true,
			redisUri: 'redis://127.0.0.1:9999'
		},
		logger: { enabled: false },
	}),
}));

jest.mock('../lib-core/AmbitenClient', () => ({
	AmbitenClient: class {
		private uri: string | undefined;
		constructor(uri?: string, _opts?: any) {
			this.uri = uri;
		}
		async connect() {
			// no-op: pretend connect succeeded
			return Promise.resolve();
		}
		async disconnect() {
			return Promise.resolve();
		}
		getCollection(name: string) {
			// return a fake collection identifier
			return name;
		}
		get client() {
			// minimal shape used by AmbitenBootstrap
			return {
				db: () => ({ collection: () => ({}) }),
			};
		}
	}
}));

describe('AmbitenBootstrapFactory (integration) - redis absent', () => {
	let bootstrap: Awaited<ReturnType<typeof AmbitenBootstrapFactory.create>>;
	let warnSpy: jest.SpyInstance;

	beforeEach(() => {
		warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { });
	});

	afterEach(async () => {
		await bootstrap?.shutdown?.();
		warnSpy.mockRestore();
		jest.clearAllMocks();
	});

	it('initializes cleanly when Redis cannot be reached', async () => {
		bootstrap = await AmbitenBootstrapFactory.create();

		await expect(bootstrap.shutdown()).resolves.not.toThrow();
	})

});
