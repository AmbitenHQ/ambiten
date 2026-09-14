[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / Relationship

# Interface: Relationship\<T\>

Defined in: [packages/core/src/types/ambiten.model.type.ts:46](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L46)

Represents a relationship between collections in MongoDB.

## Type Parameters

### T

`T` = `any`

The type of the document in the collection.

## Properties

### localField

> **localField**: keyof `T`

Defined in: [packages/core/src/types/ambiten.model.type.ts:55](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L55)

The field in the current document that holds the reference.

***

### ref

> **ref**: `string`

Defined in: [packages/core/src/types/ambiten.model.type.ts:50](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L50)

The name of the referenced collection.
