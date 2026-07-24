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