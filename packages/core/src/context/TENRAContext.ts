import { AsyncLocalStorage } from 'node:async_hooks';
import type { ClientSession, MongoClient } from 'mongodb';
import {
	TenraContextState,
	TenraLoggerLike,
	TenraQueryObserver,
	TenraQuotaBudget,
	TenraQuotaBudgetInput
} from '../types';
import { runManualTransaction } from './helpers/runManualTransaction';

export interface TenraTransactionResolver {
	resolveClient: (
		tenantId?: string,
		dbName?: string
	) => Promise<MongoClient | undefined> | MongoClient | undefined;
}

const DEFAULT_TENRA_BUDGET: TenraQuotaBudget = {
	maxQueries: Infinity,
	queriesExecuted: 0,
	totalTimeMs: 0
};

class TenraContextManager {
	private readonly storage = new AsyncLocalStorage<TenraContextState>();
	private transactionResolver?: TenraTransactionResolver;

	run<T>(context: TenraContextState, callback: () => T): T {
		const parent = this.storage.getStore() ?? {};
		const merged: TenraContextState = {
			...parent,
			...context,
			budget: context.budget
				? this.normalizeBudget(context.budget)
				: parent.budget
					? this.normalizeBudget(parent.budget)
					: undefined
		};

		return this.storage.run(merged, callback);
	}

	get(): TenraContextState {
		return this.storage.getStore() ?? {};
	}

	hasActiveContext(): boolean {
		return this.storage.getStore() !== undefined;
	}

	set(patch: Partial<TenraContextState>): void {
		const current = this.storage.getStore();
		if (!current) return;
		Object.assign(current, patch);
	}

	clear(): void {
		const current = this.storage.getStore();
		if (!current) return;

		for (const key of Object.keys(current) as (keyof TenraContextState)[]) {
			delete current[key];
		}
	}

	configureTransactionResolver(resolver: TenraTransactionResolver): void {
		this.transactionResolver = resolver;
	}

	getTenantId(): string | undefined {
		return this.get().tenantId;
	}

	getRequestId(): string | undefined {
		return this.get().requestId;
	}

	getDbName(): string | undefined {
		return this.get().dbName;
	}

	getCollectionName(): string | undefined {
		return this.get().collectionName;
	}

	getSession(): ClientSession | undefined {
		return this.get().session;
	}

	getLogger(): TenraLoggerLike | undefined {
		return this.get().logger;
	}

	getLoggerMeta(): Record<string, any> | undefined {
		return this.get().loggerMeta;
	}

	getObserver(): TenraQueryObserver | undefined {
		return this.get().observer;
	}

	normalizeBudget(budget?: TenraQuotaBudgetInput): TenraQuotaBudget {
		return {
			maxQueries: budget?.maxQueries ?? DEFAULT_TENRA_BUDGET.maxQueries,
			queriesExecuted:
				budget?.queriesExecuted ?? DEFAULT_TENRA_BUDGET.queriesExecuted,
			totalTimeMs: budget?.totalTimeMs ?? DEFAULT_TENRA_BUDGET.totalTimeMs
		};
	}

	getBudget(): TenraQuotaBudget {
		const state = this.get();
		const normalized = this.normalizeBudget(state.budget);
		state.budget = normalized;
		return normalized;
	}

	setBudget(budget: TenraQuotaBudgetInput): void {
		const state = this.get();
		state.budget = this.normalizeBudget(budget);
	}

	assertQueryBudget(): void {
		const state = this.get();
		const budget = this.getBudget();

		if (budget.queriesExecuted >= budget.maxQueries) {
			throw new Error(
				`[Tenra] Tenant ${state.tenantId ?? 'unknown'} exceeded query budget for this request.`
			);
		}
	}

	incrementQueries(): TenraQuotaBudget {
		this.assertQueryBudget();
		const budget = this.getBudget();
		budget.queriesExecuted += 1;
		return budget;
	}

	addQueryTime(durationMs: number): TenraQuotaBudget {
		const budget = this.getBudget();
		budget.totalTimeMs += durationMs;
		return budget;
	}

	isDebug(): boolean {
		const ctx = this.get();
		return Boolean(
			ctx.debug ||
			process.env.TENRA_DEBUG === 'true' ||
			process.env.TENRA_DEBUG === '1'
		);
	}

	async withTransaction<T>(
		callback: (session: ClientSession) => Promise<T>
	): Promise<T> {
		const current = this.get();

		if (current.session) {
			return callback(current.session);
		}

		if (!this.transactionResolver) {
			throw new Error('TenraContext transaction resolver is not configured.');
		}

		const client = await this.transactionResolver.resolveClient(
			current.tenantId,
			current.dbName
		);

		if (!client) {
			throw new Error(
				`No MongoClient available for${
					current.tenantId ? ` tenant "${current.tenantId}"` : ' current context'
				}.`
			);
		}

		const session = client.startSession();

		if (typeof session.withTransaction === 'function') {
			try {
				let result!: T;

				await session.withTransaction(async () => {
					result = await this.run({ session }, () => callback(session));
					return result;
				});

				return result;
			} finally {
				await session.endSession();
			}
		}

		return this.run({ session }, () =>
			runManualTransaction(session, callback)
		);
	}

	hasTransactionResolver(): boolean {
		return Boolean(this.transactionResolver);
	}
}

export const TenraContext = new TenraContextManager();