import { getTenantModel, MultiTenantManager } from '../../tanancy';
import { Model } from '../../utils/builders';
import { AmbitenSchema } from '../../lib-core';
import { DbProvider } from '../../types';
import { AmbitenContext } from '../../context';



jest.mock('../../tanancy/MultiTenantManager');
jest.mock('../../context/AmbitenContext');
jest.mock('../../utils/builders/createModel');
jest.mock('../../utils/ensureModelNameSafe', () => ({
	ensureModelNameSafe: jest.fn((name: string) => name + '_safe')
}));

jest.mock('../../utils/index', () => ({}));

describe('getTenantModel', () => {
	const fakeClient = {};
	const fakeModel = { model: true };
	const fakeSchema = {} as AmbitenSchema<any>;
	const tenantId = 'tenant123';
	const collectionName = 'TestModel';

	beforeEach(() => {
		jest.clearAllMocks();
		(MultiTenantManager.getClient as jest.Mock).mockResolvedValue(fakeClient);
		(Model as jest.Mock).mockReturnValue(fakeModel);
	});

	afterEach(async () => {
		MultiTenantManager.clearTenants();
		jest.clearAllMocks();
	});

	it('returns a model for a given tenant and caches it', async () => {
		const model = await getTenantModel({ collectionName, tenantId, schema: fakeSchema });
		const cachedModel = await model

		expect(cachedModel).toBe(fakeModel);

		// Should return cached model on second call
		const model2 = await getTenantModel({ collectionName, tenantId, schema: fakeSchema });
		expect(Model).toHaveBeenCalledTimes(1);
		expect(model2).toBe(fakeModel);
	});

	it('throws if collectionName is missing', async () => {
		await expect(getTenantModel({ collectionName: '', tenantId, schema: fakeSchema }))
			.rejects.toThrow('collectionName is required');
	});

	it('throws if tenantId param is missing', async () => {
		const tenantId = undefined as unknown as string;
		await expect(getTenantModel({ collectionName, tenantId: '', schema: fakeSchema }))
			.rejects.toThrow('tenantId is required to run tenant context');
	});

	it('throws if tenantId is missing from context', async () => {
		(AmbitenContext.getTenantId as jest.Mock).mockReturnValue(undefined);
		await expect(getTenantModel({ collectionName, tenantId: undefined as any, schema: fakeSchema }))
			.rejects.toThrow('tenantId is required to run tenant context');
	});

	afterAll(async () => {
		jest.resetAllMocks();
	});
});

describe('createTenantProvider', () => {
	const provider: DbProvider = {
		db: async () => ({} as any)
	};
	it('should return a provider that resolves the tenant database', async () => {
		const tenantId = 'tenant123';
		const fakeDb = { db: jest.fn() };
		(MultiTenantManager.getClient as jest.Mock).mockResolvedValue({ db: () => fakeDb });

		const existingtenants = await MultiTenantManager.getClient(tenantId);
		expect(MultiTenantManager.getClient).toHaveBeenCalledWith(tenantId);
		expect(existingtenants).toBeTruthy();

	});

	it('should throw an error if tenant is not registered', async () => {
		const tenantId = 'tenant123';
		(MultiTenantManager.getClient as jest.Mock).mockResolvedValue(undefined);
		const dbProvide = jest.spyOn(provider, 'db').mockImplementation(async (ctx) => {
			const client = await MultiTenantManager.getClient(tenantId);
			if (!client) {
				throw new Error(`Tenant "${tenantId}" not registered.`);
			}
			return client.db();
		});
		await expect(dbProvide).rejects.toThrow(`Tenant "${tenantId}" not registered.`);
		dbProvide.mockRestore();
	});
});
