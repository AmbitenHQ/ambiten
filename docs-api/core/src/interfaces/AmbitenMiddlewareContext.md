[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / AmbitenMiddlewareContext

# Interface: AmbitenMiddlewareContext\<T\>

Defined in: [packages/core/src/types/middleware/types.ts:30](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/middleware/types.ts#L30)

## Type Parameters

### T

`T` *extends* `Document` = `Document`

## Properties

### bulkOperations?

> `optional` **bulkOperations?**: `AnyBulkWriteOperation`\<`T`\>[]

Defined in: [packages/core/src/types/middleware/types.ts:43](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/middleware/types.ts#L43)

***

### bulkUpdates?

> `optional` **bulkUpdates?**: `object`[]

Defined in: [packages/core/src/types/middleware/types.ts:42](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/middleware/types.ts#L42)

#### filter

> **filter**: `Partial`\<`T`\>

#### update

> **update**: `UpdateFilter`\<`T`\>

***

### collectionName

> **collectionName**: `string`

Defined in: [packages/core/src/types/middleware/types.ts:33](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/middleware/types.ts#L33)

***

### dbName?

> `optional` **dbName?**: `string`

Defined in: [packages/core/src/types/middleware/types.ts:35](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/middleware/types.ts#L35)

***

### doc?

> `optional` **doc?**: `Partial`\<`T`\>

Defined in: [packages/core/src/types/middleware/types.ts:39](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/middleware/types.ts#L39)

***

### docs?

> `optional` **docs?**: `Partial`\<`T`\>[]

Defined in: [packages/core/src/types/middleware/types.ts:40](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/middleware/types.ts#L40)

***

### filter?

> `optional` **filter?**: `Filter`\<`T`\>

Defined in: [packages/core/src/types/middleware/types.ts:37](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/middleware/types.ts#L37)

***

### hardDelete?

> `optional` **hardDelete?**: `boolean`

Defined in: [packages/core/src/types/middleware/types.ts:46](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/middleware/types.ts#L46)

***

### meta?

> `optional` **meta?**: [`AmbitenOperationMeta`](AmbitenOperationMeta.md)

Defined in: [packages/core/src/types/middleware/types.ts:48](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/middleware/types.ts#L48)

***

### modelName?

> `optional` **modelName?**: `string`

Defined in: [packages/core/src/types/middleware/types.ts:32](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/middleware/types.ts#L32)

***

### onlyDeleted?

> `optional` **onlyDeleted?**: `boolean`

Defined in: [packages/core/src/types/middleware/types.ts:45](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/middleware/types.ts#L45)

***

### operation

> **operation**: [`AmbitenMiddlewareOperation`](../type-aliases/AmbitenMiddlewareOperation.md)

Defined in: [packages/core/src/types/middleware/types.ts:31](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/middleware/types.ts#L31)

***

### pipeline?

> `optional` **pipeline?**: `object`[]

Defined in: [packages/core/src/types/middleware/types.ts:41](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/middleware/types.ts#L41)

***

### result?

> `optional` **result?**: `unknown`

Defined in: [packages/core/src/types/middleware/types.ts:47](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/middleware/types.ts#L47)

***

### session?

> `optional` **session?**: `ClientSession`

Defined in: [packages/core/src/types/middleware/types.ts:36](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/middleware/types.ts#L36)

***

### tenantId?

> `optional` **tenantId?**: `string`

Defined in: [packages/core/src/types/middleware/types.ts:34](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/middleware/types.ts#L34)

***

### update?

> `optional` **update?**: `UpdateFilter`\<`T`\>

Defined in: [packages/core/src/types/middleware/types.ts:38](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/middleware/types.ts#L38)

***

### withDeleted?

> `optional` **withDeleted?**: `boolean`

Defined in: [packages/core/src/types/middleware/types.ts:44](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/middleware/types.ts#L44)
