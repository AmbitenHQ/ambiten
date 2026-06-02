import { AmbitenModel } from '../lib-core';
import type { Document } from '../types';

const modelRegistry = new Set<AmbitenModel<any>>();

/**
 * AmbitenModelRegistry manages registered Ambiten model instances.
 */
export const AmbitenModelRegistry = {
  registerModel(model: AmbitenModel<any>): void {
    modelRegistry.add(model);
  },

  getRegisteredModel<T extends Document = Document>(
    model: AmbitenModel<T>
  ): AmbitenModel<T> | null {
    return modelRegistry.has(model) ? model : null;
  },

  isModelRegistered(model: AmbitenModel<any>): boolean {
    return modelRegistry.has(model);
  },

  unregisterModel(model: AmbitenModel<any>): void {
    modelRegistry.delete(model);
  },

  getAllModels(): AmbitenModel<any>[] {
    return [...modelRegistry];
  },

  clear(): void {
    modelRegistry.clear();
  }
};

const registeredModels: AmbitenModel<any>[] = [];

export function clearModelRegistryForTests(): void {
  for (const model of registeredModels) {
    AmbitenModelRegistry.unregisterModel(model);
  }

  registeredModels.length = 0;
}