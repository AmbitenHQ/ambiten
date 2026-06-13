[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / DbProvider

# Interface: DbProvider

Defined in: [packages/core/src/types/db.provider.ts:18](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/db.provider.ts#L18)

## Extended by

- [`BootstrapClient`](BootstrapClient.md)

## Methods

### client()?

> `optional` **client**(`ctx?`): `Promise`\<`MongoClient`\>

Defined in: [packages/core/src/types/db.provider.ts:20](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/db.provider.ts#L20)

#### Parameters

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

#### Returns

`Promise`\<`MongoClient`\>

***

### db()

> **db**(`ctx?`): `Promise`\<`Db`\>

Defined in: [packages/core/src/types/db.provider.ts:19](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/db.provider.ts#L19)

#### Parameters

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

#### Returns

`Promise`\<`Db`\>

***

### startSession()?

> `optional` **startSession**(`ctx?`): `Promise`\<`ClientSession`\>

Defined in: [packages/core/src/types/db.provider.ts:21](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/db.provider.ts#L21)

#### Parameters

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

#### Returns

`Promise`\<`ClientSession`\>
