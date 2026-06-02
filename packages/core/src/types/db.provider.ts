import { ClientSession, Db, MongoClient } from "mongodb";
import { AmbitenConfig } from "./ambitenConfig";
import { AmbitenOperationMeta } from "./ambiten.model.type";

export type ModelContext = {
  tenantId?: string;
  dbName?: string;
  db?: Db;
  collectionName?: string;
  config?: AmbitenConfig;
  session?: ClientSession;
  withDeleted?: boolean;
  onlyDeleted?: boolean;
  hardDelete?: boolean;
};


export interface DbProvider {
  db(ctx?: ModelContext): Promise<Db>;
  client?(ctx?: ModelContext): Promise<MongoClient>;
  startSession?(ctx?: ModelContext): Promise<ClientSession>;
}

export interface AmbitenLoggerLike {
  info?: (message: string, meta?: Record<string, any>) => void;
  warn?: (message: string, meta?: Record<string, any>) => void;
  error?: (message: string, meta?: Record<string, any>) => void;
  debug?: (message: string, meta?: Record<string, any>) => void;
}

export interface AmbitenContextState {
  tenantId?: string;
  requestId?: string;
  dbName?: string;
  collectionName?: string;
  session?: ClientSession;
  loggerMeta?: Record<string, any>;
  logger?: AmbitenLoggerLike;
  debug?: boolean;
  meta?: AmbitenOperationMeta;
  observer?: AmbitenQueryObserver;
  budget?: AmbitenQuotaBudgetInput;
}

export interface AmbitenQueryObserver {
  onQuery?: (payload: Record<string, any>) => void | Promise<void>;
  onQueryError?: (payload: Record<string, any>) => void | Promise<void>;
}

export interface AmbitenQuotaBudgetInput {
  maxQueries?: number;
  queriesExecuted?: number;
  totalTimeMs?: number;
}

export interface AmbitenQuotaBudget {
  maxQueries: number;
  queriesExecuted: number;
  totalTimeMs: number;
}

export interface AmbitenCacheStats {
  totalKeys: number;
  tenantKeys?: number;
  memoryUsageMb: number;
  memoryUsageBytes: number;
  hitRate: number;
  missRate: number;
  totalHits: number;
  totalMisses: number;
  totalRequests: number;
  tenantId: string | null;
  timestamp: string;
}

