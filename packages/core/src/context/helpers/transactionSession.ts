import type { ClientSession } from 'mongodb';

export interface ManualTransactionSession extends ClientSession {
  startTransaction(): void;
  commitTransaction(): Promise<void>;
  abortTransaction(): Promise<void>;
  endSession(): Promise<void>;
}

export function hasManualTransactionMethods(
  session: ClientSession
): session is ManualTransactionSession {
  return (
    typeof session.startTransaction === 'function' &&
    typeof session.commitTransaction === 'function' &&
    typeof session.abortTransaction === 'function'
  );
}