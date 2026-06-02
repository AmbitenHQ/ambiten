import { BootstrapClient } from './bootstrapClient.type';

export type ResolverObject = Record<string, any>;

export interface AmbitenGraphQLOptions {
  useRedis?: boolean;
  customTypeDefs?: string[];
  customResolvers?: ResolverObject[];
  provider: BootstrapClient;
}

export interface AmbitenGraphQLUser {
  id?: string;
  role?: string;
}

export interface AmbitenGraphQLContext {
  tenantId?: string;
  requestId?: string;
  dbName?: string;
  collectionName?: string;
  session?: import('mongodb').ClientSession;
  user?: AmbitenGraphQLUser;
  provider: BootstrapClient;
}

