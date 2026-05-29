export interface TenraRequestLike {
  headers: Record<string, string | string[] | undefined>;
  url?: string;
  method?: string;
  params?: Record<string, string>;
  cookies?: Record<string, string>;
  query?: Record<string, string | string[] | undefined>;
  body?: unknown;
  get?(name: string): string | undefined;
}

export interface TenraResponseLike {
  status?(code: number): this | void;
  setHeader?(name: string, value: string): void;
}

export type TenantResolver = (
  req: TenraRequestLike
) => Promise<string | undefined> | string | undefined;

export interface TenancyOptions {
  header?: string;
  cookie?: string;
  param?: string;
  subdomain?: boolean;
  jwtClaim?: string;
  fallback?: string;
  validate?: (id: string) => boolean | Promise<boolean>;
  resolver?: TenantResolver;
}

export type ContextValueResolver<T> = (
  req: TenraRequestLike
) => Promise<T | undefined> | T | undefined;

export interface AdapterContextResolvers {
  tenantId?: ContextValueResolver<string>;
  requestId?: ContextValueResolver<string>;
  dbName?: ContextValueResolver<string>;
  collectionName?: ContextValueResolver<string>;
  debug?: ContextValueResolver<boolean>;
  meta?: ContextValueResolver<Record<string, unknown>>;
  loggerMeta?: ContextValueResolver<Record<string, unknown>>;
}

export interface AdapterContextOptions {
  tenancy?: TenancyOptions;
  enableTransactions?: boolean;
  requestIdHeader?: string;
  dbNameHeader?: string;
  collectionNameHeader?: string;
  resolvers?: AdapterContextResolvers;
}

export interface TenraAdapter<TApp = unknown> {
  name: string;
  install(app: TApp, options?: AdapterContextOptions): void | Promise<void>;
}