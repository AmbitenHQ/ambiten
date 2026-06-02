import {
  AnyBulkWriteOperation,
  ClientSession,
  Collection,
  Filter,
  UpdateFilter
} from "mongodb";
import { AmbitenClient, AmbitenSchema } from "../lib-core";
import { Document } from "./document";
import { DbProvider, ModelContext } from "./db.provider";
import { AmbitenMiddlewareOperation } from "./middleware/types";

/**
 * Options for configuring an Ambiten model.
 * @template T - The type of the document in the model.
 */
export interface AmbitenModelOptions<T extends Document = any> {
  collectionName: string;
  schema?: AmbitenSchema<T>;
  Ambiten?: AmbitenClient;
  provider?: DbProvider;
  ctx?: ModelContext
  collection?: Collection<T>;
  gcConfig?: {
    ttl: number;
    indexName?: string;
    createdAtField?: string;
    updatedAtField?: string;
    enableGC?: boolean;
    field?: string;
  }
};


/**
 * Represents a relationship between collections in MongoDB.
 * @template T - The type of the document in the collection.
 */
export interface Relationship<T = any> {
  /**
   * The name of the referenced collection.
   */
  ref: string;

  /**
   * The field in the current document that holds the reference.
   */
  localField: keyof T;
};

export interface QueryCacheOptions {
  enabled?: boolean;
  ttl?: number;
  tenantId: string
  tags?: string[];
  namespace?: string;
}

export interface QueryOptions {
  cache?: boolean | QueryCacheOptions;
  session?: ClientSession;
  projection?: Record<string, 0 | 1>;
  sort?: Record<string, 1 | -1>;
  limit?: number;
  skip?: number;
}

export interface AmbitenHookPayload<T extends Document = Document> {
  operation: AmbitenMiddlewareOperation;
  collectionName: string;
  tenantId?: string;
  dbName?: string;
  session?: ClientSession;
  filter?: Filter<T>;
  update?: UpdateFilter<T>;
  doc?: Partial<T>;
  docs?: Partial<T>[];
  pipeline?: object[];
  bulkUpdates?: { filter: Partial<T>; update: UpdateFilter<T> }[];
  bulkOperations?: AnyBulkWriteOperation<T>[];
  result?: unknown;
  meta?: AmbitenOperationMeta;
}


export interface AmbitenOperationMeta {
  /**
   * Indicates the operation is executing inside a transaction boundary.
   */
  transactional?: boolean;

  /**
   * Indicates the operation is security-sensitive or explicitly access-controlled.
   */
  secure?: boolean;

  /**
   * Indicates the operation is part of a restore flow.
   */
  restore?: boolean;

  /**
   * Indicates the operation is performing a soft delete rather than a hard delete.
   */
  softDelete?: boolean;

  /**
   * Indicates the operation is part of garbage collection.
   */
  gc?: boolean;

  /**
   * Indicates the operation is a bulk write or bulk-style mutation.
   */
  bulkWrite?: boolean;

  /**
   * Indicates the operation is creating or handling a stream.
   */
  streaming?: boolean;

  /**
   * Indicates the operation result came from cache.
   */
  cacheHit?: boolean;

  /**
   * User identifier associated with the operation, when available.
   */
  userId?: string;

  /**
   * User role associated with the operation, when available.
   */
  userRole?: string;

  /**
   * Optional tenant policy or compliance classification.
   * Reserved for future Sovereign Shield integration.
   */
  policy?: string;

  /**
   * Optional region or sovereignty zone identifier.
   * Reserved for future geofencing and data-governance features.
   */
  region?: string;

  /**
   * Optional evidence or trace classification tag.
   * Reserved for future evidence collection and audit systems.
   */
  trace?: string;

  /**
   * Free-form extension point for future enterprise features.
   */
  extra?: Record<string, unknown>;
}