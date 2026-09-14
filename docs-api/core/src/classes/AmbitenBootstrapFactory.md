[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / AmbitenBootstrapFactory

# Class: AmbitenBootstrapFactory

Defined in: [packages/core/src/lib-core/bootstrap/ambitenBootstrap.ts:546](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/bootstrap/ambitenBootstrap.ts#L546)

Factory which returns the instance of the main AmbitenBootstrap and 
Attached a method AmbitenBootstrap.create() which initializes the AmbitenBootstrap.
This class encapsulates the logic for initializing the Ambiten application stack,
including MongoDB, Multi-Tenancy, Redis, GraphQL logger etc. setup.
It can be used to create a fully configured Ambiten application.
with optional configuration parameters.

## Example

```ts
const Ambiten = await AmbitenBootstrapFactory.create();
const db = Ambiten.getMongoClient();
await db.connect();
const graphql = await Ambiten.getGraphQL();
// You can now use the GraphQL instance to generate schema or start a server
// or perform other GraphQL related operations
graphql.generateSchema();
Ambiten.getRedisClient();
// or with custom config
const Ambiten = await AmbitenBootstrapFactory.create(customConfig);
```

## Param

**config**

Optional configuration object for Ambiten.

## Constructors

### Constructor

> **new AmbitenBootstrapFactory**(): `AmbitenBootstrapFactory`

#### Returns

`AmbitenBootstrapFactory`

## Methods

### create()

> `static` **create**(`options?`): `Promise`\<[`AmbitenRuntime`](../interfaces/AmbitenRuntime.md)\<[`Document`](../type-aliases/Document.md)\>\>

Defined in: [packages/core/src/lib-core/bootstrap/ambitenBootstrap.ts:547](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/bootstrap/ambitenBootstrap.ts#L547)

#### Parameters

##### options?

`AmbitenBootstrapFactoryOptions` = `{}`

#### Returns

`Promise`\<[`AmbitenRuntime`](../interfaces/AmbitenRuntime.md)\<[`Document`](../type-aliases/Document.md)\>\>
