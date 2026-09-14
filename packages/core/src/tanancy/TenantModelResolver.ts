import type { Db, Document } from "mongodb";
import { Model } from '../utils/builders';
import { MultiTenantManager } from "./MultiTenantManager";
import type { AmbitenSchema } from "../lib-core";
import type { DbProvider, ModelContext } from "../types";
import { AmbitenContext } from "../context";


export type GetTenantModelParams<T extends Document> = {
  collectionName: string;
  schema: AmbitenSchema<T>;
  tenantId?: string;
  dbName?: string;
};

const tenantModelsCache = new Map<string, Map<string, any>>();

function createTenantProvider(
  tenantId: string,
  dbName?: string
): DbProvider {
  return {
    async db(ctx?: ModelContext): Promise<Db> {
      const client = await MultiTenantManager.getClient(tenantId);
      if (!client) {
        throw new Error(`Tenant "${tenantId}" not registered.`);
      }

      const resolvedDbName = ctx?.dbName ?? dbName;
      return resolvedDbName ? client.db(resolvedDbName) : client.db();
    },
  };
}

export const getTenantModel = async <T extends Document>(
  params: GetTenantModelParams<T>
): Promise<any> => {

  const collectionName = params?.collectionName?.trim();
  const tenantId = params?.tenantId ?? AmbitenContext.getTenantId();

  if (!collectionName) {
    throw new Error("collectionName is required.");
  }

  if (!tenantId) {
    throw new Error("tenantId is required to run tenant context");
  }

  if (!tenantModelsCache.has(tenantId)) {
    tenantModelsCache.set(tenantId, new Map());
  }

  const tenantCache = tenantModelsCache.get(tenantId)!;
  const cacheKey = params.dbName
    ? `${collectionName}::${params.dbName}`
    : collectionName;

  if (tenantCache.has(cacheKey)) {
    return tenantCache.get(cacheKey);
  }

  const provider = createTenantProvider(tenantId, params.dbName);

  const model = Model<T>({
    collectionName,
    schema: params.schema,
    provider,
  });

  tenantCache.set(cacheKey, model);

  return model;
};