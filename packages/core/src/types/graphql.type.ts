import { BootstrapClient } from './bootstrapClient.type';

export type ResolverObject = Record<string, any>;

export interface TenraGraphQLOptions {
  useRedis?: boolean;
  customTypeDefs?: string[];
  customResolvers?: ResolverObject[];
  provider: BootstrapClient;
}

export interface TenraGraphQLUser {
  id?: string;
  role?: string;
}

export interface TenraGraphQLContext {
  tenantId?: string;
  requestId?: string;
  dbName?: string;
  collectionName?: string;
  session?: import('mongodb').ClientSession;
  user?: TenraGraphQLUser;
  provider: BootstrapClient;
}

