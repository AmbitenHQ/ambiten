/**
 * @author Emmanuel Nodolomwanyi - Tenra Team
 * @package - @tenra/core
 * @version 1.0.0
 */

import { RedisService } from './redis-manager';

/**
 * Tenra Core Library
 * This library provides core functionalities for Tenra, ORM/ODM solution
 * for MongoDB in Node.js and Browser environments.
 * @module Tenra Core Library
 * @version 1.0.0
 */


console.log('Tenra Core Library Loaded. \n (Node.js environment detected.)');


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


export * from './lib-core';
export * from './lib-core/bootstrap';
export * from './config';
export * from './redis-manager';
export * from './tanancy';
export * from './context';
export * from './plugins';
export * from './instrumentation';
export * from './debug';

export * from './init-cli/generate.project';
export * from './middleware';
export * from './graphql';
export * from './utils';
export * from './utils/builders';
export * from './gc';
export * from './types';
export type { SchemaType } from './types/schema.type';
export type { Document } from './types/document';
export type { ErrorType } from './utils/error/errorTypes';