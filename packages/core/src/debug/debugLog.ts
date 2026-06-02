import { AmbitenContext } from '../context';

export function debugLog(
  message: string,
  meta: Record<string, any> = {}
): void {
  if (!AmbitenContext.isDebug()) return;

  const logger = AmbitenContext.getLogger();
  const loggerMeta = AmbitenContext.getLoggerMeta() ?? {};

  const payload = {
    tenantId: AmbitenContext.getTenantId(),
    requestId: AmbitenContext.getRequestId(),
    dbName: AmbitenContext.getDbName(),
    collectionName: AmbitenContext.getCollectionName(),
    ...loggerMeta,
    ...meta
  };

  if (logger?.debug) {
    logger.debug(message, payload);
    return;
  }

  console.debug(`[AMBITEN_DEBUG] ${message}`, payload);
}