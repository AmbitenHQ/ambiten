import type { Db, MongoClient } from 'mongodb';
import { getTenantModel } from '../../tanancy/TenantModelResolver';
import { MultiTenantManager } from '../../tanancy/MultiTenantManager';
import { Model } from '../../lib-core/model/model';
import type { AmbitenSchema } from '../../lib-core/schema/ambitenSchema';
import type { DbProvider } from '../../types';
import { AmbitenContext } from '../../context/ambitenContext';

jest.mock('../../tanancy/MultiTenantManager', () => ({
	MultiTenantManager: {
		getClient: jest.fn(),
	},
}));

jest.mock('../../context/ambitenContext', () => ({
	AmbitenContext: {
		getTenantId: jest.fn(),
	},
}));

jest.mock('../../lib-core/model/model', () => ({
	Model: jest.fn(),
}));

describe('TenantModelResolver', () => {
	const modelMock = jest.mocked(Model);
	const getClientMock = jest.mocked(MultiTenantManager.getClient);
	const getTenantIdMock = jest.mocked(AmbitenContext.getTenantId);

	const schema = {} as AmbitenSchema<any>;
	const collectionName = 'users';

	let sequence = 0;
	let tenantId: string;
	let fakeDb: Db;
	let clientDb: jest.Mock;
	let fakeModel: ReturnType<typeof Model>;

	beforeEach(() => {
		jest.resetAllMocks();

		// The resolver's model cache is separate from the tenant registry.
		// Give each test a fresh tenant while testing caching within a test.
		tenantId = `tenant-unit-${++sequence}`;

		fakeDb = {
			databaseName: 'tenant_db',
		} as Db;

		clientDb = jest.fn().mockReturnValue(fakeDb);

		fakeModel = {
			model: true,
		} as unknown as ReturnType<typeof Model>;

		getClientMock.mockResolvedValue({
			db: clientDb,
		} as unknown as MongoClient);

		getTenantIdMock.mockReturnValue(undefined);
		modelMock.mockReturnValue(fakeModel);
	});

	async function getProvider(dbName?: string): Promise<DbProvider> {
		await getTenantModel({
			collectionName,
			tenantId,
			schema,
			dbName,
		});

		const provider = modelMock.mock.calls[0]?.[0].provider;

		if (!provider) {
			throw new Error(
				'getTenantModel did not pass a provider to Model.',
			);
		}

		return provider;
	}

	it('returns a model and caches it for the same tenant and collection', async () => {
		const first = await getTenantModel({
			collectionName,
			tenantId,
			schema,
		});

		const second = await getTenantModel({
			collectionName,
			tenantId,
			schema,
		});

		expect(first).toBe(fakeModel);
		expect(second).toBe(first);
		expect(modelMock).toHaveBeenCalledTimes(1);

		expect(modelMock).toHaveBeenCalledWith({
			collectionName,
			schema,
			provider: expect.objectContaining({
				db: expect.any(Function),
			}),
		});
	});

	it('creates separate models for different tenants', async () => {
		const otherModel = {
			model: 'other',
		} as unknown as ReturnType<typeof Model>;

		modelMock
			.mockReturnValueOnce(fakeModel)
			.mockReturnValueOnce(otherModel);

		const first = await getTenantModel({
			collectionName,
			tenantId,
			schema,
		});

		const second = await getTenantModel({
			collectionName,
			tenantId: `${tenantId}-other`,
			schema,
		});

		expect(first).toBe(fakeModel);
		expect(second).toBe(otherModel);
		expect(modelMock).toHaveBeenCalledTimes(2);
	});

	it('throws if collectionName is missing', async () => {
		await expect(
			getTenantModel({
				collectionName: '',
				tenantId,
				schema,
			}),
		).rejects.toThrow('collectionName is required');

		expect(modelMock).not.toHaveBeenCalled();
	});

	it('throws if an explicitly supplied tenantId is empty', async () => {
		await expect(
			getTenantModel({
				collectionName,
				tenantId: '',
				schema,
			}),
		).rejects.toThrow('tenantId is required to run tenant context');

		expect(modelMock).not.toHaveBeenCalled();
	});

	it('throws if tenantId is absent from both parameters and context', async () => {
		await expect(
			getTenantModel({
				collectionName,
				schema,
			}),
		).rejects.toThrow('tenantId is required to run tenant context');

		expect(modelMock).not.toHaveBeenCalled();
	});

	it('uses the context tenantId when the parameter is omitted', async () => {
		getTenantIdMock.mockReturnValue(tenantId);

		const model = await getTenantModel({
			collectionName,
			schema,
		});

		const provider = modelMock.mock.calls[0][0].provider!;
		await provider.db();

		expect(model).toBe(fakeModel);
		expect(getClientMock).toHaveBeenCalledWith(tenantId);
	});

	describe('the generated tenant provider', () => {
		it('resolves the registered tenant client and its default database', async () => {
			const provider = await getProvider();

			await expect(provider.db()).resolves.toBe(fakeDb);

			expect(getClientMock).toHaveBeenCalledWith(tenantId);
			expect(clientDb).toHaveBeenCalledWith();
		});

		it('uses the database name supplied to getTenantModel', async () => {
			const provider = await getProvider('configured_db');

			await expect(provider.db()).resolves.toBe(fakeDb);

			expect(clientDb).toHaveBeenCalledWith('configured_db');
		});

		it('lets the operation context override the configured database name', async () => {
			const provider = await getProvider('configured_db');

			await expect(
				provider.db({
					dbName: 'context_db',
				}),
			).resolves.toBe(fakeDb);

			expect(clientDb).toHaveBeenCalledWith('context_db');
		});

		it('rejects when the tenant client cannot be resolved', async () => {
			getClientMock.mockResolvedValue(null);

			const provider = await getProvider();

			await expect(provider.db()).rejects.toThrow(
				`Tenant "${tenantId}" not registered.`,
			);

			expect(getClientMock).toHaveBeenCalledWith(tenantId);
			expect(clientDb).not.toHaveBeenCalled();
		});
	});
});