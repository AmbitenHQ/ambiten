import { TenraContext } from '@tenra/core';
import type { TenraOperationMeta } from '@tenra/core';

export interface AdapterRuntimeContextSnapshot {
  tenantId?: string;
  requestId?: string;
  dbName?: string;
  collectionName?: string;
  debug?: boolean;
  loggerMeta?: Record<string, unknown>;
  meta?: TenraOperationMeta;
}

export function getAdapterRuntimeContext(): AdapterRuntimeContextSnapshot {
  const ctx = TenraContext.get();

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