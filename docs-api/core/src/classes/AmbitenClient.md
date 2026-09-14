[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / AmbitenClient

# Class: AmbitenClient

Defined in: [packages/core/src/lib-core/ambitenClient.ts:39](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenClient.ts#L39)

AmbitenClient is a MongoDB client wrapper that provides a simplified interface
for connecting to and interacting with MongoDB databases.

## Implements

- [`BootstrapClient`](../interfaces/BootstrapClient.md)

## Constructors

### Constructor

> **new AmbitenClient**(`_opts`): `AmbitenClient`

Defined in: [packages/core/src/lib-core/ambitenClient.ts:52](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenClient.ts#L52)

#### Parameters

##### \_opts

[`AmbitenClientConfig`](../interfaces/AmbitenClientConfig.md)

#### Returns

`AmbitenClient`

## Methods

### client()

> **client**(`ctx?`): `Promise`\<`MongoClient`\>

Defined in: [packages/core/src/lib-core/ambitenClient.ts:238](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenClient.ts#L238)

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

Defined in: [packages/core/src/lib-core/ambitenClient.ts:667](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenClient.ts#L667)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`BootstrapClient`](../interfaces/BootstrapClient.md).[`close`](../interfaces/BootstrapClient.md#close)

***

### collection()

> **collection**\<`T`\>(`collectionName`, `ctx?`): `Promise`\<`Collection`\<`T`\>\>

Defined in: [packages/core/src/lib-core/ambitenClient.ts:286](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenClient.ts#L286)

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

Defined in: [packages/core/src/lib-core/ambitenClient.ts:223](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenClient.ts#L223)

#### Returns

`Promise`\<`AmbitenClient`\>

#### Implementation of

[`BootstrapClient`](../interfaces/BootstrapClient.md).[`connect`](../interfaces/BootstrapClient.md#connect)

***

### db()

> **db**(`ctx?`): `Promise`\<`Db`\>

Defined in: [packages/core/src/lib-core/ambitenClient.ts:121](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenClient.ts#L121)

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

Defined in: [packages/core/src/lib-core/ambitenClient.ts:679](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenClient.ts#L679)

#### Returns

`Promise`\<`void`\>

***

### dropCollection()

> **dropCollection**(`collectionName?`, `ctx?`): `Promise`\<`void`\>

Defined in: [packages/core/src/lib-core/ambitenClient.ts:608](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenClient.ts#L608)

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

Defined in: [packages/core/src/lib-core/ambitenClient.ts:646](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenClient.ts#L646)

#### Parameters

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

#### Returns

`Promise`\<`boolean`\>

***

### getClusterInfo()

> **getClusterInfo**(): `Promise`\<`ClusterInfo`\>

Defined in: [packages/core/src/lib-core/ambitenClient.ts:307](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenClient.ts#L307)

#### Returns

`Promise`\<`ClusterInfo`\>

***

### getCollection()

> **getCollection**\<`T`\>(`collectionName`, `ctx?`): `Promise`\<`Collection`\<`T`\>\>

Defined in: [packages/core/src/lib-core/ambitenClient.ts:294](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenClient.ts#L294)

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

Defined in: [packages/core/src/lib-core/ambitenClient.ts:683](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenClient.ts#L683)

#### Returns

`boolean`

***

### resetDatabase()

> **resetDatabase**(): `void`

Defined in: [packages/core/src/lib-core/ambitenClient.ts:599](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenClient.ts#L599)

#### Returns

`void`

***

### startSession()

> **startSession**(`ctx?`): `Promise`\<`ClientSession`\>

Defined in: [packages/core/src/lib-core/ambitenClient.ts:603](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenClient.ts#L603)

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

Defined in: [packages/core/src/lib-core/ambitenClient.ts:264](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenClient.ts#L264)

#### Parameters

##### collectionName

`string`

#### Returns

`Promise`\<`Collection`\<`any`\>\>

***

### useDatabase()

> **useDatabase**(`dbName`): `Promise`\<\{ `client`: `MongoClient`; `db`: `Db`; \}\>

Defined in: [packages/core/src/lib-core/ambitenClient.ts:368](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenClient.ts#L368)

Mutable legacy helper. Prefer withDatabase() or withScope() in request-safe flows.

#### Parameters

##### dbName

`string`

#### Returns

`Promise`\<\{ `client`: `MongoClient`; `db`: `Db`; \}\>

***

### validateUri()

> **validateUri**(`uri`): `void`

Defined in: [packages/core/src/lib-core/ambitenClient.ts:191](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenClient.ts#L191)

#### Parameters

##### uri

`string`

#### Returns

`void`

***

### withContext()

> **withContext**\<`R`\>(`context`, `callback`): `Promise`\<`R`\>

Defined in: [packages/core/src/lib-core/ambitenClient.ts:488](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenClient.ts#L488)

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

Defined in: [packages/core/src/lib-core/ambitenClient.ts:382](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenClient.ts#L382)

#### Parameters

##### dbName

`string`

#### Returns

[`BootstrapClient`](../interfaces/BootstrapClient.md)

***

### withScope()

> **withScope**(`scope`): [`BootstrapClient`](../interfaces/BootstrapClient.md)

Defined in: [packages/core/src/lib-core/ambitenClient.ts:555](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenClient.ts#L555)

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

Defined in: [packages/core/src/lib-core/ambitenClient.ts:527](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenClient.ts#L527)

#### Parameters

##### tenantId

`string`

#### Returns

[`BootstrapClient`](../interfaces/BootstrapClient.md)

***

### db()

> `static` **db**(`ctx?`): `Promise`\<`Db`\>

Defined in: [packages/core/src/lib-core/ambitenClient.ts:187](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenClient.ts#L187)

#### Parameters

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

#### Returns

`Promise`\<`Db`\>

***

### handleLogBatch()

> `static` **handleLogBatch**(`batch`, `transporter?`): `Promise`\<`void`\>

Defined in: [packages/core/src/lib-core/ambitenClient.ts:697](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenClient.ts#L697)

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

Defined in: [packages/core/src/lib-core/ambitenClient.ts:687](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenClient.ts#L687)

#### Parameters

##### event

`TopologyOpeningEvent` \| `TopologyClosedEvent`

#### Returns

`void`

***

### init()

> `static` **init**(`opts?`): `AmbitenClient`

Defined in: [packages/core/src/lib-core/ambitenClient.ts:70](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenClient.ts#L70)

#### Parameters

##### opts?

`Partial`\<[`AmbitenClientConfig`](../interfaces/AmbitenClientConfig.md)\>

#### Returns

`AmbitenClient`

***

### resolveRuntime()

> `static` **resolveRuntime**(): `Promise`\<\{ `db`: `Db`; `session`: `ClientSession` \| `undefined`; \}\>

Defined in: [packages/core/src/lib-core/ambitenClient.ts:344](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenClient.ts#L344)

Resolves database + session + runtime binding

#### Returns

`Promise`\<\{ `db`: `Db`; `session`: `ClientSession` \| `undefined`; \}\>
