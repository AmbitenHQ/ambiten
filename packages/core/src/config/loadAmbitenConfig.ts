import fs from "fs-extra";
import path from "path";
import Ajv, { type ValidateFunction } from "ajv";
import type {
  AmbitenConfig,
  Document,
  TenantConfigResolver,
  TenantConfigResolverModule,
} from "../types";
import type {
  ConfigModuleReference,
  ResolvedAmbitenConfig,
} from "../types/config-module";
import { loadConfigModule, selectConfigModuleExport } from "./loadConfigModule";
import configSchema from "./ambiten.config.schema.json";


const ajv = new Ajv({
  allErrors: true,
  useDefaults: false,
  strict: false,
  coerceTypes: true,
});

let validate: ValidateFunction | null = null;

const DEFAULT_CONFIG_FILENAME = "ambiten.config.json";

type ConfigRecord = Record<string, unknown>;

function isConfigRecord(value: unknown): value is ConfigRecord {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

/**
 * Assign defaults only to properties that are undefined.
 *
 * Explicit false, zero and empty-string values
 * must not be replaced.
 *
 * Null is preserved so invalid null values can
 * be reported by validation rather than hidden.
 */
function applyDefaults(
  target: ConfigRecord,
  defaults: ConfigRecord
): void {
  for (const [key, value] of Object.entries(defaults)) {
    if (target[key] === undefined) {
      target[key] = value;
    }
  }
}

/**
 * Normalize configuration from either JSON or
 * a programmatic AmbitenConfig object.
 *
 * This function does not JSON-serialize the input.
 * Programmatic provider/model instances are preserved.
 *
 * Nested objects modified by normalization are copied
 * to avoid mutating the caller's original configuration.
 */
export function normalizeAmbitenConfig<T extends Document = Document>(
  rawConfig: unknown,
): AmbitenConfig<T> {
  if (!isConfigRecord(rawConfig)) {
    throw new Error("[Ambiten] Configuration must be an object.");
  }
  const cfg: ConfigRecord = { ...rawConfig };
  /*
   * Root defaults
   */
  applyDefaults(cfg, { configVersion: "1.0.0" });
  /*
   * Multi-tenancy
   *
   * Do not create multiTenant when it was omitted.
   */
  if (isConfigRecord(cfg.multiTenant)) {
    const multiTenant = { ...cfg.multiTenant };
    applyDefaults(multiTenant, {
      enabled: false,
      headerKey: "x-tenant-id",
    });
    if (isConfigRecord(multiTenant.initOptions)) {
      const initOptions = { ...multiTenant.initOptions };
      applyDefaults(initOptions, { lazy: false, retryAttempts: 3 });
      multiTenant.initOptions = initOptions;
    }
    cfg.multiTenant = multiTenant;
  }
  /*
   * Logger
   *
   * Preserve the legacy boolean shorthand.
   */
  if (typeof cfg.logger === "boolean") {
    cfg.logger = {
      enabled: cfg.logger,
    };
  }
  if (isConfigRecord(cfg.logger)) {
    const logger = { ...cfg.logger };
    /*
     * Normalize enableMetrics.
     */
    if (typeof logger.enableMetrics === "boolean") {
      logger.enableMetrics = {
        enabled: logger.enableMetrics,
      };
    }
    if (logger.enableMetrics === undefined) {
      logger.enableMetrics = {};
    }
    if (isConfigRecord(logger.enableMetrics)) {
      const enableMetrics = { ...logger.enableMetrics };
      applyDefaults(enableMetrics, {
        enabled: false,
        logInterval: 60000,
      });
      logger.enableMetrics = enableMetrics;
    }
    /*
     * Migrate the old compressLogFiles spelling.
     */
    if (
      logger.compress === undefined &&
      logger.compressLogFiles !== undefined
    ) {
      logger.compress = logger.compressLogFiles;
    }
    delete logger.compressLogFiles;
    /*
     * Normalize compress.
     */
    if (typeof logger.compress === "boolean") {
      logger.compress = { enabled: logger.compress };
    }
    if (logger.compress === undefined) {
      logger.compress = {};
    }
    if (isConfigRecord(logger.compress)) {
      const compress = { ...logger.compress };
      applyDefaults(compress, { enabled: false });
      logger.compress = compress;
    }
    /*
     * Circuit-breaker defaults apply when
     * the circuitBreaker object is provided.
     */
    if (isConfigRecord(logger.circuitBreaker)) {
      const circuitBreaker = { ...logger.circuitBreaker };
      applyDefaults(circuitBreaker, {
        enabled: true,
        retryAttempts: 5,
      });
      logger.circuitBreaker = circuitBreaker;
    }
    cfg.logger = logger;
  }
  /*
   * GraphQL
   *
   * Preserve the existing loader behavior:
   * absent GraphQL means disabled.
   */
  if (typeof cfg.graphql === "boolean") {
    cfg.graphql = { enabled: cfg.graphql };
  }
  if (cfg.graphql === undefined) {
    cfg.graphql = { enabled: false };
  }
  if (isConfigRecord(cfg.graphql)) {
    const graphql = { ...cfg.graphql };
    applyDefaults(graphql, {
      enabled: false,
      subscriptions: false,
      playground: true,
      schemaOutputPath: "./src/graphql/schema.gql",
    });
    cfg.graphql = graphql;
  }

  /*
   * Feature defaults
   *
   * Directory scaffolding defaults are deliberately
   * handled by generateDefaultConfigContent.ts.
   *
   * In particular, features.resolvers has a
   * different contract between the JSON Schema
   * and the programmatic runtime API.
   */
  if (cfg.features === undefined) {
    cfg.features = {};
  }
  if (isConfigRecord(cfg.features)) {
    const features = { ...cfg.features };
    applyDefaults(features, {
      useRedisCache: false,
      redisUri: "",
    });
    cfg.features = features;
  }

  /*
   * Advanced settings
   *
   * Preserve legacy boolean shorthand.
   */
  if (typeof cfg.advanced === "boolean") {
    cfg.advanced = {
      garbageCollector: { enabled: cfg.advanced },
    };
  }

  /*
   * The previous loader explicitly provided
   * disabled circuit-breaker and GC objects
   * when advanced was entirely absent.
   */
  if (cfg.advanced === undefined) {
    cfg.advanced = {
      circuitBreaker: { enabled: false },
      garbageCollector: { enabled: false },
    };
  }
  
  if (isConfigRecord(cfg.advanced)) {
    const advanced = { ...cfg.advanced };
    applyDefaults(advanced, {
      autoInstall: false,
      gcCron: "0 * * * *",
    });
    /*
     * Advanced circuit breaker.
     */
    if (isConfigRecord(advanced.circuitBreaker)) {
      const circuitBreaker = { ...advanced.circuitBreaker };
      applyDefaults(circuitBreaker, {
        enabled: true,
        retryAttempts: 5,
      });
      advanced.circuitBreaker = circuitBreaker;
    }
    /*
     * Legacy garbageCollector boolean.
     */
    if (typeof advanced.garbageCollector === "boolean") {
      advanced.garbageCollector = {
        enabled: advanced.garbageCollector,
      };
    }
    /*
     * Advanced garbage collector.
     */
    if (isConfigRecord(advanced.garbageCollector)) {
      const garbageCollector = { ...advanced.garbageCollector };
      applyDefaults(garbageCollector, {
        enabled: false,
        retentionPeriod: 30,
        logResults: true,
      });
      advanced.garbageCollector = garbageCollector;
    }
    cfg.advanced = advanced;
  }
  /*
   *
   * Do not generate artificial schema/model defaults.
   * Both are optional and must retain their real
   * configuration when supplied.
   */
  return cfg as unknown as AmbitenConfig<T>;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isModuleReference(value: unknown): value is ConfigModuleReference {
  return isPlainRecord(value) && typeof value.path === "string";
}

function assertModuleReference(value: ConfigModuleReference, label: string): void {
  if (
    !value.path.trim() ||
    (value.exportName !== undefined &&
      (typeof value.exportName !== "string" || !value.exportName.trim())) ||
    Object.keys(value).some((key) => key !== "path" && key !== "exportName")
  ) {
    throw new Error(
      `Invalid config: "${label}" module reference requires a non-empty "path" and an optional non-empty "exportName". Inline options cannot be mixed with a module reference.`,
    );
  }
}

function assertSchemaDefinition(value: unknown): void {
  if (!isPlainRecord(value) || isModuleReference(value)) {
    throw new Error('Invalid config: "schema" must be a schema definition object.');
  }
  for (const [name, definition] of Object.entries(value)) {
    if (!isPlainRecord(definition)) {
      throw new Error(`Invalid config: schema entry "${name}" must be an object.`);
    }
  }
}

function assertModelOptions(value: unknown): void {
  if (
    !isPlainRecord(value) ||
    isModuleReference(value) ||
    typeof value.collectionName !== "string" ||
    !value.collectionName.trim()
  ) {
    throw new Error('Invalid config: "model.collectionName" is required in a model options object.');
  }
  const gcConfig = value.gcConfig;
  if (
    gcConfig !== undefined &&
    (!isPlainRecord(gcConfig) ||
      typeof gcConfig.ttl !== "number" ||
      !Number.isFinite(gcConfig.ttl) ||
      gcConfig.ttl < 0)
  ) {
    throw new Error('Invalid config: "model.gcConfig.ttl" must be a non-negative finite number.');
  }
}
export function assertValidAmbitenConfig<T extends Document = Document>(
  config: AmbitenConfig<T>,
): void {
  /*
   * A MongoDB URI is required only when no
   * externally supplied provider is available.
   */
  const hasExternalProvider = Boolean(config.provider ?? config.mongoClient);
  const hasConnectionUri =
    typeof config.connection?.uri === "string" &&
    config.connection.uri.trim().length > 0;
  if (!hasExternalProvider && !hasConnectionUri) {
    throw new Error(
      'Invalid config: provide "connection.uri", ' +
        '"provider", or "mongoClient".',
    );
  }
  if (config.logger !== undefined) {
    if (
      config.logger === null ||
      typeof config.logger !== "object" ||
      Array.isArray(config.logger)
    ) {
      throw new Error('Invalid config: "logger" must be a settings object.');
    }
    const suppliedLogger = config.logger.logger;
    if (
      suppliedLogger !== undefined &&
      (!suppliedLogger ||
        ["trace", "debug", "info", "warn", "error", "fatal"].some(
          (method) =>
            typeof (suppliedLogger as unknown as Record<string, unknown>)[
              method
            ] !== "function",
        ))
    ) {
      throw new Error(
        'Invalid config: "logger.logger" must implement ILogger.',
      );
    }
  }
  /*
   * Validate the outer shape of SchemaDefinition<T>.
   *
   * Do not reject executable field constructors here:
   * programmatic configuration supports them.
   */
  if (config.schema !== undefined) {
    if (isModuleReference(config.schema)) assertModuleReference(config.schema, "schema");
    else assertSchemaDefinition(config.schema);
  }
  /*
   * A model is optional, but its collectionName
   * is mandatory when supplied.
   */
  if (config.model !== undefined) {
    if (isModuleReference(config.model)) assertModuleReference(config.model, "model");
    else assertModelOptions(config.model);
  }
  /*
   * Validate static tenant mappings.
   */
  const multiTenant = config.multiTenant;
  if (multiTenant !== undefined && !isPlainRecord(multiTenant)) {
    throw new Error('Invalid config: "multiTenant" must be an object.');
  }
  if (
    multiTenant?.enabled !== undefined &&
    typeof multiTenant.enabled !== "boolean"
  ) {
    throw new Error('Invalid config: "multiTenant.enabled" must be a boolean.');
  }
  if (
    multiTenant?.tenantConfigResolver !== undefined &&
    typeof multiTenant.tenantConfigResolver !== "function"
  ) {
    throw new Error(
      'Invalid config: "multiTenant.tenantConfigResolver" must be a function.',
    );
  }

  const resolverModule = multiTenant?.tenantConfigResolverModule;
  if (resolverModule !== undefined) {
    if (
      !isPlainRecord(resolverModule) ||
      typeof resolverModule.path !== "string" ||
      !resolverModule.path.trim() ||
      (resolverModule.exportName !== undefined &&
        (typeof resolverModule.exportName !== "string" ||
          !resolverModule.exportName.trim())) ||
      Object.keys(resolverModule).some(
        (key) => key !== "path" && key !== "exportName",
      )
    ) {
      throw new Error(
        'Invalid config: "multiTenant.tenantConfigResolverModule" requires ' +
          'a non-empty "path" and an optional non-empty "exportName".',
      );
    }
    if (multiTenant?.tenantConfigResolver !== undefined) {
      throw new Error(
        'Invalid config: provide either "tenantConfigResolver" or ' +
          '"tenantConfigResolverModule", not both.',
      );
    }
  }

  const tenants = multiTenant?.tenants;
  if (tenants !== undefined) {
    if (
      !isPlainRecord(tenants) ||
      !Object.entries(tenants).every(
        ([tenantId, uri]) =>
          tenantId.trim().length > 0 &&
          typeof uri === "string" &&
          /^mongodb(?:\+srv)?:\/\//.test(uri.trim()),
      )
    ) {
      throw new Error(
        'Invalid config: "multiTenant.tenants" ' +
          "must be a tenant-to-URI map.",
      );
    }
  }
}

async function resolveTenantConfigModule<T extends Document>(
  config: AmbitenConfig<T>,
  baseDirectory: string,
): Promise<AmbitenConfig<T>> {
  const multiTenant = config.multiTenant;
  const reference: TenantConfigResolverModule | undefined =
    multiTenant?.tenantConfigResolverModule;

  if (!multiTenant?.enabled || !reference) {
    return config;
  }

  const loaded = await loadConfigModule(reference, baseDirectory, "tenant resolver");
  const { namespace: module, filename: modulePath, exportName } = loaded;

  // Native import exposes module.exports as default for CJS. A TypeScript
  // default export compiled to CJS is therefore module.default.default.
  // Select a function directly or from the CommonJS exports object.
  const directExport = module[exportName];
  const resolver =
    typeof directExport === "function"
      ? directExport
      : isPlainRecord(module.default)
        ? module.default[exportName]
        : undefined;
  if (typeof resolver !== "function") {
    throw new Error(
      `[Ambiten] Tenant resolver module "${modulePath}" must export a function named "${exportName}".`,
    );
  }

  const resolvedMultiTenant = { ...multiTenant };
  delete resolvedMultiTenant.tenantConfigResolverModule;
  resolvedMultiTenant.tenantConfigResolver = resolver as TenantConfigResolver;
  return { ...config, multiTenant: resolvedMultiTenant };
}

async function resolveConfigModules<T extends Document>(
  config: AmbitenConfig<T>,
  baseDirectory: string,
): Promise<ResolvedAmbitenConfig<T>> {
  const resolved = { ...config };
  for (const property of ["schema", "model"] as const) {
    const reference = config[property];
    if (!isModuleReference(reference)) continue;
    const loaded = await loadConfigModule(reference, baseDirectory, property);
    const value = selectConfigModuleExport(loaded);
    try {
      if (property === "schema") assertSchemaDefinition(value);
      else assertModelOptions(value);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      throw new Error(
        `[Ambiten] Invalid ${property} export "${loaded.exportName}" from "${loaded.filename}": ${reason}`,
      );
    }
    (resolved as unknown as ConfigRecord)[property] = value;
  }
  const hydrated = await resolveTenantConfigModule(resolved, baseDirectory);
  assertValidAmbitenConfig(hydrated);
  return hydrated as ResolvedAmbitenConfig<T>;
}

/** The bootstrap uses this entry point for both JSON and programmatic configuration. */
export async function resolveAmbitenConfig<T extends Document = Document>(
  input?: string | AmbitenConfig<T>,
): Promise<ResolvedAmbitenConfig<T>> {
  if (typeof input === "string" || input === undefined) {
    return loadAmbitenConfig<T>(input);
  }
  const normalized = normalizeAmbitenConfig<T>(input);
  assertValidAmbitenConfig(normalized);
  return resolveConfigModules(normalized, process.cwd());
}

export async function loadAmbitenConfig<T extends Document = Document>(
  configPath?: string,
): Promise<ResolvedAmbitenConfig<T>> {
  const candidates = configPath
    ? [path.resolve(configPath)]
    : [
        path.resolve(process.cwd(), DEFAULT_CONFIG_FILENAME),
        path.resolve(process.cwd(), "config", DEFAULT_CONFIG_FILENAME),
        path.resolve(process.cwd(), "src", "config", DEFAULT_CONFIG_FILENAME),
        // __dirname is unavailable in native ESM. Keep legacy package-directory
        // fallbacks for the CommonJS build without breaking ESM config discovery.
        ...(typeof __dirname === "string"
          ? [
              path.resolve(__dirname, DEFAULT_CONFIG_FILENAME),
              path.resolve(__dirname, "..", DEFAULT_CONFIG_FILENAME),
            ]
          : []),
      ];
  let finalPath: string | undefined;
  for (const candidate of candidates) {
    if (await fs.pathExists(candidate)) {
      finalPath = candidate;
      break;
    }
  }
  if (!finalPath) {
    throw new Error(
      `Config file not found at any of: ${candidates.join(", ")}`,
    );
  }
  let parsed: AmbitenConfig<T>;
  try {
    const raw = await fs.readFile(finalPath, "utf-8");
    parsed = normalizeAmbitenConfig<T>(JSON.parse(raw));
  } catch (err) {
    throw new Error(`[Ambiten] Failed to parse config file: ${err}`);
  }
  if (!validate) {
    validate = ajv.compile(configSchema);
  }
  const isValid = validate(parsed);
  if (!isValid) {
    console.error(JSON.stringify(validate.errors, null, 2));
    const errors = validate.errors
      ?.map((e) => {
        const location = e.instancePath || "(root)";
        const extra =
          e.keyword === "additionalProperties"
            ? `: ${(e.params as any).additionalProperty}`
            : "";
        return `${location} ${e.message}${extra}`;
      })
      .join("; ");
    throw new Error(`[Ambiten] Invalid configuration: ${errors}`);
  }
  assertValidAmbitenConfig(parsed);
  // Validate the JSON document before adding executable functions to it.
  return resolveConfigModules(parsed, path.dirname(finalPath));
}