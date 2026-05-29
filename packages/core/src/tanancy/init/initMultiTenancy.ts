import { MultiTenantManager } from '../MultiTenantManager';
import { TenraConfig } from '../../types/index';
import { MongoClient } from 'mongodb';

export interface InitMultiTenancyOptions {
  lazy?: boolean;
  config?: TenraConfig['logger']
}

/**
 * Initializes multi-tenancy by registering tenants with their respective MongoDB URIs.
 * Supports both lazy (on-demand) and eager connection strategies.
 *
 * @param {Record<string, string>} tenants - A record of tenant IDs mapped to their MongoDB URIs.
 * @param {InitMultiTenancyOptions} [options={}] - Optional configuration for multi-tenancy initialization.
 * @param {boolean} [options.lazy=false] - If `true`, tenants are registered lazily (connected on-demand).
 * @param {TenraConfig} [options.config] - Optional configuration, including a logger for logging messages.
 * @returns {Promise<void>} A promise that resolves when all tenants are registered.
 * @throws {Error} If a tenant's MongoDB URI is invalid or missing.
 * @throws {Error} If a tenant is already registered and `lazy` is `false`.
 * @example 
 * // Initialize multi-tenancy with eager connection. Practically, you should use applyMultiTenancy instead.
 * that implements this function.
 * await initMultiTenancy({
 *   'tenant-a': 'mongodb://localhost:27017/tenant-a',
 *  'tenant-b': 'mongodb://localhost:27017/tenant-b'
 * }, {
 *   lazy: false,
 *  config: {}
 */
export const initMultiTenancy = async (
  tenants: Record<string, string>, // tenantId => MongoDB URI
  options: InitMultiTenancyOptions = {}
): Promise<void> => {
  const { lazy = false, config } = options;

  for (const [tenantId, uri] of Object.entries(tenants)) {
    if (!uri || typeof uri !== 'string' || !uri.startsWith('mongodb')) {
      throw new Error(`Invalid MongoDB URI for tenant "${tenantId}": ${uri}`);
    }

    if (MultiTenantManager.hasTenant(tenantId)) {
      config?.logger?.warn?.(`Tenant "${tenantId}" is already registered. Skipping.`);
      continue;
    }

    if (lazy) {
      // Ensure logger implements all required methods for core/src/types/logger.types.ts
      if (config?.enabled && config.logger) {
        const logger = config.logger as any;
        return logger
      }

      MultiTenantManager.registerLazyTenant(tenantId, uri);
      continue;
    } else {
      // Eagerly connect
      await MultiTenantManager.registerTenant(tenantId, uri);
    }
  }
};

function impl_Logger(logger: any) {
  const { info, warn, error, fatal, debug } = logger;
  return {
    info: info?.bind(logger) ?? (() => { }),
    warn: warn?.bind(logger) ?? (() => { }),
    error: error?.bind(logger) ?? (() => { }),
    fatal: fatal?.bind(logger) ?? (() => { }),
    debug: debug?.bind(logger) ?? (() => { }),
  };
}
