import type { ClientSession } from 'mongodb';
import { TenraContext } from '../context';
import { resolveTenraOption } from './resolveTenraOption';

export interface RuntimeResolutionInput {
	methodTenantId?: string;
	methodDbName?: string;
	methodCollectionName?: string;
	methodSession?: ClientSession;

	modelTenantId?: string;
	modelDbName?: string;
	modelCollectionName?: string;
	modelSession?: ClientSession;

	clientDbName?: string;
}

export interface RuntimeResolutionOutput {
	tenantId?: string;
	dbName?: string;
	collectionName?: string;
	session?: ClientSession;
	requestId?: string;
	loggerMeta?: Record<string, any>;
}

export function resolveRuntimeConfig(
	input: RuntimeResolutionInput
): RuntimeResolutionOutput {
	const ctx = TenraContext.get();

	return {
		tenantId: resolveTenraOption([
			input.methodTenantId,
			ctx?.tenantId,
			input.modelTenantId
		]),
		dbName: resolveTenraOption([
			input.methodDbName,
			ctx?.dbName, 
			input.modelDbName,
			input.clientDbName
		]),
		collectionName: resolveTenraOption([
			input.methodCollectionName,
			ctx?.collectionName,
			input.modelCollectionName
		]),
		session: resolveTenraOption([
			input.methodSession,
			ctx?.session,
			input.modelSession
		]),
		requestId: ctx?.requestId,
		loggerMeta: ctx?.loggerMeta
	};
}