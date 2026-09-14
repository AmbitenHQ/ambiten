[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [logger/src](../README.md) / LoggerHooks

# Interface: LoggerHooks

Defined in: [packages/logger/src/types/logger.types.ts:71](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/logger/src/types/logger.types.ts#L71)

## Properties

### onError?

> `optional` **onError?**: (`error`, `entry?`) => `void`

Defined in: [packages/logger/src/types/logger.types.ts:74](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/logger/src/types/logger.types.ts#L74)

#### Parameters

##### error

`unknown`

##### entry?

[`LogEntry`](LogEntry.md) \| [`LogEntry`](LogEntry.md)[]

#### Returns

`void`

***

### onFlush?

> `optional` **onFlush?**: (`entries`) => `void`

Defined in: [packages/logger/src/types/logger.types.ts:73](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/logger/src/types/logger.types.ts#L73)

#### Parameters

##### entries

[`LogEntry`](LogEntry.md)[]

#### Returns

`void`

***

### onLog?

> `optional` **onLog?**: (`entry`) => `void`

Defined in: [packages/logger/src/types/logger.types.ts:72](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/logger/src/types/logger.types.ts#L72)

#### Parameters

##### entry

[`LogEntry`](LogEntry.md)

#### Returns

`void`
