[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / DbProvider

# Interface: DbProvider

Defined in: [packages/core/src/types/db.provider.ts:19](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/db.provider.ts#L19)

## Extended by

- [`BootstrapClient`](BootstrapClient.md)

## Methods

### client()?

> `optional` **client**(`ctx?`): `Promise`\<`MongoClient`\>

Defined in: [packages/core/src/types/db.provider.ts:21](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/db.provider.ts#L21)

#### Parameters

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

#### Returns

`Promise`\<`MongoClient`\>

***

### db()

> **db**(`ctx?`): `Promise`\<`Db`\>

Defined in: [packages/core/src/types/db.provider.ts:20](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/db.provider.ts#L20)

#### Parameters

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

#### Returns

`Promise`\<`Db`\>

***

### startSession()?

> `optional` **startSession**(`ctx?`): `Promise`\<`ClientSession`\>

Defined in: [packages/core/src/types/db.provider.ts:22](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/db.provider.ts#L22)

#### Parameters

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

#### Returns

`Promise`\<`ClientSession`\>
