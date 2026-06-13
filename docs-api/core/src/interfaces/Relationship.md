[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / Relationship

# Interface: Relationship\<T\>

Defined in: [packages/core/src/types/ambiten.model.type.ts:39](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.model.type.ts#L39)

Represents a relationship between collections in MongoDB.

## Type Parameters

### T

`T` = `any`

The type of the document in the collection.

## Properties

### localField

> **localField**: keyof `T`

Defined in: [packages/core/src/types/ambiten.model.type.ts:48](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.model.type.ts#L48)

The field in the current document that holds the reference.

***

### ref

> **ref**: `string`

Defined in: [packages/core/src/types/ambiten.model.type.ts:43](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.model.type.ts#L43)

The name of the referenced collection.
