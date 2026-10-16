/**
 * @author Emmanuel Nodolomwanyi - Ambiten Team
 * @package - @Ambiten/core
 * @version 1.2.4
 */

import { RedisService } from './redis-manager';

/**
 * Ambiten Core Library
 * This library provides core functionalities for Ambiten, ORM/ODM solution
 * for MongoDB in Node.js and Browser environments.
 * @module Ambiten Core Library
 * @version 1.2.4
 */

const isCjs =
	typeof module !== 'undefined' &&
	typeof module.exports !== 'undefined';

console.log(
	`Ambiten Core Library Loaded [${isCjs ? 'CJS' : 'ESM'}].`
);

export const initializeRedis = async (
	{ useRedis = false }: { useRedis?: boolean } = {}
) => {
	if (useRedis) {
		const redisClient = RedisService.getInstance();
		const client = await redisClient.getClient();

		if (!client.isOpen) {
			await client.connect();
		}
	}
};


export * from './lib-core/index';
export * from './lib-core/bootstrap/index';
export * from './config/index';
export * from './redis-manager/index';
export * from './tanancy/index';
export * from './context/index';
export * from './plugins/index';
export * from './instrumentation/index';
export * from './debug/index';
export * from './ambiten-cache/index';

export * from './init-cli/index';
export * from './middleware/index';
export * from './graphql/index';
export * from './utils/index';
export * from './utils/builders/index';
export * from './gc/index';
export * from './types/index';

export {
	createAmbitenClientModule,
	AmbitenClient,
} from './lib-core/ambitenClient';
export {
	AmbitenModel,
	Model
} from './lib-core/model';
export {
	AmbitenSchema,
	Schema
} from './lib-core/schema/ambitenSchema';
export { AmbitenBootstrapFactory } from './lib-core/bootstrap/ambitenBootstrap';
export { AmbitenContext } from './context/ambitenContext'
export {
	runManualTransaction,
	hasManualTransactionMethods
} from './context/index';

export { MultiTenantManager, initMultiTenancy } from './tanancy';
export { AmbitenGraphQL } from './graphql'

export { loadAmbitenConfig } from './config'
export { generateProject, generateProjectWithConfig } from './init-cli';
export { measureQueryForBrowser } from './instrumentation';
export { applySoftDelete } from './plugins';
export {
	AmbitenGC,
	startGarbageCollector,
	scheduleGarbageCollector,
	runGarbageCollector,
	runGarbageCollectorOnAllModels
} from './gc';
export { debugLog } from './debug'

export type {
	TenantConfig,
	RegisterTenantOptions,
	RegisteredTenantStatistics
} from './tanancy/MultiTenantManager';

export { createSchema } from './utils/builders/schema';
export { createAmbitenError } from './utils/error/ambitenError-handler';
export { configureAmbitenContext } from './utils/configureAmbitenContext';
export {
	AmbitenModelRegistry,
	clearModelRegistryForTests
} from './utils/ModelRegistry';
export { AuthService } from './utils/AuthUtils';

export type { GeneratedProjectResult } from './init-cli/generate.project';
export type { InitMultiTenancyOptions } from './tanancy/init/initMultiTenancy';
export type { SoftDeletableDocument, SoftDeleteOptions } from './plugins/softDelete/types'
export type { ErrorType } from './utils/error/errorTypes';
export type { GCOptions } from './gc/ambitenGC';
export type { GarbageCollectorScheduleOptions } from './gc/gcCron.node';

export type {
	AmbitenRuntime,
	BootstrapClient,
	AmbitenClientConfig,
	AmbitenResolvedClientScope,
	ModelContext,
	AmbitenModelOptions,
	ResolverObject,
	TenantConfigResolver,
	ResolvedTenantConfig,
	AmbitenGraphQLOptions,
	AmbitenGraphQLContext,
	QueryOptions,
	AmbitenContextState,
	SchemaType,
	Document,
	AmbitenMiddlewareHandler,
	AmbitenCacheStats,
	GCConfig,
	eventTypes,
	EventType
} from './types';
