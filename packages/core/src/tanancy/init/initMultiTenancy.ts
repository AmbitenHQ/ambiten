import { MultiTenantManager } from "../MultiTenantManager";
import type { AmbitenConfig, TenantConfigResolver } from "../../types";

export interface InitMultiTenancyOptions {
  lazy?: boolean;
  config?: AmbitenConfig["logger"];
  tenantConfigResolver?: TenantConfigResolver;
}

export const initMultiTenancy = async (
  tenants: Record<string, string>,
  options: InitMultiTenancyOptions = {},
): Promise<void> => {
  const { lazy = false, config, tenantConfigResolver } = options;

  if (
    tenantConfigResolver !== undefined &&
    typeof tenantConfigResolver !== "function"
  ) {
    throw new Error("tenantConfigResolver must be a function.");
  }
  if (!tenants || typeof tenants !== "object" || Array.isArray(tenants)) {
    throw new Error("Tenants must be a tenant-to-URI map.");
  }

  // Validate the whole map before changing the registry or connecting any tenant.
  const seen = new Set<string>();
  const entries = Object.entries(tenants).map(([tenantId, uri]) => {
    const id = tenantId.trim();
    if (!id) {
      throw new Error("Tenant ID is required.");
    }
    if (seen.has(id)) {
      throw new Error(`Duplicate tenant ID after trimming: "${id}".`);
    }
    seen.add(id);
    if (
      typeof uri !== "string" ||
      !/^mongodb(?:\+srv)?:\/\//.test(uri.trim())
    ) {
      throw new Error(`Invalid MongoDB URI for tenant "${id}".`);
    }
    return [id, uri.trim()] as const;
  });

  if (tenantConfigResolver) {
    MultiTenantManager.setTenantConfigResolver(tenantConfigResolver);
  }

  // An empty static map is valid: a resolver can supply tenants on demand.
  for (const [tenantId, uri] of entries) {
    if (MultiTenantManager.hasTenant(tenantId)) {
      config?.logger?.warn?.(
        `Tenant "${tenantId}" is already registered. Skipping.`,
      );
      continue;
    }
    if (lazy) {
      MultiTenantManager.registerLazyTenant(tenantId, uri);
    } else {
      await MultiTenantManager.registerTenant(tenantId, uri);
    }
  }
};