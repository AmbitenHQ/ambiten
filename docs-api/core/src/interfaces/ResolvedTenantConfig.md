[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / ResolvedTenantConfig

# Interface: ResolvedTenantConfig

Defined in: [packages/core/src/types/tenant-config-resolver.ts:9](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/tenant-config-resolver.ts#L9)

Database configuration returned when Ambiten dynamically
discovers a tenant that is not already registered.

This represents external tenant configuration only.
Runtime state such as MongoClient instances and lazy/eager
registration state is owned by MultiTenantManager.

## Properties

### dbName?

> `optional` **dbName?**: `string`

Defined in: [packages/core/src/types/tenant-config-resolver.ts:26](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/tenant-config-resolver.ts#L26)

Optional database name.

When omitted, MultiTenantManager may resolve the database
name from the URI or fall back to its existing tenant
database-name resolution strategy.

***

### metadata?

> `optional` **metadata?**: `Record`\<`string`, `unknown`\>

Defined in: [packages/core/src/types/tenant-config-resolver.ts:35](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/tenant-config-resolver.ts#L35)

Optional application-defined tenant metadata.

Ambiten does not interpret these values. They may be used
by application infrastructure for information such as
region, tier, shard, deployment group, or other metadata.

***

### uri

> **uri**: `string`

Defined in: [packages/core/src/types/tenant-config-resolver.ts:17](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/tenant-config-resolver.ts#L17)

MongoDB connection URI for the tenant.

#### Example

```ts
"mongodb://localhost:27017/tenant-a"
"mongodb+srv://user:password@cluster.mongodb.net/tenant-a"
```
