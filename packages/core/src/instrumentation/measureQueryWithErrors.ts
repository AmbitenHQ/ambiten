import { performance } from 'perf_hooks';
import { TenraContext } from '../context/tenraContext';

export interface QueryInstrumentationMeta {
	operation: string;
	collectionName?: string;
	filter?: unknown;
	update?: unknown;
	pipeline?: unknown;
	documentCount?: number;
	extra?: Record<string, any>;
}

export async function measureQuery<T>(
	meta: QueryInstrumentationMeta,
	executor: () => Promise<T>
): Promise<T> {
	if (!TenraContext.hasActiveContext()) {
		throw new Error('[Tenra] Missing runtime context.');
	}

	const logger = TenraContext.getLogger();
	const observer = TenraContext.getObserver();
	const loggerMeta = TenraContext.getLoggerMeta() ?? {};

	const tenantId = TenraContext.getTenantId();
	const requestId = TenraContext.getRequestId();
	const dbName = TenraContext.getDbName();
	const collectionName =
		meta.collectionName ?? TenraContext.getCollectionName();

	const budgetAfterIncrement = TenraContext.incrementQueries();
	const start = performance.now();

	try {
		const result = await executor();

		const durationMs = Math.round((performance.now() - start) * 100) / 100;
		const budgetAfterTime = TenraContext.addQueryTime(durationMs);

		const payload = {
			operation: meta.operation,
			collectionName,
			durationMs,
			status: 'success',
			tenantId,
			requestId,
			dbName,
			filter: meta.filter,
			update: meta.update,
			pipeline: meta.pipeline,
			documentCount: meta.documentCount,
			queriesExecuted: budgetAfterIncrement.queriesExecuted,
			maxQueries: budgetAfterIncrement.maxQueries,
			totalBudgetUsed: budgetAfterTime.totalTimeMs,
			...loggerMeta,
			...(meta.extra ?? {})
		};

		setImmediate(() => {
			observer?.onQuery?.(payload);

			if (logger?.info) {
				logger.info('[Tenra Query]', payload);
			} else if (TenraContext.isDebug()) {
				console.log('[Tenra Query]', payload);
			}
		});

		return result;
	} catch (error: any) {
		const durationMs = Math.round((performance.now() - start) * 100) / 100;
		const budgetAfterTime = TenraContext.addQueryTime(durationMs);

		const payload = {
			operation: meta.operation,
			collectionName,
			durationMs,
			status: 'error',
			tenantId,
			requestId,
			dbName,
			filter: meta.filter,
			update: meta.update,
			pipeline: meta.pipeline,
			documentCount: meta.documentCount,
			queriesExecuted: budgetAfterTime.queriesExecuted,
			maxQueries: budgetAfterTime.maxQueries,
			totalBudgetUsed: budgetAfterTime.totalTimeMs,
			errorMessage: error?.message,
			errorName: error?.name,
			...loggerMeta,
			...(meta.extra ?? {})
		};

		setImmediate(() => {
			observer?.onQueryError?.({
				...payload,
				error
			});

			if (logger?.error) {
				logger.error('[Tenra Query Error]', payload);
			} else if (TenraContext.isDebug()) {
				console.error('[Tenra Query Error]', payload);
			}
		});

		throw error;
	}
};