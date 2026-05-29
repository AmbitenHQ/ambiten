/**
 * @author Emmanuel Nodolomwanyi - Tenra Team
 * @package - @tenra/core
 * @version 1.0.0
 */

import { TenraClient } from './lib-core';

/**
 * Tenra Core Library for Browser
 * This module provides core functionalities for Tenra in a browser environment.
 * It includes database operations, configuration, and more.
 * @module Tenra Core Browser Module
 * @version 1.0.0
 */

console.log('Tenra Core Library Loaded for (Browser)');

declare global {
	interface Window {
		TenraClient: typeof TenraClient;
		Buffer: any;
	}
}

window.TenraClient = TenraClient;
window.Buffer = Buffer;



export * from './lib-core';
export { TenraBootstrapFactory } from './lib-core/bootstrap';
export * from './config';
export * from './graphql';
export * from './tanancy';
export * from './context';
export * from './plugins';
export * from './debug';
export { measureQueryForBrowser } from './instrumentation';


export * from './utils/builders';
export * from './utils';
export * from './gc';
export * from './redis-manager';
export * from './types';
export type {}
export type { SchemaType } from './types/schema.type';
export type { Document } from './types/document';
export type { ErrorType } from './utils/error/errorTypes';