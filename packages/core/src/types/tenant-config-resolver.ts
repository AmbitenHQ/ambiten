/**
 * Database configuration returned when Ambiten dynamically
 * discovers a tenant that is not already registered.
 *
 * This represents external tenant configuration only.
 * Runtime state such as MongoClient instances and lazy/eager
 * registration state is owned by MultiTenantManager.
 */
export interface ResolvedTenantConfig {
  /**
   * MongoDB connection URI for the tenant.
   *
   * @example
   * "mongodb://localhost:27017/tenant-a"
   * "mongodb+srv://user:password@cluster.mongodb.net/tenant-a"
   */
  uri: string;

  /**
   * Optional database name.
   *
   * When omitted, MultiTenantManager may resolve the database
   * name from the URI or fall back to its existing tenant
   * database-name resolution strategy.
   */
  dbName?: string;

  /**
   * Optional application-defined tenant metadata.
   *
   * Ambiten does not interpret these values. They may be used
   * by application infrastructure for information such as
   * region, tier, shard, deployment group, or other metadata.
   */
  metadata?: Record<string, unknown>;
}

/**
 * Dynamically resolves database configuration for a tenant.
 *
 * The tenant ID has already been resolved by the Ambiten
 * request/adapter layer and propagated through AmbitenContext.
 *
 * Returning `undefined` or `null` indicates that the tenant
 * could not be resolved.
 */
export type TenantConfigResolver = (
  tenantId: string
) =>
  | ResolvedTenantConfig
  | null
  | undefined
  | Promise<ResolvedTenantConfig | null | undefined>;