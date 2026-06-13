[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / scheduleGarbageCollector

# Function: scheduleGarbageCollector()

> **scheduleGarbageCollector**(`options?`): `ScheduledTask`

Defined in: [packages/core/src/gc/gcCron.node.ts:23](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/gc/gcCron.node.ts#L23)

Schedules registry-driven garbage collection.

The cron task uses registered model instances and delegates cleanup to
`model.runGC()` so Ambiten's runtime context, middleware, schema hooks,
instrumentation, cache invalidation, and events remain centralized.

## Parameters

### options?

`string` \| [`GarbageCollectorScheduleOptions`](../interfaces/GarbageCollectorScheduleOptions.md)

Cron expression or scheduler options.

## Returns

`ScheduledTask`

The scheduled cron task.
