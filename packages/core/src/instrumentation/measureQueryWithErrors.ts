import { performance } from 'perf_hooks';
import { AmbitenContext } from '../context/ambitenContext';

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
	if (!AmbitenContext.hasActiveContext()) {
		throw new Error('[Ambiten] Missing runtime context.');
	}

	const logger = AmbitenContext.getLogger();
	const observer = AmbitenContext.getObserver();
	const loggerMeta = AmbitenContext.getLoggerMeta() ?? {};

	const tenantId = AmbitenContext.getTenantId();
	const requestId = AmbitenContext.getRequestId();
	const dbName = AmbitenContext.getDbName();
	const collectionName =
		meta.collectionName ?? AmbitenContext.getCollectionName();

	const budgetAfterIncrement = AmbitenContext.incrementQueries();
	const start = performance.now();

	try {
		const result = await executor();

		const durationMs = Math.round((performance.now() - start) * 100) / 100;
		const budgetAfterTime = AmbitenContext.addQueryTime(durationMs);

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
				logger.info('[Ambiten Query]', payload);
			} else if (AmbitenContext.isDebug()) {
				console.log('[Ambiten Query]', payload);
			}
		});

		return result;
	} catch (error: any) {
		const durationMs = Math.round((performance.now() - start) * 100) / 100;
		const budgetAfterTime = AmbitenContext.addQueryTime(durationMs);

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
				logger.error('[Ambiten Query Error]', payload);
			} else if (AmbitenContext.isDebug()) {
				console.error('[Ambiten Query Error]', payload);
			}
		});

		throw error;
	}
};