/**
 * This is legacy code and is not intended for public use. It may be removed in future versions without warning.
 * @deprecated
 * @internal
 * TenantContext provides a thread-safe way to manage tenant-specific data using AsyncLocalStorage.
 * This is particularly useful in multi-tenant applications where you need to track the current tenant across asynchronous operations.
 */
import { AsyncLocalStorage } from "node:async_hooks";

const tenantStorage = new AsyncLocalStorage<{ tenantId: string | undefined }>();

/**
 * @deprecated
 * @internal
 * 
 * This is legacy code and is not intended for public use. It may be removed in future versions without warning.
 * Provides a thread-safe context for managing tenant-specific data using `AsyncLocalStorage`.
 * This is useful for multi-tenant applications where the current tenant needs to be tracked across asynchronous operations.
 */
export class TenantContext {
  /**
   * Runs a callback function within a specific tenant context.
   * @param {string} tenantId - The ID of the tenant to set in the context.
   * @param {() => void} callback - The callback function to execute within the tenant context.
   */
  static run(tenantId: string, callback: () => void): void {
    if (!tenantId) {
      throw new Error('tenantId is required to run tenant context');
    }
    tenantStorage.run({ tenantId: tenantId }, callback);
  }

  /**
   * Sets the tenant ID in the current context.
   * @param {string} tenantId - The ID of the tenant to set.
   */
  static setTenantId(tenantId: string): void {
    const store = tenantStorage.getStore();
    if (store) store.tenantId = tenantId;
  }

  /**
   * Retrieves the tenant ID from the current context.
   * @returns {string | undefined} The tenant ID, or `undefined` if no tenant ID is set.
   */
  static getTenantId(): string | undefined {
    return tenantStorage.getStore()?.tenantId;
  }

  /**
   * Clears the tenant ID from the current context.
   */
  static clear(): void {
    const store = tenantStorage.getStore();
    if (store) store.tenantId = undefined;
  }
};