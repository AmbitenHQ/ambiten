import { TenraContext } from '@tenra/core';
import { resolveTenant } from '@tenra/adapter-types';
import type {
  TenraRequestLike,
  AdapterContextOptions
} from '@tenra/adapter-types';

function readHeader(
  req: TenraRequestLike,
  name: string
): string | undefined {
  const value = req.headers?.[name.toLowerCase()];
  if (!value) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

export async function runWithAdapterContext<T>(
  req: TenraRequestLike,
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
    return TenraContext.run(ctx, () =>
      TenraContext.withTransaction(async () => await handler())
    );
  }

  return TenraContext.run(ctx, async () => await handler());
}