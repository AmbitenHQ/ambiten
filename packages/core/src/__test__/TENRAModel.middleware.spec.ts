import type {
  Collection,
  Db,
  Document,
  Filter,
  UpdateFilter
} from 'mongodb';
import { TenraModel, TenraSchema } from '../lib-core';
import type { DbProvider } from '../types';
import { MultiTenantManager } from '../tanancy';
import { TenraContext } from '../context';
import { registerMockTenant } from './mock-helpers/mockMultitenant';
// import { bufferedTransporter } from '../utils';

type UserDoc = Document & {
  _id?: any;
  name?: string;
  deleted?: boolean;
  role?: string;
  updatedAt?: Date;
};

async function runWithTestContext<T>(fn: () => Promise<T>): Promise<T> {
  return TenraContext.run(
    {
      tenantId: 'tenant-test',
      requestId: 'req-test-1',
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

describe('TenraModel middleware', () => {
  let mockCollection: jest.Mocked<Partial<Collection<UserDoc>>>;
  let mockDb: jest.Mocked<Partial<Db>>;
  let mockProvider: DbProvider;
  let model: TenraModel<UserDoc>;

  beforeEach(async () => {
    jest.clearAllMocks();
    MultiTenantManager.clearTenants();

    mockCollection = {
      find: jest.fn(),
      findOne: jest.fn(),
      insertOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      deleteMany: jest.fn(),
      findOneAndUpdate: jest.fn(),
      aggregate: jest.fn()
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
      databaseName: 'test-db'
    };

    mockProvider = {
      db: jest.fn().mockResolvedValue(mockDb as Db)
    };

    await registerMockTenant(
      'tenant-test',
      mockCollection as Collection<UserDoc>,
      'test-db'
    );

    model = new TenraModel<UserDoc>({
      collectionName: 'users',
      provider: mockProvider,
      schema: new TenraSchema<UserDoc>({} as any)
    });
  });

  afterEach(async () => {
    MultiTenantManager.clearTenants();
    jest.clearAllMocks();
    // await bufferedTransporter.stop();
  });

  it('beforeFind should mutate filter', async () => {
    const toArray = jest.fn().mockResolvedValue([
      { _id: '1', name: 'Alice', deleted: false }
    ]);

    mockCollection.find = jest.fn().mockReturnValue({ toArray } as any);

    model.beforeFind((ctx) => {
      ctx.filter = {
        ...(ctx.filter ?? {}),
        deleted: false
      } as Filter<UserDoc>;
    });

    const result = await runWithTestContext(() => model.find({ name: 'Alice' }));

    expect(mockCollection.find).toHaveBeenCalledWith(
      { name: 'Alice', deleted: false },
      undefined
    );

    expect(result).toEqual([
      { _id: '1', name: 'Alice', deleted: false }
    ]);
  });

  it('afterFind should mutate result', async () => {
    const toArray = jest.fn().mockResolvedValue([
      { _id: '1', name: 'Alice' }
    ]);

    mockCollection.find = jest.fn().mockReturnValue({ toArray } as any);

    model.afterFind((ctx) => {
      const result = Array.isArray(ctx.result) ? ctx.result : [];

      ctx.result = result.map((doc: any) => ({
        ...doc,
        tagged: true
      }));
    });

    const result = await runWithTestContext(() => model.find({}));

    expect(result).toEqual([
      { _id: '1', name: 'Alice', tagged: true }
    ]);
  });

  it('beforeSave should mutate doc in create', async () => {
    mockCollection.insertOne = jest.fn().mockResolvedValue({
      insertedId: 'abc123'
    } as any);

    await registerMockTenant(
      'tenant-test',
      mockCollection as any,
      'test-db'
    );

    model.beforeSave((ctx) => {
      ctx.doc = {
        ...(ctx.doc ?? {}),
        role: 'user'
      };
    });

    const result = await runWithTestContext(() => model.create({ name: 'Bob' }));

    expect(mockCollection.insertOne).toHaveBeenCalledWith(
      { name: 'Bob', role: 'user' },
      undefined
    );

    expect(result).toEqual({
      _id: 'abc123',
      name: 'Bob',
      role: 'user'
    });
  });

  it('beforeUpdateOne should mutate update payload', async () => {
    mockCollection.updateOne = jest.fn().mockResolvedValue({
      acknowledged: true,
      matchedCount: 1,
      modifiedCount: 1,
      upsertedCount: 0,
      upsertedId: null
    } as any);

    await registerMockTenant(
      'tenant-test',
      mockCollection as any,
      'test-db'
    );

    model.beforeUpdateOne((ctx) => {
      ctx.update = {
        ...(ctx.update ?? {}),
        $set: {
          ...((ctx.update as any)?.$set ?? {}),
          updatedAt: new Date('2026-03-19T10:00:00.000Z')
        }
      } as UpdateFilter<UserDoc>;
    });

    await runWithTestContext(() =>
      model.updateOne(
        { name: 'Bob' },
        { $set: { role: 'admin' } }
      )
    );

    expect(mockCollection.updateOne).toHaveBeenCalledWith(
      { name: 'Bob' },
      {
        $set: {
          role: 'admin',
          updatedAt: new Date('2026-03-19T10:00:00.000Z')
        }
      },
      undefined
    );
  });

  it('afterDeleteOne should receive deleted payload in middleware result', async () => {
    mockCollection.findOne = jest.fn().mockResolvedValue({
      _id: '1',
      name: 'Alice'
    } as any);

    await registerMockTenant(
      'tenant-test',
      mockCollection as any,
      'test-db'
    );

    mockCollection.deleteOne = jest.fn().mockResolvedValue({
      acknowledged: true,
      deletedCount: 1
    } as any);

    const afterDelete = jest.fn();

    model.afterDeleteOne((ctx) => {
      afterDelete(ctx.result);
    });

    await runWithTestContext(() => model.deleteOne({ name: 'Alice' }));

    expect(afterDelete).toHaveBeenCalledWith({
      _id: '1',
      name: 'Alice'
    });
  });

  it('beforeAggregate should prepend pipeline stage', async () => {
    const toArray = jest.fn().mockResolvedValue([
      { _id: '1', name: 'Alice', deleted: false }
    ]);

    mockCollection.aggregate = jest.fn().mockReturnValue({
      toArray,
      bufferedCount: jest.fn().mockReturnValue(0)
    } as any);

    model.beforeAggregate((ctx) => {
      ctx.pipeline = [
        { $match: { deleted: false } },
        ...(ctx.pipeline ?? [])
      ];
    });

    const result = await runWithTestContext(() =>
      model.aggregate([
        { $match: { role: 'admin' } }
      ])
    );

    expect(mockCollection.aggregate).toHaveBeenCalledWith(
      [
        { $match: { deleted: false } },
        { $match: { role: 'admin' } }
      ],
      {}
    );

    expect(result).toEqual([
      { _id: '1', name: 'Alice', deleted: false }
    ]);
  });

  it('findOneAndUpdate middleware should mutate query and result', async () => {
    mockCollection.findOneAndUpdate = jest.fn().mockResolvedValue({
      _id: '1',
      name: 'Alice',
      role: 'admin'
    } as any);

    await registerMockTenant(
      'tenant-test',
      mockCollection as any,
      'test-db'
    );

    model.beforeFindOneAndUpdate((ctx) => {
      ctx.filter = {
        ...(ctx.filter ?? {}),
        deleted: false
      } as Filter<UserDoc>;
    });

    model.afterFindOneAndUpdate((ctx) => {
      ctx.result = {
        ...(ctx.result ?? {}),
        touchedByMiddleware: true
      };
    });

    const result = await runWithTestContext(() =>
      model.findOneAndUpdate(
        { name: 'Alice' },
        { $set: { role: 'admin' } }
      )
    );

    expect(mockCollection.findOneAndUpdate).toHaveBeenCalledWith(
      { name: 'Alice', deleted: false },
      { $set: { role: 'admin' } },
      { returnDocument: 'after' }
    );

    expect(result).toEqual({
      _id: '1',
      name: 'Alice',
      role: 'admin',
      touchedByMiddleware: true
    });
  });

  it('should run before middleware in registration order', async () => {
    const order: string[] = [];
    const toArray = jest.fn().mockResolvedValue([]);

    mockCollection.find = jest.fn().mockReturnValue({ toArray } as any);

    model.beforeFind(() => {
      order.push('first');
    });

    model.beforeFind(() => {
      order.push('second');
    });

    await runWithTestContext(() => model.find({}));

    expect(order).toEqual(['first', 'second']);
  });

  it('should expose merged tenant context to middleware', async () => {
    const toArray = jest.fn().mockResolvedValue([]);
    mockCollection.find = jest.fn().mockReturnValue({ toArray } as any);

    const mockTenantDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
      databaseName: 'main_db'
    } as any;

    jest.spyOn(MultiTenantManager, 'getTenant').mockReturnValue({
      tenantId: 'tenantA',
      uri: 'mongodb://localhost:27017/main_db',
      dbName: 'main_db',
      lazy: false
    } as any);

    jest.spyOn(MultiTenantManager, 'getClient').mockResolvedValue({
      db: jest.fn().mockReturnValue(mockTenantDb)
    } as any);

    const seen: any[] = [];

    model.beforeFind((ctx) => {
      seen.push({
        tenantId: ctx.tenantId,
        dbName: ctx.dbName
      });
    });

    await TenraContext.run(
      {
        tenantId: 'tenant-test',
        requestId: 'req-test-1',
        dbName: 'test-db'
      },
      async () =>
        model.find({}, { tenantId: 'tenantA', dbName: 'main_db' })
    );

    expect(seen).toEqual([
      { tenantId: 'tenantA', dbName: 'main_db' }
    ]);
  });

  it('should expose merged db and session context to middleware', async () => {
    const toArray = jest.fn().mockResolvedValue([]);
    mockCollection.find = jest.fn().mockReturnValue({ toArray } as any);

    const seen: any[] = [];
    const fakeSession = { id: 'session-1' } as any;

    model.beforeFind((ctx) => {
      seen.push({
        dbName: ctx.dbName,
        session: ctx.session
      });
    });

    await runWithTestContext(() =>
      model.find(
        {},
        {
          db: mockDb as Db,
          dbName: 'main_db',
          session: fakeSession
        }
      )
    );

    expect(seen).toEqual([
      {
        dbName: 'main_db',
        session: fakeSession
      }
    ]);
  });

  afterAll(async () => {
    jest.clearAllMocks();
    // await bufferedTransporter.stop();
  });
});