import type { ClientSession, Filter, UpdateFilter, Document, AnyBulkWriteOperation } from 'mongodb';
import { TenraOperationMeta } from '../tenra.model.type';

export type TenraMiddlewareOperation =
  | 'find'
  | 'findOne'
  | 'create'
  | 'updateOne'
  | 'updateMany'
  | 'deleteOne'
  | 'deleteMany'
  | 'bulkInsert'
  | 'bulkWrite'
  | 'bulkUpdate'
  | 'aggregate'
  | 'findOneAndUpdate'
  | 'findOneAndDelete'
  | 'findOneAndReplace'
  | 'findOneAndUpsert'
  | 'restoreOne'
  | 'restoreMany'
  | 'runGC';

export interface TenraMiddlewareContext<T extends Document = Document> {
  operation: TenraMiddlewareOperation;
  modelName?: string;
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
  withDeleted?: boolean
  onlyDeleted?: boolean;
  hardDelete?: boolean;
  result?: unknown;
  meta?: TenraOperationMeta;
}

export type TenraMiddlewareHandler<T extends Document = Document> =
  (ctx: TenraMiddlewareContext<T>) => Promise<void> | void;


