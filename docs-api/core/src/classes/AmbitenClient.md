[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / AmbitenClient

# Class: AmbitenClient

Defined in: [packages/core/src/lib-core/ambitenClient.ts:38](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenClient.ts#L38)

AmbitenClient is a MongoDB client wrapper that provides a simplified interface
for connecting to and interacting with MongoDB databases.

## Implements

- [`BootstrapClient`](../interfaces/BootstrapClient.md)

## Constructors

### Constructor

> **new AmbitenClient**(`_opts`): `AmbitenClient`

Defined in: [packages/core/src/lib-core/ambitenClient.ts:51](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenClient.ts#L51)

#### Parameters

##### \_opts

[`AmbitenClientConfig`](../interfaces/AmbitenClientConfig.md)

#### Returns

`AmbitenClient`

## Methods

### client()

> **client**(`ctx?`): `Promise`\<`MongoClient`\>

Defined in: [packages/core/src/lib-core/ambitenClient.ts:210](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenClient.ts#L210)

#### Parameters

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

#### Returns

`Promise`\<`MongoClient`\>

#### Implementation of

[`BootstrapClient`](../interfaces/BootstrapClient.md).[`client`](../interfaces/BootstrapClient.md#client)

***

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [packages/core/src/lib-core/ambitenClient.ts:639](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenClient.ts#L639)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`BootstrapClient`](../interfaces/BootstrapClient.md).[`close`](../interfaces/BootstrapClient.md#close)

***

### collection()

> **collection**\<`T`\>(`collectionName`, `ctx?`): `Promise`\<`Collection`\<`T`\>\>

Defined in: [packages/core/src/lib-core/ambitenClient.ts:258](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenClient.ts#L258)

#### Type Parameters

##### T

`T` *extends* `Document` = `Document`

#### Parameters

##### collectionName

`string`

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

#### Returns

`Promise`\<`Collection`\<`T`\>\>

#### Implementation of

[`BootstrapClient`](../interfaces/BootstrapClient.md).[`collection`](../interfaces/BootstrapClient.md#collection)

***

### connect()

> **connect**(): `Promise`\<`AmbitenClient`\>

Defined in: [packages/core/src/lib-core/ambitenClient.ts:195](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenClient.ts#L195)

#### Returns

`Promise`\<`AmbitenClient`\>

#### Implementation of

[`BootstrapClient`](../interfaces/BootstrapClient.md).[`connect`](../interfaces/BootstrapClient.md#connect)

***

### db()

> **db**(`ctx?`): `Promise`\<`Db`\>

Defined in: [packages/core/src/lib-core/ambitenClient.ts:108](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenClient.ts#L108)

Resolution order:
1. explicit ctx.db
2. tenant-aware db resolution
3. explicit ctx.dbName on base client
4. mutable override dbName
5. default dbName

#### Parameters

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

#### Returns

`Promise`\<`Db`\>

#### Implementation of

[`BootstrapClient`](../interfaces/BootstrapClient.md).[`db`](../interfaces/BootstrapClient.md#db)

***

### disconnect()

> **disconnect**(): `Promise`\<`void`\>

Defined in: [packages/core/src/lib-core/ambitenClient.ts:651](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenClient.ts#L651)

#### Returns

`Promise`\<`void`\>

***

### dropCollection()

> **dropCollection**(`collectionName?`, `ctx?`): `Promise`\<`void`\>

Defined in: [packages/core/src/lib-core/ambitenClient.ts:580](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenClient.ts#L580)

#### Parameters

##### collectionName?

`string`

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

#### Returns

`Promise`\<`void`\>

***

### dropDatabase()

> **dropDatabase**(`ctx?`): `Promise`\<`boolean`\>

Defined in: [packages/core/src/lib-core/ambitenClient.ts:618](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenClient.ts#L618)

#### Parameters

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

#### Returns

`Promise`\<`boolean`\>

***

### getClusterInfo()

> **getClusterInfo**(): `Promise`\<`ClusterInfo`\>

Defined in: [packages/core/src/lib-core/ambitenClient.ts:279](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenClient.ts#L279)

#### Returns

`Promise`\<`ClusterInfo`\>

***

### getCollection()

> **getCollection**\<`T`\>(`collectionName`, `ctx?`): `Promise`\<`Collection`\<`T`\>\>

Defined in: [packages/core/src/lib-core/ambitenClient.ts:266](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenClient.ts#L266)

#### Type Parameters

##### T

`T` *extends* `Document`

#### Parameters

##### collectionName

`string`

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

#### Returns

`Promise`\<`Collection`\<`T`\>\>

***

### isConnected()

> **isConnected**(): `boolean`

Defined in: [packages/core/src/lib-core/ambitenClient.ts:655](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenClient.ts#L655)

#### Returns

`boolean`

***

### resetDatabase()

> **resetDatabase**(): `void`

Defined in: [packages/core/src/lib-core/ambitenClient.ts:571](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenClient.ts#L571)

#### Returns

`void`

***

### startSession()

> **startSession**(`ctx?`): `Promise`\<`ClientSession`\>

Defined in: [packages/core/src/lib-core/ambitenClient.ts:575](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenClient.ts#L575)

#### Parameters

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

#### Returns

`Promise`\<`ClientSession`\>

#### Implementation of

[`BootstrapClient`](../interfaces/BootstrapClient.md).[`startSession`](../interfaces/BootstrapClient.md#startsession)

***

### useCollection()

> **useCollection**(`collectionName`): `Promise`\<`Collection`\<`any`\>\>

Defined in: [packages/core/src/lib-core/ambitenClient.ts:236](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenClient.ts#L236)

#### Parameters

##### collectionName

`string`

#### Returns

`Promise`\<`Collection`\<`any`\>\>

***

### useDatabase()

> **useDatabase**(`dbName`): `Promise`\<\{ `client`: `MongoClient`; `db`: `Db`; \}\>

Defined in: [packages/core/src/lib-core/ambitenClient.ts:340](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenClient.ts#L340)

Mutable legacy helper. Prefer withDatabase() or withScope() in request-safe flows.

#### Parameters

##### dbName

`string`

#### Returns

`Promise`\<\{ `client`: `MongoClient`; `db`: `Db`; \}\>

***

### validateUri()

> **validateUri**(`uri`): `void`

Defined in: [packages/core/src/lib-core/ambitenClient.ts:163](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenClient.ts#L163)

#### Parameters

##### uri

`string`

#### Returns

`void`

***

### withContext()

> **withContext**\<`R`\>(`context`, `callback`): `Promise`\<`R`\>

Defined in: [packages/core/src/lib-core/ambitenClient.ts:460](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenClient.ts#L460)

#### Type Parameters

##### R

`R`

#### Parameters

##### context

###### collectionName?

`string`

###### dbName?

`string`

###### requestId?

`string`

###### session?

`ClientSession`

###### tenantId?

`string`

##### callback

() => `Promise`\<`R`\>

#### Returns

`Promise`\<`R`\>

***

### withDatabase()

> **withDatabase**(`dbName`): [`BootstrapClient`](../interfaces/BootstrapClient.md)

Defined in: [packages/core/src/lib-core/ambitenClient.ts:354](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenClient.ts#L354)

#### Parameters

##### dbName

`string`

#### Returns

[`BootstrapClient`](../interfaces/BootstrapClient.md)

***

### withScope()

> **withScope**(`scope`): [`BootstrapClient`](../interfaces/BootstrapClient.md)

Defined in: [packages/core/src/lib-core/ambitenClient.ts:527](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenClient.ts#L527)

#### Parameters

##### scope

###### dbName?

`string`

###### tenantId?

`string`

#### Returns

[`BootstrapClient`](../interfaces/BootstrapClient.md)

***

### withTenant()

> **withTenant**(`tenantId`): [`BootstrapClient`](../interfaces/BootstrapClient.md)

Defined in: [packages/core/src/lib-core/ambitenClient.ts:499](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenClient.ts#L499)

#### Parameters

##### tenantId

`string`

#### Returns

[`BootstrapClient`](../interfaces/BootstrapClient.md)

***

### db()

> `static` **db**(`ctx?`): `Promise`\<`Db`\>

Defined in: [packages/core/src/lib-core/ambitenClient.ts:159](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenClient.ts#L159)

#### Parameters

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

#### Returns

`Promise`\<`Db`\>

***

### handleLogBatch()

> `static` **handleLogBatch**(`batch`, `transporter?`): `Promise`\<`void`\>

Defined in: [packages/core/src/lib-core/ambitenClient.ts:669](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenClient.ts#L669)

#### Parameters

##### batch

(`TopologyOpeningEvent` \| `TopologyClosedEvent`)[]

##### transporter?

`Pick`\<`Transporter`, `"write"`\>

#### Returns

`Promise`\<`void`\>

***

### handleTopologyEvent()

> `static` **handleTopologyEvent**(`event`): `void`

Defined in: [packages/core/src/lib-core/ambitenClient.ts:659](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenClient.ts#L659)

#### Parameters

##### event

`TopologyOpeningEvent` \| `TopologyClosedEvent`

#### Returns

`void`

***

### init()

> `static` **init**(`opts?`): `AmbitenClient`

Defined in: [packages/core/src/lib-core/ambitenClient.ts:69](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenClient.ts#L69)

#### Parameters

##### opts?

`Partial`\<[`AmbitenClientConfig`](../interfaces/AmbitenClientConfig.md)\>

#### Returns

`AmbitenClient`

***

### resolveRuntime()

> `static` **resolveRuntime**(): `Promise`\<\{ `db`: `Db`; `session`: `ClientSession` \| `undefined`; \}\>

Defined in: [packages/core/src/lib-core/ambitenClient.ts:316](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenClient.ts#L316)

Resolves database + session + runtime binding

#### Returns

`Promise`\<\{ `db`: `Db`; `session`: `ClientSession` \| `undefined`; \}\>
