import { AmbitenModelRegistry } from '../utils/ModelRegistry';
import { colorize } from '../utils';
import type { ModelContext } from '../types';

export interface GarbageCollectorRunOptions {
  ctx?: ModelContext;
  continueOnError?: boolean;
}

export interface GarbageCollectorModelResult {
  collectionName?: string;
  success: boolean;
  error?: unknown;
}

export interface GarbageCollectorRunResult {
  scanned: number;
  succeeded: number;
  failed: number;
  models: GarbageCollectorModelResult[];
}

/**
 * Runs garbage collection on all registered Ambiten model instances.
 *
 * This delegates cleanup to each model's `runGC()` method so the operation
 * remains context-aware and preserves middleware, schema hooks, query
 * instrumentation, cache invalidation, and event publishing.
 *
 * @param options - Optional garbage collection execution options.
 * @returns Summary of the garbage collection run.
 */
export async function runGarbageCollectorOnAllModels(
  options: GarbageCollectorRunOptions = {}
): Promise<GarbageCollectorRunResult> {
  const models = AmbitenModelRegistry.getAllModels();

  const result: GarbageCollectorRunResult = {
    scanned: models.length,
    succeeded: 0,
    failed: 0,
    models: []
  };

  for (const model of models) {
    const modelContext = model.getContext?.();
    const collectionName = modelContext?.ctx?.collectionName;

    try {
      if (typeof model.runGC !== 'function') {
        throw new Error('Registered model does not implement runGC().');
      }

      await model.runGC(options.ctx);

      result.succeeded += 1;
      result.models.push({
        collectionName,
        success: true
      });
    } catch (error) {
      result.failed += 1;
      result.models.push({
        collectionName,
        success: false,
        error
      });

      console.error(
        colorize(
          `[GC] Failed on collection "${collectionName ?? 'unknown'}"`,
          'red'
        ),
        error
      );

      if (!options.continueOnError) {
        throw error;
      }
    }
  }

  return result;
}

/**
 * Runs garbage collection on a single Ambiten model instance.
 *
 * @param model - Registered Ambiten model instance.
 * @param ctx - Optional model execution context.
 */
export async function runGarbageCollector(
  model: { runGC(ctx?: ModelContext): Promise<void> },
  ctx?: ModelContext
): Promise<void> {
  await model.runGC(ctx);
}