import { AmbitenContext } from '@ambiten/core';
import { resolveTenant } from '@ambiten/adapter-types';
import type {
  AmbitenRequestLike,
  AdapterContextOptions
} from '@ambiten/adapter-types';

function readHeader(
  req: AmbitenRequestLike,
  name: string
): string | undefined {
  const value = req.headers?.[name.toLowerCase()];
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export async function runWithAdapterContext<T>(
  req: AmbitenRequestLike,
  handler: () => T | Promise<T>,
  options: AdapterContextOptions = {}
): Promise<T> {
  const {
    tenancy,
    enableTransactions = false,
    requestIdHeader = 'x-request-id',
    dbNameHeader = 'x-db-name',
    collectionNameHeader = 'x-collection-name',
    resolvers
  } = options;

  const resolvedTenantId =
    resolvers?.tenantId
      ? await resolvers.tenantId(req)
      : tenancy
        ? await resolveTenant(req, tenancy)
        : undefined;

  if (tenancy && !resolvedTenantId) {
    throw new Error('Tenant resolution failed.');
  }

  if (resolvedTenantId && tenancy?.validate) {
    const isValid = await tenancy.validate(resolvedTenantId);
    if (!isValid) {
      throw new Error(`Invalid tenant ID: ${resolvedTenantId}`);
    }
  }

  const requestId =
    (resolvers?.requestId && await resolvers.requestId(req)) ??
    readHeader(req, requestIdHeader);

  const dbName =
    (resolvers?.dbName && await resolvers.dbName(req)) ??
    readHeader(req, dbNameHeader);

  const collectionName =
    (resolvers?.collectionName && await resolvers.collectionName(req)) ??
    readHeader(req, collectionNameHeader);

  const debug = resolvers?.debug
    ? await resolvers.debug(req)
    : undefined;

  const loggerMeta = resolvers?.loggerMeta
    ? await resolvers.loggerMeta(req)
    : undefined;

  const meta = resolvers?.meta
    ? await resolvers.meta(req)
    : undefined;

  const ctx = {
    tenantId: resolvedTenantId,
    requestId,
    dbName,
    collectionName,
    debug,
    loggerMeta,
    meta
  };

  if (enableTransactions) {
    return AmbitenContext.run(ctx, () =>
      AmbitenContext.withTransaction(async () => await handler())
    );
  }

  return AmbitenContext.run(ctx, async () => await handler());
}