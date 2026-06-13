[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / GCOptions

# Interface: GCOptions

Defined in: [packages/core/src/gc/ambitenGC.ts:9](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/gc/ambitenGC.ts#L9)

## Properties

### continueOnError?

> `optional` **continueOnError?**: `boolean`

Defined in: [packages/core/src/gc/ambitenGC.ts:16](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/gc/ambitenGC.ts#L16)

***

### cron?

> `optional` **cron?**: `string`

Defined in: [packages/core/src/gc/ambitenGC.ts:14](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/gc/ambitenGC.ts#L14)

***

### ctx?

> `optional` **ctx?**: [`ModelContext`](../type-aliases/ModelContext.md)

Defined in: [packages/core/src/gc/ambitenGC.ts:15](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/gc/ambitenGC.ts#L15)

***

### enabled?

> `optional` **enabled?**: `boolean`

Defined in: [packages/core/src/gc/ambitenGC.ts:10](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/gc/ambitenGC.ts#L10)

***

### interval?

> `optional` **interval?**: `string`

Defined in: [packages/core/src/gc/ambitenGC.ts:11](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/gc/ambitenGC.ts#L11)

***

### logger?

> `optional` **logger?**: `object`

Defined in: [packages/core/src/gc/ambitenGC.ts:17](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/gc/ambitenGC.ts#L17)

#### error?

> `optional` **error?**: (`message`, `meta?`) => `void`

##### Parameters

###### message

`string`

###### meta?

`Record`\<`string`, `unknown`\>

##### Returns

`void`

#### info?

> `optional` **info?**: (`message`, `meta?`) => `void`

##### Parameters

###### message

`string`

###### meta?

`Record`\<`string`, `unknown`\>

##### Returns

`void`

#### warn?

> `optional` **warn?**: (`message`, `meta?`) => `void`

##### Parameters

###### message

`string`

###### meta?

`Record`\<`string`, `unknown`\>

##### Returns

`void`

***

### logResults?

> `optional` **logResults?**: `boolean`

Defined in: [packages/core/src/gc/ambitenGC.ts:13](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/gc/ambitenGC.ts#L13)

***

### retentionPeriod?

> `optional` **retentionPeriod?**: `number`

Defined in: [packages/core/src/gc/ambitenGC.ts:12](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/gc/ambitenGC.ts#L12)
