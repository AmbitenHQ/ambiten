/* eslint-disable @typescript-eslint/no-require-imports */
import {
	MongoClient,
	Db,
	Document,
	Collection,
	TopologyClosedEvent,
	TopologyOpeningEvent,
	ClientSession
} from 'mongodb';
import 'dotenv/config';
import type {
	TenraClientConfig,
	BootstrapClient,
	ModelContext,
	TenraResolvedClientScope,
	TenraContextState
} from '../types';
import {
	ErrorType,
	createTenraError
} from '../utils';
import { MultiTenantManager, TenantConfig } from '../tanancy';
import { TenraContext } from '../context';
import type { Transporter } from '@tenra/logger';

const TenraSymbol = Symbol.for('Tenra:default');

type ClusterInfo =
	| { type: 'sharded' }
	| { type: 'replicaSet'; setName?: string; hosts?: string[] }
	| { type: 'standalone' };

/**
 * TenraClient is a MongoDB client wrapper that provides a simplified interface
 * for connecting to and interacting with MongoDB databases.
 */
export class TenraClient implements BootstrapClient {
	private _uri!: string | undefined;
	private _client?: MongoClient | null;
	private _db?: Db | null;
	private collectionRef?: Collection<any>;
	private _connected = false;

	private readonly _defaultDbName: string;
	private _overrideDbName?: string;

	private static instances: Map<string, BootstrapClient> = new Map();
	private static defaultUri = 'mongodb://127.0.0.1:27017';

	constructor(private readonly _opts: TenraClientConfig) {
		this._uri = _opts.uri || process.env.MONGO_URI || TenraClient.defaultUri;
		this._defaultDbName =
			_opts?.options?.dbName ||
			process.env.DB_NAME ||
			'Tenra_default_db';

		this._client = new MongoClient(this._uri!, {
			directConnection: true,
			minPoolSize: 5,
			maxPoolSize: 50,
			serverSelectionTimeoutMS: 5000
		});

		this._db = this._client.db(this._opts.options?.dbName);
		this.ensureMongoDependency();
	}

	static init(opts?: Partial<TenraClientConfig>): TenraClient {
		const key = String(TenraSymbol);
		const existing = this.instances.get(key);
		if (existing) {
			return existing as TenraClient;
		}

		const client = createTenraClientModule({
			uri: opts?.uri ?? this.defaultUri ?? process.env.MONGO_URI,
			options: { dbName: opts?.options?.dbName },
			tenantResolver: opts?.tenantResolver
		});

		this.instances.set(key, client);
		return client;
	}

	private ensureMongoDependency(): void {
		try {
			const { MongoClient } = require('mongodb');
			void MongoClient;
		} catch {
			console.error(
				'\n❌ Missing peer dependency: "mongodb".\n' +
				'Please install it in your project before continuing:\n\n' +
				'   npm i mongodb\n'
			);
			process.exit(1);
		}
	}

	/**
	 * Resolution order:
	 * 1. explicit ctx.db
	 * 2. tenant-aware db resolution
	 * 3. explicit ctx.dbName on base client
	 * 4. mutable override dbName
	 * 5. default dbName
	 */
	async db(ctx?: ModelContext): Promise<Db> {
		if (ctx?.db) {
			return ctx.db;
		}

		if (ctx?.tenantId) {
			const resolver = this._opts.tenantResolver;
			if (!resolver) {
				throw new Error(
					'Multi-tenancy not enabled. Provide tenantResolver to TenraClient or avoid passing tenantId.'
				);
			}

			const tenantClient = await resolver.getClient(ctx.tenantId);
			if (!tenantClient) {
				throw new Error(`Tenant "${ctx.tenantId}" is not registered.`);
			}

			const resolvedTenantDbName =
				ctx.dbName ??
				MultiTenantManager.getTenantDbName(ctx.tenantId) ??
				this._defaultDbName;

			return tenantClient.db(resolvedTenantDbName);
		}

		if (!this._client || !this._connected) {
			const message = 'TenraClient not connected. call connect() first.';

			throw createTenraError(
				ErrorType.CONNECTION_ERROR,
				message,
				{
					details: {
						operation: 'db'
					}
				}
			);
		}

		if (ctx?.dbName) {
			return this._client.db(ctx.dbName);
		}

		if (this._overrideDbName) {
			return this._client.db(this._overrideDbName);
		}

		return this._client.db(this._defaultDbName);
	}

	static async db(ctx?: ModelContext): Promise<Db> {
		return this.init().db(ctx);
	}

	validateUri(uri: string): void {
		if (!uri || typeof uri !== 'string') {
			const message = 'Missing MongoDB URI. Set MONGODB_URI (or pass uri explicitly).';

			throw createTenraError(
				ErrorType.VALIDATION_ERROR,
				message,
				{
					details: {
						operation: 'validateUri',
						providedUri: uri,
					}
				}
			);
		}

		if (!/^mongodb(\+srv)?:\/\//.test(uri)) {
			const message = `Invalid MongoDB URI "${uri}". It must start with "mongodb://" or "mongodb+srv://".`;

			throw createTenraError(
				ErrorType.VALIDATION_ERROR,
				message,
				{
					details: {
						operation: 'validateUri',
						providedUri: uri,
					}
				}
			);
		}
	}

	async connect(): Promise<this> {
		this.validateUri(this._opts.uri!);

		if (!this._client) {
			this._client = new MongoClient(this._opts.uri!);
		}

		if (!this._connected) {
			await this._client.connect();
			this._connected = true;
		}

		return this;
	}

	async client(ctx?: ModelContext): Promise<MongoClient> {
		if (ctx?.tenantId) {
			const resolver = this._opts.tenantResolver;

			if (!resolver) {
				throw new Error(
					'Multi-tenancy not enabled. Provide tenantResolver to TenraClient or avoid passing tenantId.'
				);
			}

			const tenantClient = await resolver.getClient(ctx.tenantId);

			if (!tenantClient) {
				throw new Error(`Tenant "${ctx.tenantId}" is not registered.`);
			}

			return tenantClient;
		}

		if (!this._client) {
			throw new Error('Client not initialized. Call `connect()` first.');
		}

		return this._client;
	}

	async useCollection(collectionName: string): Promise<Collection<any>> {
		if (!collectionName || typeof collectionName !== 'string' || !collectionName.trim()) {
			throw new Error('Collection name is required.');
		}

		if (!this._client) {
			throw new Error('Client not initialized. Call `connect()` first.');
		}

		const scope = this.resolveClientScope({ collectionName });
		const db = this._client.db(scope.dbName);

		if (!db || typeof db.collection !== 'function') {
			throw new Error('Database name is required in client options.');
		}

		const collection = db.collection(scope.collectionName!);
		this.collectionRef = collection;

		return collection;
	}

	async collection<T extends Document = Document>(
		collectionName: string,
		ctx?: ModelContext
	): Promise<Collection<T>> {
		const db = await this.db(ctx);
		return db.collection<T>(collectionName);
	}

	async getCollection<T extends Document>(
		collectionName: string,
		ctx?: ModelContext
	): Promise<Collection<T>> {
		if (!this._client || typeof (this._client as any).db !== 'function') {
			return {
				toString: () => collectionName
			} as unknown as Collection<T>;
		}

		return this.collection<T>(collectionName, ctx);
	}

	async getClusterInfo(): Promise<ClusterInfo> {
		if (!this._client) {
			throw new Error('Client not initialized. Call `connect()` first.');
		}

		const dbName = this._opts?.options?.dbName;

		if (!dbName) {
			throw new Error('Database name is required in client options.');
		}

		const helloResult = await this._client
			.db(dbName)
			.admin()
			.command({ hello: 1 })

		if (helloResult?.msg === 'isdbgrid') {
			console.log('MongoDB is running in a sharded cluster.');
			return { type: 'sharded' };
		}

		if (helloResult?.setName || helloResult?.hosts) {
			console.log('MongoDB is running as a replica set.');
			return {
				type: 'replicaSet',
				setName: helloResult.setName,
				hosts: helloResult.hosts
			};
		}

		console.log('MongoDB is running as a standalone instance.');
		return { type: 'standalone' };
	}

	/**
 * Resolves database + session + runtime binding
 */
	static async resolveRuntime() {
		const ctx = TenraContext.get();

		if (!ctx?.tenantId) {
			throw new Error("Tenant not resolved in context.");
		}

		const tenant = MultiTenantManager.getTenant(ctx.tenantId);

		if (!tenant) {
			throw new Error(`Tenant not found: ${ctx.tenantId}`);
		}

		const db = this.resolveDbFromTenant(tenant, ctx);

		return {
			db,
			session: ctx?.session,
		};
	}

	/**
	 * Mutable legacy helper. Prefer withDatabase() or withScope() in request-safe flows.
	 */
	async useDatabase(dbName: string): Promise<{ db: Db; client: MongoClient }> {
		if (!dbName) {
			throw new Error('Database name is required.');
		}

		const client = await this.client();
		this._overrideDbName = dbName;

		return {
			db: client.db(dbName),
			client
		};
	}

	withDatabase(dbName: string): BootstrapClient {
		return {
			db: async (ctx?: ModelContext) => {
				const merged: ModelContext = { ...ctx, dbName: ctx?.dbName ?? dbName };
				return this.db(merged);
			},
			connect: async () => {
				await this.connect();
				return this;
			},
			client: async (ctx?: ModelContext) => {
				const merged: ModelContext = { ...ctx, dbName: ctx?.dbName ?? dbName };
				return this.client(merged);
			},
			collection: async (collectionName: string, ctx?: ModelContext) => {
				const merged: ModelContext = { ...ctx, dbName: ctx?.dbName ?? dbName };
				return this.collection(collectionName, merged);
			},
			startSession: async (ctx?: ModelContext) => {
				const merged: ModelContext = {
					...ctx, dbName: ctx?.dbName ?? dbName, session: ctx?.session
				}
				return this.startSession(merged)
			},
			close: async () => {
				await this.close();
			}
		};
	}

	/**
 * Resolves the active database name.
 *
 * @param overrideDbName - Optional database override.
 * @returns The resolved database name.
 * @throws {Error} When no database name can be resolved.
 */
	private resolveDbName(overrideDbName?: string): string {
		return this.resolveClientScope({ dbName: overrideDbName }).dbName;
	}

	/**
 * Resolves the active client execution scope by combining explicit method
 * arguments, active Tenra runtime context, and client-level defaults.
 *
 * Resolution priority:
 * 1. Explicit method arguments
 * 2. Active Tenra runtime context
 * 3. Client configuration
 * 4. Client defaults
 *
 * This method does not mutate runtime context or client configuration.
 *
 * @param input - Optional scope overrides for database, collection, and session.
 * @returns The resolved execution scope for client-level operations.
 * @throws {Error} When no database name can be resolved.
 */
	private resolveClientScope(input: {
		dbName?: string;
		collectionName?: string;
		session?: ClientSession;
	} = {}): TenraResolvedClientScope {
		const ctx = TenraContext.get();

		const dbName =
			input.dbName ??
			ctx.dbName ??
			this._opts?.options?.dbName ??
			this._defaultDbName;

		if (!dbName) {
			throw new Error('Database name is required in client options.');
		}

		const collectionName =
			input.collectionName ??
			ctx.collectionName;

		return {
			tenantId: ctx.tenantId,
			requestId: ctx.requestId,
			dbName,
			collectionName: collectionName?.trim() || undefined,
			session: input.session ?? ctx.session
		};
	}

	private static resolveDbFromTenant(
		tenant: TenantConfig,
		ctx: TenraContextState
	): Db {
		if (!tenant?.client) {
			throw new Error(`Tenant "${ctx?.tenantId}" has no MongoDB client.`);
		}

		const dbName = ctx?.dbName ?? tenant.dbName;

		if (!dbName) {
			throw new Error(
				`Database name not resolved for tenant "${ctx?.tenantId}".`
			);
		}

		return tenant.client.db(dbName);
	};

	async withContext<R>(
		context: {
			tenantId?: string;
			requestId?: string;
			dbName?: string;
			collectionName?: string;
			session?: ClientSession;
		},
		callback: () => Promise<R>
	): Promise<R> {
		return TenraContext.run(
			{
				tenantId: context.tenantId,
				requestId: context.requestId,
				dbName: context.dbName,
				collectionName: context.collectionName,
				session: context.session
			},
			callback
		);
	}

	private logWithContext(
		level: 'info' | 'warn' | 'error',
		message: string,
		meta: Record<string, unknown> = {}
	): void {
		const ctx = TenraContext.get();

		const enrichedMeta = {
			requestId: ctx.requestId,
			tenantId: ctx.tenantId,
			...ctx.loggerMeta,
			...meta
		};

		this._opts.options?.config?.logger?.[level]?.(message, enrichedMeta);
	}

	withTenant(tenantId: string): BootstrapClient {
		return {
			db: async (ctx?: ModelContext) => {
				const merged: ModelContext = { ...ctx, tenantId: ctx?.tenantId ?? tenantId };
				return this.db(merged);
			},
			connect: async () => {
				await this.connect();
				return this;
			},
			client: async (ctx?: ModelContext) => {
				const merged: ModelContext = { ...ctx, tenantId: ctx?.tenantId ?? tenantId };
				return this.client(merged);
			},
			collection: async (collectionName: string, ctx?: ModelContext) => {
				const merged: ModelContext = { ...ctx, tenantId: ctx?.tenantId ?? tenantId };
				return this.collection(collectionName, merged);
			},
			startSession: async (ctx: ModelContext) => {
				const merged: ModelContext = { ...ctx, tenantId: ctx.tenantId ?? tenantId }
				return this.startSession(merged)
			},
			close: async () => {
				await this.close();
			}
		};
	}

	withScope(scope: { tenantId?: string; dbName?: string }): BootstrapClient {
		return {
			db: async (ctx?: ModelContext) => {
				const merged: ModelContext = {
					...ctx,
					tenantId: ctx?.tenantId ?? scope.tenantId,
					dbName: ctx?.dbName ?? scope.dbName
				};
				return this.db(merged);
			},
			connect: async () => {
				await this.connect();
				return this;
			},
			client: async (ctx?: ModelContext) => {
				const merged: ModelContext = {
					...ctx,
					tenantId: ctx?.tenantId ?? scope.tenantId,
					dbName: ctx?.dbName ?? scope.dbName
				};
				return this.client(merged);
			},
			collection: async (collectionName: string, ctx?: ModelContext) => {
				const merged: ModelContext = {
					...ctx,
					tenantId: ctx?.tenantId ?? scope.tenantId,
					dbName: ctx?.dbName ?? scope.dbName
				};
				return this.collection(collectionName, merged);
			},
			startSession: async (ctx: ModelContext) => {
				const merged: ModelContext = {
					...ctx,
					tenantId: ctx?.tenantId ?? scope.tenantId,
					dbName: ctx?.dbName ?? scope.dbName
				};
				return this.startSession(merged)
			},
			close: async () => {
				await this.close();
			}
		};
	}

	resetDatabase(): void {
		this._overrideDbName = undefined;
	}

	async startSession(ctx?: ModelContext): Promise<ClientSession> {
		const client = await this.client(ctx);
		return client.startSession();
	}

	async dropCollection(
		collectionName?: string,
		ctx?: ModelContext
	): Promise<void> {
		if (!this._client && !ctx?.db) {
			throw createTenraError(
				ErrorType.CONNECTION_ERROR,
				'Client not initialized. Call `connect()` first.',
				{
					details: {
						operation: 'dropCollection',
						providedCollectionName: collectionName
					}
				}
			);
		}

		const resolvedCollectionName =
			collectionName?.trim() ||
			this.collectionRef?.collectionName;

		if (!resolvedCollectionName) {
			throw createTenraError(
				ErrorType.VALIDATION_ERROR,
				'Collection name is required.',
				{
					details: {
						operation: 'dropCollection',
						providedCollectionName: collectionName
					}
				}
			);
		}

		const db = ctx?.db ?? this._client!.db(this.resolveDbName(ctx?.dbName));
		await db.collection(resolvedCollectionName).drop();
	}

	async dropDatabase(ctx?: ModelContext): Promise<boolean> {
		if (!this._client && !ctx?.db) {
			throw createTenraError(
				ErrorType.CONNECTION_ERROR,
				'Client not initialized. Call `connect()` first.',
				{
					details: {
						operation: 'dropDatabase'
					}
				}
			);
		}

		const db =
			ctx?.db ??
			this._client!.db(this.resolveDbName(ctx?.dbName));

		const result = await db.dropDatabase();
		return result === undefined ? true : result;
	}

	async close(): Promise<void> {
		if (this._client) {
			await this._client.close?.();
		}

		this._client = null;
		this._db = null;
		this._connected = false;

		console.log('[info]: Disconnected from MongoDB');
	}

	async disconnect(): Promise<void> {
		await this.close();
	}

	isConnected(): boolean {
		return this._connected;
	}

	static handleTopologyEvent(event: TopologyOpeningEvent | TopologyClosedEvent): void {
		if (event instanceof TopologyOpeningEvent) {
			console.log(`Topology opened: ${event.topologyId}`);
		} else if (event instanceof TopologyClosedEvent) {
			console.log(`Topology closed: ${event.topologyId}`);
		} else {
			console.warn(`[warning]: Unknown topology event: ${event}`);
		}
	};

	static async handleLogBatch(
		batch: Array<TopologyOpeningEvent | TopologyClosedEvent>,
		transporter?: Pick<Transporter, 'write'>
	): Promise<void> {
		if (!Array.isArray(batch) || batch.length === 0) {
			console.warn('[warning]: Received an empty log batch or invalid format.');
			return;
		}

		const ctx = TenraContext.get();

		this.handleTopologyEvent(batch[0]);

		const remaining = batch.slice(1);

		if (remaining.length === 0) return;

		if (!transporter) {
			console.warn(
				`[warning]: No transporter provided; ${remaining.length} topology event(s) will not be processed.`
			);
			return;
		}

		const writes = remaining.map((event) => {
			const eventName = event.constructor?.name ?? 'TopologyEvent';

			const eventType = eventName.toLowerCase().includes('opening')
				? 'opening'
				: eventName.toLowerCase().includes('closed')
					? 'closed'
					: 'unknown';

			const message = `Topology event: ${eventName}`;

			return transporter.write(
				{
					level: 'info',
					timestamp: new Date().toISOString(),
					message,
					source: 'TenraTopology',
					context: {
						requestId: ctx?.requestId,
						tenantId: ctx?.tenantId,
						collectionName: ctx?.collectionName,
						dbName: ctx?.dbName,
					},
					meta: {
						eventType,
						topologyId: event.topologyId,
					},
				},
				message
			);
		});

		await Promise.all(writes);
	}
}

export function createTenraClientModule(opts: TenraClientConfig) {
	return new TenraClient(opts);
}

