[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / BootstrapClient

# Interface: BootstrapClient

Defined in: [packages/core/src/types/bootstrapClient.type.ts:10](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/bootstrapClient.type.ts#L10)

## Extends

- [`DbProvider`](DbProvider.md)

## Methods

### client()

> **client**(`ctx?`): `Promise`\<`MongoClient`\>

Defined in: [packages/core/src/types/bootstrapClient.type.ts:13](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/bootstrapClient.type.ts#L13)

#### Parameters

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

#### Returns

`Promise`\<`MongoClient`\>

#### Overrides

[`DbProvider`](DbProvider.md).[`client`](DbProvider.md#client)

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [packages/core/src/types/bootstrapClient.type.ts:12](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/bootstrapClient.type.ts#L12)

#### Returns

`Promise`\<`void`\>

***

### collection()

> **collection**\<`T`\>(`collectionName`, `ctx?`): `Promise`\<`Collection`\<`T`\>\>

Defined in: [packages/core/src/types/bootstrapClient.type.ts:15](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/bootstrapClient.type.ts#L15)

#### Type Parameters

##### T

`T` *extends* [`Document`](../type-aliases/Document.md) = [`Document`](../type-aliases/Document.md)

#### Parameters

##### collectionName

`string`

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

#### Returns

`Promise`\<`Collection`\<`T`\>\>

***

### connect()

> **connect**(): `Promise`\<`BootstrapClient`\>

Defined in: [packages/core/src/types/bootstrapClient.type.ts:11](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/bootstrapClient.type.ts#L11)

#### Returns

`Promise`\<`BootstrapClient`\>

***

### db()

> **db**(`ctx?`): `Promise`\<`Db`\>

Defined in: [packages/core/src/types/db.provider.ts:19](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/db.provider.ts#L19)

#### Parameters

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

#### Returns

`Promise`\<`Db`\>

#### Inherited from

[`DbProvider`](DbProvider.md).[`db`](DbProvider.md#db)

***

### startSession()

> **startSession**(`ctx?`): `Promise`\<`ClientSession`\>

Defined in: [packages/core/src/types/bootstrapClient.type.ts:14](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/bootstrapClient.type.ts#L14)

#### Parameters

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

#### Returns

`Promise`\<`ClientSession`\>

#### Overrides

[`DbProvider`](DbProvider.md).[`startSession`](DbProvider.md#startsession)
