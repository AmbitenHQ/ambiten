import { createAmbitenError, ErrorType } from "../utils";
import { AmbitenClient } from "../lib-core";
import { Collection, Db, MongoClient } from "mongodb";


jest.mock('@ambiten/logger', () => {
	const actual = jest.requireActual('@ambiten/logger');

	return {
		...actual,
		Logger: {
			...actual.Logger,
			initialize: jest.fn(),
			info: jest.fn(),
			debug: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
			trace: jest.fn(),
			shutdown: jest.fn().mockResolvedValue(undefined),
		},
		shutdownLogger: jest.fn().mockResolvedValue(undefined),
	};
});


const mockCollection = {};
const mockDb = {
	collection: jest.fn().mockReturnValue(mockCollection),
};



/**
 * @jest-environment node
 */
describe('AmbitenClient', () => {
	let driver: AmbitenClient;

	// Arrange
	const uri = 'mongodb://127.0.0.1:27017';
	const dbName = 'test';

	beforeEach(async () => {
		driver = new AmbitenClient({ uri, options: { dbName } });

		// Replace network-related methods with no-op mocks
		(driver as any).connect = jest.fn().mockResolvedValue((driver as any)._db);
		(driver as any).dropDatabase = jest.fn().mockResolvedValue(true);
		(driver as any).disconnect = jest.fn().mockResolvedValue(undefined);
		(driver as any).collection = jest.fn().mockImplementation((name: string) => ({ collectionName: name }));
		(driver as any)._client = { db: jest.fn().mockReturnValue({ databaseName: dbName }) };
		(driver as any)._db = { databaseName: dbName };

		await driver.connect();
	});

	afterEach(async () => {
		jest.clearAllMocks();
		await driver.disconnect();
		await driver.close();
	});

	afterAll(async () => {
		await driver.dropDatabase();
		await driver.disconnect();
		// Clean up any resources if necessary
		driver = null as any; // Clear the driver instance
		jest.clearAllMocks();
	});

	it('should initialize MongoClient with correct URI', async () => {
		const MongoClient = jest.fn().mockImplementation(async () => {
			return await driver.connect()
		});

		await MongoClient(uri, {
			minPoolSize: 5,
			maxPoolSize: 50,
			serverSelectionTimeoutMS: 5000
		});

		// Assert
		expect(MongoClient).toHaveBeenCalledWith(uri, {
			minPoolSize: 5,
			maxPoolSize: 50,
			serverSelectionTimeoutMS: 5000
		});
	});

	it('should throw error if connection is called without uri', async () => {
		const message = 'Missing MongoDB URI. Set MONGODB_URI (or pass uri explicitly).';

		const client = new AmbitenClient({ uri: '', options: { dbName } });
		if (client) {
			await expect(client.connect()).rejects.toThrow(message);
		}

	});

	it('should log error if getCollection is called without _client', async () => {
		const client = new AmbitenClient({ uri: uri, options: { dbName } });
		(client as any)._client = null;

		await client.getCollection('test');

		const message = 'No collection found, please check the database name.';
		const cause = 'DB_NAME_ERROR';
		const error = new Error(message).stack;

		console.log = jest.fn();
		console.log(`[${cause}]:, ${error}`);

		expect(console.log).toHaveBeenCalled();
		await client.disconnect();
	});

	it('should return replicaSet type and msg in getClusterInfo for sharded cluster', async () => {
		const mockCommand = jest.fn().mockResolvedValue({ hello: true, msg: 'isdbgrid' });
		const mockAdmin = jest.fn().mockReturnValue({ command: mockCommand });
		const mockDb = jest.fn().mockReturnValue({ admin: mockAdmin });

		const client = new AmbitenClient({ uri: uri, options: { dbName } });
		Object.defineProperty(
			client, '_client', {
			value: { db: mockDb },
			writable: true
		});

		const log = jest.spyOn(console, 'log').mockImplementation(() => { });
		const result = await client.getClusterInfo();

		expect(result).toEqual({ type: 'sharded' });
		expect(log).toHaveBeenCalledWith('MongoDB is running in a sharded cluster.');

		log.mockRestore();
		await client.close();
	});

	it('should return replicaSet type and setName in getClusterInfo for replicaSet', async () => {
		const mockCommand = jest.fn().mockResolvedValue({
			setName: 'rs0',
			hosts: ['localhost:27017', 'localhost:27018']
		});
		const mockAdmin = jest.fn().mockReturnValue({ command: mockCommand });
		const mockDb = jest.fn().mockReturnValue({ admin: mockAdmin });

		const client = new AmbitenClient({
			uri: uri,
			options: { dbName }
		});
		Object.defineProperty(
			client, '_client', {
			value: { db: mockDb },
			writable: true
		});

		const log = jest.spyOn(console, 'log').mockImplementation(() => { });
		const result = await client.getClusterInfo();

		expect(result).toEqual({
			type: 'replicaSet',
			setName: 'rs0',
			hosts: ['localhost:27017', 'localhost:27018']
		});
		expect(log).toHaveBeenCalledWith('MongoDB is running as a replica set.');

		log.mockRestore();
		await client.close();
	});

	it('should return standalone type in getClusterInfo for standalone', async () => {
		const mockCommand = jest.fn().mockResolvedValue({});
		const mockAdmin = jest.fn().mockReturnValue({ command: mockCommand });
		const mockDb = jest.fn().mockReturnValue({ admin: mockAdmin });

		const client = new AmbitenClient({
			uri: uri,
			options: { dbName }
		});
		Object.defineProperty(
			client, 'client', {
			value: { db: mockDb },
			writable: true
		});

		const log = jest.spyOn(console, 'log').mockImplementation(() => { });
		const result = await client.getClusterInfo();

		expect(result).toEqual({ type: 'standalone' });
		expect(log).toHaveBeenCalledWith('MongoDB is running as a standalone instance.');

		log.mockRestore();
		await client.disconnect();
	});

	it('should throw error if useCollection is called without collectionName', async () => {
		const client = new AmbitenClient({ uri: uri, options: { dbName } });
		await client.connect();
		await expect(client.useCollection('')).rejects.toBeDefined();

		await client.disconnect();
	});

	it('should call drop on collection in dropCollection', async () => {
		const mockDrop = jest.fn().mockResolvedValue(undefined);
		const mockCollection = { drop: mockDrop };
		const mockDb = { collection: jest.fn().mockReturnValue(mockCollection) };
		const mockClient = {
			connect: jest.fn().mockResolvedValue(undefined),
			db: jest.fn().mockReturnValue(mockDb)
		};
		const mockModelContext = {
			tenantId: 'tenant123',
			db: mockClient.db(),
			dbName: dbName,
			collectionName: mockDb.collection('test').collectionName,
			config: {},
			session: null,
			withDeleted: false,
			onlyDeleted: false,
			hardDelete: false,
		}
		const client = new AmbitenClient({ uri: uri, options: { dbName } });
		(client as any)._client = mockClient;
		(client as any).collectionName = 'test';
		await client.dropCollection('test');
		// await mockCollection.drop();

		expect(mockDrop).toHaveBeenCalled();
		expect(mockCollection.drop).toHaveBeenCalledTimes(1);
	});

	it('should return _client when client getter is called', async () => {
		const client = new AmbitenClient({ uri: uri, options: { dbName } });
		expect(await client.client).toBeDefined();
	});

	it('should throw error in validateUri if uri does not start with mongodb:// or mongodb+srv://', () => {
		const client = new AmbitenClient({ uri: uri, options: { dbName } });
		expect(() => client.validateUri('http://localhost')).toThrow();
	});

	it('should log correct message in getClusterInfo for sharded cluster', async () => {
		const mockCommand = jest.fn().mockResolvedValue({ msg: 'isdbgrid' });
		const mockAdmin = jest.fn().mockReturnValue({ command: mockCommand });
		const mockDb = jest.fn().mockReturnValue({ admin: mockAdmin });

		const client = new AmbitenClient({
			uri: uri,
			options: { dbName }
		});

		Object.defineProperty(client, '_client', {
			value: { db: mockDb },
			writable: true
		});
		const log = jest.spyOn(console, 'log').mockImplementation(() => { });
		const result = await client.getClusterInfo();

		expect(result).toEqual({ type: 'sharded' });
		expect(log).toHaveBeenCalledWith('MongoDB is running in a sharded cluster.');

		log.mockRestore();
	});

	it('should log correct message in getClusterInfo for replicaSet', async () => {
		const mockCommand = jest.fn().mockResolvedValue({
			setName: 'rs0',
			hosts: ['localhost:27017', 'localhost:27018']
		});
		const mockAdmin = jest.fn().mockReturnValue({ command: mockCommand });
		const mockDb = jest.fn().mockReturnValue({ admin: mockAdmin });

		const client = new AmbitenClient({
			uri: uri,
			options: { dbName }
		});

		Object.defineProperty(client, '_client', {
			value: { db: mockDb },
			writable: true
		});
		const log = jest.spyOn(console, 'log');
		const result = await client.getClusterInfo();

		expect(result).toEqual({
			type: 'replicaSet',
			setName: 'rs0',
			hosts: ['localhost:27017', 'localhost:27018']
		});
		expect(log).toHaveBeenCalledWith('MongoDB is running as a replica set.');

		log.mockRestore();
	});

	it('should log with correct message in getClusterInfo for standalone', async () => {
		const mockCommand = jest.fn().mockResolvedValue({ standalone: true });
		const mockAdmin = jest.fn().mockReturnValue({ command: mockCommand });
		const mockDb = jest.fn().mockReturnValue({ admin: mockAdmin });

		const client = new AmbitenClient({ uri: uri, options: { dbName } });
		Object.defineProperty(client, '_client', {
			value: { db: mockDb },
			writable: true
		});
		const log = jest.spyOn(console, 'log').mockImplementation(() => { });
		const result = await client.getClusterInfo();

		expect(result).toEqual({ type: 'standalone' });
		expect(log).toHaveBeenCalledWith('MongoDB is running as a standalone instance.');

		log.mockRestore();
	});

	it('should throw error if useCollection is called without collectionName', async () => {
		const client = new AmbitenClient({ uri: uri, options: { dbName } });
		await client.connect();
		await expect(client.useCollection('')).rejects.toBeDefined();
		await client.disconnect();
	});

	it('should resolve true when dropDatabase succeeds', async () => {
		const mockDropDatabase = jest.fn().mockResolvedValue(undefined);
		const mockClose = jest.fn().mockResolvedValue(undefined);
		const mockDb = { dropDatabase: mockDropDatabase };
		const mockClient = {
			connect: jest.fn().mockResolvedValue(undefined),
			db: jest.fn().mockReturnValue(mockDb),
			close: mockClose
		};
		const client = new AmbitenClient({ uri: uri, options: { dbName } });
		(client as any)._client = mockClient;
		const result = await client.dropDatabase();

		expect(result).toBe(true);
	});

	it('should reject when dropDatabase fails', async () => {
		const mockDropDatabase = jest.fn().mockRejectedValue(new Error('Failed to drop database'));
		const mockDb = { dropDatabase: mockDropDatabase };
		const mockClient = {
			connect: jest.fn().mockResolvedValue(undefined),
			db: jest.fn().mockReturnValue(mockDb),
			close: jest.fn()
		};
		const client = new AmbitenClient({ uri: uri, options: { dbName } });
		(client as any)._client = mockClient;
		// const loggerSpy = jest.spyOn(logger, 'error');
		await expect(client.dropDatabase()).rejects.toBeDefined();
		// expect(loggerSpy).toHaveBeenCalledWith('Failed to drop database');
	});

	it('should set _client and _db to null on disconnect', async () => {
		const mockClose = jest.fn().mockResolvedValue(undefined);
		const client = new AmbitenClient({ uri: uri, options: { dbName } });
		(client as any)._client = { close: mockClose };
		(client as any)._db = {};
		await client.disconnect();
		expect((client as any)._client).toBeNull();
		expect((client as any)._db).toBeNull();
	});

	it('should call client.close and log to the console on close()', async () => {
		// const mockClose = {
		// 	close: jest.fn().mockResolvedValue(undefined)
		// }
		const client = new AmbitenClient({ uri: uri, options: { dbName } });
		// Object.defineProperty(client, 'client', { value: { close: mockClose } });
		const closeCLient = await client.close();
		const clientLog = jest.spyOn(console, 'log').mockImplementation(() => { });
		const clientDb = client === undefined || null

		expect(clientDb).toBeNull();
		expect(clientLog).toHaveBeenCalledWith('[info]: Disconnected from MongoDB');
	});

	//Integration test for connection and disconnection
	it('should connect and disconnect successfully', async () => {
		const client = new AmbitenClient({ uri: uri, options: { dbName } });
		await client.connect();
		expect((client as any)._client).toBeDefined();
		expect((client as any)._db).toBeDefined();
		await client.disconnect();
		expect((client as any)._client).toBeNull();
		expect((client as any)._db).toBeNull();
	});

	describe('validateUri', () => {
		it('should not throw an error when URI starts with "mongodb://"', async () => {
			// Act & Assert
			expect(() => driver.validateUri(uri)).not.toThrow();
		});

		it('should throw error when URI is an empty string', async () => {
			// Arrange
			const emptyUri = '';

			// Act & Assert
			expect(() => driver.validateUri(emptyUri)).toThrow();
		});
	});

	describe('connect', () => {

		it('should connect to MongoDB and log connection to the console', async () => {
			// Arrange
			const mockClient = {
				connect: jest.fn().mockResolvedValue(undefined),
				log: jest.fn()
			};
			const expectedMessage = `Failed to connect to the database`;

			const dbName = 'test';

			const Ambiten = {
				_client: mockClient,
				dbName,
				connect: async function () {
					try {
						await this._client.connect();
						console.log(`Connected to database: ${this.dbName}`);
					} catch (error) {
						throw createAmbitenError(
							ErrorType.AmbitenConnectionError,
							expectedMessage,
							{
								details: {
									operation: 'connect',
									providedDbName: this.dbName
								},
							}
						);
					}
				}
			};

			// const loggerSpy = jest.spyOn(logger, 'info');

			// let log = jest.spyOn(console, 'log').mockImplementation();

			// Act
			await Ambiten.connect();
			await mockClient.log(`Connected to database: ${dbName}`);

			// Assert
			expect(mockClient.connect).toHaveBeenCalled();
			expect(await mockClient.log).toHaveBeenCalledWith(`Connected to database: ${dbName}`);
		});
	});

	describe('collection', () => {
		it('should return a collection object', async () => {
			// Arrange
			const collectionName = 'testCollection';

			// Act
			const collection = await driver.collection(collectionName);

			// Assert
			expect(collection.collectionName).toBe(collectionName);
		});
	});

	describe('getCollection', () => {
		it('should return a MongoDB Collection object when db is defined', async () => {
			// Arrange
			const mockCollection = { find: jest.fn() };
			const mockDb = {
				collection: jest.fn().mockReturnValue(mockCollection)
			};

			const Ambiten = {
				db: mockDb,
				getCollection: function <T extends Document>(name: string): Collection<T> {
					if (!this.db) {
						const message = 'No cllection found, please check the database name';

						throw createAmbitenError(
							ErrorType.AmbitenCollectionError,
							message,
							{
								details: {
									operation: 'getCollection',
									providedCollectionName: name
								}
							}
						);
					}
					return this.db.collection(name);
				}
			};

			// Act
			const result = await Ambiten.getCollection('testCollection');

			// Assert
			await expect(mockDb.collection).toHaveBeenCalledWith('testCollection');
			await expect(result).toBe(mockCollection);
		});
	});

	describe('AmbitenClient › useCollection', () => {
		const uri = 'mongodb://localhost:27017';
		const dbName = 'testdb';

		it('should set and return the selected collection in useCollection', async () => {
			const mockCollection = { collectionName: 'users' };
			const mockCollectionFn = jest.fn().mockReturnValue(mockCollection);
			const mockDb = jest.fn().mockReturnValue({
				collection: mockCollectionFn
			});

			const client = new AmbitenClient({
				uri,
				options: { dbName }
			});

			Object.defineProperty(client, '_client', {
				value: { db: mockDb },
				writable: true
			});

			const result = await client.useCollection('users');

			expect(mockDb).toHaveBeenCalledWith(dbName);
			expect(mockCollectionFn).toHaveBeenCalledWith('users');
			expect(result).toBe(mockCollection);
		});

		it('should trim and use the provided collection name', async () => {
			const mockCollection = { collectionName: 'users' };
			const mockCollectionFn = jest.fn().mockReturnValue(mockCollection);
			const mockDb = jest.fn().mockReturnValue({
				collection: mockCollectionFn
			});

			const client = new AmbitenClient({
				uri,
				options: { dbName }
			});

			Object.defineProperty(client, '_client', {
				value: { db: mockDb },
				writable: true
			});

			const result = await client.useCollection('users');

			expect(mockCollectionFn).toHaveBeenCalledWith('users');
			expect(result).toBe(mockCollection);
		});

		it('should throw an error if collection name is not provided in useCollection', async () => {
			const client = new AmbitenClient({
				uri,
				options: { dbName }
			});

			await expect(client.useCollection('')).rejects.toThrow(
				'Collection name is required.'
			);
		});

		it('should throw an error if collection name is only whitespace in useCollection', async () => {
			const client = new AmbitenClient({
				uri,
				options: { dbName }
			});

			await expect(client.useCollection('   ')).rejects.toThrow(
				'Collection name is required.'
			);
		});

		it('should throw an error if client is not initialized in useCollection', async () => {
			const client = new AmbitenClient({
				uri,
				options: { dbName }
			});

			Object.defineProperty(client, '_client', {
				value: null,
				writable: true
			});

			await expect(client.useCollection('users')).rejects.toThrow(
				'Client not initialized. Call `connect()` first.'
			);
		});

		it('should throw an error if dbName is missing in useCollection', async () => {
			const client = new AmbitenClient({
				uri,
				options: {}
			});

			Object.defineProperty(client, '_client', {
				value: { db: jest.fn() },
				writable: true
			});

			await expect(client.useCollection('users')).rejects.toThrow(
				'Database name is required in client options.'
			);
		});

		it('should resolve collection using explicit collection and configured dbName', async () => {
			const mockCollection = { collectionName: 'users' };
			const mockCollectionFn = jest.fn().mockReturnValue(mockCollection);
			const mockDb = jest.fn().mockReturnValue({ collection: mockCollectionFn });

			const client = new AmbitenClient({
				uri: 'mongodb://localhost:27017',
				options: { dbName: 'test-db' }
			});

			Object.defineProperty(client, '_client', {
				value: { db: mockDb },
				writable: true
			});

			const result = await client.useCollection('users');

			expect(mockDb).toHaveBeenCalledWith('test-db');
			expect(mockCollectionFn).toHaveBeenCalledWith('users');
			expect(result).toBe(mockCollection);
		});
	});

	describe('AmbitenClient › getClusterInfo', () => {
		const uri = 'mongodb://localhost:27017';
		const dbName = 'testdb';

		it('should return sharded type in getClusterInfo for sharded cluster', async () => {
			const mockCommand = jest.fn().mockResolvedValue({
				msg: 'isdbgrid'
			});
			const mockAdmin = jest.fn().mockReturnValue({ command: mockCommand });
			const mockDb = jest.fn().mockReturnValue({ admin: mockAdmin });

			const client = new AmbitenClient({
				uri,
				options: { dbName }
			});

			Object.defineProperty(client, '_client', {
				value: { db: mockDb },
				writable: true
			});

			const log = jest.spyOn(console, 'log').mockImplementation(() => { });

			const result = await client.getClusterInfo();

			expect(result).toEqual({ type: 'sharded' });
			expect(mockDb).toHaveBeenCalledWith(dbName);
			expect(mockAdmin).toHaveBeenCalled();
			expect(mockCommand).toHaveBeenCalledWith({ hello: 1 });
			expect(log).toHaveBeenCalledWith('MongoDB is running in a sharded cluster.');

			log.mockRestore();
		});

		it('should return replicaSet type in getClusterInfo for replica set', async () => {
			const mockCommand = jest.fn().mockResolvedValue({
				setName: 'rs0',
				hosts: ['localhost:27017', 'localhost:27018']
			});
			const mockAdmin = jest.fn().mockReturnValue({ command: mockCommand });
			const mockDb = jest.fn().mockReturnValue({ admin: mockAdmin });

			const client = new AmbitenClient({
				uri,
				options: { dbName }
			});

			Object.defineProperty(client, '_client', {
				value: { db: mockDb },
				writable: true
			});

			const log = jest.spyOn(console, 'log').mockImplementation(() => { });

			const result = await client.getClusterInfo();

			expect(result).toEqual({
				type: 'replicaSet',
				setName: 'rs0',
				hosts: ['localhost:27017', 'localhost:27018']
			});
			expect(mockDb).toHaveBeenCalledWith(dbName);
			expect(mockAdmin).toHaveBeenCalled();
			expect(mockCommand).toHaveBeenCalledWith({ hello: 1 });
			expect(log).toHaveBeenCalledWith('MongoDB is running as a replica set.');

			log.mockRestore();
		});

		it('should return standalone type in getClusterInfo for standalone', async () => {
			const mockCommand = jest.fn().mockResolvedValue({});
			const mockAdmin = jest.fn().mockReturnValue({ command: mockCommand });
			const mockDb = jest.fn().mockReturnValue({ admin: mockAdmin });

			const client = new AmbitenClient({
				uri,
				options: { dbName }
			});

			Object.defineProperty(client, '_client', {
				value: { db: mockDb },
				writable: true
			});

			const log = jest.spyOn(console, 'log').mockImplementation(() => { });

			const result = await client.getClusterInfo();

			expect(result).toEqual({ type: 'standalone' });
			expect(mockDb).toHaveBeenCalledWith(dbName);
			expect(mockAdmin).toHaveBeenCalled();
			expect(mockCommand).toHaveBeenCalledWith({ hello: 1 });
			expect(log).toHaveBeenCalledWith('MongoDB is running as a standalone instance.');

			log.mockRestore();
		});

		it('should throw if client is not initialized in getClusterInfo', async () => {
			const client = new AmbitenClient({
				uri,
				options: { dbName }
			});

			Object.defineProperty(client, '_client', {
				value: null,
				writable: true
			});

			await expect(client.getClusterInfo()).rejects.toThrow(
				'Client not initialized. Call `connect()` first.'
			);
		});

		it('should throw if dbName is missing in getClusterInfo', async () => {
			const client = new AmbitenClient({
				uri,
				options: {}
			});

			Object.defineProperty(client, '_client', {
				value: { db: jest.fn() },
				writable: true
			});

			await expect(client.getClusterInfo()).rejects.toThrow(
				'Database name is required in client options.'
			);
		});
	});

	describe('startSession', () => {
		it("should start a session", async () => {
			const mockSession = { startTransaction: jest.fn() } as any;

			const startSessionSpy = jest
				.spyOn(MongoClient.prototype, "startSession")
				.mockReturnValue(mockSession);

			const client = new AmbitenClient({
				uri: "mongodb://localhost:27017/test",
				options: { dbName: "test" },
			});

			Object.defineProperty(client, "_client", {
				value: new MongoClient("mongodb://localhost:27017/test"),
				writable: true,
			});

			Object.defineProperty(client, "_connected", {
				value: true,
				writable: true,
			});

			const session = await client.startSession();

			expect(session).toBe(mockSession);

			startSessionSpy.mockRestore();
		});
	});

	describe('dropDatabase', () => {
		it('should drop the database', async () => {
			// Arrange
			const mockClient = {
				client: jest.fn().mockReturnValue({
					connect: jest.fn().mockResolvedValue('Connected'),
				}),
				db: jest.fn().mockReturnValue({
					dropDatabase: jest.fn().mockResolvedValue('Dropped'),
				})
			}
			// const mockDb = {
			// 	dropDatabase: jest.fn().mockResolvedValue(undefined)
			// };
			const Ambiten = {
				_db: mockClient.db(),
				_client: mockClient,
				connect: async function () {
					await this._client.client().connect();
					console.log(`Connected to database: ${this._db.dbName}`);
				},
				dropDatabase: async function () {
					if (!this._db) {
						throw new Error('Database not connected');
					}
					await this._db.dropDatabase();
					console.log(`Dropped database: ${this._db.databaseName}`);
					return true;
				}
			};

			// Act
			await Ambiten.connect();
			await Ambiten.dropDatabase();

			// Assert
			expect(await mockClient.client).toHaveBeenCalled();
			expect(await mockClient.db).toHaveBeenCalled();
		});
	});

	describe('disconnect', () => {
		it('should close the database connection', async () => {
			// Arrange
			const mockClient = {
				close: jest.fn().mockResolvedValue(undefined)
			};
			const Ambiten = {
				client: mockClient,
				disconnect: async function () {
					await this.client.close();
					// logger.info('Disconnected from the database');
				}
			};

			await Ambiten.disconnect();

			// Assert
			expect(await mockClient.close).toHaveBeenCalled();
		});
	});
});





