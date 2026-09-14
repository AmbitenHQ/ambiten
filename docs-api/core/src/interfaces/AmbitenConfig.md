[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / AmbitenConfig

# Interface: AmbitenConfig\<T\>

Defined in: [packages/core/src/types/ambitenConfig.ts:30](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambitenConfig.ts#L30)

## Type Parameters

### T

`T` *extends* [`Document`](../type-aliases/Document.md) = `any`

## Properties

### advanced?

> `optional` **advanced?**: `object`

Defined in: [packages/core/src/types/ambitenConfig.ts:93](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambitenConfig.ts#L93)

#### autoInstall?

> `optional` **autoInstall?**: `boolean`

#### circuitBreaker?

> `optional` **circuitBreaker?**: `object`

##### circuitBreaker.enabled?

> `optional` **enabled?**: `boolean`

##### circuitBreaker.retryAttempts?

> `optional` **retryAttempts?**: `number`

#### garbageCollector?

> `optional` **garbageCollector?**: `object`

##### garbageCollector.enabled?

> `optional` **enabled?**: `boolean`

##### garbageCollector.logResults?

> `optional` **logResults?**: `boolean`

##### garbageCollector.retentionPeriod?

> `optional` **retentionPeriod?**: `string` \| `number`

#### gcCron?

> `optional` **gcCron?**: `string`

***

### configVersion?

> `optional` **configVersion?**: `string`

Defined in: [packages/core/src/types/ambitenConfig.ts:110](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambitenConfig.ts#L110)

***

### connection?

> `optional` **connection?**: `object`

Defined in: [packages/core/src/types/ambitenConfig.ts:38](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambitenConfig.ts#L38)

#### options?

> `optional` **options?**: `Record`\<`string`, `any`\>

#### uri

> **uri**: `string`

***

### features?

> `optional` **features?**: `object`

Defined in: [packages/core/src/types/ambitenConfig.ts:84](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambitenConfig.ts#L84)

#### models?

> `optional` **models?**: `string`

#### redisUri?

> `optional` **redisUri?**: `string`

#### resolvers?

> `optional` **resolvers?**: `Record`\<`string`, `any`\> \| `Record`\<`string`, `any`\>[]

#### schemas?

> `optional` **schemas?**: `string`

#### typeDefs?

> `optional` **typeDefs?**: `string`

#### useRedisCache?

> `optional` **useRedisCache?**: `boolean`

***

### graphql?

> `optional` **graphql?**: `object`

Defined in: [packages/core/src/types/ambitenConfig.ts:77](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambitenConfig.ts#L77)

#### enabled?

> `optional` **enabled?**: `boolean`

#### playground?

> `optional` **playground?**: `boolean`

#### schemaOutputPath?

> `optional` **schemaOutputPath?**: `string`

#### subscriptions?

> `optional` **subscriptions?**: `boolean`

***

### logger?

> `optional` **logger?**: [`AmbitenLoggerSettings`](AmbitenLoggerSettings.md)

Defined in: [packages/core/src/types/ambitenConfig.ts:75](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambitenConfig.ts#L75)

***

### model?

> `optional` **model?**: [`BootstrapModelOptions`](../type-aliases/BootstrapModelOptions.md)\<`T`\>

Defined in: [packages/core/src/types/ambitenConfig.ts:43](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambitenConfig.ts#L43)

***

### mongoClient?

> `optional` **mongoClient?**: [`BootstrapClient`](BootstrapClient.md)

Defined in: [packages/core/src/types/ambitenConfig.ts:36](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambitenConfig.ts#L36)

***

### multiTenant?

> `optional` **multiTenant?**: `object`

Defined in: [packages/core/src/types/ambitenConfig.ts:47](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambitenConfig.ts#L47)

#### enabled?

> `optional` **enabled?**: `boolean`

#### headerKey?

> `optional` **headerKey?**: `string`

Header used by supported runtime integrations
to identify the active tenant.

##### Default

```ts
"x-tenant-id"
```

#### initOptions?

> `optional` **initOptions?**: [`InitMultiTenancyOptions`](InitMultiTenancyOptions.md)

#### tenantConfigResolver?

> `optional` **tenantConfigResolver?**: [`TenantConfigResolver`](../type-aliases/TenantConfigResolver.md)

Dynamically resolves configuration for tenants
that are not already registered.

#### tenants?

> `optional` **tenants?**: `Record`\<`string`, `string`\>

Static tenant ID → MongoDB URI mappings.

Useful for local development, tests,
and applications with a known tenant set.

***

### projectName?

> `optional` **projectName?**: `string`

Defined in: [packages/core/src/types/ambitenConfig.ts:33](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambitenConfig.ts#L33)

***

### provider?

> `optional` **provider?**: [`BootstrapClient`](BootstrapClient.md)

Defined in: [packages/core/src/types/ambitenConfig.ts:35](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambitenConfig.ts#L35)

***

### schema?

> `optional` **schema?**: [`SchemaDefinition`](../type-aliases/SchemaDefinition.md)\<`T`\>

Defined in: [packages/core/src/types/ambitenConfig.ts:45](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambitenConfig.ts#L45)
