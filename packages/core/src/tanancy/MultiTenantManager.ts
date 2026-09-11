import { MongoClient } from 'mongodb';
import type {
  TenantConfigResolver
} from '../types';


export interface TenantConfig {
  tenantId: string;
  uri: string;
  dbName: string;
  client?: MongoClient;
  lazy: boolean;
  metadata?: Record<string, unknown>;
}

export interface RegisterTenantOptions {
  dbName?: string;
  client?: MongoClient;
  lazy?: boolean;
  metadata?: Record<string, unknown>;
}

export interface RegisteredTenantStatistics {
  registeredTenants: number,
  connectedTenants: number,
  lazyTenants: number,
  dynamicResolverEnabled: boolean
}


/**
 * MultiTenantManager is responsible for managing tenant configurations and MongoDB client connections in a multi-tenant application.
 * It supports both lazy and immediate tenant registration, allowing for flexible connection management based on application needs.
 */
export class MultiTenantManager {
  private static tenants: Map<string, TenantConfig> = new Map();
  private static tenantConfigResolver?: TenantConfigResolver;
  private static pendingTenantResolutions =
    new Map<string, Promise<TenantConfig | undefined>>();


  constructor() { }

  /**
   * Checks if a tenant is already registered.
   * @param {string} tenantId - The ID of the tenant to check.
   * @returns {boolean} `true` if the tenant is registered, `false` otherwise.
   */
  static hasTenant(tenantId: string): boolean {
    return this.tenants.has(tenantId);
  }

  /**
   * Registers a tenant for lazy connection.
   * Connection is established only when the tenant is accessed for the first time.
   *
   * @param {string} tenantId - The tenant ID.
   * @param {string} uri - The MongoDB URI.
   * @param {RegisterTenantOptions} [options] - Optional tenant registration settings.
   */
  static registerLazyTenant(
    tenantId: string,
    uri: string,
    options: Omit<RegisterTenantOptions, 'lazy' | 'client'> = {}
  ): TenantConfig {
    this.validateTenantId(tenantId);
    this.validateUri(uri);

    const normalizedTenantId = tenantId.trim();

    const tenantConfig: TenantConfig = {
      tenantId: normalizedTenantId,
      uri: uri.trim(),
      dbName: options.dbName?.trim() || this.extractDbNameFromUri(uri) || normalizedTenantId,
      client: undefined,
      lazy: true,
      metadata: options.metadata
    };

    this.tenants.set(normalizedTenantId, tenantConfig);

    return tenantConfig;
  }

  /**
   * Registers a tenant and establishes a connection immediately.
   *
   * @param {string} tenantId - The tenant ID.
   * @param {string} uri - The MongoDB URI.
   * @param {RegisterTenantOptions} [options] - Optional tenant registration settings.
   * @returns {Promise<MongoClient>} The connected MongoClient instance.
   */
  static async registerTenant(
    tenantId: string,
    uri: string,
    options: Omit<RegisterTenantOptions, 'lazy'> = {}
  ): Promise<MongoClient> {
    this.validateTenantId(tenantId);
    this.validateUri(uri);

    const normalizedTenantId = tenantId.trim();
    const existing = this.tenants.get(normalizedTenantId);

    if (existing?.client) {
      return existing.client;
    }

    const client = options.client ?? new MongoClient(uri);
    if (!options.client) {
      await client.connect();
    }

    const tenantConfig: TenantConfig = {
      tenantId: normalizedTenantId,
      uri: uri.trim(),
      dbName: options.dbName?.trim() || this.extractDbNameFromUri(uri) || normalizedTenantId,
      client,
      lazy: false,
      metadata: options.metadata
    };

    this.tenants.set(normalizedTenantId, tenantConfig);
    return client;
  }

  /**
   * Retrieves the MongoClient instance for a specific tenant.
   * If the tenant was registered lazily, connection is established on first access.
   *
   * @param {string} tenantId - The tenant ID.
   * @returns {Promise<MongoClient | null>} The MongoClient or null if not registered.
   */
  static async getClient(
    tenantId: string
  ): Promise<MongoClient | null> {
    this.validateTenantId(tenantId);

    const normalizedTenantId = tenantId.trim();

    const tenant =
      await this.resolveTenant(normalizedTenantId);

    if (!tenant) {
      return null;
    }

    if (tenant.client) {
      return tenant.client;
    }

    if (tenant.lazy) {
      const client = new MongoClient(tenant.uri);

      await client.connect();

      this.tenants.set(normalizedTenantId, {
        ...tenant,
        client,
        lazy: false
      });

      return client;
    }

    return null;
  }

  static setTenantConfigResolver(
    resolver: TenantConfigResolver
  ): void {
    this.tenantConfigResolver = resolver;
  }

  static clearTenantConfigResolver(): void {
    this.tenantConfigResolver = undefined;
  }

  /**
   * Resolves a tenant from the current runtime registry or, when
   * necessary, from the configured external TenantConfigResolver.
   *
   * Dynamically resolved tenants are registered locally before
   * being returned, making subsequent lookups local.
   *
   * @param tenantId - The tenant ID.
   * @returns The resolved tenant configuration, if available.
  */
  static async resolveTenant(
    tenantId: string
  ): Promise<TenantConfig | undefined> {
    this.validateTenantId(tenantId);

    const id = tenantId.trim();

    const existing =
      this.tenants.get(id);

    if (existing) {
      return { ...existing };
    }

    if (!this.tenantConfigResolver) {
      return undefined;
    }

    const pending =
      this.pendingTenantResolutions.get(id);

    if (pending) {
      return pending;
    }

    const resolution =
      this.resolveExternalTenant(id);

    this.pendingTenantResolutions.set(
      id,
      resolution
    );

    try {
      return await resolution;
    } finally {
      this.pendingTenantResolutions.delete(id);
    }
  }

  private static async resolveExternalTenant(
    tenantId: string
  ): Promise<TenantConfig | undefined> {
    if (!this.tenantConfigResolver) {
      return undefined;
    }

    const resolved =
      await this.tenantConfigResolver(tenantId);

    if (!resolved) {
      return undefined;
    }

    const alreadyRegistered =
      this.tenants.get(tenantId);

    if (alreadyRegistered) {
      return { ...alreadyRegistered };
    }

    const tenant =
      this.registerLazyTenant(
        tenantId,
        resolved.uri,
        {
          dbName: resolved.dbName,
          metadata: resolved.metadata
        }
      );

    return { ...tenant };
  }

  /**
 * Retrieves a tenant that is already registered in the current runtime.
 *
 * This method performs a synchronous local registry lookup only.
 * Dynamically discovered tenants are included once they have been
 * resolved and registered by MultiTenantManager.
 *
 * Use resolveTenant() when the tenant may need to be discovered
 * through the configured TenantConfigResolver.
 *
 * @param tenantId - The tenant ID.
 * @returns The registered tenant configuration, if available.
 */
  static getTenant(tenantId: string): TenantConfig | undefined {
    this.validateTenantId(tenantId);

    const tenant = this.tenants.get(tenantId.trim());

    return tenant
      ? { ...tenant }
      : undefined;
  }

  /**
  * Retrieves the database name for an already registered tenant.
  *
  * This is a synchronous local-registry lookup.
  *
  * @param tenantId - The tenant ID.
  * @returns The configured database name, if available.
  */
  static async getTenantDbName(
    tenantId: string
  ): Promise<string | undefined> {
    return this.getTenant(tenantId)?.dbName ?? await this.resolveTenantDbName(tenantId)
  }

  /**
 * Resolves the tenant locally or externally and returns its
 * configured database name.
 *
 * @param tenantId - The tenant ID.
 * @returns The resolved database name, if available.
 */
  static async resolveTenantDbName(
    tenantId: string
  ): Promise<string | undefined> {
    const tenant =
      await this.resolveTenant(tenantId);

    return tenant?.dbName;
  }

  /**
 * Returns the first tenant with an active MongoDB client
 * in the current Ambiten runtime.
 *
 * This reflects runtime connection state only.
 */
  static getConnectedTenant(): string {
    const connected =
      Array.from(this.tenants.values())
        .find((tenant) => !!tenant.client);

    return connected?.tenantId ?? '';
  }

  /**
  * Returns all tenant IDs with active MongoDB clients
  * in the current Ambiten runtime.
  *
  * Includes both statically registered and dynamically
  * discovered tenants that are currently connected.
  */
  static getAllConnectedTenants(): string[] {
    return Array.from(this.tenants.values())
      .filter((tenant) => !!tenant.client)
      .map((tenant) => tenant.tenantId);
  }

  /**
 * Returns all tenants currently registered with this
 * Ambiten runtime.
 *
 * This includes:
 * - statically configured tenants
 * - manually registered tenants
 * - externally discovered tenants after they have been resolved
 *
 * It does not represent every tenant that may exist in an
 * external registry but has never been encountered by this runtime.
 */
  static getAllTenants(): TenantConfig[] {
    return Array.from(this.tenants.values())
      .map((tenant) => ({ ...tenant }));
  }

  /**
   * Returns true if at least one tenant is registered.
   */
  static isEnabled(): boolean {
    return this.tenants.size > 0;
  }

  /**
 * Removes a tenant from the current runtime registry.
 *
 * This does not remove the tenant from an external tenant source.
 * If a TenantConfigResolver can still resolve the tenant, it may
 * be discovered and registered again on a future request.
 *
 * @param tenantId - The tenant ID.
 * @returns true when a registered tenant was removed.
 */
  static removeTenant(tenantId: string): boolean {
    this.validateTenantId(tenantId);

    return this.tenants.delete(
      tenantId.trim()
    );
  }

  static getStats(): RegisteredTenantStatistics {
    const registeredTenants =
      this.tenants.size;

    const connectedTenants =
      this.getAllConnectedTenants().length;

    const lazyTenants =
      Array.from(this.tenants.values())
        .filter((tenant) => tenant.lazy)
        .length;

    const dynamicResolverEnabled =
      Boolean(this.tenantConfigResolver);

    return {
      registeredTenants,
      connectedTenants,
      lazyTenants,
      dynamicResolverEnabled
    };
  }

  /**
   * Clears all tenants from the registry.
   */
  static clearTenants(): void {
    this.tenants.clear();
  }

  private static validateTenantId(tenantId: string): void {
    if (!tenantId || typeof tenantId !== 'string' || !tenantId.trim()) {
      throw new Error('Tenant ID is required.');
    }
  }

  private static validateUri(uri: string): void {
    if (!uri || typeof uri !== 'string' || !uri.trim()) {
      throw new Error('MongoDB URI is required.');
    }

    if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
      throw new Error(`Invalid MongoDB URI: ${uri}`);
    }
  }

  private static extractDbNameFromUri(uri: string): string | undefined {
    try {
      const withoutQuery = uri.split('?')[0];
      const parts = withoutQuery.split('/');
      const lastPart = parts[parts.length - 1];

      if (!lastPart || lastPart.includes(':')) {
        return undefined;
      }

      return lastPart.trim() || undefined;
    } catch {
      return undefined;
    }
  }
}

