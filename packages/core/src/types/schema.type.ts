import { ObjectId } from "mongodb";
import { Document } from "./document";


/**
 * JSON-compatible field type names.
 *
 * These aliases are normalized to their JavaScript
 * constructors when the schema is registered.
 */
export type SchemaFieldTypeName =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'array'
  | 'object';

/**
 * Constructors supported directly by Ambiten.
 *
 * Additional custom constructors remain supported
 * programmatically.
 */
export type SchemaFieldConstructor =
  | StringConstructor
  | NumberConstructor
  | BooleanConstructor
  | DateConstructor
  | ArrayConstructor
  | ObjectConstructor
  | (abstract new (...args: any[]) => unknown);

/**
 * Runtime-context values that schemas are explicitly
 * allowed to consume.
 *
 * Do not use `string` here. This allow-list is part
 * of the schema/runtime security boundary.
 */
export type SchemaRuntimeContextKey =
  | 'tenantId'
  | 'requestId'
  | 'dbName'
  | 'collectionName';

/**
 * Declarative runtime default contract.
 *
 * Add new runtime operations here as the ecosystem grows.
 */
export interface SchemaRuntimeDefaultMap {
  now: unknown;

  uuid: unknown;

  context: {
    key: SchemaRuntimeContextKey;
  };
}

/**
 * Converts SchemaRuntimeDefaultMap into the discriminated
 * union consumed by schemas.
 *
 * Equivalent to:
 *
 * { $runtime: 'now' }
 * | { $runtime: 'uuid' }
 * | {
 *     $runtime: 'context';
 *     key: SchemaRuntimeContextKey;
 *   }
 */
export type SchemaRuntimeDefault = {
  [K in keyof SchemaRuntimeDefaultMap]:
  {
    $runtime: K;
  } & SchemaRuntimeDefaultMap[K];
}[keyof SchemaRuntimeDefaultMap];

/**
 * JSON-safe literal schema defaults.
 *
 * Runtime-generated values such as Date and UUID use
 * SchemaRuntimeDefault instead.
 */
export type SchemaJsonPrimitive =
  | string
  | number
  | boolean
  | null;

export type SchemaJsonValue =
  | SchemaJsonPrimitive
  | SchemaJsonValue[]
  | {
    [key: string]: SchemaJsonValue;
  };

export type SchemaFieldDefault =
  | SchemaJsonValue
  | SchemaRuntimeDefault;

/**
 * Configuration for one document property.
 */
export interface SchemaFieldOptions {
  type?:
  | SchemaFieldTypeName
  | SchemaFieldConstructor;

  required?: boolean;

  default?: SchemaFieldDefault;

  /*
   * Preserve compatibility with additional Ambiten
   * schema metadata while the contract evolves.
   */
  [option: string]: any;
}

/**
 * Represents a schema definition for a document.
 */
export type SchemaDefinition<
  T extends Document = Document
> = Partial<
  Record<
    Extract<keyof T, string>,
    SchemaFieldOptions
  >
>;

/**
 * MongoDB schema types.
 */
export const SchemaType = {
  Types: { ObjectId },
} as const;




/**
 * Represents a hook function for middleware.
 * @param {any} data - The data passed to the hook.
 * @returns {Promise<void>} A promise that resolves when the hook is executed.
 */
export type HookFunction = (data: any) => Promise<void>;