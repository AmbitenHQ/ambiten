import type { Db, Document } from "mongodb";
import { Model } from '../utils/builders';
import { MultiTenantManager } from "./MultiTenantManager";
import type { TenraSchema } from "../lib-core";
import type { DbProvider, ModelContext } from "../types";
import { TenraContext } from "../context";
// import { ensureModelNameSafe } from "../utils";


export type GetTenantModelParams<T extends Document> = {
  collectionName: string;
  schema: TenraSchema<T>;
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
  const tenantId = params?.tenantId ?? TenraContext.getTenantId();

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


// import { TENRASchema } from '../lib-core';
// import { MultiTenantManager } from './MultiTenantManager';
// import { TenantContext } from './TenantContext';
// import { Model } from '../utils/builders/createModel';
// import { ensureModelNameSafe } from '../utils/ensureModelNameSafe'; // <- wherever you put it
// import { Document } from '../types';
// import { Db } from 'mongodb';

// type DbProvider = { db(ctx?: { dbName?: string }): Promise<Db> };

// /**
//  * Parameters required to resolve a tenant-specific model.
//  * @template T - The type of the document in the model.
//  */
// export type GetTanantModelParams<T extends Document> = {
//   collectionName: string;
//   tenantId: string;
//   schema?: TENRASchema<T>;
// };

// const tenantModelsCache: Map<string, Map<string, ReturnType<typeof Model>>> = new Map();

// /**
//  * Resolves a tenant-specific model by creating or retrieving it from the cache.
//  * Ensures that each tenant has its own isolated model instance.
//  *
//  * @template T - The type of the document in the model.
//  * @param {GetTanantModelParams<T>} param - The parameters required to resolve the model.
//  * @param {string} param.modelName - The name of the model to resolve.
//  * @param {TENRASchema<T>} [param.schema] - The schema definition for the model (optional).
//  * @param {string} param.tenantId - The ID of the tenant for which the model is being resolved.
//  * @returns {Promise<any>} A promise that resolves to the tenant-specific model instance.
//  * @throws {Error} If no tenant context is found or the tenant is not registered.
//  * @example
//  * const userModel = await getTenantModel({
//  *  modelName: 'User',
//  *  schema: UserSchema,
//  *  tenantId: 'tenant123'
//  * });
//  * // userModel is now a tenant-specific model for the 'User' collection in 'tenant123'
//  * @example
//  * const productModel = await getTenantModel({
//  *  modelName: 'Product',
//  *  schema: ProductSchema,
//  *  tenantId: 'tenant456'
//  * });
//  */
// export const getTenantModel = async <T extends Document>
//   (param: GetTanantModelParams<T>): Promise<any> => {
//   const safeCollectionName = ensureModelNameSafe(param.collectionName);
//   const schema = param.schema;
//   // const client = await MultiTenantManager.getClient(param.tenantId);
//   const tenantId = param.tenantId ?? TenantContext.getTenantId();

//   if (!tenantId) throw new Error('No tenant context found');

//   if (!tenantModelsCache.has(tenantId)) {
//     tenantModelsCache.set(tenantId, new Map());
//   }

//   const clientCache = tenantModelsCache.get(tenantId)!;
//   if (clientCache.has(safeCollectionName)) {
//     return clientCache.get(safeCollectionName);
//   }

//   const provider = tenantDbProvider(tenantId);

//   const model = Model({
//     collectionName: safeCollectionName,
//     schema,
//     provider: provider
//   });
//   clientCache.set(safeCollectionName, model as unknown as ReturnType<typeof Model>);

//   return model;
// };
