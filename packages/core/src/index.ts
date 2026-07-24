/**
 * @author Emmanuel Nodolomwanyi - Ambiten Team
 * @package - @Ambiten/core
 * @version 1.0.0
 */

import { RedisService } from './redis-manager';

/**
 * Ambiten Core Library
 * This library provides core functionalities for Ambiten, ORM/ODM solution
 * for MongoDB in Node.js and Browser environments.
 * @module Ambiten Core Library
 * @version 1.0.0
 */


console.log('Ambiten Core Library Loaded. \n (Node.js environment detected.)');


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

export * from './init-cli/generate.project';
export * from './middleware/index';
export * from './graphql/index';
export * from './utils/index';
export * from './utils/builders/index';
export * from './gc/index';
export * from './types/index';

export { AmbitenClient, createAmbitenClientModule } from './lib-core/ambitenClient';
export { AmbitenModel } from './lib-core/ambitenModelFactory';
export { AmbitenSchema } from './lib-core/ambitenSchema';
export { AmbitenBootstrapFactory } from './lib-core/bootstrap/ambitenBootstrap';
export { measureQueryForBrowser } from './instrumentation';

export type { AmbitenRuntime } from './types/ambiten-runtime-type';
export type { SchemaType } from './types/schema.type';
export type { Document } from './types/document';
export type { ErrorType } from './utils/error/errorTypes';