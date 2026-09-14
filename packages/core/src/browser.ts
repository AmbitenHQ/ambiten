/**
 * @author Emmanuel Nodolomwanyi - Ambiten Team
 * @package - @ambiten/core
 * @version 1.2.4
 */

import { AmbitenClient } from './lib-core';

/**
 * Ambiten Core Library for Browser
 * This module provides core functionalities for Ambiten in a browser environment.
 * It includes database operations, configuration, and more.
 * @module Ambiten Core Browser Module
 * @version 1.2.4
 */

const isCjs =
  typeof module !== 'undefined' &&
  typeof module.exports !== 'undefined';

console.log(
  `Ambiten Core Library Loaded (Browser) [${isCjs ? 'CJS' : 'ESM'}].`
);

declare global {
	interface Window {
		AmbitenClient: typeof AmbitenClient;
		Buffer: any;
	}
}

window.AmbitenClient = AmbitenClient;
window.Buffer = Buffer;



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

export * from './init-cli/generate.project';
export * from './middleware/index';
export * from './graphql/index';
export * from './utils/index';
export * from './utils/builders/index';
export * from './gc/index';
export * from './types/index';

export {
	createAmbitenClientModule,
	AmbitenClient,
	AmbitenModel,
	AmbitenSchema,
	AmbitenBootstrapFactory
} from './lib-core';

export {
	AmbitenContext,
	runManualTransaction,
	hasManualTransactionMethods
} from './context';

export { MultiTenantManager, initMultiTenancy } from './tanancy';
export { AmbitenGraphQL } from './graphql'

export { loadAmbitenConfig } from './config'
export { generateProject, generateProjectWithConfig } from './init-cli/generate.project';
export { measureQueryForBrowser } from './instrumentation';
export { applySoftDelete } from './plugins/softDelete/applySoftDelete';
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

export {
	Model,
	createSchema,
	createAmbitenError,
	AuthService,
	configureAmbitenContext,
	AmbitenModelRegistry,
	clearModelRegistryForTests,
	
} from './utils'

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
