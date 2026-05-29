import type {
  Collection,
  MongoClient,
  ClientSession,
} from 'mongodb';
import { Document } from './document';
import { DbProvider, ModelContext } from './db.provider';


export interface BootstrapClient extends DbProvider {
  connect(): Promise<this>;
  close(): Promise<void>;
  client(ctx?: ModelContext): Promise<MongoClient>;
  startSession(ctx?: ModelContext): Promise<ClientSession>;
  collection<T extends Document = Document>(
    collectionName: string,
    ctx?: ModelContext
  ): Promise<Collection<T>>;
}