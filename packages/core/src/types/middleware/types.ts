import type {
  ClientSession,
  Filter,
  UpdateFilter,
  Document,
  AnyBulkWriteOperation
} from 'mongodb';
import { AmbitenOperationMeta } from '../ambiten.model.type';

export type AmbitenMiddlewareOperation =
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

export interface AmbitenMiddlewareContext<T extends Document = Document> {
  operation: AmbitenMiddlewareOperation;
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
  meta?: AmbitenOperationMeta;
}

export type AmbitenMiddlewareHandler<T extends Document = Document> =
  (ctx: AmbitenMiddlewareContext<T>) => Promise<void> | void;


