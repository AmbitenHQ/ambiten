export interface SoftDeleteOptions {
  field?: string;
  deletedAtField?: string;
  deletedByField?: string;
  isDeletedField?: string;
  enabled?: boolean;
  excludeDeletedByDefault?: boolean;
}

export interface SoftDeletableDocument extends Document {
  deletedAt?: Date | null;
  isDeleted?: boolean;
  deletedBy?: string | null;
}