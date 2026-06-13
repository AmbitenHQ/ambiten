[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / AmbitenBootstrapFactory

# Class: AmbitenBootstrapFactory

Defined in: [packages/core/src/lib-core/bootstrap/ambitenBootstrap.ts:478](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/bootstrap/ambitenBootstrap.ts#L478)

Factory class to create an instance of AmbitenBootstrap.
This class encapsulates the logic for initializing the Ambiten application stack,
including MongoDB, Multi-Tenancy, Redis, GraphQL logger etc. setup.
It can be used to create a fully configured Ambiten instance
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

Defined in: [packages/core/src/lib-core/bootstrap/ambitenBootstrap.ts:479](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/bootstrap/ambitenBootstrap.ts#L479)

#### Parameters

##### options?

[`AmbitenBootstrapFactoryOptions`](../interfaces/AmbitenBootstrapFactoryOptions.md) = `{}`

#### Returns

`Promise`\<[`AmbitenRuntime`](../interfaces/AmbitenRuntime.md)\<[`Document`](../type-aliases/Document.md)\>\>
