/**
 * @author Emmanuel Nodolomwanyi - Ambiten Team
 * @package - @Ambiten/core
 * @version 1.0.0
 */

import { AmbitenClient } from './lib-core';

/**
 * Ambiten Core Library for Browser
 * This module provides core functionalities for Ambiten in a browser environment.
 * It includes database operations, configuration, and more.
 * @module Ambiten Core Browser Module
 * @version 1.0.0
 */

console.log('Ambiten Core Library Loaded for (Browser)');

declare global {
	interface Window {
		AmbitenClient: typeof AmbitenClient;
		Buffer: any;
	}
}

window.AmbitenClient = AmbitenClient;
window.Buffer = Buffer;



export * from './lib-core';
export { AmbitenBootstrapFactory } from './lib-core/bootstrap';
export * from './config';
export * from './graphql';
export * from './tanancy';
export * from './context';
export * from './plugins';
export * from './debug';
export { measureQueryForBrowser } from './instrumentation';
export * from './ambiten-cache';


export * from './utils/builders';
export * from './utils';
export * from './gc';
export * from './redis-manager';
export * from './types';
export type { AmbitenRuntime } from './types/ambiten-runtime-type';
export type { SchemaType } from './types/schema.type';
export type { Document } from './types/document';
export type { ErrorType } from './utils/error/errorTypes';