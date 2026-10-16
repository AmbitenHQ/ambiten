import { ObjectId } from 'mongodb';
import type { Db, Document, MongoClient } from 'mongodb';
import { AmbitenContext } from '../../../context/ambitenContext';
import { Schema } from '../../../lib-core/schema/ambitenSchema';
import { Model } from '../../../lib-core/model/model';
import { MultiTenantManager } from '../../../tanancy/MultiTenantManager';
import type { DbProvider } from '../../../types';

// This suite does not require a Redis server.
jest.mock('../../../redis-manager', () => ({
  redis: {
    scan: jest.fn().mockResolvedValue(['0', []]),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(0),
  },
}));

describe('Schema runtime defaults', () => {
  it('creates a Date using $runtime now', async () => {
    const schema = Schema.create<Document>({
      createdAt: {
        type: 'date',
        required: true,
        default: {
          $runtime: 'now',
        },
      },
    });

    const document: Document = {};

    await schema.validateAsync(document);

    expect(document.createdAt).toBeInstanceOf(Date);
  });

  it('creates UUID defaults', async () => {
    const schema = Schema.create<Document>({
      id: {
        type: 'string',
        default: {
          $runtime: 'uuid',
        },
      },
    });

    const first: Document = {};
    const second: Document = {};

    await schema.validateAsync(first);
    await schema.validateAsync(second);

    expect(first.id).toEqual(expect.any(String));
    expect(second.id).toEqual(expect.any(String));
    expect(first.id).not.toBe(second.id);
  });

  it('resolves tenantId from AmbitenContext', async () => {
    const schema = Schema.create<Document>({
      tenantId: {
        type: 'string',
        default: {
          $runtime: 'context',
          key: 'tenantId',
        },
      },
    });

    const document: Document = {};

    await AmbitenContext.run(
      {
        tenantId: 'tenant-a',
      },
      async () => {
        await schema.validateAsync(document);
      },
    );

    expect(document.tenantId).toBe('tenant-a');
  });

  it('fails when a requested context value is unavailable', async () => {
    const schema = Schema.create<Document>({
      tenantId: {
        type: 'string',
        default: {
          $runtime: 'context',
          key: 'tenantId',
        },
      },
    });

    await expect(
      schema.validateAsync({}),
    ).rejects.toThrow(/context/i);
  });

  it('does not share object or array defaults across documents', async () => {
    const schema = Schema.create<Document>({
      tags: {
        type: 'array',
        default: [],
      },
      metadata: {
        type: 'object',
        default: {},
      },
    });

    const first: Document = {};
    const second: Document = {};

    await schema.validateAsync(first);
    await schema.validateAsync(second);

    first.tags.push('one');
    first.metadata.changed = true;

    expect(second.tags).toEqual([]);
    expect(second.metadata).toEqual({});
    expect(first.tags).not.toBe(second.tags);
    expect(first.metadata).not.toBe(second.metadata);
  });

  it('rejects unknown runtime defaults immediately', () => {
    expect(() =>
      Schema.create<Document>({
        createdAt: {
          type: 'date',
          default: {
            $runtime: 'tomorrow',
          } as any,
        },
      }),
    ).toThrow(/Unsupported schema runtime default/);
  });

  it('rejects arbitrary context keys', () => {
    expect(() =>
      Schema.create<Document>({
        secret: {
          type: 'string',
          default: {
            $runtime: 'context',
            key: 'password',
          } as any,
        },
      }),
    ).toThrow(/tenantId, requestId, dbName, collectionName/);
  });
});

describe('Model integration', () => {
  afterEach(() => {
    MultiTenantManager.clearTenants();
    MultiTenantManager.clearTenantConfigResolver();
    jest.restoreAllMocks();
  });

  it('applies runtime defaults while creating a document for a registered tenant', async () => {
    const tenantId = 'tenant-a';
    const dbName = 'tenant_a';
    const insertedId = new ObjectId();

    const insertOne = jest.fn().mockResolvedValue({
      acknowledged: true,
      insertedId,
    });

    const collection = jest.fn().mockReturnValue({
      insertOne,
    });

    const fakeDb = {
      databaseName: dbName,
      collection,
    } as unknown as Db;

    const clientDb = jest.fn().mockReturnValue(fakeDb);

    const fakeClient = {
      db: clientDb,
    } as unknown as MongoClient;

    // Supplying a provider prevents construction of the default client.
    const provider: DbProvider = {
      db: jest.fn().mockResolvedValue(fakeDb),
    };

    MultiTenantManager.clearTenants();
    MultiTenantManager.clearTenantConfigResolver();

    // Injecting a client registers the tenant without opening a connection.
    await MultiTenantManager.registerTenant(
      tenantId,
      `mongodb://127.0.0.1:27017/${dbName}`,
      {
        dbName,
        client: fakeClient,
      },
    );

    const schema = Schema.create<Document>({
      name: {
        type: 'string',
        required: true,
      },
      email: {
        type: 'string',
        required: true,
      },
      createdAt: {
        type: 'date',
        required: true,
        default: {
          $runtime: 'now',
        },
      },
      tenantId: {
        type: 'string',
        required: true,
        default: {
          $runtime: 'context',
          key: 'tenantId',
        },
      },
      requestId: {
        type: 'string',
        required: true,
        default: {
          $runtime: 'context',
          key: 'requestId',
        },
      },
    });

    const userModel = Model<Document>({
      collectionName: 'users',
      schema,
      provider,
    });

    const user = await AmbitenContext.run(
      {
        tenantId,
        requestId: 'req-1',
        dbName,
      },
      async () =>
        userModel.create({
          name: 'Test',
          email: 'test@example.com',
        }),
    );

    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.tenantId).toBe(tenantId);
    expect(user.requestId).toBe('req-1');

    expect(clientDb).toHaveBeenCalledWith(dbName);
    expect(collection).toHaveBeenCalledWith('users');
    expect(insertOne).toHaveBeenCalledTimes(1);

    expect(insertOne.mock.calls[0][0]).toEqual(
      expect.objectContaining({
        name: 'Test',
        email: 'test@example.com',
        createdAt: expect.any(Date),
        tenantId,
        requestId: 'req-1',
      }),
    );
  });
});