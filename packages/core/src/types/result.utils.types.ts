import type { Document, EnhancedOmit, ObjectId, WithId } from "mongodb";

export type MongoDoc<T extends Document> = WithId<T>;

export type ModelResult<T extends Document> =
  EnhancedOmit<WithId<T>, "_id"> & { _id: string };

export type ModelResultArray<T extends Document> = ModelResult<T>[];