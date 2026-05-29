import type {
  Collection,
  OptionalUnlessRequiredId,
  Document as MongoDocument,
} from 'mongodb';

import type {
  SchemaDefinition,
  Document,
  Relationship,
  GCConfig,
} from '../types';

import type {
  TenraMiddlewareOperation,
  TenraMiddlewareContext,
  TenraMiddlewareHandler,
} from '../types';

type MiddlewareStore<T extends MongoDocument> = {
  pre: Partial<Record<TenraMiddlewareOperation, TenraMiddlewareHandler<T>[]>>;
  post: Partial<Record<TenraMiddlewareOperation, TenraMiddlewareHandler<T>[]>>;
};

/**
 * The TenraSchema class allows you to define a schema for MongoDB documents.
 * It supports:
 * - schema definition
 * - custom validation
 * - indexes
 * - relationships
 * - virtual fields
 * - context-aware middleware
 * - garbage collection metadata
 */
export class TenraSchema<T extends Document> {
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
   * Creates an instance of TenraSchema.
   * @param schemaDefinition - The schema definition for the document.
   */
  constructor(schemaDefinition: SchemaDefinition<T>) {
    this.schemaDefinition = schemaDefinition;
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
    this.schemaDefinition = schemaDefinition;
    console.info('Schema registered:', this.schemaDefinition);
  }

  /**
   * Adds a custom validator for a specific field.
   */
  validator(
    field: string,
    fn: (value: any, doc?: OptionalUnlessRequiredId<T>) => boolean | Promise<boolean>
  ): void {
    this.validators[field] = fn;
  }

  /**
   * Validates a document synchronously.
   * Throws if an async validator is encountered.
   */
  validate(doc: OptionalUnlessRequiredId<T>): void {
    for (const [field, validate] of Object.entries(this.validators)) {
      const result = validate((doc as any)[field], doc);

      if (result instanceof Promise) {
        throw new Error(
          `Validator for field "${field}" is async. Use validateAsync() instead.`
        );
      }

      if (!result) {
        console.log(`[error]: Validation failed for field: ${field}`);
        throw new Error(`Validation failed for field: ${field}`);
      }
    }
  }

  /**
   * Validates a document asynchronously.
   */
  async validateAsync(doc: OptionalUnlessRequiredId<T>): Promise<void> {
    for (const [field, validate] of Object.entries(this.validators)) {
      const isValid = await validate((doc as any)[field], doc);

      if (!isValid) {
        console.log(`[error]: Validation failed for field: ${field}`);
        throw new Error(`Validation failed for field: ${field}`);
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
    operation: TenraMiddlewareOperation,
    fn: TenraMiddlewareHandler<T>
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
    operation: TenraMiddlewareOperation,
    fn: TenraMiddlewareHandler<T>
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
    operation: TenraMiddlewareOperation
  ): TenraMiddlewareHandler<T>[] {
    return this.middleware.pre[operation] || [];
  }

  /**
   * Returns all post-middleware for an operation.
   */
  getPostHooks(
    operation: TenraMiddlewareOperation
  ): TenraMiddlewareHandler<T>[] {
    return this.middleware.post[operation] || [];
  }

  /**
   * Backward-compatible hook reader.
   * Defaults to pre hooks to avoid breaking older callers that expect getHooks(action).
   */
  getHooks(
    operation: TenraMiddlewareOperation,
    phase: 'pre' | 'post' = 'pre'
  ): TenraMiddlewareHandler<T>[] {
    return phase === 'pre'
      ? this.getPreHooks(operation)
      : this.getPostHooks(operation);
  }

  /**
   * Executes pre-middleware for an operation.
   */
  async executePre(
    operation: TenraMiddlewareOperation,
    ctx: TenraMiddlewareContext<T>
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
    operation: TenraMiddlewareOperation,
    ctx: TenraMiddlewareContext<T>
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
    operation: TenraMiddlewareOperation,
    ctx: TenraMiddlewareContext<T>
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
    operation: TenraMiddlewareOperation,
    ctx: TenraMiddlewareContext<T>
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

export class Schema<T extends Document = Document> extends TenraSchema<T> {
  constructor(schemaDefinition: SchemaDefinition<T>) {
    super(schemaDefinition);
    this.registerSchema(schemaDefinition);
  }

  async create(data: OptionalUnlessRequiredId<T>): Promise<T> {
    await this.validateAsync(data);

    const ctx: TenraMiddlewareContext<T> = {
      operation: 'create',
      collectionName: 'schema-test',
      doc: data as T,
    };

    await this.executePre('create', ctx);

    const result = data as T;

    this.applyVirtuals(result);

    const postCtx: TenraMiddlewareContext<T> = {
      ...ctx,
      result,
      doc: result,
    };

    await this.executePost('create', postCtx);

    return result;
  }

  static create<T extends Document = Document>(
    schemaDefinition: SchemaDefinition<T>
  ): Schema<T> {
    return new Schema<T>(schemaDefinition);
  }
}

