import * as cron from 'node-cron';
import { runGarbageCollectorOnAllModels } from './gcManager';
import { AmbitenModelRegistry } from '../utils/ModelRegistry';
import { colorize } from '../utils';
import type { ModelContext } from '../types';

export interface GarbageCollectorScheduleOptions {
  cronExpr?: string;
  ctx?: ModelContext;
  continueOnError?: boolean;
}

/**
 * Schedules registry-driven garbage collection.
 *
 * The cron task uses registered model instances and delegates cleanup to
 * `model.runGC()` so Ambiten's runtime context, middleware, schema hooks,
 * instrumentation, cache invalidation, and events remain centralized.
 *
 * @param options - Cron expression or scheduler options.
 * @returns The scheduled cron task.
 */
export function scheduleGarbageCollector(
  options: string | GarbageCollectorScheduleOptions = '0 * * * *'
) {
  const cronExpr =
    typeof options === 'string'
      ? options
      : options.cronExpr ?? '0 * * * *';

  const ctx =
    typeof options === 'string'
      ? undefined
      : options.ctx;

  const continueOnError =
    typeof options === 'string'
      ? true
      : options.continueOnError ?? true;

  return cron.schedule(cronExpr, async () => {
    try {
      const models = AmbitenModelRegistry.getAllModels();

      if (models.length === 0) {
        console.warn(
          colorize('[GC] Skipping GC: no registered models found.', 'yellow')
        );
        return;
      }

      console.log(
        colorize(
          `[GC] Running garbage collector at ${new Date().toISOString()}`,
          'blue'
        )
      );

      const result = await runGarbageCollectorOnAllModels({
        ctx,
        continueOnError
      });

      console.log(
        colorize(
          `[GC] Completed. scanned=${result.scanned}, succeeded=${result.succeeded}, failed=${result.failed}`,
          result.failed > 0 ? 'yellow' : 'blue'
        )
      );
    } catch (error) {
      console.error(
        colorize('[GC] Error running garbage collector', 'red'),
        error
      );
    }
  });
}

