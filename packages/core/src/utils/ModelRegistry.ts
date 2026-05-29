import { TenraModel } from '../lib-core';
import type { Document } from '../types';

const modelRegistry = new Set<TenraModel<any>>();

/**
 * TenraModelRegistry manages registered Tenra model instances.
 */
export const TenraModelRegistry = {
  registerModel(model: TenraModel<any>): void {
    modelRegistry.add(model);
  },

  getRegisteredModel<T extends Document = Document>(
    model: TenraModel<T>
  ): TenraModel<T> | null {
    return modelRegistry.has(model) ? model : null;
  },

  isModelRegistered(model: TenraModel<any>): boolean {
    return modelRegistry.has(model);
  },

  unregisterModel(model: TenraModel<any>): void {
    modelRegistry.delete(model);
  },

  getAllModels(): TenraModel<any>[] {
    return [...modelRegistry];
  },

  clear(): void {
    modelRegistry.clear();
  }
};

const registeredModels: TenraModel<any>[] = [];

export function clearModelRegistryForTests(): void {
  for (const model of registeredModels) {
    TenraModelRegistry.unregisterModel(model);
  }

  registeredModels.length = 0;
}