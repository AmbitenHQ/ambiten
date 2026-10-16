import type { Collection, OptionalUnlessRequiredId } from 'mongodb';

import type {
  SchemaDefinition,
  Document,
  Relationship,
  GCConfig
} from '../../types';

import type {
  AmbitenMiddlewareOperation,
  AmbitenMiddlewareContext,
  AmbitenMiddlewareHandler,
} from '../../types';
import {
  normalizeSchemaDefinition
} from '../schema/normalize-schema-definition';
import {
  assertSchemaJsonValue,
  assertSchemaRuntimeDefault,
  cloneSchemaJsonValue,
  hasRuntimeDirective,
  resolveSchemaRuntimeDefault
} from '../schema/schema-runtime-default';


type MiddlewareStore<T extends Document> = {
  pre: Partial<Record<AmbitenMiddlewareOperation,
    AmbitenMiddlewareHandler<T>[]>>;
  post: Partial<Record<AmbitenMiddlewareOperation,
    AmbitenMiddlewareHandler<T>[]>>;
};

const FIELD_TYPE_ALIASES = {
  string: String,
  number: Number,
  boolean: Boolean,
  date: Date,
  array: Array,
  object: Object,
} as const;

type FieldTypeAlias = keyof typeof FIELD_TYPE_ALIASES;

// function normalizeFieldType(
//   field: string,
//   type: unknown
// ): Function {
//   /*
//    * Preserve executable programmatic constructors.
//    *
//    * This also allows existing custom constructor-based
//    * definitions to continue through registration.
//    */
//   if (typeof type === 'function') {
//     return type;
//   }

//   /*
//    * JSON-compatible descriptors.
//    */
//   if (
//     typeof type === 'string' &&
//     Object.prototype.hasOwnProperty.call(
//       FIELD_TYPE_ALIASES,
//       type
//     )
//   ) {
//     return FIELD_TYPE_ALIASES[type as FieldTypeAlias];
//   }

//   throw new Error(
//     `Invalid schema type for field "${field}": ` +
//     `${String(type)}. ` +
//     'Expected a supported constructor or one of: ' +
//     Object.keys(FIELD_TYPE_ALIASES).join(', ')
//   );
// }

// function normalizeSchemaDefinition<T extends Document>(
//   schemaDefinition: SchemaDefinition<T>
// ): SchemaDefinition<T> {
//   if (
//     schemaDefinition === null ||
//     typeof schemaDefinition !== 'object' ||
//     Array.isArray(schemaDefinition)
//   ) {
//     throw new Error('Schema definition must be an object.');
//   }

//   const entries = Object.entries(schemaDefinition).map(
//     ([field, rawOptions]) => {
//       if (
//         rawOptions === null ||
//         typeof rawOptions !== 'object' ||
//         Array.isArray(rawOptions)
//       ) {
//         throw new Error(
//           `Schema field "${field}" must have an options object.`
//         );
//       }

//       const options = { ...rawOptions } as Record<string, unknown>;

//       if (
//         options.required !== undefined &&
//         typeof options.required !== 'boolean'
//       ) {
//         throw new Error(
//           `Schema field "${field}" has an invalid required flag.`
//         );
//       }

//       if (
//         Object.prototype.hasOwnProperty.call(options, 'type') &&
//         options.type !== undefined
//       ) {
//         options.type = normalizeFieldType(field, options.type);
//       }

//       return [field, options] as const;

//     }
//   );

//   return Object.fromEntries(entries) as SchemaDefinition<T>;

// }

/**
 * The AmbitenSchema class allows you to define a schema for MongoDB documents.
 * It supports:
 * - schema definition
 * - custom validation
 * - indexes
 * - relationships
 * - virtual fields
 * - context-aware middleware
 * - garbage collection metadata
 */
export class AmbitenSchema<T extends Document> {
  private schemaDefinition: SchemaDefinition<T>;
  private indexes: any[] = [];
  private virtuals: { [key: string]: (doc: T) => any } = {};
  private validators: {
    [key: string]: (value: any, doc?: OptionalUnlessRequiredId<T>) => boolean | Promise<boolean>;
  } = {};
  private relationships: Relationship[] = [];
  private gcConfig?: GCConfig;

  private middleware: MiddlewareStore<T> = {
    pre: {},
    post: {},
  };

  /**
   * Creates an instance of AmbitenSchema.
   * @param schemaDefinition - The schema definition for the document.
   */
  constructor(schemaDefinition: SchemaDefinition<T>) {
    this.schemaDefinition = normalizeSchemaDefinition(schemaDefinition);
  }

  /**
   * Retrieves the schema definition.
   */
  getSchema(): SchemaDefinition<T> {
    return this.schemaDefinition;
  }

  /**
   * Re-registers the schema definition.
   */
  registerSchema(schemaDefinition: SchemaDefinition<T>): void {
    this.schemaDefinition = normalizeSchemaDefinition(schemaDefinition);
  }

  private applyDefaults(doc: OptionalUnlessRequiredId<T>): void {
    const target =
      doc as Record<string, unknown>;

    for (const [field, options] of Object.entries(this.schemaDefinition)
    ) {
      /*
       * Defaults only apply to missing values.
       *
       * null, false, 0 and empty strings are explicit
       * values and must never be replaced.
       */
      if (
        target[field] !== undefined ||
        !Object.prototype.hasOwnProperty.call(
          options,
          'default'
        )
      ) {
        continue;
      }

      const configuredDefault = options?.default;


      if (hasRuntimeDirective(configuredDefault)) {
        assertSchemaRuntimeDefault(configuredDefault);
        target[field] = resolveSchemaRuntimeDefault(configuredDefault);

        continue;
      }

      assertSchemaJsonValue(
        configuredDefault,
        `field "${field}" default`
      );

      target[field] = cloneSchemaJsonValue(configuredDefault);

    }
  }

  private validateUnknownFields(
    doc: OptionalUnlessRequiredId<T>
  ): void {
    const definition = this.schemaDefinition as Record<
      string,
      { required?: boolean; type?: any }
    >;

    // No structural schema was supplied.
    // Allow custom-validator-only schemas to continue working.
    if (!definition || Object.keys(definition).length === 0) {
      return;
    }

    for (const key of Object.keys(doc)) {
      // MongoDB-generated fields may need an allow-list.
      if (key === "_id") continue;

      if (!Object.prototype.hasOwnProperty.call(definition, key)) {
        throw new Error(`Unknown schema property "${key}".`);
      }
    }
  }

  private validateRequiredFields(doc: Record<string, unknown>): void {
    for (const [field, options] of Object.entries(this.schemaDefinition)) {
      if (options?.required === true && (doc)[field] === undefined) {
        throw new Error(`Required property "${field}" is missing.`);
      }
    }
  }

  private validateFieldTypes(
    doc: OptionalUnlessRequiredId<T>
  ): void {
    for (const [field, options] of Object.entries(
      this.schemaDefinition
    )
    ) {
      const expectedType = options?.type;
      if (expectedType === undefined) {
        continue;
      }

      const value = (doc as Document)[field];


      if (value === undefined) {
        continue;
      }

      let valid = false;

      if (expectedType === String) {
        valid = typeof value === 'string';
      }

      else if (expectedType === Number) {
        valid = typeof value === 'number' && Number.isFinite(value);
      }

      else if (expectedType === Boolean) {
        valid = typeof value === 'boolean';
      }

      else if (expectedType === Date) {
        valid = value instanceof Date && !Number.isNaN(value.getTime());
      }

      else if (expectedType === Array) {
        valid = Array.isArray(value);
      }

      else if (expectedType === Object) {
        if (
          value !== null &&
          typeof value === 'object' &&
          !Array.isArray(value)
        ) {
          const prototype = Object.getPrototypeOf(value);
          valid =
            prototype === Object.prototype ||
            prototype === null;
        }
      }

      else if (typeof expectedType === 'function') {
        try {
          valid = value instanceof expectedType;

        } catch {
          throw new Error(
            `Schema field "${field}" uses an unsupported constructor.`
          );
        }
      }

      if (!valid) {
        // const expectedName = expectedType.name || 'configured constructor';
        const expectedName =
          typeof expectedType === 'function'
            ? expectedType.name || 'configured constructor'
            : String(expectedType);

        const actualType =
          value === null
            ? 'null'
            : Array.isArray(value)
              ? 'array'
              : value instanceof Date
                ? 'date'
                : typeof value;

        throw new Error(
          `Field "${field}" should be of type ` +
          `${expectedName}, but got ${actualType}.`
        );
      }
    }
  }


  /**
   * Adds a custom validator for a specific field.
   */
  validator(
    field: string,
    fn: (
      value: any,
      doc?: OptionalUnlessRequiredId<T>
    ) => boolean | Promise<boolean>
  ): void {
    this.validators[field] = fn;
  }

  private validateStructure(
    doc: OptionalUnlessRequiredId<T>
  ): void {
    const definition = this.schemaDefinition;

    if (
      !definition ||
      Object.keys(definition).length === 0
    ) {
      return;
    }

    /*
     * First reject fields that do not belong to the schema.
     *
     * This avoids mutating an already-invalid document.
     */
    this.validateUnknownFields(doc);

    /*
     * Defaults must exist before required/type validation.
     */
    this.applyDefaults(doc);

    this.validateRequiredFields(doc);
    this.validateFieldTypes(doc);

  }

  /**
   * Validates a document synchronously.
   * Throws if an async validator is encountered.
   */
  validate(doc: OptionalUnlessRequiredId<T>): void {
    this.validateStructure(doc);

    for (const [field, validate] of Object.entries(this.validators)) {
      const result = validate(
        (doc as Document)[field],
        doc
      );

      if (result instanceof Promise) {
        throw new Error(
          `Validator for field "${field}" is async. Use validateAsync() instead.`
        );
      }

      if (!result) {
        throw new Error(
          `Validation failed for field: ${field}`,
        );
      }
    }
  }

  /**
   * Validates a document asynchronously.
   */
  async validateAsync(doc: OptionalUnlessRequiredId<T>): Promise<void> {
    this.validateStructure(doc);

    for (const [field, validate] of Object.entries(this.validators)) {
      const isValid = await validate(
        (doc)[field],
        doc
      );

      if (!isValid) {
        throw new Error(
          `Validation failed for field: ${field}`,
        );
      }
    }
  }

  /**
   * Adds an index to the schema.
   */
  index(fields: any, options?: any): void {
    this.indexes.push({ fields, options });
  }

  /**
   * Applies all defined indexes to a MongoDB collection.
   */
  async applyIndexes(collection: Collection<any>): Promise<void> {
    for (const { fields, options } of this.indexes) {
      await collection.createIndex(fields, options);
    }
  }

  /**
   * Adds a relationship to the schema.
   */
  addRelationship(ref: string, localField: keyof T): void {
    this.relationships.push({ ref, localField });
  }

  /**
   * Retrieves all relationships defined in the schema.
   */
  getRelationships(): Relationship[] {
    return this.relationships;
  }

  /**
   * Adds a virtual field to the schema.
   */
  virtual(name: string, getter: (doc: T) => any): void {
    this.virtuals[name] = getter;
  }

  /**
   * Applies all virtual fields to a document.
   */
  applyVirtuals(doc: T): void {
    for (const [key, getter] of Object.entries(this.virtuals)) {
      Object.defineProperty(doc, key, {
        get: () => getter(doc),
        enumerable: true,
      });
    }
  }

  /**
   * Adds a pre-middleware handler for a specific operation.
   */
  pre(
    operation: AmbitenMiddlewareOperation,
    fn: AmbitenMiddlewareHandler<T>
  ): this {
    if (!this.middleware.pre[operation]) {
      this.middleware.pre[operation] = [];
    }
    this.middleware.pre[operation]!.push(fn);
    return this;
  }

  /**
   * Adds a post-middleware handler for a specific operation.
   */
  post(
    operation: AmbitenMiddlewareOperation,
    fn: AmbitenMiddlewareHandler<T>
  ): this {
    if (!this.middleware.post[operation]) {
      this.middleware.post[operation] = [];
    }
    this.middleware.post[operation]!.push(fn);
    return this;
  }

  /**
   * Returns all pre-middleware for an operation.
   */
  getPreHooks(
    operation: AmbitenMiddlewareOperation
  ): AmbitenMiddlewareHandler<T>[] {
    return this.middleware.pre[operation] || [];
  }

  /**
   * Returns all post-middleware for an operation.
   */
  getPostHooks(
    operation: AmbitenMiddlewareOperation
  ): AmbitenMiddlewareHandler<T>[] {
    return this.middleware.post[operation] || [];
  }

  /**
   * Backward-compatible hook reader.
   * Defaults to pre hooks to avoid breaking older callers that expect getHooks(action).
   */
  getHooks(
    operation: AmbitenMiddlewareOperation,
    phase: 'pre' | 'post' = 'pre'
  ): AmbitenMiddlewareHandler<T>[] {
    return phase === 'pre'
      ? this.getPreHooks(operation)
      : this.getPostHooks(operation);
  }

  /**
   * Executes pre-middleware for an operation.
   */
  async executePre(
    operation: AmbitenMiddlewareOperation,
    ctx: AmbitenMiddlewareContext<T>
  ): Promise<void> {
    const hooks = this.getPreHooks(operation);
    for (const hook of hooks) {
      await hook(ctx);
    }
  }

  /**
   * Executes post-middleware for an operation.
   */
  async executePost(
    operation: AmbitenMiddlewareOperation,
    ctx: AmbitenMiddlewareContext<T>
  ): Promise<void> {
    const hooks = this.getPostHooks(operation);
    for (const hook of hooks) {
      await hook(ctx);
    }
  }

  /**
   * Executes middleware for a given phase and operation.
   */
  async executeMiddleware(
    phase: 'pre' | 'post',
    operation: AmbitenMiddlewareOperation,
    ctx: AmbitenMiddlewareContext<T>
  ): Promise<void> {
    const hooks = this.getHooks(operation, phase);
    for (const hook of hooks) {
      try {
        await hook(ctx);
      } catch (error) {
        console.error(`[error]: Error in ${phase}:${operation} middleware:`, error);
        throw error;
      }
    }
  }

  /**
   * Backward-compatible alias.
   * If older callers use triggerMiddleware(action, data), they should be upgraded
   * to pass explicit phase + operation + context.
   */
  async triggerMiddleware(
    phase: 'pre' | 'post',
    operation: AmbitenMiddlewareOperation,
    ctx: AmbitenMiddlewareContext<T>
  ): Promise<void> {
    await this.executeMiddleware(phase, operation, ctx);
  }

  /**
   * Sets garbage collection configuration.
   */
  setGCConfig(config: GCConfig): this {
    this.gcConfig = config;
    return this;
  }

  /**
   * Gets garbage collection configuration.
   */
  getGCConfig(): GCConfig | undefined {
    return this.gcConfig;
  }
}

export class Schema<T extends Document> extends AmbitenSchema<T> {
  constructor(schemaDefinition: SchemaDefinition<T>) {
    super(schemaDefinition);
  }

  async create(data: OptionalUnlessRequiredId<T>): Promise<T> {
    await this.validateAsync(data);

    const ctx: AmbitenMiddlewareContext<T> = {
      operation: 'create',
      collectionName: 'schema-test',
      doc: data as T,
    };

    await this.executePre('create', ctx);

    const result = data as T;

    this.applyVirtuals(result);

    const postCtx: AmbitenMiddlewareContext<T> = {
      ...ctx,
      result,
      doc: result,
    };

    await this.executePost('create', postCtx);

    return result;
  }

  static create<T extends Document>(
    schemaDefinition: SchemaDefinition<T>
  ): Schema<T> {
    return new Schema<T>(schemaDefinition);
  }
}

