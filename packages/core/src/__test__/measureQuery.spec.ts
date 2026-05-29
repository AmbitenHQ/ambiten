import { TenraContext } from '../context/tenraContext';
import { measureQuery } from '../instrumentation';
// import { bufferedTransporter } from '../utils';

describe('measureQuery', () => {
	beforeEach(() => {
		jest.restoreAllMocks();
	});

	afterEach(async () => {
	 jest.clearAllMocks();
		// await bufferedTransporter.stop();
	});

	it('should throw when no active runtime context exists', async () => {
		await expect(
			measureQuery(
				{ operation: 'findOne' },
				async () => ({ ok: true })
			)
		).rejects.toThrow('[Tenra] Missing runtime context.');
	});

	it('should execute successfully, increment queries, add time, notify observer and logger', async () => {
		const onQuery = jest.fn();
		const logger = {
			info: jest.fn(),
			error: jest.fn()
		};

		await TenraContext.run(
			{
				tenantId: 'tenant-a',
				requestId: 'req-1',
				dbName: 'db-a',
				collectionName: 'users',
				logger,
				loggerMeta: { traceId: 'trace-123' },
				observer: { onQuery },
				budget: { maxQueries: 5 }
			},
			async () => {
				const result = await measureQuery(
					{
						operation: 'findOne',
						filter: { email: 'john@example.com' }
					},
					async () => ({ id: 1, email: 'john@example.com' })
				);

				expect(result).toEqual({ id: 1, email: 'john@example.com' });

				const budget = TenraContext.getBudget();
				expect(budget.queriesExecuted).toBe(1);
				expect(budget.totalTimeMs).toBeGreaterThanOrEqual(0);

				await new Promise(resolve => setImmediate(resolve));

				expect(onQuery).toHaveBeenCalledTimes(1);
				expect(onQuery).toHaveBeenCalledWith(
					expect.objectContaining({
						operation: 'findOne',
						collectionName: 'users',
						status: "success",
						tenantId: 'tenant-a',
						requestId: 'req-1',
						dbName: 'db-a',
						filter: { email: 'john@example.com' },
						queriesExecuted: 1,
						maxQueries: 5,
						traceId: 'trace-123'
					})
				);

				expect(logger.info).toHaveBeenCalledTimes(1);
				expect(logger.info).toHaveBeenCalledWith(
					'[Tenra Query]',
					expect.objectContaining({
						operation: 'findOne',
						status: "success",
						tenantId: 'tenant-a',
						queriesExecuted: 1,
						maxQueries: 5
					})
				);
			}
		);
	});

	it('should execute failure path, add time, notify onQueryError and logger.error', async () => {
		const onQueryError = jest.fn();
		const logger = {
			info: jest.fn(),
			error: jest.fn()
		};

		await TenraContext.run(
			{
				tenantId: 'tenant-b',
				requestId: 'req-2',
				dbName: 'db-b',
				collectionName: 'orders',
				logger,
				observer: { onQueryError },
				budget: { maxQueries: 5 }
			},
			async () => {
				const error = new Error('DB exploded');

				await expect(
					measureQuery(
						{
							operation: 'updateOne',
							filter: { id: '123' },
							update: { $set: { status: 'paid' } }
						},
						async () => {
							throw error;
						}
					)
				).rejects.toThrow('DB exploded');

				const budget = TenraContext.getBudget();
				expect(budget.queriesExecuted).toBe(1);
				expect(budget.totalTimeMs).toBeGreaterThanOrEqual(0);

				await new Promise(resolve => setImmediate(resolve));

				expect(onQueryError).toHaveBeenCalledTimes(1);
				expect(onQueryError).toHaveBeenCalledWith(
					expect.objectContaining({
						operation: 'updateOne',
						collectionName: 'orders',
						status: "error",
						tenantId: 'tenant-b',
						requestId: 'req-2',
						dbName: 'db-b',
						filter: { id: '123' },
						update: { $set: { status: 'paid' } },
						error,
						errorMessage: 'DB exploded',
						errorName: 'Error',
						queriesExecuted: 1,
						maxQueries: 5
					})
				);

				expect(logger.error).toHaveBeenCalledTimes(1);
				expect(logger.error).toHaveBeenCalledWith(
					'[Tenra Query Error]',
					expect.objectContaining({
						operation: 'updateOne',
						status: "error",
						tenantId: 'tenant-b',
						errorMessage: 'DB exploded'
					})
				);
			}
		);
	});

	it('should enforce query budget limit', async () => {
		await TenraContext.run(
			{
				tenantId: 'tenant-c',
				budget: {
					maxQueries: 1,
					queriesExecuted: 1,
					totalTimeMs: 0
				}
			},
			async () => {
				await expect(
					measureQuery(
						{ operation: 'find' },
						async () => [{ id: 1 }]
					)
				).rejects.toThrow(
					'[Tenra] Tenant tenant-c exceeded query budget for this request.'
				);
			}
		);
	});

	it('should normalize a partial budget safely', async () => {
		await TenraContext.run(
			{
				tenantId: 'tenant-d',
				budget: { maxQueries: 3 }
			},
			async () => {
				const budgetBefore = TenraContext.getBudget();

				expect(budgetBefore).toEqual({
					maxQueries: 3,
					queriesExecuted: 0,
					totalTimeMs: 0
				});

				await measureQuery(
					{ operation: 'findMany' },
					async () => [{ id: 1 }, { id: 2 }]
				);

				const budgetAfter = TenraContext.getBudget();
				expect(budgetAfter.queriesExecuted).toBe(1);
				expect(budgetAfter.maxQueries).toBe(3);
				expect(budgetAfter.totalTimeMs).toBeGreaterThanOrEqual(0);
			}
		);
	});
});