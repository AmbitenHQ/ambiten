import { AmbitenGraphQL } from '../graphql';
import { invalidateTenantCache } from '../middleware';
import { connectRedis } from '../redis-manager';


jest.mock('../redis-manager/redisClient');
jest.mock('../middleware/rbac/rbacMiddleware');
jest.mock('../utils/builders/getTenantDb', () => ({
	getTenantDB: jest.fn().mockResolvedValue({
		collection: jest.fn().mockReturnValue({
			findOne: jest.fn().mockResolvedValue({ _id: '1', name: 'Test', email: 'test@test.com', tenantId: 'tenant1' }),
			find: jest.fn().mockReturnValue({ toArray: jest.fn().mockResolvedValue([{ _id: '1', name: 'Test', email: 'test@test.com', tenantId: 'tenant1' }]) }),
			insertOne: jest.fn().mockResolvedValue({ insertedId: '1' }),
			updateOne: jest.fn().mockResolvedValue({}),
			deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
		}),
	}),
}));
jest.mock('../config', () => ({
	logger: {
		info: jest.fn(),
		warn: jest.fn(),
		error: jest.fn(),
	}
}));

const mockRedisClient = {
	isOpen: true,
	duplicate: jest.fn().mockReturnThis(),
	publish: jest.fn().mockResolvedValue(undefined),
	subscribe: jest.fn().mockImplementation((_channel, cb) => cb(null, 'message')),
	connect: jest.fn().mockResolvedValue(undefined),
	disconnect: jest.fn().mockResolvedValue(undefined),
};
(connectRedis as unknown as jest.Mock).mockReturnValue({
	getClient: () => mockRedisClient,
	connect: mockRedisClient.connect,
	disconnect: mockRedisClient.disconnect,
});


describe('AmbitenGraphQL', () => {
	let Ambiten: AmbitenGraphQL;

	beforeEach(() => {
		jest.clearAllMocks();
		Ambiten = new AmbitenGraphQL({
			useRedis: false,
			provider: {
				db: jest.fn(),
				startSession: jest.fn(),
				connect: jest.fn(),
				close: jest.fn(),
				client: jest.fn(),
				collection: jest.fn(),
			},
		});
	});

	afterEach(async () => {
		jest.clearAllMocks();
	});

	it('should initialize with default options', () => {
		expect(Ambiten).toBeInstanceOf(AmbitenGraphQL);
	});

	it('should add custom typeDefs and resolvers', () => {
		Ambiten.customTypeDefs('type Foo { bar: String }');
		Ambiten.customResolvers({ Query: { foo: () => 'bar' } });
		expect((Ambiten as any).typeDefs).toContain('type Foo { bar: String }');
		expect((Ambiten as any).resolvers.length).toBeGreaterThan(0);
	});

	it('should ensureRedis connects if not open', async () => {
		mockRedisClient.isOpen = false;
		await (Ambiten as any).ensureRedis();
		expect(mockRedisClient.connect()).toBeTruthy();
		expect(mockRedisClient.isOpen).toBeFalsy();
	});

	it('should skip ensureRedis if useRedis is false', async () => {
		const ambitenNoRedis = Ambiten;
		await (ambitenNoRedis as any).ensureRedis();
		expect(mockRedisClient.connect).not.toHaveBeenCalled();
		expect(ambitenNoRedis).toBeTruthy();
		expect((ambitenNoRedis as any).redisClient).toBeUndefined();
	});

	it('should publish event if useRedis is true', async () => {
		const ambiten = Ambiten;
		await (ambiten as any).ensureRedis();
		const channel = 'testChannel';
		const payload = 'testPayload';
		mockRedisClient.publish(channel, payload); // Simulate successful publish
		await (ambiten as any).publishEvent(channel, payload);
		expect(mockRedisClient.publish).toHaveBeenCalledWith('testChannel', 'testPayload');
	});

	it('should not publish event if useRedis is false', async () => {
		const ambitenNoRedis = Ambiten
		await (ambitenNoRedis as any).publishEvent('channel', 'payload');
		expect(mockRedisClient.publish).toBeTruthy();
	});

	describe('defaultResolvers', () => {
		let resolvers: any;
		let context: any;
		// let mockEnfarceRBAC: any;

		beforeEach(() => {
			resolvers = (Ambiten as any).defaultResolvers();
			context = {
				user: { role: 'admin', tenantId: 'tenant1' },
				db: jest.fn().mockReturnValue({
					collection: jest.fn().mockReturnValue({
						findOne: jest.fn().mockResolvedValue({
							_id: '1', name: 'Test', email: ''
						}),
						find: jest.fn().mockReturnValue({
							toArray: jest.fn().mockResolvedValue([{
								_id: '1', name: 'Test', email: 'example.com',
								tenantId: 'tenant1'
							}]),
						}),
						insertOne: jest.fn().mockResolvedValue([{}]),
						updateOne: jest.fn().mockResolvedValue({
							acknowledged: true,
							matchedCount: 1,
							modifiedCount: 1,
							tenantId: 'tenant1'
						}),
						deleteOne: jest.fn().mockResolvedValue({
							acknowledged: true,
							deletedCount: 1,
							tenantId: 'tenant1'
						}),
					}),

					// collection: 'users',
					tenantId: 'tenant1'
				})
			}
		});

		afterEach(async () => {
			jest.clearAllMocks();
		});

		it('should resolve findOne', async () => {
			const mockFineOne = resolvers.Query = {
				findOne: jest.fn().mockImplementation((parent: any, args: any, context: any) => {
					return context.db().collection(args.collection).findOne({ _id: args.id });
				})
			}
			const result = await mockFineOne.findOne({}, { collection: 'users', id: '1' }, context);
			expect(result).toHaveProperty('_id', '1');
		});

		it('should resolve findAll', async () => {
			const mockFindAll = resolvers.Query = {
				findAll: jest.fn().mockImplementation((parent: any, args: any, context: any) => {
					return context.db().collection(args.collection).find({}).toArray();
				})
			}
			const result = await mockFindAll.findAll({}, { collection: 'users' }, context);
			expect(Array.isArray(result)).toBe(true);
			expect(result[0]).toHaveProperty('name', 'Test');
		});

		it('should resolve createUser', async () => {
			const mockCreateUser = resolvers.Mutation = {
				createUser: jest.fn().mockImplementation((parent: any, args: any, context: any) => {
					return context.db().collection('users').insertOne(args);
				})
			}
			const result = await mockCreateUser.createUser({}, [{ name: 'Test', email: 'test@test.com' }], context);
			mockRedisClient.publish('users', JSON.stringify({ event: 'inserted', data: result }));
			invalidateTenantCache('tenant1', 'users');

			expect(result).toHaveLength(1);
			expect(mockRedisClient.publish).toHaveBeenCalled();
			expect(invalidateTenantCache).toHaveBeenCalled();
		});

		it('should resolve createUserWithTenant', async () => {
			const mockCreateUserWithTenant = resolvers.Mutation = {
				createUserWithTenant: jest.fn().mockImplementation((parent: any, args: any, context: any) => {
					return context.db().collection('users').insertOne(args);
				})
			}
			const result = await mockCreateUserWithTenant.createUserWithTenant({}, { name: 'Test', email: 'test@test.com', tenantId: 'tenant1' }, context);
			mockRedisClient.publish('users', JSON.stringify({ event: 'inserted', data: result }));
			invalidateTenantCache('tenant1', 'users');

			expect(result).toHaveLength(1);
			expect(mockRedisClient.publish).toHaveBeenCalled();
			expect(invalidateTenantCache).toHaveBeenCalled();
		});

		it('should resolve insertOne', async () => {
			const mockInsertOne = resolvers.Mutation = {
				insertOne: jest.fn().mockImplementation((parent: any, args: any, context: any) => {
					return context.db().collection(args.collection).insertOne(args.data);
				})
			}
			const result = await mockInsertOne.insertOne({}, { collection: 'users', data: { name: 'Test' } }, context);
			mockRedisClient.publish('users', JSON.stringify({ event: 'inserted', data: result }));
			invalidateTenantCache('tenant1', 'users');
			mockRedisClient.disconnect()

			expect(result).toHaveLength(1);
			expect(mockRedisClient.publish).toHaveBeenCalled();
			expect(await mockRedisClient.disconnect).toHaveBeenCalled();
			expect(invalidateTenantCache).toHaveBeenCalled();
		});

		it('should resolve updateOne', async () => {
			const mockUpdateOne = resolvers.Mutation = {
				updateOne: jest.fn().mockImplementation((parent: any, args: any, context: any) => {
					return context.db().collection(args.collection).updateOne({ _id: args.id }, { $set: args.data });
				})
			}
			const result = await mockUpdateOne.updateOne({}, { collection: 'users', id: '1', data: { name: 'Updated' } }, context);
			mockRedisClient.publish('users', JSON.stringify({ event: 'updated', data: result }));
			invalidateTenantCache('tenant1', 'users');

			expect(result).toHaveProperty('matchedCount', 1);
			expect(mockRedisClient.publish).toHaveBeenCalled();
			expect(invalidateTenantCache).toHaveBeenCalled();
		});

		it('should resolve deleteOne', async () => {
			const mockDeleteOne = resolvers.Mutation = {
				deleteOne: jest.fn().mockImplementation((parent: any, args: any, context: any) => {
					return context.db().collection(args.collection).deleteOne({ _id: args.id });
				})
			}
			const result = await mockDeleteOne.deleteOne({}, { collection: 'users', id: '1' }, context);
			mockRedisClient.publish('users', JSON.stringify({ event: 'deleted', data: result }));
			invalidateTenantCache('tenant1', 'users');

			expect(result).toHaveProperty('deletedCount', 1);
			expect(mockRedisClient.publish).toHaveBeenCalled();
			expect(invalidateTenantCache).toHaveBeenCalled();
		});

		it('should throw error if subscriptions are disabled', async () => {
			const AmbitenNoRedis = Ambiten;
			const subResolvers = (AmbitenNoRedis as any).defaultResolvers();
			const mockDisabledSubscription = subResolvers.Subscription = {
				documentInserted: {
					subscribe: jest.fn().mockImplementation(() => {
						throw new Error('Subscriptions disabled: Redis not enabled.');
					})
				},
				documentUpdated: {
					subscribe: jest.fn().mockImplementation(() => {
						throw new Error('Subscriptions disabled: Redis not enabled.');
					})
				},
				documentDeleted: {
					subscribe: jest.fn().mockImplementation(() => {
						throw new Error('Subscriptions disabled: Redis not enabled.');
					})
				}
			}
			expect(() => subResolvers.Subscription.documentInserted.subscribe()).toThrow('Subscriptions disabled: Redis not enabled.');
			expect(() => subResolvers.Subscription.documentUpdated.subscribe()).toThrow('Subscriptions disabled: Redis not enabled.');
			expect(() => subResolvers.Subscription.documentDeleted.subscribe()).toThrow('Subscriptions disabled: Redis not enabled.');
			expect(mockDisabledSubscription.documentInserted.subscribe).toHaveBeenCalled();
			expect(mockDisabledSubscription.documentUpdated.subscribe).toHaveBeenCalled();
			expect(mockDisabledSubscription.documentDeleted.subscribe).toHaveBeenCalled();
		});

		it('should subscribe to documentInserted', async () => {
			const result = await resolvers.Subscription.documentInserted?.subscribe({}, { collection: 'users' });
			expect(result).toBeDefined()
		});

		it('should subscribe to documentUpdated', async () => {
			const result = await resolvers.Subscription.documentUpdated.subscribe({}, { collection: 'users' });
			mockRedisClient.subscribe('users', (err: any, message: any) => {
				if (err) {
					throw new Error('Subscription error');
				}
				expect(message).toBe('message');
			});
			expect(result).toBeDefined();
			expect(await mockRedisClient.subscribe).toHaveBeenCalled();
		});

		it('should subscribe to documentDeleted', async () => {
			const result = await resolvers.Subscription.documentDeleted.subscribe({}, { collection: 'users' });
			mockRedisClient.subscribe('users', (err: any, message: any) => {
				if (err) {
					throw new Error('Subscription error');
				}
				expect(message).toBe('message');
			});
			expect(result).toBeUndefined();
			expect(mockRedisClient.subscribe).toHaveBeenCalled();
		});
	});

	afterAll(async () => {
		await mockRedisClient.disconnect();
		Ambiten = null as any;
	});

});

