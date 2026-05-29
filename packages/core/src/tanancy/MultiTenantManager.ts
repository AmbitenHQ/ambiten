import { MongoClient } from 'mongodb';

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

/**
 * MultiTenantManager is responsible for managing tenant configurations and MongoDB client connections in a multi-tenant application.
 * It supports both lazy and immediate tenant registration, allowing for flexible connection management based on application needs.
 */
export class MultiTenantManager {
  private static tenants: Map<string, TenantConfig> = new Map();

  constructor() {}

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
  static async getClient(tenantId: string): Promise<MongoClient | null> {
    this.validateTenantId(tenantId);

    const normalizedTenantId = tenantId.trim();
    const tenant = this.tenants.get(normalizedTenantId);

    if (!tenant) return null;

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

  /**
   * Retrieves the full tenant configuration.
   *
   * @param {string} tenantId - The tenant ID.
   * @returns {TenantConfig | undefined} The tenant configuration if found.
   */
  static getTenant(tenantId: string): TenantConfig | undefined {
    this.validateTenantId(tenantId);
    return this.tenants.get(tenantId.trim());
  }

  /**
   * Retrieves the configured database name for a tenant.
   *
   * @param {string} tenantId - The tenant ID.
   * @returns {string | undefined} The database name if found.
   */
  static getTenantDbName(tenantId: string): string | undefined {
    return this.getTenant(tenantId)?.dbName;
  }

  /**
   * Returns the first connected tenant ID.
   * Useful for backward compatibility, though not ideal in multi-tenant flows.
   */
  static getConnectedTenant(): string {
    const connected = Array.from(this.tenants.values()).find(tenant => !!tenant.client);
    return connected?.tenantId || '';
  }

  /**
   * Returns all currently connected tenant IDs.
   */
  static getAllConnectedTenants(): string[] {
    return Array.from(this.tenants.values())
      .filter(tenant => !!tenant.client)
      .map(tenant => tenant.tenantId);
  }

  /**
   * Returns all registered tenant configs.
   */
  static getAllTenants(): TenantConfig[] {
    return Array.from(this.tenants.values());
  }

  /**
   * Returns true if at least one tenant is registered.
   */
  static isEnabled(): boolean {
    return this.tenants.size > 0;
  }

  /**
   * Removes a tenant from the registry.
   */
  static removeTenant(tenantId: string): boolean {
    this.validateTenantId(tenantId);
    return this.tenants.delete(tenantId.trim());
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