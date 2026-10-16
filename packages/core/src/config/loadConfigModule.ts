import path from "path";
import { pathToFileURL } from "url";
import type { ConfigModuleReference } from "../types/config-module";

// Preserve native import() when TypeScript compiles this source to CommonJS.
const importModule = new Function("specifier", "return import(specifier)") as (
  specifier: string,
) => Promise<Record<string, unknown>>;

export interface LoadedConfigModule {
  namespace: Record<string, unknown>;
  filename: string;
  exportName: string;
}

export async function loadConfigModule(
  reference: ConfigModuleReference,
  baseDirectory: string,
  label: string,
): Promise<LoadedConfigModule> {
  const filename = path.resolve(baseDirectory, reference.path);
  const exportName = reference.exportName ?? "default";
  try {
    return {
      namespace: await importModule(pathToFileURL(filename).href),
      filename,
      exportName,
    };
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    const hint =
      error instanceof Error &&
        "code" in error &&
        error.code === "ERR_UNKNOWN_FILE_EXTENSION"
        ? " TypeScript configuration modules require a TypeScript ESM loader in the application process (for example, node --import tsx src/main.ts), or compilation to JavaScript with the module path updated to the emitted file."
        : "";
    throw new Error(
      `[Ambiten] Cannot load ${label} module "${filename}": ${reason}${hint}`,
    );
  }
}

/** Handle native ESM, module.exports, named CJS exports, and compiled TS defaults. */
export function selectConfigModuleExport(module: LoadedConfigModule): unknown {
  const direct = module.namespace[module.exportName];
  if (
    module.exportName === "default" &&
    direct !== null &&
    typeof direct === "object" &&
    "__esModule" in direct &&
    direct.__esModule === true &&
    Object.prototype.hasOwnProperty.call(direct, "default")
  ) {
    return (direct as Record<string, unknown>).default;
  }
  if (direct !== undefined) return direct;
  const commonJs = module.namespace.default;
  if (commonJs !== null && typeof commonJs === "object") {
    return (commonJs as Record<string, unknown>)[module.exportName];
  }
  return undefined;
}
