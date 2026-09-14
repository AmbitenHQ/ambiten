[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / AmbitenModelOptions

# Interface: AmbitenModelOptions\<T\>

Defined in: [packages/core/src/types/ambiten.model.type.ts:17](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L17)

Options for configuring an Ambiten model.

## Type Parameters

### T

`T` *extends* [`Document`](../type-aliases/Document.md) = `any`

The type of the document in the model.

## Properties

### Ambiten?

> `optional` **Ambiten?**: [`AmbitenClient`](../classes/AmbitenClient.md)

Defined in: [packages/core/src/types/ambiten.model.type.ts:20](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L20)

***

### collection?

> `optional` **collection?**: `Collection`\<`T`\>

Defined in: [packages/core/src/types/ambiten.model.type.ts:23](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L23)

***

### collectionName

> **collectionName**: `string`

Defined in: [packages/core/src/types/ambiten.model.type.ts:18](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L18)

***

### ctx?

> `optional` **ctx?**: [`ModelContext`](../type-aliases/ModelContext.md)

Defined in: [packages/core/src/types/ambiten.model.type.ts:22](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L22)

***

### gcConfig?

> `optional` **gcConfig?**: `object`

Defined in: [packages/core/src/types/ambiten.model.type.ts:24](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L24)

#### createdAtField?

> `optional` **createdAtField?**: `string`

#### enableGC?

> `optional` **enableGC?**: `boolean`

#### field?

> `optional` **field?**: `string`

#### indexName?

> `optional` **indexName?**: `string`

#### ttl

> **ttl**: `number`

#### updatedAtField?

> `optional` **updatedAtField?**: `string`

***

### provider?

> `optional` **provider?**: [`DbProvider`](DbProvider.md)

Defined in: [packages/core/src/types/ambiten.model.type.ts:21](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L21)

***

### schema?

> `optional` **schema?**: [`AmbitenSchema`](../classes/AmbitenSchema.md)\<`T`\>

Defined in: [packages/core/src/types/ambiten.model.type.ts:19](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L19)
