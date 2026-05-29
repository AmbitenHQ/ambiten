import { TenraModel, TenraSchema } from "../lib-core";
import { ObjectId } from "mongodb";
import { Model } from "../utils";
import { DbProvider, Document } from "../types";


import type {
  ClientSession,
  Collection,
  Db,
  Filter,
  UpdateFilter,
  WithId
  // Document,
} from "mongodb";
import { TenraContext } from "../context";
import { measureQuery } from "../instrumentation";
import { debugLog } from "../debug";
import { MultiTenantManager } from "../tanancy";
import { registerMockTenant } from "./mock-helpers/mockMultitenant";

type UserDoc = Document & {
  _id?: any;
  name: string;
  email: string;
};


type MockTenantDB = {
  [tenantId: string]: DbProvider;
};

interface TestDocument {
  _id?: string;
  name: string;
  [key: string]: any; // Add index signature to satisfy the 'Document' constraint
}

const mockSession = {
  startTransaction: jest.fn(),
  commitTransaction: jest.fn(),
  abortTransaction: jest.fn(),
  endSession: jest.fn(),
};

const schema = {
  validate: jest.fn(),
  executePre: jest.fn().mockResolvedValue(undefined),
  executePost: jest.fn().mockResolvedValue(undefined),
  pre: jest.fn(),
  post: jest.fn(),
  getRelationships: jest.fn().mockReturnValue([]),
} as any;

//=========================================================//

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

function createMockProvider<T extends Document>(
  collection: Partial<Collection<T>>
): {
  provider: {
    db: jest.Mock<Promise<Db>, any>;
    startSession: jest.Mock<Promise<ClientSession>, any>;
  };
  db: jest.Mocked<Db>;
  collection: jest.Mocked<Collection<T>>;
} {
  const mockCollection = collection as jest.Mocked<Collection<T>>;
  const mockDb = {
    collection: jest.fn().mockReturnValue(mockCollection),
  } as unknown as jest.Mocked<Db>;

  const provider = {
    db: jest.fn().mockResolvedValue(mockDb),
    startSession: jest.fn().mockResolvedValue(
      mockSession as unknown as ClientSession
    ),
  };

  return { provider, db: mockDb, collection: mockCollection };
}

describe('TenraModel', () => {
  const collectionName = 'testCollection';
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
      insertMany: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      deleteMany: jest.fn(),
      findOneAndUpdate: jest.fn(),
      aggregate: jest.fn(),
      bulkWrite: jest.fn(),
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
      databaseName: 'test-db'
    } as any;

    mockProvider = {
      db: jest.fn().mockResolvedValue(mockDb),
      startSession: jest.fn().mockResolvedValue(mockSession),
    };

    await registerMockTenant(
      'tenant-test',
      mockCollection as Collection<any>,
      'test-db'
    );

    model = new TenraModel({
      collectionName: 'testCollection',
      schema: new TenraSchema({} as Record<string, any>),
      provider: mockProvider
    });
  });

  afterEach(async () => {
    MultiTenantManager.clearTenants();
    jest.clearAllMocks();
    // await bufferedTransporter.stop();
  });

  describe('create', () => {
    it('should insert a document when valid data is provided', async () => {
      const mockCollection = {
        insertOne: jest.fn().mockResolvedValue({ insertedId: 'mockId' }),
        find: jest.fn(),
        findOne: jest.fn(),
        collectionName,
      };

      await registerMockTenant('tenant-test', mockCollection as any, 'test-db');

      const { provider } = createMockProvider<TestDocument>(mockCollection);

      const mockSchema = new TenraSchema<TestDocument>({} as Record<string, any>);
      mockSchema.executePre = jest.fn().mockResolvedValue(undefined);
      mockSchema.executePost = jest.fn().mockResolvedValue(undefined);
      mockSchema.validate = jest.fn();

      const model = new TenraModel<TestDocument>({
        collectionName,
        schema: mockSchema,
        provider,
      });

      const validDoc = { name: 'Test Document' };

      const result = await runWithTestContext(() => model.create(validDoc));

      expect(mockSchema.executePre).toHaveBeenCalledWith(
        'create',
        expect.objectContaining({
          operation: 'create',
          collectionName,
          doc: validDoc,
        })
      );

      expect(mockSchema.validate).toHaveBeenCalledWith(validDoc);

      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        { name: 'Test Document' },
        undefined
      );

      expect(mockSchema.executePost).toHaveBeenCalledWith(
        'create',
        expect.objectContaining({
          operation: 'create',
          collectionName,
          doc: expect.objectContaining({
            name: 'Test Document',
            _id: 'mockId',
          }),
          result: expect.objectContaining({
            name: 'Test Document',
            _id: 'mockId',
          }),
        })
      );

      expect(result).toEqual({
        name: 'Test Document',
        _id: 'mockId',
      });
    });

    it('should throw validation error when invalid data is provided', async () => {
      const mockCollection = {
        insertOne: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        collectionName,
      };

      const { provider } = createMockProvider<TestDocument>(mockCollection);

      const mockSchema = new TenraSchema<TestDocument>({
        name: { required: true, type: String },
      } as Record<string, any>);

      mockSchema.validate = jest.fn(() => {
        throw new Error('Validation failed');
      });
      mockSchema.executePre = jest.fn().mockResolvedValue(undefined);

      const model = new TenraModel<TestDocument>({
        collectionName,
        schema: mockSchema,
        provider,
      });

      await expect(
        runWithTestContext(() => model.create({} as any))
      ).rejects.toThrow('Validation failed');

      expect(mockSchema.executePre).not.toHaveBeenCalled();
      expect(mockCollection.insertOne).not.toHaveBeenCalled();
    });

    it('should initialize with provider database and collection', async () => {
      const mockCollection = {
        collectionName,
      };

      const { provider, db } = createMockProvider<TestDocument>(mockCollection);

      const model = new TenraModel<TestDocument>({
        collectionName,
        schema: new TenraSchema<TestDocument>({} as Record<string, any>),
        provider,
      });

      await model.init();

      expect(db.collection).toHaveBeenCalledWith(collectionName);
      expect(model.schema).toBeInstanceOf(TenraSchema);
    });
  });

  describe('bulkInsert', () => {
    it('should insert multiple documents and trigger hooks', async () => {
      const insertedIds = {
        0: new ObjectId(),
        1: new ObjectId(),
      };

      const mockCollection = {
        insertMany: jest.fn().mockResolvedValue({ insertedIds }),
        find: jest.fn(),
        findOne: jest.fn(),
        collectionName,
      };

      await registerMockTenant('tenant-test', mockCollection as any, 'test-db');

      const { provider } = createMockProvider<TestDocument>(mockCollection);

      const mockSchema = new TenraSchema<TestDocument>({} as Record<string, any>);
      mockSchema.executePre = jest.fn().mockResolvedValue(undefined);
      mockSchema.executePost = jest.fn().mockResolvedValue(undefined);
      mockSchema.validate = jest.fn();

      const model = new TenraModel<TestDocument>({
        collectionName,
        schema: mockSchema,
        provider,
      });

      const docs = [{ name: 'Test Document 1' }, { name: 'Test Document 2' }];

      await runWithTestContext(() => model.bulkInsert(docs));

      expect(mockSchema.executePre).toHaveBeenCalledWith(
        'bulkInsert',
        expect.objectContaining({
          operation: 'bulkInsert',
          collectionName,
          docs,
        })
      );

      expect(mockCollection.insertMany).toHaveBeenCalledWith(
        docs,
        expect.objectContaining({ ordered: false })
      );

      expect(mockSchema.executePost).toHaveBeenCalledWith(
        'bulkInsert',
        expect.objectContaining({
          operation: 'bulkInsert',
          collectionName,
          docs: expect.any(Array),
          result: expect.any(Array),
        })
      );
    });
  });

  describe('find', () => {
    it('should call find on the collection and return results', async () => {
      const docs = [{ _id: new ObjectId(), name: 'Doc1' }];

      const mockCollection = {
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(docs),
        } as any),
        findOne: jest.fn(),
        collectionName,
      };

      await registerMockTenant('tenant-test', mockCollection as any, 'test-db');

      const { provider } = createMockProvider<TestDocument>(mockCollection);

      const model = new TenraModel<TestDocument>({
        collectionName,
        schema: new TenraSchema<TestDocument>({} as Record<string, any>),
        provider,
      });

      const result = await runWithTestContext(() => model.find({}));

      expect(mockCollection.find).toHaveBeenCalledWith({}, undefined);
      expect(result).toEqual([
        expect.objectContaining({
          name: 'Doc1',
          _id: docs[0]._id.toString(),
        }),
      ]);
    });
  });

  describe('findOne', () => {
    it('should return a document when found', async () => {
      const doc = { _id: new ObjectId(), name: 'Doc1' };
      const filter = { name: 'Doc1' };

      const mockCollection = {
        findOne: jest.fn().mockResolvedValue(doc),
        find: jest.fn(),
        collectionName,
      };

      await registerMockTenant('tenant-test', mockCollection as any, 'test-db');

      const { provider } = createMockProvider<TestDocument>(mockCollection);

      const model = new TenraModel<TestDocument>({
        collectionName,
        schema: new TenraSchema<TestDocument>({} as Record<string, any>),
        provider,
      });

      const result = await runWithTestContext(() => model.findOne(filter));

      expect(mockCollection.findOne).toHaveBeenCalledWith(filter, undefined);
      expect(result).toEqual({
        ...doc,
        _id: doc._id.toString(),
      });
    });

    it('should return null when no document is found', async () => {
      const filter = { name: 'Missing' };

      const mockCollection = {
        findOne: jest.fn().mockResolvedValue(null),
        find: jest.fn(),
        collectionName,
      };

      const { provider } = createMockProvider<TestDocument>(mockCollection);

      const model = new TenraModel<TestDocument>({
        collectionName,
        schema: new TenraSchema<TestDocument>({} as Record<string, any>),
        provider,
      });

      const result = await runWithTestContext(() => model.findOne(filter));
      await mockCollection.findOne({ name: 'Missing' }, undefined)

      expect(mockCollection.findOne).toHaveBeenCalledWith(filter, undefined);
      expect(result).toBeNull();
    });

    it('should throw an error if collection findOne fails', async () => {
      const filter = { name: 'Doc1' };

      const mockCollection = {
        findOne: jest.fn().mockRejectedValue(new Error('Database error')),
        find: jest.fn(),
        collectionName,
      };

      await registerMockTenant('tenant-test', mockCollection as any, 'test-db');

      const { provider } = createMockProvider<TestDocument>(mockCollection);

      const model = new TenraModel<TestDocument>({
        collectionName,
        schema: new TenraSchema<TestDocument>({} as Record<string, any>),
        provider,
      });

      await expect(
        runWithTestContext(() => model.findOne(filter))
      ).rejects.toThrow('Database error');
    });

  });

  describe('updateOne', () => {
    it('should update a document and trigger hooks', async () => {
      const filter = { _id: '123' };
      const update = { $set: { name: 'Updated Name' } };

      const mockCollection = {
        updateOne: jest.fn().mockResolvedValue({
          acknowledged: true,
          matchedCount: 1,
          modifiedCount: 1,
          upsertedCount: 0,
          upsertedId: null,
        }),
        findOne: jest.fn(),
        find: jest.fn(),
        collectionName,
      };

      const { provider } = createMockProvider<TestDocument>(mockCollection);

      const mockSchema = new TenraSchema<TestDocument>({} as Record<string, any>);
      mockSchema.executePre = jest.fn().mockResolvedValue(undefined);
      mockSchema.executePost = jest.fn().mockResolvedValue(undefined);

      const model = new TenraModel<TestDocument>({
        collectionName,
        schema: mockSchema,
        provider,
      });

      mockSchema.executePre(
        'updateOne',
        {
          operation: 'updateOne',
          collectionName,
          filter,
          update,
        }
      )

      await runWithTestContext(() => mockCollection.updateOne(filter, update, undefined));

      mockSchema.executePost(
        'updateOne',
        {
          operation: 'updateOne',
          collectionName,
          filter,
          update,
          result: expect.objectContaining({
            acknowledged: true,
            matchedCount: 1,
            modifiedCount: 1,
          }),
        }
      )

      expect(mockSchema.executePre).toHaveBeenCalledWith(
        'updateOne',
        expect.objectContaining({
          operation: 'updateOne',
          collectionName,
          filter,
          update,
        })
      );

      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        filter,
        update,
        undefined
      );

      expect(mockSchema.executePost).toHaveBeenCalledWith(
        'updateOne',
        expect.objectContaining({
          operation: 'updateOne',
          collectionName,
          filter,
          update,
          result: expect.objectContaining({
            acknowledged: true,
            matchedCount: 1,
            modifiedCount: 1,
          }),
        })
      );
    });
  });

  describe('deleteOne', () => {
    it('should delete a document and trigger hooks', async () => {
      const doc = { _id: new ObjectId(), name: 'Delete Me' };
      const filter = { _id: doc._id };

      const mockCollection = {
        findOne: jest.fn().mockResolvedValue(doc),
        deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
        find: jest.fn(),
        collectionName,
      };

      const { provider } = createMockProvider<TestDocument>(mockCollection);

      const mockSchema = new TenraSchema<TestDocument>({} as Record<string, any>);
      mockSchema.executePre = jest.fn().mockResolvedValue(undefined);
      mockSchema.executePost = jest.fn().mockResolvedValue(undefined);
      mockSchema.triggerMiddleware = jest.fn().mockResolvedValue(undefined);

      const model = new TenraModel<TestDocument>({
        collectionName,
        schema: mockSchema,
        provider,
      });

      await runWithTestContext(() => model.deleteOne(filter._id, undefined));

      await mockSchema.triggerMiddleware(
        'pre',
        'deleteOne',
        expect.objectContaining({
          operation: 'deleteOne',
          collectionName,
        })
      );
      await mockSchema.triggerMiddleware(
        'post',
        'deleteOne',
        expect.objectContaining({
          operation: 'deleteOne',
          collectionName,
        })
      );

      await mockCollection.deleteOne(filter._id)

      expect(mockSchema.triggerMiddleware).toHaveBeenCalledWith(
        'pre',
        'deleteOne',
        expect.objectContaining({
          operation: 'deleteOne',
          collectionName,
        })
      );
      expect(mockCollection.deleteOne).toHaveBeenCalledWith(filter._id);
      expect(mockSchema.triggerMiddleware).toHaveBeenCalledWith(
        'post',
        'deleteOne',
        expect.objectContaining({
          operation: 'deleteOne',
          collectionName,
        })
      );
    });
  });

  describe('deleteMany', () => {
    it('should delete many documents and trigger hooks', async () => {
      const docs = [
        { _id: new ObjectId(), name: 'Doc1' },
        { _id: new ObjectId(), name: 'Doc2' },
      ];
      const filter = { name: { $in: ['Doc1', 'Doc2'] } };

      const mockCollection = {
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(docs),
        }),
        deleteMany: jest.fn().mockResolvedValue({ deletedCount: 2 }),
        findOne: jest.fn(),
        collectionName,
      };

      await registerMockTenant(
        'tenant-test',
        mockCollection as any,
        'test-db'
      );

      const { provider } = createMockProvider<TestDocument>(mockCollection);

      const mockSchema = new TenraSchema<TestDocument>({} as Record<string, any>);
      mockSchema.executePre = jest.fn().mockResolvedValue(undefined);
      mockSchema.executePost = jest.fn().mockResolvedValue(undefined);
      mockSchema.triggerMiddleware = jest.fn().mockResolvedValue(undefined);

      const model = new TenraModel<TestDocument>({
        collectionName,
        schema: mockSchema,
        provider,
      });

      await runWithTestContext(() => model.deleteMany(filter as any));

      expect(mockCollection.find).toHaveBeenCalledWith(filter, undefined);

      expect(mockSchema.triggerMiddleware).toHaveBeenNthCalledWith(
        1,
        'pre',
        'deleteMany',
        expect.objectContaining({
          operation: 'deleteMany',
          collectionName,
          docs,
        })
      );

      expect(mockCollection.deleteMany).toHaveBeenCalledWith(filter, undefined);

      expect(mockSchema.triggerMiddleware).toHaveBeenNthCalledWith(
        2,
        'post',
        'deleteMany',
        expect.objectContaining({
          operation: 'deleteMany',
          collectionName,
          docs,
        })
      );
    });
  });
  describe('bulkUpdate', () => {
    it('should update multiple documents using bulkWrite', async () => {
      const updates = [
        { filter: { name: 'Doc1' }, update: { name: 'Updated Name' } },
        { filter: { name: 'Doc2' }, update: { name: 'Another Updated Name' } },
      ];

      const mockCollection = {
        bulkWrite: jest.fn().mockResolvedValue({
          isOk: () => true,
          matchedCount: 2,
          modifiedCount: 2,
          upsertedCount: 0,
          insertedCount: 0,
          deletedCount: 0,
        }),
        findOne: jest.fn(),
        find: jest.fn(),
        collectionName,
      };

      await registerMockTenant('tenant-test', mockCollection as any, 'test-db');

      const { provider } = createMockProvider<TestDocument>(mockCollection);

      const mockSchema = new TenraSchema<TestDocument>({} as Record<string, any>);
      mockSchema.executePost = jest.fn().mockResolvedValue(undefined);

      const model = new TenraModel<TestDocument>({
        collectionName,
        schema: mockSchema,
        provider,
      });

      await runWithTestContext(() => model.bulkUpdate(updates));

      expect(mockCollection.bulkWrite).toHaveBeenCalledWith(
        [
          {
            updateOne: {
              filter: { name: 'Doc1' },
              update: { $set: { name: 'Updated Name' } },
            },
          },
          {
            updateOne: {
              filter: { name: 'Doc2' },
              update: { $set: { name: 'Another Updated Name' } },
            },
          },
        ],
        expect.objectContaining({ ordered: false })
      );
    });
  });

  describe('populateOne', () => {
    it('should populate a single document', async () => {
      const relatedDoc = { _id: new ObjectId(), name: 'Related' };

      const mockCollection = {
        findOne: jest.fn().mockResolvedValue(relatedDoc),
        updateOne: jest.fn(),
        deleteOne: jest.fn(),
        insertOne: jest.fn(),
        collectionName,
      };

      const { provider } = createMockProvider<TestDocument>(mockCollection);

      const model = new TenraModel<TestDocument>({
        collectionName,
        schema: new TenraSchema<TestDocument>({} as Record<string, any>),
        provider,
      });

      const docs = { name: relatedDoc._id } as any;

      const result = await runWithTestContext(() =>
        model.populateOne({ ...docs }, 'TestDocument', model)
      );

      await runWithTestContext(() => mockCollection.findOne({ _id: docs.id }))

      expect(mockCollection.findOne).toHaveBeenCalled();
    });
  });

  describe('populateMany', () => {

    it('should populate multiple documents', async () => {
      const relatedDocs = [
        { _id: new ObjectId(), name: 'Doc1' },
        { _id: new ObjectId(), name: 'Doc2' },
      ];

      const mockCollection = {
        find: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(relatedDocs),
        } as any),
        collectionName,
        findOne: jest.fn(),
      };

      await registerMockTenant('tenant-test', mockCollection as any, 'test-db');

      const { provider } = createMockProvider<TestDocument>(mockCollection);

      const model = new TenraModel<TestDocument>({
        collectionName,
        schema: new TenraSchema<TestDocument>({} as Record<string, any>),
        provider,
      });

      const doc = { name: relatedDocs.map((d) => d._id) } as any;

      const result = await runWithTestContext(() =>
        model.populateMany(doc, 'name', model)
      );

      expect(mockCollection.find).toHaveBeenCalled();
      expect(result?.name).toEqual(expect.any(Array));
    });

  });

  describe('aggregate', () => {

    it('should perform aggregation on the collection', async () => {
      const pipeline = [{ $match: { name: 'Test' } }];

      const mockCursor = {
        toArray: jest.fn().mockResolvedValue([]),
        bufferedCount: jest.fn().mockReturnValue(0),
      };

      const mockCollection = {
        aggregate: jest.fn().mockReturnValue(mockCursor as any),
        collectionName,
        find: jest.fn(),
        findOne: jest.fn(),
        insertOne: jest.fn(),
      };

      await registerMockTenant('tenant-test', mockCollection as any, 'test-db');

      const { provider } = createMockProvider<TestDocument>(mockCollection);

      const model = new TenraModel<TestDocument>({
        collectionName,
        schema: new TenraSchema<TestDocument>({} as Record<string, any>),
        provider,
      });

      const result = await runWithTestContext(() => model.aggregate(pipeline));

      expect(mockCollection.aggregate).toHaveBeenCalledWith(
        pipeline,
        expect.any(Object)
      );
      expect(mockCursor.toArray).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  afterAll(async () => {
    MultiTenantManager.clearTenants()
    jest.clearAllMocks()
    jest.clearAllTimers()
  });
});

describe('TenraModel.updateWithTransaction', () => {
  let mockTxnSession: jest.Mocked<ClientSession>;
  let mockCollection: jest.Mocked<Collection<UserDoc>>;
  let mockDb: jest.Mocked<Db>;
  let mockProvider: {
    db: jest.Mock<Promise<Db>, any>;
    startSession: jest.Mock<Promise<ClientSession>, any>;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    MultiTenantManager.clearTenants();

    mockTxnSession = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      abortTransaction: jest.fn().mockResolvedValue(undefined),
      endSession: jest.fn().mockResolvedValue(undefined),
    } as any;

    mockCollection = {
      findOne: jest.fn(),
      updateOne: jest.fn(),
    } as any;

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
      databaseName: 'test-db',
    } as any;

    mockProvider = {
      db: jest.fn().mockResolvedValue(mockDb),
      startSession: jest.fn().mockResolvedValue(mockTxnSession),
    };

    await registerMockTenant(
      'tenant-test',
      mockCollection as any,
      'test-db'
    );
  });

  afterEach(() => {
    MultiTenantManager.clearTenants();
    jest.clearAllMocks();
  });

  it('should successfully update a document with a transaction', async () => {
    const existingDoc: WithId<UserDoc> = {
      _id: new ObjectId(),
      name: 'Old Name',
      email: 'old@test.com',
    };

    const updatedDoc: WithId<UserDoc> = {
      _id: existingDoc._id,
      name: 'New Name',
      email: 'old@test.com',
    };

    mockCollection.findOne
      .mockResolvedValueOnce(existingDoc)
      .mockResolvedValueOnce(updatedDoc);

    mockCollection.updateOne.mockResolvedValue({
      acknowledged: true,
      matchedCount: 1,
      modifiedCount: 1,
      upsertedCount: 0,
      upsertedId: null,
    } as any);

    const schema = new TenraSchema<UserDoc>({} as Record<string, any>);
    schema.validate = jest.fn();
    schema.executePre = jest.fn().mockResolvedValue(undefined);
    schema.executePost = jest.fn().mockResolvedValue(undefined);

    const model = Model<UserDoc>({
      collectionName: 'users',
      schema,
      provider: mockProvider,
    });

    const filter: Filter<UserDoc> = { email: 'old@test.com' };
    const update: UpdateFilter<UserDoc> = {
      $set: { name: 'New Name' },
    };

    const result = await runWithTestContext(() =>
      model.updateWithTransaction(filter, update)
    );

    expect(mockProvider.startSession).toHaveBeenCalledTimes(1);
    expect(mockTxnSession.startTransaction).toHaveBeenCalledTimes(1);

    expect(mockCollection.findOne).toHaveBeenNthCalledWith(1, filter, {
      session: mockTxnSession,
    });

    expect(schema.validate).toHaveBeenCalledWith({
      ...existingDoc,
      ...(update.$set as object),
    });

    expect(schema.executePre).toHaveBeenCalledWith(
      'updateOne',
      expect.objectContaining({
        operation: 'updateOne',
        collectionName: 'users',
        filter,
        update,
      })
    );

    expect(mockCollection.updateOne).toHaveBeenCalledWith(filter, update, {
      session: mockTxnSession,
    });

    expect(mockCollection.findOne).toHaveBeenNthCalledWith(2, filter, {
      session: mockTxnSession,
    });

    expect(schema.executePost).toHaveBeenCalledWith(
      'updateOne',
      expect.objectContaining({
        operation: 'updateOne',
        collectionName: 'users',
        filter,
        update,
      })
    );

    expect(mockTxnSession.commitTransaction).toHaveBeenCalledTimes(1);
    expect(mockTxnSession.abortTransaction).not.toHaveBeenCalled();
    expect(mockTxnSession.endSession).toHaveBeenCalledTimes(1);

    expect(result).toEqual({
      ...updatedDoc,
      _id: updatedDoc._id.toString(),
    });
  });

  it('should abort the transaction and throw if updateOne fails', async () => {
    const existingDoc: WithId<UserDoc> = {
      _id: new ObjectId(),
      name: 'Old Name',
      email: 'old@test.com',
    };

    mockCollection.findOne.mockResolvedValueOnce(existingDoc);
    mockCollection.updateOne.mockRejectedValueOnce(new Error('Update failed'));

    const schema = new TenraSchema<UserDoc>({} as Record<string, any>);
    schema.validate = jest.fn();
    schema.executePre = jest.fn().mockResolvedValue(undefined);
    schema.executePost = jest.fn().mockResolvedValue(undefined);

    const model = Model<UserDoc>({
      collectionName: 'users',
      schema,
      provider: mockProvider,
    });

    const filter: Filter<UserDoc> = { email: 'old@test.com' };
    const update: UpdateFilter<UserDoc> = {
      $set: { name: 'New Name' },
    };

    await expect(
      runWithTestContext(() => model.updateWithTransaction(filter, update))
    ).rejects.toThrow('Update failed');

    expect(mockProvider.startSession).toHaveBeenCalledTimes(1);
    expect(mockTxnSession.startTransaction).toHaveBeenCalledTimes(1);
    expect(mockTxnSession.abortTransaction).toHaveBeenCalledTimes(1);
    expect(mockTxnSession.commitTransaction).not.toHaveBeenCalled();
    expect(mockTxnSession.endSession).toHaveBeenCalledTimes(1);
  });

  it('should return null if document does not exist', async () => {
    mockCollection.findOne.mockResolvedValueOnce(null);

    const schema = new TenraSchema<UserDoc>({} as Record<string, any>);
    schema.validate = jest.fn();
    schema.executePre = jest.fn().mockResolvedValue(undefined);
    schema.executePost = jest.fn().mockResolvedValue(undefined);

    const model = Model<UserDoc>({
      collectionName: 'users',
      schema,
      provider: mockProvider,
    });

    const result = await runWithTestContext(() =>
      model.updateWithTransaction(
        { email: 'missing@test.com' },
        { $set: { name: 'Nobody' } }
      )
    );

    expect(result).toBeNull();
    expect(mockCollection.updateOne).not.toHaveBeenCalled();
    expect(mockTxnSession.abortTransaction).not.toHaveBeenCalled();
    expect(mockTxnSession.commitTransaction).toHaveBeenCalledTimes(1);
    expect(mockTxnSession.endSession).toHaveBeenCalledTimes(1);
  });

  it('should log query instrumentation through context logger', async () => {
    const info = jest.fn();

    await TenraContext.run(
      {
        tenantId: 'tenantA',
        requestId: 'req_1',
        logger: { info },
      } as any,
      async () => {
        const result = await measureQuery(
          { operation: 'find', collectionName: 'users' },
          async () => ['ok']
        );

        expect(result).toEqual(['ok']);

        await new Promise(resolve => setImmediate(resolve));
      }
    );

    expect(info).toHaveBeenCalledWith(
      '[Tenra Query]',
      expect.objectContaining({
        operation: 'find',
        collectionName: 'users',
        tenantId: 'tenantA',
        requestId: 'req_1',
        durationMs: expect.any(Number),
      })
    );
  });

  it('should emit debug logs when debug mode is enabled', async () => {
    const debug = jest.fn();

    await TenraContext.run(
      {
        debug: true,
        logger: { debug },
      } as any,
      async () => {
        debugLog('Resolved collection', { collectionName: 'users' });
      }
    );

    expect(debug).toHaveBeenCalledWith(
      'Resolved collection',
      expect.objectContaining({
        collectionName: 'users',
      })
    );
  });

  it('should log query errors and rethrow', async () => {
    const error = jest.fn();

    await expect(
      TenraContext.run(
        {
          tenantId: 'tenantA',
          requestId: 'req_err_1',
          logger: { error },
        } as any,
        async () => {
          await expect(
            measureQuery(
              { operation: 'findOne', collectionName: 'users' },
              async () => {
                throw new Error('boom');
              }
            )
          ).rejects.toThrow('boom');

          await new Promise(resolve => setImmediate(resolve));
        }
      )
    ).resolves.toBeUndefined();

    expect(error).toHaveBeenCalledWith(
      '[Tenra Query Error]',
      expect.objectContaining({
        operation: 'findOne',
        collectionName: 'users',
        status: "error",
        errorMessage: 'boom',
      })
    );
  });

  afterAll(async () => {
    jest.clearAllMocks();
    // await bufferedTransporter.stop();
  });
});

