[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / AmbitenClientType

# Interface: AmbitenClientType\<T\>

Defined in: [packages/core/src/types/ambiten.client.type.ts:71](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.client.type.ts#L71)

Represents the AmbitenClient interface for interacting with MongoDB.

## Type Parameters

### T

`T` *extends* [`Document`](../type-aliases/Document.md)

The type of the document in the collection.

## Properties

### uri

> **uri**: `string`

Defined in: [packages/core/src/types/ambiten.client.type.ts:75](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.client.type.ts#L75)

The MongoDB connection URI.

## Methods

### collection()

> **collection**(`collectionName`): `Promise`\<`Collection`\<`T`\>\>

Defined in: [packages/core/src/types/ambiten.client.type.ts:100](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.client.type.ts#L100)

Retrieves a collection by name.

#### Parameters

##### collectionName

`string`

The name of the collection.

#### Returns

`Promise`\<`Collection`\<`T`\>\>

A promise that resolves to the collection instance.

***

### connect()

> **connect**(): `Promise`\<`Db`\>

Defined in: [packages/core/src/types/ambiten.client.type.ts:81](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.client.type.ts#L81)

Connects to the MongoDB database.

#### Returns

`Promise`\<`Db`\>

A promise that resolves to the connected database instance.

***

### dropDatabase()

> **dropDatabase**(): `Promise`\<`boolean`\>

Defined in: [packages/core/src/types/ambiten.client.type.ts:87](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.client.type.ts#L87)

Drops the entire database.

#### Returns

`Promise`\<`boolean`\>

A promise that resolves to `true` if the database is dropped successfully.

***

### getClient()

> **getClient**(): `MongoClient`

Defined in: [packages/core/src/types/ambiten.client.type.ts:155](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.client.type.ts#L155)

Retrieves the MongoClient instance.

#### Returns

`MongoClient`

The MongoClient instance.

***

### getCollection()

> **getCollection**(`name`): `Promise`\<`Collection`\<`T`\>\>

Defined in: [packages/core/src/types/ambiten.client.type.ts:107](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.client.type.ts#L107)

Retrieves a collection by name.

#### Parameters

##### name

`string`

The name of the collection.

#### Returns

`Promise`\<`Collection`\<`T`\>\>

A promise that resolves to the collection instance.

***

### getDatabase()

> **getDatabase**(`tenantId`, `uri`): `Promise`\<\{ `client`: `MongoClient`; `db`: `Db`; \}\>

Defined in: [packages/core/src/types/ambiten.client.type.ts:136](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.client.type.ts#L136)

Retrieves the database instance for a specific tenant and URI.

#### Parameters

##### tenantId

`string`

The ID of the tenant.

##### uri

`string`

The MongoDB connection URI.

#### Returns

`Promise`\<\{ `client`: `MongoClient`; `db`: `Db`; \}\>

A promise that resolves to the database instance and its MongoClient.

***

### getDb()

> **getDb**(): `Db`

Defined in: [packages/core/src/types/ambiten.client.type.ts:93](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.client.type.ts#L93)

Retrieves the current database instance.

#### Returns

`Db`

The connected database instance.

***

### getTenantCollection()

> **getTenantCollection**(`tenantId`, `collectionName`): `Promise`\<`Collection`\<`T`\>\>

Defined in: [packages/core/src/types/ambiten.client.type.ts:128](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.client.type.ts#L128)

Retrieves a collection for a specific tenant.

#### Parameters

##### tenantId

`string`

The ID of the tenant.

##### collectionName

`string`

The name of the collection.

#### Returns

`Promise`\<`Collection`\<`T`\>\>

A promise that resolves to the collection instance.

***

### getTenantDB()

> **getTenantDB**(`tenantId`): `Db`

Defined in: [packages/core/src/types/ambiten.client.type.ts:114](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.client.type.ts#L114)

Retrieves the database instance for a specific tenant.

#### Parameters

##### tenantId

`string`

The ID of the tenant.

#### Returns

`Db`

The database instance for the tenant.

***

### setDriver()

> **setDriver**(`mongodbDriver`): `void`

Defined in: [packages/core/src/types/ambiten.client.type.ts:120](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.client.type.ts#L120)

Sets the MongoDB driver.

#### Parameters

##### mongodbDriver

`any`

The MongoDB driver to set.

#### Returns

`void`

***

### useDatabase()

> **useDatabase**(`dbName`): `Promise`\<\{ `client`: `MongoClient`; `db`: `Db`; \}\>

Defined in: [packages/core/src/types/ambiten.client.type.ts:143](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.client.type.ts#L143)

Switches to a different database by name.

#### Parameters

##### dbName

`string`

The name of the database to switch to.

#### Returns

`Promise`\<\{ `client`: `MongoClient`; `db`: `Db`; \}\>

A promise that resolves to the new database instance and its MongoClient.

***

### validateUri()

> **validateUri**(`uri`): `void`

Defined in: [packages/core/src/types/ambiten.client.type.ts:149](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.client.type.ts#L149)

Validates the MongoDB connection URI.

#### Parameters

##### uri

`string`

The MongoDB connection URI.

#### Returns

`void`
