import { MultiTenantManager } from '../MultiTenantManager';
import type { AmbitenConfig } from '../../types/index';
import type { TenantConfigResolver } from '../../types';

export interface InitMultiTenancyOptions {
  lazy?: boolean;
  config?: AmbitenConfig['logger'];
  tenantConfigResolver?: TenantConfigResolver;
}

export const initMultiTenancy = async (
  tenants: Record<string, string>,
  options: InitMultiTenancyOptions = {}
): Promise<void> => {
  const {
    lazy = false,
    config,
    tenantConfigResolver
  } = options;

  if (tenantConfigResolver) {
    MultiTenantManager.setTenantConfigResolver(
      tenantConfigResolver
    );
  }

  for (const [tenantId, uri] of Object.entries(tenants)) {
    if (
      !uri ||
      typeof uri !== 'string' ||
      !uri.startsWith('mongodb')
    ) {
      throw new Error(
        `Invalid MongoDB URI for tenant "${tenantId}": ${uri}`
      );
    }

    if (MultiTenantManager.hasTenant(tenantId)) {
      config?.logger?.warn?.(
        `Tenant "${tenantId}" is already registered. Skipping.`
      );
      continue;
    }

    if (lazy) {
      MultiTenantManager.registerLazyTenant(
        tenantId,
        uri
      );
      continue;
    }

    await MultiTenantManager.registerTenant(
      tenantId,
      uri
    );
  }
};