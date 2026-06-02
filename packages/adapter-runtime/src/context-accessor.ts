import { AmbitenContext } from '@ambiten/core';
import type { AmbitenOperationMeta } from '@ambiten/core';

export interface AdapterRuntimeContextSnapshot {
  tenantId?: string;
  requestId?: string;
  dbName?: string;
  collectionName?: string;
  debug?: boolean;
  loggerMeta?: Record<string, unknown>;
  meta?: AmbitenOperationMeta;
}

export function getAdapterRuntimeContext(): AdapterRuntimeContextSnapshot {
  const ctx = AmbitenContext.get();

  return {
    tenantId: ctx.tenantId,
    requestId: ctx.requestId,
    dbName: ctx.dbName,
    collectionName: ctx.collectionName,
    debug: ctx.debug,
    loggerMeta: ctx.loggerMeta,
    meta: ctx.meta
  };
}