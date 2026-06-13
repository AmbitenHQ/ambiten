[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / AmbitenHookPayload

# Interface: AmbitenHookPayload\<T\>

Defined in: [packages/core/src/types/ambiten.model.type.ts:68](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.model.type.ts#L68)

## Type Parameters

### T

`T` *extends* [`Document`](../type-aliases/Document.md) = [`Document`](../type-aliases/Document.md)

## Properties

### bulkOperations?

> `optional` **bulkOperations?**: `AnyBulkWriteOperation`\<`T`\>[]

Defined in: [packages/core/src/types/ambiten.model.type.ts:80](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.model.type.ts#L80)

***

### bulkUpdates?

> `optional` **bulkUpdates?**: `object`[]

Defined in: [packages/core/src/types/ambiten.model.type.ts:79](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.model.type.ts#L79)

#### filter

> **filter**: `Partial`\<`T`\>

#### update

> **update**: `UpdateFilter`\<`T`\>

***

### collectionName

> **collectionName**: `string`

Defined in: [packages/core/src/types/ambiten.model.type.ts:70](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.model.type.ts#L70)

***

### dbName?

> `optional` **dbName?**: `string`

Defined in: [packages/core/src/types/ambiten.model.type.ts:72](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.model.type.ts#L72)

***

### doc?

> `optional` **doc?**: `Partial`\<`T`\>

Defined in: [packages/core/src/types/ambiten.model.type.ts:76](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.model.type.ts#L76)

***

### docs?

> `optional` **docs?**: `Partial`\<`T`\>[]

Defined in: [packages/core/src/types/ambiten.model.type.ts:77](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.model.type.ts#L77)

***

### filter?

> `optional` **filter?**: `Filter`\<`T`\>

Defined in: [packages/core/src/types/ambiten.model.type.ts:74](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.model.type.ts#L74)

***

### meta?

> `optional` **meta?**: [`AmbitenOperationMeta`](AmbitenOperationMeta.md)

Defined in: [packages/core/src/types/ambiten.model.type.ts:82](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.model.type.ts#L82)

***

### operation

> **operation**: [`AmbitenMiddlewareOperation`](../type-aliases/AmbitenMiddlewareOperation.md)

Defined in: [packages/core/src/types/ambiten.model.type.ts:69](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.model.type.ts#L69)

***

### pipeline?

> `optional` **pipeline?**: `object`[]

Defined in: [packages/core/src/types/ambiten.model.type.ts:78](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.model.type.ts#L78)

***

### result?

> `optional` **result?**: `unknown`

Defined in: [packages/core/src/types/ambiten.model.type.ts:81](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.model.type.ts#L81)

***

### session?

> `optional` **session?**: `ClientSession`

Defined in: [packages/core/src/types/ambiten.model.type.ts:73](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.model.type.ts#L73)

***

### tenantId?

> `optional` **tenantId?**: `string`

Defined in: [packages/core/src/types/ambiten.model.type.ts:71](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.model.type.ts#L71)

***

### update?

> `optional` **update?**: `UpdateFilter`\<`T`\>

Defined in: [packages/core/src/types/ambiten.model.type.ts:75](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.model.type.ts#L75)
