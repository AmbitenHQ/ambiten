[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / AmbitenHookPayload

# Interface: AmbitenHookPayload\<T\>

Defined in: [packages/core/src/types/ambiten.model.type.ts:75](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L75)

## Type Parameters

### T

`T` *extends* [`Document`](../type-aliases/Document.md) = [`Document`](../type-aliases/Document.md)

## Properties

### bulkOperations?

> `optional` **bulkOperations?**: `AnyBulkWriteOperation`\<`T`\>[]

Defined in: [packages/core/src/types/ambiten.model.type.ts:87](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L87)

***

### bulkUpdates?

> `optional` **bulkUpdates?**: `object`[]

Defined in: [packages/core/src/types/ambiten.model.type.ts:86](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L86)

#### filter

> **filter**: `Partial`\<`T`\>

#### update

> **update**: `UpdateFilter`\<`T`\>

***

### collectionName

> **collectionName**: `string`

Defined in: [packages/core/src/types/ambiten.model.type.ts:77](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L77)

***

### dbName?

> `optional` **dbName?**: `string`

Defined in: [packages/core/src/types/ambiten.model.type.ts:79](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L79)

***

### doc?

> `optional` **doc?**: `Partial`\<`T`\>

Defined in: [packages/core/src/types/ambiten.model.type.ts:83](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L83)

***

### docs?

> `optional` **docs?**: `Partial`\<`T`\>[]

Defined in: [packages/core/src/types/ambiten.model.type.ts:84](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L84)

***

### filter?

> `optional` **filter?**: `Filter`\<`T`\>

Defined in: [packages/core/src/types/ambiten.model.type.ts:81](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L81)

***

### meta?

> `optional` **meta?**: [`AmbitenOperationMeta`](AmbitenOperationMeta.md)

Defined in: [packages/core/src/types/ambiten.model.type.ts:89](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L89)

***

### operation

> **operation**: [`AmbitenMiddlewareOperation`](../type-aliases/AmbitenMiddlewareOperation.md)

Defined in: [packages/core/src/types/ambiten.model.type.ts:76](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L76)

***

### pipeline?

> `optional` **pipeline?**: `object`[]

Defined in: [packages/core/src/types/ambiten.model.type.ts:85](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L85)

***

### result?

> `optional` **result?**: `unknown`

Defined in: [packages/core/src/types/ambiten.model.type.ts:88](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L88)

***

### session?

> `optional` **session?**: `ClientSession`

Defined in: [packages/core/src/types/ambiten.model.type.ts:80](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L80)

***

### tenantId?

> `optional` **tenantId?**: `string`

Defined in: [packages/core/src/types/ambiten.model.type.ts:78](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L78)

***

### update?

> `optional` **update?**: `UpdateFilter`\<`T`\>

Defined in: [packages/core/src/types/ambiten.model.type.ts:82](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L82)
