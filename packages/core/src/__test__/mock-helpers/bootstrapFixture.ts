import type { AmbitenConfig, BootstrapClient } from '../../types';


export function createBootstrapFixture() {
	const db = {
		databaseName: 'ambiten_test',
		collection: jest.fn().mockReturnValue({}),
	};

	const nativeClient = {
		db: jest.fn().mockReturnValue(db),
		close: jest.fn().mockResolvedValue(undefined),
	};

	const provider = {
		connect: jest.fn().mockResolvedValue(undefined),
		close: jest.fn().mockResolvedValue(undefined),
		disconnect: jest.fn().mockResolvedValue(undefined),
		db: jest.fn().mockResolvedValue(db),
		client: jest.fn().mockResolvedValue(nativeClient),
		collection: jest.fn().mockResolvedValue({}),
		getCollection: jest.fn().mockResolvedValue({}),
	};

	const config: AmbitenConfig = {
		projectName: 'ambiten-test',

		provider: provider as unknown as BootstrapClient,

		connection: {
			uri: 'mongodb://127.0.0.1:27017/ambiten_test',
			options: { dbName: 'ambiten_test' },
		},

		logger: {
			enabled: false,
			transportConfigs: [],
		},

		features: {
			useRedisCache: false,
		},

		multiTenant: {
			enabled: false,
			tenants: {},
		},

		advanced: {
			garbageCollector: {
				enabled: false,
			},
		},
	};

	return { config, provider };
}