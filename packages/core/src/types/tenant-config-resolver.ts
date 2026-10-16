/** External configuration only; clients and connection state belong to the manager. */
export interface ResolvedTenantConfig {
  uri: string;
  dbName?: string;
  metadata?: Record<string, unknown>;
}

/** Return null or undefined when the tenant does not exist. */
export type TenantConfigResolver = (
  tenantId: string,
) =>
  | ResolvedTenantConfig
  | null
  | undefined
  | Promise<ResolvedTenantConfig | null | undefined>;

/**
 * JSON-compatible reference to a local JavaScript module.
 *
 * In JSON configuration, path is relative to the configuration file.
 * In programmatic configuration, path is relative to process.cwd().
 * The selected export must be a TenantConfigResolver, not a factory.
 */
export interface TenantConfigResolverModule {
  path: string;
  exportName?: string;
}
