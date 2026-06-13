[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / runGarbageCollectorOnAllModels

# Function: runGarbageCollectorOnAllModels()

> **runGarbageCollectorOnAllModels**(`options?`): `Promise`\<[`GarbageCollectorRunResult`](../interfaces/GarbageCollectorRunResult.md)\>

Defined in: [packages/core/src/gc/gcManager.ts:33](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/gc/gcManager.ts#L33)

Runs garbage collection on all registered Ambiten model instances.

This delegates cleanup to each model's `runGC()` method so the operation
remains context-aware and preserves middleware, schema hooks, query
instrumentation, cache invalidation, and event publishing.

## Parameters

### options?

[`GarbageCollectorRunOptions`](../interfaces/GarbageCollectorRunOptions.md) = `{}`

Optional garbage collection execution options.

## Returns

`Promise`\<[`GarbageCollectorRunResult`](../interfaces/GarbageCollectorRunResult.md)\>

Summary of the garbage collection run.
