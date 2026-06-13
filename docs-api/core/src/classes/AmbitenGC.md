[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / AmbitenGC

# Class: AmbitenGC

Defined in: [packages/core/src/gc/ambitenGC.ts:24](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/gc/ambitenGC.ts#L24)

## Constructors

### Constructor

> **new AmbitenGC**(`options?`): `AmbitenGC`

Defined in: [packages/core/src/gc/ambitenGC.ts:30](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/gc/ambitenGC.ts#L30)

#### Parameters

##### options?

[`GCOptions`](../interfaces/GCOptions.md) = `{}`

#### Returns

`AmbitenGC`

## Methods

### runOnce()

> **runOnce**(`ctx?`): `Promise`\<[`GarbageCollectorRunResult`](../interfaces/GarbageCollectorRunResult.md)\>

Defined in: [packages/core/src/gc/ambitenGC.ts:108](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/gc/ambitenGC.ts#L108)

Runs garbage collection once across registered models.

#### Parameters

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

Optional model execution context override.

#### Returns

`Promise`\<[`GarbageCollectorRunResult`](../interfaces/GarbageCollectorRunResult.md)\>

Summary of the GC run.

***

### start()

> **start**(): `void`

Defined in: [packages/core/src/gc/ambitenGC.ts:66](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/gc/ambitenGC.ts#L66)

Starts interval-based garbage collection.

#### Returns

`void`

***

### stop()

> **stop**(): `void`

Defined in: [packages/core/src/gc/ambitenGC.ts:88](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/gc/ambitenGC.ts#L88)

Stops interval or cron-based garbage collection.

#### Returns

`void`
