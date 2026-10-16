import type { AmbitenConfig } from "../types";
import { resolveBootstrapTransportConfigs } from "../config/defaultLoggerTransportConfigs";

function assertJsonDefinition(
  value: unknown,
  location: string,
  ancestors = new Set<object>(),
): void {
  if (value === undefined || value === null) return;
  const kind = typeof value;
  if (kind === "string" || kind === "boolean") return;
  if (kind === "number" && Number.isFinite(value)) return;
  if (kind === "object") {
    const object = value as object;
    const prototype = Object.getPrototypeOf(object);
    if (
      !ancestors.has(object) &&
      (Array.isArray(object) ||
        prototype === Object.prototype ||
        prototype === null)
    ) {
      ancestors.add(object);
      for (const [key, item] of Object.entries(object)) {
        assertJsonDefinition(item, `${location}.${key}`, ancestors);
      }
      ancestors.delete(object);
      return;
    }
  }
  throw new Error(
    `CLI JSON generation cannot serialize "${location}": non-JSON value. Use a schema/model module reference for executable definitions or bootstrap with a programmatic config.`,
  );
}

function assertJsonModelOptions(model: AmbitenConfig["model"]): void {
  if (model === undefined || model === null || typeof model !== "object")
    return;
  const runtimeKeys = ["schema", "provider", "Ambiten", "ctx", "collection"];
  const suppliedRuntimeKeys = runtimeKeys.filter((key) =>
    Object.prototype.hasOwnProperty.call(model, key),
  );
  if (suppliedRuntimeKeys.length > 0) {
    throw new Error(
      `CLI JSON generation cannot serialize programmatic-only model properties: ${suppliedRuntimeKeys.join(", ")}. Use a programmatic config or an exported model options object referenced by its module path.`,
    );
  }
}

/** We merge these fields into DEFAULT_CONFIG_CONTENT's existing config object. */
export function jsonBootstrapDefaults(
  options: AmbitenConfig,
): Record<string, unknown> {
  const logger = options.logger;
  const multiTenant = options.multiTenant;
  if (multiTenant?.tenantConfigResolver !== undefined) {
    throw new Error(
      "CLI JSON generation cannot serialize tenantConfigResolver. " +
      "Use tenantConfigResolverModule or bootstrap with a programmatic config.",
    );
  }
  assertJsonDefinition(options.schema, "schema");
  assertJsonModelOptions(options.model);
  assertJsonDefinition(options.model, "model");

  return {
    ...(options.schema !== undefined ? { schema: options.schema } : {}),
    ...(options.model !== undefined ? { model: options.model } : {}),
    logger: {
      enabled: logger?.enabled ?? true,
      level: logger?.level ?? "info",
      colorize: logger?.colorize ?? true,
      json: logger?.json ?? false,
      transportConfigs: resolveBootstrapTransportConfigs(
        logger?.transportConfigs,
      ),
      enableMetrics: logger?.enableMetrics ?? {
        enabled: false,
        logInterval: 60000,
      },
      compress: logger?.compress ?? { enabled: false },
      ...(logger?.excludedSources
        ? { excludedSources: logger.excludedSources }
        : {}),
      ...(logger?.formatOptions ? { formatOptions: logger.formatOptions } : {}),
      ...(logger?.circuitBreaker
        ? { circuitBreaker: logger.circuitBreaker }
        : {}),
    },
    ...(multiTenant
      ? {
        multiTenant: {
          enabled: multiTenant.enabled ?? false,
          headerKey: multiTenant.headerKey ?? "x-tenant-id",
          tenants: multiTenant.tenants ?? {},
          ...(multiTenant.tenantConfigResolverModule
            ? {
              tenantConfigResolverModule: {
                ...multiTenant.tenantConfigResolverModule,
              },
            }
            : {}),
          initOptions: { lazy: multiTenant.initOptions?.lazy ?? false },
        },
      }
      : {}),
  };
};