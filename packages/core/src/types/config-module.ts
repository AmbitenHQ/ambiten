import type { AmbitenConfig } from "./ambitenConfig";
import type { BootstrapModelOptions } from "./ambiten.model.type";
import type { Document } from "./document";
import type { SchemaDefinition } from "./schema.type";

/** Paths are relative to the JSON config file, or to cwd for manual configs. */
export interface ConfigModuleReference {
  path: string;
  /** The selected export is a definition/options object; defaults to "default". */
  exportName?: string;
}

export type SchemaConfigInput<T extends Document = Document> =
  | SchemaDefinition<T>
  | ConfigModuleReference;

export type ModelConfigInput<T extends Document = Document> =
  | BootstrapModelOptions<T>
  | ConfigModuleReference;

/** Bootstrap consumes loaded definitions, never unresolved module references. */
export type ResolvedAmbitenConfig<T extends Document = Document> = Omit<
  AmbitenConfig<T>,
  "schema" | "model"
> & {
  schema?: SchemaDefinition<T>;
  model?: BootstrapModelOptions<T>;
};
