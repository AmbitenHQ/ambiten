import { ClientSession, Db, MongoClient } from "mongodb";
import { TenraConfig } from "./tenraConfig";
import { TenraOperationMeta } from "./tenra.model.type";

export type ModelContext = {
	tenantId?: string;
	dbName?: string;
	db?: Db;
	collectionName?: string;
	config?: TenraConfig;
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

export interface TenraLoggerLike {
	info?: (message: string, meta?: Record<string, any>) => void;
	warn?: (message: string, meta?: Record<string, any>) => void;
	error?: (message: string, meta?: Record<string, any>) => void;
	debug?: (message: string, meta?: Record<string, any>) => void;
}

export interface TenraContextState {
  tenantId?: string;
  requestId?: string;
  dbName?: string;
  collectionName?: string;
  session?: ClientSession;
  loggerMeta?: Record<string, any>;
  logger?: TenraLoggerLike;
  debug?: boolean;
  meta?: TenraOperationMeta;
  observer?: TenraQueryObserver;
  budget?: TenraQuotaBudgetInput;
}

export interface TenraQueryObserver {
	onQuery?: (payload: Record<string, any>) => void | Promise<void>;
	onQueryError?: (payload: Record<string, any>) => void | Promise<void>;
}

export interface TenraQuotaBudgetInput {
  maxQueries?: number;
  queriesExecuted?: number;
  totalTimeMs?: number;
}

export interface TenraQuotaBudget {
  maxQueries: number;
  queriesExecuted: number;
  totalTimeMs: number;
}

export interface TenraCacheStats {
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

