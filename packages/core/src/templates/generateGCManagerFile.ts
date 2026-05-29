export function generateGCManager(): string {
  return `import { TenraModel } from '@tenra/core';
import { ObjectId } from 'mongodb';

export interface GarbageCollectorOptions {
  /**
   * Retention period in days.
   */
  retentionPeriod?: number;
  dateField?: string;
}

export async function runGarbageCollector(
  model: TenraModel<any>,
  options: GarbageCollectorOptions = {}
): Promise<void> {
  const retentionPeriod = options.retentionPeriod ?? 7;
  const dateField = options.dateField ?? 'deletedAt';

  const cutoff = new Date(
    Date.now() - retentionPeriod * 24 * 60 * 60 * 1000
  );

  const expiredDocs = await model.find({
    [dateField]: { $lt: cutoff }
  });

  for (const doc of expiredDocs) {
    await model.deleteOne({ _id: new ObjectId(doc._id) });
    console.log(\`🗑️ Deleted expired document: \${doc._id}\`);
  }

  console.log('✅ Garbage collection completed.');
}
`;
}
