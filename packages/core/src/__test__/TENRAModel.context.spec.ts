import { TenraClient, TenraModel, TenraSchema } from '../lib-core';
import { TenraContext } from '../context';
import { MultiTenantManager } from '../tanancy';
// import { bufferedTransporter } from '../utils';

type TestDoc = {
	_id?: any;
	name?: string;
	email?: string;
};

describe('TenraModel context resolution', () => {
	let mockDb: any;
	let mockCollection: any;
	let mockProvider: any;
	let model: TenraModel<TestDoc>;

	beforeEach(() => {
		mockCollection = {
			find: jest.fn(),
			findOne: jest.fn(),
			insertOne: jest.fn(),
			updateOne: jest.fn(),
			deleteOne: jest.fn(),
			db: {
				collection: jest.fn()
			}
		};

		mockDb = {
			collection: jest.fn().mockReturnValue(mockCollection)
		};

		mockProvider = {
			db: jest.fn().mockResolvedValue(mockDb),
			startSession: jest.fn()
		};

		model = new TenraModel<TestDoc>({
			collectionName: 'users',
			schema: new TenraSchema<TestDoc>({} as any),
			provider: mockProvider
		});

		MultiTenantManager.clearTenants();
	});

	afterEach(async () => {
		jest.clearAllMocks();
		MultiTenantManager.clearTenants();
		// await bufferedTransporter.stop();
	});

	it('should prioritize method ctx over default ctx and runtime ctx in mergeCtx', async () => {
		(model as any)._defaultCtx = {
			tenantId: 'default-tenant',
			dbName: 'default-db',
			collectionName: 'default-collection'
		};

		await TenraContext.run(
			{
				tenantId: 'runtime-tenant',
				dbName: 'runtime-db',
				collectionName: 'runtime-collection'
			},
			async () => {
				const result = (model as any).mergeCtx({
					tenantId: 'method-tenant',
					dbName: 'method-db',
					collectionName: 'method-collection'
				});

				expect(result).toEqual({
					tenantId: 'method-tenant',
					dbName: 'method-db',
					db: undefined,
					collectionName: 'method-collection',
					config: undefined,
					session: undefined
				});
			}
		);
	});

	it('should merge nested context values', async () => {
		await TenraContext.run(
			{ tenantId: 'tenantA', requestId: 'req-1' },
			async () => {
				await TenraContext.run(
					{ collectionName: 'users' },
					async () => {
						expect(TenraContext.getTenantId()).toBe('tenantA');
						expect(TenraContext.getRequestId()).toBe('req-1');
						expect(TenraContext.getCollectionName()).toBe('users');
					}
				);
			}
		);
	});

	it('should reuse existing session inside nested withTransaction', async () => {
		const mockSession = {
			withTransaction: jest.fn(async (cb: () => Promise<void>) => cb()),
			endSession: jest.fn()
		} as any;

		const mockClient = {
			startSession: jest.fn(() => mockSession)
		} as any;

		TenraContext.configureTransactionResolver({
			resolveClient: () => mockClient
		});

		await TenraContext.run({ tenantId: 'tenantA' }, async () => {
			await TenraContext.withTransaction(async (session1) => {
				await TenraContext.withTransaction(async (session2) => {
					expect(session2).toBe(session1);
				});
			});
		});

		expect(mockClient.startSession).toHaveBeenCalledTimes(1);
		expect(mockSession.endSession).toHaveBeenCalledTimes(1);
	});

	it('should prioritize default ctx over runtime ctx in mergeCtx', async () => {
		(model as any)._defaultCtx = {
			tenantId: 'default-tenant',
			dbName: 'default-db',
			collectionName: 'default-collection'
		};

		await TenraContext.run(
			{
				tenantId: 'runtime-tenant',
				dbName: 'runtime-db',
				collectionName: 'runtime-collection'
			},
			async () => {
				const result = (model as any).mergeCtx();

				expect(result).toEqual({
					tenantId: 'default-tenant',
					dbName: 'default-db',
					db: undefined,
					collectionName: 'default-collection',
					config: undefined,
					session: undefined
				});
			}
		);
	});

	it('should use runtime context in mergeCtx when method and default ctx are absent', async () => {
		await TenraContext.run(
			{
				tenantId: 'runtime-tenant',
				dbName: 'runtime-db',
				collectionName: 'runtime-collection'
			},
			async () => {
				const result = (model as any).mergeCtx();

				expect(result).toEqual({
					tenantId: 'runtime-tenant',
					dbName: 'runtime-db',
					db: undefined,
					collectionName: 'runtime-collection',
					config: undefined,
					session: undefined
				});
			}
		);
	});

	it('should return undefined in mergeCtx when no context exists', () => {
		const result = (model as any).mergeCtx();
		expect(result).toBeUndefined();
	});

	/*Bind Test*/
	// Test that bind creates a new model with merged default context without mutating the original model's default context
	it('should return a cloned model with merged default ctx in bind', () => {
		(model as any)._defaultCtx = {
			tenantId: 'tenant-a',
			dbName: 'db-a'
		};

		const boundModel = model.bind({
			collectionName: 'audit_logs'
		});

		expect(boundModel).not.toBe(model);
		expect((boundModel as any)._defaultCtx).toEqual({
			tenantId: 'tenant-a',
			dbName: 'db-a',
			collectionName: 'audit_logs'
		});

		expect((model as any)._defaultCtx).toEqual({
			tenantId: 'tenant-a',
			dbName: 'db-a'
		});
	});

	it('should use bound default ctx when calling mergeCtx on bound model', () => {
		const boundModel = model.bind({
			tenantId: 'tenant-bound',
			dbName: 'db-bound',
			collectionName: 'users_bound'
		});

		const result = (boundModel as any).mergeCtx();

		expect(result).toEqual({
			tenantId: 'tenant-bound',
			dbName: 'db-bound',
			db: undefined,
			collectionName: 'users_bound',
			config: undefined,
			session: undefined
		});
	});

	it('should resolve collection using dbName from TenraContext', async () => {
		const mockCollection = { collectionName: 'orders' };
		const mockCollectionFn = jest.fn().mockReturnValue(mockCollection);
		const mockDb = jest.fn().mockReturnValue({ collection: mockCollectionFn });

		const client = new TenraClient({
			uri: 'mongodb://localhost:27017',
			options: { dbName: 'fallback-db' }
		});

		Object.defineProperty(client, '_client', {
			value: { db: mockDb },
			writable: true
		});

		const result = await TenraContext.run(
			{
				dbName: 'runtime-db',
				collectionName: 'orders'
			},
			() => client.useCollection('orders')
		);

		expect(mockDb).toHaveBeenCalledWith('runtime-db');
		expect(mockCollectionFn).toHaveBeenCalledWith('orders');
		expect(result).toBe(mockCollection);
	});

	/*Session Resolution Tests*/
	it('should prioritize method session over runtime session in resolveSession', async () => {
		const runtimeSession = { id: 'runtime-session' };
		const methodSession = { id: 'method-session' };

		await TenraContext.run(
			{ session: runtimeSession as any },
			async () => {
				const result = (model as any).resolveSession({
					session: methodSession as any
				});

				expect(result).toBe(methodSession);
			}
		);
	});

	it('should use runtime session in resolveSession when method session is absent', async () => {
		const runtimeSession = { id: 'runtime-session' };

		await TenraContext.run(
			{ session: runtimeSession as any },
			async () => {
				const result = (model as any).resolveSession();
				expect(result).toBe(runtimeSession);
			}
		);
	});

	/*Integration Test for getCollection context resolution*/
	it('should resolve collection from provider db in getCollection', async () => {
		const result = await (model as any).getCollection();

		expect(mockProvider.db).toHaveBeenCalled();
		expect(mockDb.collection).toHaveBeenCalledWith('users');
		expect(result).toBe(mockCollection);
	});

	it('should use ctx collectionName in getCollection when provided', async () => {
		await (model as any).getCollection({
			collectionName: 'overridden_users'
		});

		expect(mockDb.collection).toHaveBeenCalledWith('overridden_users');
	});

	it('should return collection override in getCollection when _collectionOverride is set', async () => {
		const overrideCollection = { custom: true };
		(model as any)._collectionOverride = overrideCollection;

		const result = await (model as any).getCollection();

		expect(result).toBe(overrideCollection);
		expect(mockProvider.db).not.toHaveBeenCalled();
	});

	/*Multi-Tenancy Integration Test*/
	it('should resolve db from tenant config in resolveDb', async () => {
		const tenantDb = { collection: jest.fn().mockReturnValue(mockCollection) };
		const tenantClient = {
			db: jest.fn().mockReturnValue(tenantDb)
		};

		MultiTenantManager.registerLazyTenant(
			'tenant-a',
			'mongodb://localhost:27017/tenant_a_db'
		);

		jest.spyOn(MultiTenantManager, 'getClient').mockResolvedValue(tenantClient as any);

		const db = await (model as any).resolveDb({
			tenantId: 'tenant-a'
		});

		expect(MultiTenantManager.getClient).toHaveBeenCalledWith('tenant-a');
		expect((tenantClient.db as jest.Mock)).toHaveBeenCalledWith('tenant_a_db');
		expect(db).toBe(tenantDb);
	});

	it('should prioritize ctx dbName over tenant dbName in resolveDb', async () => {
		const tenantDb = { collection: jest.fn().mockReturnValue(mockCollection) };
		const tenantClient = {
			db: jest.fn().mockReturnValue(tenantDb)
		};

		MultiTenantManager.registerLazyTenant(
			'tenant-a',
			'mongodb://localhost:27017/tenant_a_db'
		);

		jest.spyOn(MultiTenantManager, 'getClient').mockResolvedValue(tenantClient as any);

		await (model as any).resolveDb({
			tenantId: 'tenant-a',
			dbName: 'override_db'
		});

		expect((tenantClient.db as jest.Mock)).toHaveBeenCalledWith('override_db');
	});

	it('should throw when tenant is not registered in resolveDb', async () => {
		await expect(
			(model as any).resolveDb({ tenantId: 'missing-tenant' })
		).rejects.toThrow('Tenant "missing-tenant" is not registered.');
	});

	/*withTransaction Session Reuse Test*/
	it('should reuse existing session in withTransaction when ctx session is provided', async () => {
		const existingSession = {
			startTransaction: jest.fn(),
			commitTransaction: jest.fn(),
			abortTransaction: jest.fn(),
			endSession: jest.fn()
		};

		const operation = jest.fn().mockResolvedValue('done');

		const result = await (model as any).withTransaction(operation, {
			session: existingSession as any
		});

		expect(result).toBe('done');
		expect(operation).toHaveBeenCalledWith(existingSession);
		expect(existingSession.startTransaction).not.toHaveBeenCalled();
		expect(mockProvider.startSession).not.toHaveBeenCalled();
	});

	it('should start, commit, and end a transaction in withTransaction when no session exists', async () => {
		const session = {
			startTransaction: jest.fn(),
			commitTransaction: jest.fn().mockResolvedValue(undefined),
			abortTransaction: jest.fn().mockResolvedValue(undefined),
			endSession: jest.fn().mockResolvedValue(undefined)
		};

		mockProvider.startSession.mockResolvedValue(session);

		const operation = jest.fn().mockResolvedValue('ok');

		const result = await (model as any).withTransaction(operation);

		expect(result).toBe('ok');
		expect(mockProvider.startSession).toHaveBeenCalled();
		expect(session.startTransaction).toHaveBeenCalled();
		expect(operation).toHaveBeenCalledWith(session);
		expect(session.commitTransaction).toHaveBeenCalled();
		expect(session.abortTransaction).not.toHaveBeenCalled();
		expect(session.endSession).toHaveBeenCalled();
	});

	it('should abort and end session in withTransaction when operation fails', async () => {
		const session = {
			startTransaction: jest.fn(),
			commitTransaction: jest.fn().mockResolvedValue(undefined),
			abortTransaction: jest.fn().mockResolvedValue(undefined),
			endSession: jest.fn().mockResolvedValue(undefined)
		};

		mockProvider.startSession.mockResolvedValue(session);

		const operationError = new Error('transaction failed');
		const operation = jest.fn().mockRejectedValue(operationError);

		await expect((model as any).withTransaction(operation)).rejects.toThrow(
			'transaction failed'
		);

		expect(session.startTransaction).toHaveBeenCalled();
		expect(session.commitTransaction).not.toHaveBeenCalled();
		expect(session.abortTransaction).toHaveBeenCalled();
		expect(session.endSession).toHaveBeenCalled();
	});

	it('should expose transaction session through TenraContext during withTransaction', async () => {
		const session = {
			startTransaction: jest.fn(),
			commitTransaction: jest.fn().mockResolvedValue(undefined),
			abortTransaction: jest.fn().mockResolvedValue(undefined),
			endSession: jest.fn().mockResolvedValue(undefined)
		};

		mockProvider.startSession.mockResolvedValue(session);

		const operation = jest.fn().mockImplementation(async () => {
			expect(TenraContext.get()?.session).toBe(session);
			return 'ok';
		});

		const result = await (model as any).withTransaction(operation, {
			tenantId: 'tenant-a',
			dbName: 'db-a',
			collectionName: 'users'
		});

		expect(result).toBe('ok');
	});

	/*getSession Context Merging Test*/
	it('should call provider.startSession with merged ctx in getSession', async () => {
		const session = { id: 'session-1' };
		mockProvider.startSession.mockResolvedValue(session);

		(model as any)._defaultCtx = {
			tenantId: 'tenant-default'
		};

		const result = await (model as any).getSession({
			dbName: 'db-method'
		});

		expect(mockProvider.startSession).toHaveBeenCalledWith({
			tenantId: 'tenant-default',
			dbName: 'db-method',
			db: undefined,
			collectionName: undefined,
			config: undefined,
			session: undefined
		});
		expect(result).toBe(session);
	});

	afterAll(async () => {
		jest.clearAllMocks();
		// await bufferedTransporter.stop();
	});
});