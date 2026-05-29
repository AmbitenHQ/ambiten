import { TenraContext } from '../context';

export function debugLog(
  message: string,
  meta: Record<string, any> = {}
): void {
  if (!TenraContext.isDebug()) return;

  const logger = TenraContext.getLogger();
  const loggerMeta = TenraContext.getLoggerMeta() ?? {};

  const payload = {
    tenantId: TenraContext.getTenantId(),
    requestId: TenraContext.getRequestId(),
    dbName: TenraContext.getDbName(),
    collectionName: TenraContext.getCollectionName(),
    ...loggerMeta,
    ...meta
  };

  if (logger?.debug) {
    logger.debug(message, payload);
    return;
  }

  console.debug(`[Tenra_DEBUG] ${message}`, payload);
}