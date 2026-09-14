[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / AmbitenClientConfig

# Interface: AmbitenClientConfig

Defined in: [packages/core/src/types/ambiten.client.type.ts:8](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.client.type.ts#L8)

Configuration options for the AmbitenClient.

## Properties

### options?

> `optional` **options?**: [`AmbitenClientOptions`](AmbitenClientOptions.md)

Defined in: [packages/core/src/types/ambiten.client.type.ts:17](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.client.type.ts#L17)

Optional configuration options for the client.

***

### tenantResolver?

> `optional` **tenantResolver?**: [`TenantClientResolver`](TenantClientResolver.md)

Defined in: [packages/core/src/types/ambiten.client.type.ts:22](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.client.type.ts#L22)

An optional MongoClient instance.

***

### uri

> **uri**: `string`

Defined in: [packages/core/src/types/ambiten.client.type.ts:12](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.client.type.ts#L12)

The MongoDB connection URI.
