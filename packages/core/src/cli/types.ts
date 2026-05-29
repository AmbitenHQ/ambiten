export interface BootstrapCliOptions {
  withGraphql?: boolean;
  withRedis?: boolean;
  logger?: boolean;
  multiTenant?: boolean;
  uri?: string;
  rbac?: boolean;
  withGarbageCollector?: boolean;
  install?: boolean;
}