[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [logger/src](../README.md) / ILogger

# Interface: ILogger

Defined in: [packages/logger/src/types/logger.types.ts:6](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/logger.types.ts#L6)

## Properties

### close?

> `optional` **close?**: () => `void` \| `Promise`\<`void`\>

Defined in: [packages/logger/src/types/logger.types.ts:20](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/logger.types.ts#L20)

#### Returns

`void` \| `Promise`\<`void`\>

***

### debug

> **debug**: (`message`, ...`meta`) => `void`

Defined in: [packages/logger/src/types/logger.types.ts:8](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/logger.types.ts#L8)

#### Parameters

##### message

`string`

##### meta

...`unknown`[]

#### Returns

`void`

***

### error

> **error**: (`message`, ...`meta`) => `void`

Defined in: [packages/logger/src/types/logger.types.ts:11](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/logger.types.ts#L11)

#### Parameters

##### message

`string`

##### meta

...`unknown`[]

#### Returns

`void`

***

### fatal

> **fatal**: (`message`, ...`meta`) => `void`

Defined in: [packages/logger/src/types/logger.types.ts:12](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/logger.types.ts#L12)

#### Parameters

##### message

`string`

##### meta

...`unknown`[]

#### Returns

`void`

***

### getMetrics?

> `optional` **getMetrics?**: () => [`MetricsTracker`](../classes/MetricsTracker.md)

Defined in: [packages/logger/src/types/logger.types.ts:16](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/logger.types.ts#L16)

#### Returns

[`MetricsTracker`](../classes/MetricsTracker.md)

***

### info

> **info**: (`message`, ...`meta`) => `void`

Defined in: [packages/logger/src/types/logger.types.ts:9](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/logger.types.ts#L9)

#### Parameters

##### message

`string`

##### meta

...`unknown`[]

#### Returns

`void`

***

### log?

> `optional` **log?**: (`level`, `message`, ...`meta`) => `void`

Defined in: [packages/logger/src/types/logger.types.ts:14](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/logger.types.ts#L14)

#### Parameters

##### level

[`LogLevel`](../type-aliases/LogLevel.md)

##### message

`string`

##### meta

...`unknown`[]

#### Returns

`void`

***

### shutdown?

> `optional` **shutdown?**: () => `void` \| `Promise`\<`void`\>

Defined in: [packages/logger/src/types/logger.types.ts:18](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/logger.types.ts#L18)

#### Returns

`void` \| `Promise`\<`void`\>

***

### stop?

> `optional` **stop?**: () => `void` \| `Promise`\<`void`\>

Defined in: [packages/logger/src/types/logger.types.ts:19](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/logger.types.ts#L19)

#### Returns

`void` \| `Promise`\<`void`\>

***

### trace

> **trace**: (`message`, ...`meta`) => `void`

Defined in: [packages/logger/src/types/logger.types.ts:7](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/logger.types.ts#L7)

#### Parameters

##### message

`string`

##### meta

...`unknown`[]

#### Returns

`void`

***

### warn

> **warn**: (`message`, ...`meta`) => `void`

Defined in: [packages/logger/src/types/logger.types.ts:10](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/logger.types.ts#L10)

#### Parameters

##### message

`string`

##### meta

...`unknown`[]

#### Returns

`void`
