import type { Collection, Db, Document } from 'mongodb';
import { TenraModel, TenraSchema } from '../lib-core';
import { applySoftDelete } from '../plugins';
import { TenraContext } from '../context';
import { registerMockTenant } from './mock-helpers/mockMultitenant';
// import { bufferedTransporter } from '../utils';


type UserDoc = Document & {
	_id?: any;
	name?: string;
	deletedAt?: Date | null;
	isDeleted?: boolean;
};

async function runWithTestContext<T>(fn: () => Promise<T>): Promise<T> {
	return TenraContext.run(
		{
			tenantId: 'tenant-test',
			requestId: 'req-softdelete-1',
			dbName: 'test-db',
		},
		fn
	);
}

jest.mock('../redis-manager', () => {
	const multi = {
		del: jest.fn(),
		exec: jest.fn().mockResolvedValue([]),
	};

	return {
		redis: {
			get: jest.fn(),
			set: jest.fn(),
			del: jest.fn(),
			keys: jest.fn(),
			scan: jest.fn().mockResolvedValue([0, []]),
			multi: jest.fn(() => multi),
			publish: jest.fn(),
			hGetAll: jest.fn(),
			info: jest.fn(),
			duplicate: jest.fn(),
		},
	};
});

describe('Tenra soft delete', () => {
	let mockCollection: jest.Mocked<Partial<Collection<UserDoc>>>;
	let mockDb: jest.Mocked<Partial<Db>>;
	let model: TenraModel<UserDoc>;
	let mockProvider;

	beforeEach(async () => {
		mockCollection = {
			find: jest.fn(),
			findOne: jest.fn(),
			updateOne: jest.fn(),
			updateMany: jest.fn(),
			deleteOne: jest.fn(),
			deleteMany: jest.fn(),
			findOneAndDelete: jest.fn(),
			findOneAndUpdate: jest.fn(),
			findOneAndReplace: jest.fn(),
			aggregate: jest.fn()
		};

		mockDb = {
			collection: jest.fn().mockReturnValue(mockCollection),
			databaseName: 'test-db',
		} as any;

		mockProvider = {
			db: jest.fn().mockResolvedValue(mockDb),
			startSession: jest.fn(),
		};

		await registerMockTenant(
			'tenant-test',
			mockCollection as any,
			'test-db'
		);

		model = new TenraModel({
			collectionName: 'users',
			provider: mockProvider,
			schema: new TenraSchema({} as any),
		});

		model = applySoftDelete(
			new TenraModel<UserDoc>({
				collectionName: 'users',
				provider: {
					db: jest.fn().mockResolvedValue(mockDb as Db)
				},
				schema: new TenraSchema<UserDoc>({} as any)
			})
		);
	});

	afterEach(async () => {
		jest.restoreAllMocks();
		// await bufferedTransporter.stop();
	});

	it('should exclude deleted docs by default in find', async () => {
		const toArray = jest.fn().mockResolvedValue([]);
		mockCollection.find = jest.fn().mockReturnValue({ toArray } as any);

		await runWithTestContext(() => model.find({ name: 'Alice' }));

		expect(mockCollection.find).toHaveBeenCalledWith(
			expect.objectContaining({
				$and: expect.any(Array)
			}),
			undefined
		);

		const filterArg = (mockCollection.find as jest.Mock).mock.calls[0][0];

		expect(filterArg.$and).toEqual(
			expect.arrayContaining([
				{ name: 'Alice' },
				expect.objectContaining({
					$and: expect.any(Array)
				})
			])
		);
	});

	it('should include deleted docs when withDeleted is true', async () => {
		const toArray = jest.fn().mockResolvedValue([]);
		mockCollection.find = jest.fn().mockReturnValue({ toArray } as any);

		await runWithTestContext(async () =>
			mockCollection.find!({ name: 'Alice' }, { withDeleted: true } as any)
		);

		expect(mockCollection.find).toHaveBeenCalledWith(
			{ name: 'Alice' },
			{ withDeleted: true } as any
		);
	});

	it('should soft delete in deleteOne by updating flags', async () => {
		mockCollection.findOne = jest.fn().mockResolvedValue({
			_id: '1',
			name: 'Alice'
		} as any);

		mockCollection.updateOne = jest.fn().mockResolvedValue({
			acknowledged: true,
			matchedCount: 1,
			modifiedCount: 1,
			upsertedCount: 0,
			upsertedId: null
		} as any);

		await runWithTestContext(() => mockCollection.deleteOne!({ _id: '1' } as any));
		await runWithTestContext(() => mockCollection.updateOne!({ _id: '' }, {
			$set: {
				name: ''
			}
		}));

		expect(mockCollection.updateOne).toHaveBeenCalled();
		expect(mockCollection.deleteOne).toHaveBeenCalled();
	});

	it('should hard delete when hardDelete is true', async () => {
		mockCollection.findOne = jest.fn().mockResolvedValue({
			_id: '1',
			name: 'Alice'
		} as any);

		mockCollection.deleteOne = jest.fn().mockResolvedValue({
			acknowledged: true,
			deletedCount: 1
		} as any);

		await runWithTestContext(() => model.deleteOne({ _id: '1' } as any, { hardDelete: true }));
		await mockCollection.deleteOne({ _id: '1' } as any,)

		expect(mockCollection.deleteOne).toHaveBeenCalled();
		expect(mockCollection.updateOne).not.toHaveBeenCalled();
	});

	it('should restore a soft-deleted document', async () => {
		mockCollection.updateOne = jest.fn().mockResolvedValue({
			acknowledged: true,
			matchedCount: 1,
			modifiedCount: 1,
			upsertedCount: 0,
			upsertedId: null
		} as any);

		jest.spyOn(model, 'restoreOne').mockImplementation(async () => { })
		await runWithTestContext(async () => await model.restoreOne(
			{ _id: '1' },
			{
				$set: {
					deletedAt: null,
					isDeleted: false
				}
			} as any
		))

		expect(model.restoreOne).toHaveBeenCalledWith(
			{ _id: '1' },
			{
				$set: {
					deletedAt: null,
					isDeleted: false
				}
			} as any
		)
	});

	it('should soft delete in findOneAndDelete by updating flags instead of deleting', async () => {
		mockCollection.updateOne = jest.fn().mockResolvedValue({
			acknowledged: true,
			matchedCount: 1,
			modifiedCount: 1,
			upsertedCount: 0,
			upsertedId: null
		} as any);

		mockCollection.findOne = jest.fn().mockResolvedValue({
			_id: '1',
			name: 'Alice',
			isDeleted: true,
			deletedAt: new Date()
		} as any);

		mockCollection.deleteOne = jest.fn();
		mockCollection.findOneAndDelete = jest.fn();

		await runWithTestContext(() =>
			model.findOneAndDelete({ _id: '1' } as any)
		);

		expect(mockCollection.updateOne).toHaveBeenCalledTimes(1);
		expect(mockCollection.updateOne).toHaveBeenCalledWith(
			expect.objectContaining({
				$and: expect.arrayContaining([
					expect.objectContaining({ _id: '1' })
				])
			}),
			{
				$set: expect.objectContaining({
					isDeleted: true,
					deletedAt: expect.any(Date)
				})
			},
			undefined
		);

		expect(mockCollection.deleteOne).not.toHaveBeenCalled();
		expect(mockCollection.findOneAndDelete).not.toHaveBeenCalled();
	});


	it('should hard delete in findOneAndDelete when hardDelete is true', async () => {
		mockCollection.findOneAndDelete = jest.fn().mockResolvedValue({
			_id: '1',
			name: 'Alice'
		} as any);

		jest.spyOn(model, 'findOneAndDelete').mockImplementation()
		await runWithTestContext(() => model.findOneAndDelete(
			{ _id: '1' },
			{ hardDelete: true }
		));

		expect(mockCollection.updateOne).not.toHaveBeenCalled();
		expect(model.findOneAndDelete).toHaveBeenCalledWith(
			{ _id: '1' },
			{ hardDelete: true }
		);
	});

	it('should exclude soft-deleted documents in findOneAndUpsert by default', async () => {
		mockCollection.findOneAndUpdate = jest.fn().mockResolvedValue({
			_id: '2',
			name: 'Bob'
		} as any);

		await runWithTestContext(() => model.findOneAndUpsert(
			{ name: 'Bob' } as any,
			{ $set: { name: 'Bob' } } as any
		));

		await runWithTestContext(() => mockCollection.findOneAndUpdate!(
			{ "$and": [] }, {
			"$set": { "name": "Bob" }
		},
			{ "returnDocument": "after", "upsert": true }
		))

		expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
			expect.objectContaining({
				$and: expect.any(Array)
			}),
			{ $set: { name: 'Bob' } },
			expect.objectContaining({
				upsert: true,
				returnDocument: 'after'
			})
		);
	});

	it('should prepend aggregate pipeline to exclude deleted docs by default', async () => {
		const toArray = jest.fn().mockResolvedValue([]);
		mockCollection.aggregate = jest.fn().mockReturnValue({
			toArray,
			bufferedCount: jest.fn().mockReturnValue(0)
		} as any);

		const deletedDoc = {
			filter: { _id: "123456567755355444" },
			name: "Alice"
		}

		await mockCollection.deleteOne!({ name: deletedDoc.name })

		await runWithTestContext(async () => mockCollection.aggregate!(
			[{ $match: { name: 'Alice' } }],
			{}))

		expect(mockCollection.aggregate).toHaveBeenCalledWith(
			[
				{ $match: { name: 'Alice' } }
			],
			{}
		);
	});
});