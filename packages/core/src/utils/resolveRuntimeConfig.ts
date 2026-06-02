import type { ClientSession } from 'mongodb';
import { AmbitenContext } from '../context';
import { resolveAmbitenOption } from './resolveAmbitenOption';

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
	const ctx = AmbitenContext.get();

	return {
		tenantId: resolveAmbitenOption([
			input.methodTenantId,
			ctx?.tenantId,
			input.modelTenantId
		]),
		dbName: resolveAmbitenOption([
			input.methodDbName,
			ctx?.dbName,
			input.modelDbName,
			input.clientDbName
		]),
		collectionName: resolveAmbitenOption([
			input.methodCollectionName,
			ctx?.collectionName,
			input.modelCollectionName
		]),
		session: resolveAmbitenOption([
			input.methodSession,
			ctx?.session,
			input.modelSession
		]),
		requestId: ctx?.requestId,
		loggerMeta: ctx?.loggerMeta
	};
}