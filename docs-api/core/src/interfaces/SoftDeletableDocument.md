[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / SoftDeletableDocument

# Interface: SoftDeletableDocument

Defined in: [packages/core/src/plugins/softDelete/types.ts:12](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/plugins/softDelete/types.ts#L12)

Represents a generic document in MongoDB.

## Extends

- [`Document`](../type-aliases/Document.md)

## Indexable

> \[`key`: `string`\]: `any`

## Properties

### deletedAt?

> `optional` **deletedAt?**: `Date` \| `null`

Defined in: [packages/core/src/plugins/softDelete/types.ts:13](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/plugins/softDelete/types.ts#L13)

***

### deletedBy?

> `optional` **deletedBy?**: `string` \| `null`

Defined in: [packages/core/src/plugins/softDelete/types.ts:15](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/plugins/softDelete/types.ts#L15)

***

### isDeleted?

> `optional` **isDeleted?**: `boolean`

Defined in: [packages/core/src/plugins/softDelete/types.ts:14](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/plugins/softDelete/types.ts#L14)
