[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / AmbitenConfig

# Interface: AmbitenConfig

Defined in: [packages/core/src/types/ambitenConfig.ts:29](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambitenConfig.ts#L29)

## Properties

### advanced?

> `optional` **advanced?**: `object`

Defined in: [packages/core/src/types/ambitenConfig.ts:96](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambitenConfig.ts#L96)

Advanced runtime configuration.

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

Defined in: [packages/core/src/types/ambitenConfig.ts:114](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambitenConfig.ts#L114)

Optional config metadata/versioning.
Useful for generated config files and forward compatibility.

***

### connection?

> `optional` **connection?**: `object`

Defined in: [packages/core/src/types/ambitenConfig.ts:42](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambitenConfig.ts#L42)

Connection settings used when no provider/mongoClient is supplied.

#### options?

> `optional` **options?**: `Record`\<`string`, `any`\>

#### uri

> **uri**: `string`

***

### features?

> `optional` **features?**: `object`

Defined in: [packages/core/src/types/ambitenConfig.ts:84](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambitenConfig.ts#L84)

Optional feature paths and integrations.
These are especially useful for generated project structures and bootstrap discovery.

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

Defined in: [packages/core/src/types/ambitenConfig.ts:73](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambitenConfig.ts#L73)

Optional GraphQL auto-generation/bootstrap feature.
Primarily useful for playgrounds, prototyping, and generated GraphQL flows.

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

Defined in: [packages/core/src/types/ambitenConfig.ts:67](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambitenConfig.ts#L67)

Logger configuration.

***

### model?

> `optional` **model?**: [`AmbitenModelOptions`](AmbitenModelOptions.md)\<`any`\>

Defined in: [packages/core/src/types/ambitenConfig.ts:51](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambitenConfig.ts#L51)

Optional default model/schema bootstrap config.
These are runtime-facing defaults, not request resolver functions.

***

### mongoClient?

> `optional` **mongoClient?**: [`BootstrapClient`](BootstrapClient.md)

Defined in: [packages/core/src/types/ambitenConfig.ts:37](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambitenConfig.ts#L37)

***

### multiTenant?

> `optional` **multiTenant?**: `object`

Defined in: [packages/core/src/types/ambitenConfig.ts:57](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambitenConfig.ts#L57)

Multi-tenant runtime configuration.

#### enabled?

> `optional` **enabled?**: `boolean`

#### headerKey?

> `optional` **headerKey?**: `string`

#### initOptions?

> `optional` **initOptions?**: [`InitMultiTenancyOptions`](InitMultiTenancyOptions.md)

#### tenants?

> `optional` **tenants?**: `Record`\<`string`, `string`\>

***

### projectName?

> `optional` **projectName?**: `string`

Defined in: [packages/core/src/types/ambitenConfig.ts:30](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambitenConfig.ts#L30)

***

### provider?

> `optional` **provider?**: [`BootstrapClient`](BootstrapClient.md)

Defined in: [packages/core/src/types/ambitenConfig.ts:36](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambitenConfig.ts#L36)

Optional externally provided bootstrap client/provider.
If provided, bootstrap uses this instead of creating one from connection config.

***

### schema?

> `optional` **schema?**: [`SchemaDefinition`](../type-aliases/SchemaDefinition.md)\<[`Document`](../type-aliases/Document.md)\>

Defined in: [packages/core/src/types/ambitenConfig.ts:52](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambitenConfig.ts#L52)
