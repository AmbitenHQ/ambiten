import type { ClientSession } from 'mongodb';
import { hasManualTransactionMethods } from './transactionSession';

export async function runManualTransaction<T>(
  session: ClientSession,
  operation: (session: ClientSession) => Promise<T>
): Promise<T> {
  if (!hasManualTransactionMethods(session)) {
    throw new Error(
      'Session does not implement manual transaction methods.'
    );
  }

  session.startTransaction();

  try {
    const result = await operation(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}