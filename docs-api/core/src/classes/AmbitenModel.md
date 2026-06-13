[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / AmbitenModel

# Class: AmbitenModel\<T\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:82](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L82)

A MongoDB-backed model with schema validation, middleware, multi-tenancy,
transactions, caching, soft-delete support, and query instrumentation.

## Type Parameters

### T

`T` *extends* [`Document`](../type-aliases/Document.md)

The MongoDB document shape handled by this model.

## Constructors

### Constructor

> **new AmbitenModel**\<`T`\>(`options`): `AmbitenModel`\<`T`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:115](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L115)

Creates a new model instance.

#### Parameters

##### options

[`AmbitenModelOptions`](../interfaces/AmbitenModelOptions.md)\<`T`\>

Model configuration including collection, schema, provider,
default context, and optional GC configuration.

#### Returns

`AmbitenModel`\<`T`\>

## Accessors

### schema

#### Get Signature

> **get** **schema**(): [`AmbitenSchema`](AmbitenSchema.md)\<`T`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:528](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L528)

Returns the schema attached to this model.

##### Returns

[`AmbitenSchema`](AmbitenSchema.md)\<`T`\>

## Methods

### after()

> **after**(`operation`, `handler`): `this`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:5404](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L5404)

#### Parameters

##### operation

[`AmbitenMiddlewareOperation`](../type-aliases/AmbitenMiddlewareOperation.md)

##### handler

[`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>

#### Returns

`this`

***

### afterAggregate()

> **afterAggregate**(`handler`): `this`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:5482](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L5482)

#### Parameters

##### handler

[`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>

#### Returns

`this`

***

### afterBulkInsert()

> **afterBulkInsert**(`handler`): `this`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:5466](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L5466)

#### Parameters

##### handler

[`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>

#### Returns

`this`

***

### afterBulkUpdate()

> **afterBulkUpdate**(`handler`): `this`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:5474](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L5474)

#### Parameters

##### handler

[`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>

#### Returns

`this`

***

### afterDeleteMany()

> **afterDeleteMany**(`handler`): `this`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:5458](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L5458)

#### Parameters

##### handler

[`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>

#### Returns

`this`

***

### afterDeleteOne()

> **afterDeleteOne**(`handler`): `this`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:5450](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L5450)

#### Parameters

##### handler

[`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>

#### Returns

`this`

***

### afterFind()

> **afterFind**(`handler`): `this`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:5418](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L5418)

#### Parameters

##### handler

[`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>

#### Returns

`this`

***

### afterFindOne()

> **afterFindOne**(`handler`): `this`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:5426](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L5426)

#### Parameters

##### handler

[`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>

#### Returns

`this`

***

### afterFindOneAndDelete()

> **afterFindOneAndDelete**(`handler`): `this`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:5498](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L5498)

#### Parameters

##### handler

[`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>

#### Returns

`this`

***

### afterFindOneAndReplace()

> **afterFindOneAndReplace**(`handler`): `this`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:5506](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L5506)

#### Parameters

##### handler

[`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>

#### Returns

`this`

***

### afterFindOneAndUpdate()

> **afterFindOneAndUpdate**(`handler`): `this`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:5490](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L5490)

#### Parameters

##### handler

[`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>

#### Returns

`this`

***

### afterFindOneAndUpsert()

> **afterFindOneAndUpsert**(`handler`): `this`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:5514](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L5514)

#### Parameters

##### handler

[`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>

#### Returns

`this`

***

### afterSave()

> **afterSave**(`handler`): `this`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:5434](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L5434)

#### Parameters

##### handler

[`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>

#### Returns

`this`

***

### afterUpdateOne()

> **afterUpdateOne**(`handler`): `this`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:5442](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L5442)

#### Parameters

##### handler

[`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>

#### Returns

`this`

***

### aggregate()

> **aggregate**\<`U`\>(`pipeline`, `options?`, `externalSession?`, `ctx?`, `queryOptions?`): `Promise`\<`U`[]\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:3455](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L3455)

Executes an aggregation pipeline against the model collection.

This operation runs inside the active Ambiten runtime context, is instrumented
through [measureQuery](../functions/measureQuery.md), executes registered aggregate middlewares,
supports optional query-result caching, and publishes a database change event
after execution.

When caching is enabled through [QueryOptions](../interfaces/QueryOptions.md), the aggregation result
is stored and reused using a tenant-aware cache key derived from the
collection, pipeline, options, and runtime context.

#### Type Parameters

##### U

`U` *extends* [`Document`](../type-aliases/Document.md)

The aggregation result document shape.

#### Parameters

##### pipeline

`object`[]

MongoDB aggregation pipeline stages.

##### options?

`AggregateOptions` = `{}`

Optional MongoDB aggregation options.

##### externalSession?

`ClientSession`

Optional explicit client session to use for the aggregation.

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

Optional model execution context for tenant, database,
collection, session, and related runtime overrides.

##### queryOptions?

[`QueryOptions`](../interfaces/QueryOptions.md)

Optional query-level features such as caching.

#### Returns

`Promise`\<`U`[]\>

The aggregation result array.

#### Throws

When the pipeline is missing or invalid.

***

### aggregateWithCache()

> **aggregateWithCache**(`pipeline`, `cacheKey`, `cacheDuration?`): `Promise`\<`T`[]\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:3932](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L3932)

Aggregates documents in the collection using a pipeline with caching.

#### Parameters

##### pipeline

`object`[]

The aggregation pipeline.

##### cacheKey

`string`

The cache key.

##### cacheDuration?

`number` = `300`

The cache duration in seconds.

#### Returns

`Promise`\<`T`[]\>

The aggregation result as an array.

#### Throws

If the pipeline is not valid or the cache key is not a string.

***

### aggregateWithTransaction()

> **aggregateWithTransaction**\<`U`\>(`pipeline`, `options?`, `ctx?`): `Promise`\<`U`[]\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:3597](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L3597)

Executes an aggregation pipeline inside a transaction-aware runtime context.

This transactional variant runs within the active Ambiten runtime context,
executes registered aggregate middlewares, triggers schema aggregate hooks,
instruments the query through [measureQuery](../functions/measureQuery.md), and publishes a database
change event after execution.

#### Type Parameters

##### U

`U` *extends* [`Document`](../type-aliases/Document.md)

The aggregation result document shape.

#### Parameters

##### pipeline

`object`[]

MongoDB aggregation pipeline stages.

##### options?

`AggregateOptions` = `{}`

Optional MongoDB aggregation options.

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

Optional model execution context for tenant, database,
collection, session, and transaction-aware runtime overrides.

#### Returns

`Promise`\<`U`[]\>

The aggregation result array.

#### Throws

When the pipeline is missing or invalid.

***

### before()

> **before**(`operation`, `handler`): `this`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:5394](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L5394)

#### Parameters

##### operation

[`AmbitenMiddlewareOperation`](../type-aliases/AmbitenMiddlewareOperation.md)

##### handler

[`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>

#### Returns

`this`

***

### beforeAggregate()

> **beforeAggregate**(`handler`): `this`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:5478](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L5478)

#### Parameters

##### handler

[`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>

#### Returns

`this`

***

### beforeBulkInsert()

> **beforeBulkInsert**(`handler`): `this`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:5462](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L5462)

#### Parameters

##### handler

[`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>

#### Returns

`this`

***

### beforeBulkUpdate()

> **beforeBulkUpdate**(`handler`): `this`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:5470](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L5470)

#### Parameters

##### handler

[`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>

#### Returns

`this`

***

### beforeDeleteMany()

> **beforeDeleteMany**(`handler`): `this`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:5454](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L5454)

#### Parameters

##### handler

[`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>

#### Returns

`this`

***

### beforeDeleteOne()

> **beforeDeleteOne**(`handler`): `this`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:5446](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L5446)

#### Parameters

##### handler

[`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>

#### Returns

`this`

***

### beforeFind()

> **beforeFind**(`handler`): `this`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:5414](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L5414)

#### Parameters

##### handler

[`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>

#### Returns

`this`

***

### beforeFindOne()

> **beforeFindOne**(`handler`): `this`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:5422](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L5422)

#### Parameters

##### handler

[`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>

#### Returns

`this`

***

### beforeFindOneAndDelete()

> **beforeFindOneAndDelete**(`handler`): `this`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:5494](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L5494)

#### Parameters

##### handler

[`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>

#### Returns

`this`

***

### beforeFindOneAndReplace()

> **beforeFindOneAndReplace**(`handler`): `this`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:5502](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L5502)

#### Parameters

##### handler

[`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>

#### Returns

`this`

***

### beforeFindOneAndUpdate()

> **beforeFindOneAndUpdate**(`handler`): `this`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:5486](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L5486)

#### Parameters

##### handler

[`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>

#### Returns

`this`

***

### beforeFindOneAndUpsert()

> **beforeFindOneAndUpsert**(`handler`): `this`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:5510](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L5510)

#### Parameters

##### handler

[`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>

#### Returns

`this`

***

### beforeSave()

> **beforeSave**(`handler`): `this`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:5430](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L5430)

#### Parameters

##### handler

[`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>

#### Returns

`this`

***

### beforeUpdateOne()

> **beforeUpdateOne**(`handler`): `this`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:5438](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L5438)

#### Parameters

##### handler

[`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>

#### Returns

`this`

***

### bind()

> **bind**(`ctx`): `AmbitenModel`\<`T`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:462](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L462)

Returns a model instance bound to a default context.

#### Parameters

##### ctx

[`ModelContext`](../type-aliases/ModelContext.md)

Context to bind to the cloned model.

#### Returns

`AmbitenModel`\<`T`\>

A cloned model instance with merged default context.

***

### bulkInsert()

> **bulkInsert**(`docs`, `ctx?`): `Promise`\<`void`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:1221](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L1221)

Inserts multiple documents into the model collection.

This operation runs inside the active Ambiten runtime context, is instrumented
through [measureQuery](../functions/measureQuery.md), executes registered bulkInsert middlewares,
validates each incoming document against the model schema, triggers schema
bulk insert hooks, invalidates relevant cache patterns, and publishes a
database change event after successful insertion.

#### Parameters

##### docs

`OptionalUnlessRequiredId`\<`T`\>[]

The documents to insert.

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

Optional model execution context for tenant, database,
collection, session, and related runtime overrides.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the operation completes.

***

### bulkUpdate()

> **bulkUpdate**(`updates`, `ctx?`): `Promise`\<`void`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:1343](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L1343)

Updates multiple documents using MongoDB bulk write semantics.

This operation runs inside the active Ambiten runtime context, is instrumented
through [measureQuery](../functions/measureQuery.md), executes registered bulkUpdate middlewares,
triggers schema bulk update hooks, invalidates relevant cache patterns, and
publishes a database change event after completion.

Each update entry is translated into an `updateOne` bulk operation using
`$set` with the provided partial update document.

#### Parameters

##### updates

`object`[]

Array of filter/update pairs to execute as bulk updates.

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

Optional model execution context for tenant, database,
collection, session, and related runtime overrides.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the operation completes.

#### Throws

When the updates payload is invalid.

***

### bulkWriteWithTransaction()

> **bulkWriteWithTransaction**(`operations`, `options?`, `ctx?`): `Promise`\<`BulkWriteResult`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:2073](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L2073)

Executes multiple MongoDB bulk write operations inside a transaction-aware
runtime context.

This transactional variant runs within the active Ambiten runtime context,
executes registered bulk update middlewares, triggers schema bulk update
hooks with transactional metadata, invalidates relevant cache patterns, and
publishes a database change event after completion.

#### Parameters

##### operations

`AnyBulkWriteOperation`\<`T`\>[]

MongoDB bulk write operations to execute.

##### options?

`BulkWriteOptions` = `{}`

Optional MongoDB bulk write options.

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

Optional model execution context for tenant, database,
collection, session, and transaction-aware runtime overrides.

#### Returns

`Promise`\<`BulkWriteResult`\>

The MongoDB bulk write result.

#### Throws

When the operations payload is missing or invalid.

***

### create()

> **create**(`doc`, `ctx?`): `Promise`\<[`ModelResult`](../type-aliases/ModelResult.md)\<`T`\>\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:703](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L703)

Creates a new document in the model collection.

This operation runs inside the active Ambiten runtime context, is instrumented
through [measureQuery](../functions/measureQuery.md), executes registered create middlewares,
validates the incoming document against the model schema, triggers schema
create hooks, invalidates relevant cache patterns, and publishes a database
change event after successful insertion.

#### Parameters

##### doc

`OptionalUnlessRequiredId`\<`T`\>

The document to insert.

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

Optional model execution context for tenant, database,
collection, session, and related runtime overrides.

#### Returns

`Promise`\<[`ModelResult`](../type-aliases/ModelResult.md)\<`T`\>\>

The created document as a normalized model result.

#### Throws

When the provided document is missing or invalid.

***

### createIndex()

> **createIndex**(`fields`, `ctx?`): `Promise`\<`void`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:4052](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L4052)

Creates an index on the model collection.

#### Parameters

##### fields

`Partial`\<`Record`\<keyof `T`, `1` \| `-1`\>\>

Index field specification where each key maps to ascending
(`1`) or descending (`-1`) index order.

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

Optional model execution context for tenant, database,
collection, session, and related runtime overrides.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the index has been created.

#### Throws

When the field specification is missing or invalid.

***

### createWithTransaction()

> **createWithTransaction**(`doc`, `ctx?`): `Promise`\<[`ModelResult`](../type-aliases/ModelResult.md)\<`T`\>\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:1952](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L1952)

Creates a new document inside a transaction-aware runtime context.

This transactional variant runs within the active Ambiten runtime context,
executes registered create middlewares, validates the incoming document,
triggers schema create hooks with transactional metadata, invalidates
relevant cache patterns, and publishes a database change event after
successful insertion.

#### Parameters

##### doc

`OptionalUnlessRequiredId`\<`T`\>

The document to insert.

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

Optional model execution context for tenant, database,
collection, session, and transaction-aware runtime overrides.

#### Returns

`Promise`\<[`ModelResult`](../type-aliases/ModelResult.md)\<`T`\>\>

The created document as a normalized model result.

#### Throws

When the provided document is missing or invalid.

***

### deleteMany()

> **deleteMany**(`filter`, `ctx?`): `Promise`\<`void`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:1674](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L1674)

Deletes multiple documents matching the provided filter.

This operation runs inside the active Ambiten runtime context, is instrumented
through [measureQuery](../functions/measureQuery.md), executes registered deleteMany middlewares,
supports middleware-driven soft delete flows, triggers schema delete or
update hooks as appropriate, invalidates relevant cache patterns, and
publishes a database change event after completion.

When middleware metadata enables soft delete, matched documents are updated
instead of being physically removed from the collection.

#### Parameters

##### filter

`Filter`\<`T`\>

MongoDB filter used to identify the documents to delete.

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

Optional model execution context for tenant, database,
collection, session, and related runtime overrides.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the operation completes.

#### Throws

When the filter is missing or invalid.

#### Throws

When soft delete is enabled but no softDeleteUpdate payload is provided.

***

### deleteOne()

> **deleteOne**(`filter`, `ctx?`): `Promise`\<`void`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:1501](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L1501)

Deletes a single document matching the provided filter.

This operation runs inside the active Ambiten runtime context, is instrumented
through [measureQuery](../functions/measureQuery.md), executes registered delete middlewares,
supports middleware-driven soft delete flows, triggers schema delete or
update hooks as appropriate, invalidates relevant cache patterns, and
publishes a database change event after completion.

When middleware metadata enables soft delete, the matched document is updated
instead of being physically removed from the collection.

#### Parameters

##### filter

`Filter`\<`T`\>

MongoDB filter used to identify the document to delete.

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

Optional model execution context for tenant, database,
collection, session, and related runtime overrides.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the operation completes.

#### Throws

When the filter is missing or invalid.

#### Throws

When soft delete is enabled but no softDeleteUpdate payload is provided.

***

### deleteSecure()

> **deleteSecure**(`filter`, `user`, `ctx?`): `Promise`\<`void`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:3335](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L3335)

Deletes a single document matching the provided filter using an admin-only
secure operation.

This method enforces authorization before executing the delete flow. It runs
inside the active Ambiten runtime context, is instrumented through
[measureQuery](../functions/measureQuery.md), executes registered model middlewares, triggers schema
delete hooks with security metadata, invalidates relevant cache patterns, and
publishes a database change event after a successful deletion.

#### Parameters

##### filter

`Filter`\<`T`\>

MongoDB filter used to identify the document to delete.

##### user

[`User`](../type-aliases/User.md)

Authenticated user performing the operation. Must have the `admin` role.

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

Optional model execution context for tenant, database,
collection, session, and related runtime overrides.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the operation completes.

#### Throws

When the user is not authorized to perform the operation.

#### Throws

When the filter is missing or invalid.

#### Throws

When the user payload is missing.

***

### deleteWithTransaction()

> **deleteWithTransaction**(`filter`, `ctx?`): `Promise`\<`boolean`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:2202](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L2202)

Deletes a single document inside a transaction-aware runtime context.

This transactional variant runs within the active Ambiten runtime context,
executes registered delete middlewares, triggers schema delete hooks with
transactional metadata, invalidates relevant cache patterns, and publishes a
database change event after completion.

#### Parameters

##### filter

`Filter`\<`T`\>

MongoDB filter used to identify the document to delete.

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

Optional model execution context for tenant, database,
collection, session, and transaction-aware runtime overrides.

#### Returns

`Promise`\<`boolean`\>

`true` when a document was deleted, otherwise `false`.

#### Throws

When the filter is missing or invalid.

***

### dropIndex()

> **dropIndex**(`indexName`): `Promise`\<`void`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:4085](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L4085)

Drops an index from the collection by its name.

#### Parameters

##### indexName

`string`

The name of the index to drop.

#### Returns

`Promise`\<`void`\>

Resolves when the index is dropped.

***

### find()

> **find**(`filter?`, `ctx?`, `options?`): `Promise`\<[`ModelResultArray`](../type-aliases/ModelResultArray.md)\<`T`\>\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:813](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L813)

Finds documents matching the provided filter.

This operation runs inside the active Ambiten runtime context, is instrumented
through [measureQuery](../functions/measureQuery.md), executes registered find middlewares, supports
optional result caching, triggers schema find hooks, and returns normalized
model results.

#### Parameters

##### filter?

`Filter`\<`T`\> = `{}`

MongoDB filter used to match documents.

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

Optional model execution context for tenant, database,
collection, session, and related runtime overrides.

##### options?

[`QueryOptions`](../interfaces/QueryOptions.md)

Optional query-level features such as caching.

#### Returns

`Promise`\<[`ModelResultArray`](../type-aliases/ModelResultArray.md)\<`T`\>\>

An array of normalized model results.

#### Throws

When the filter is invalid.

***

### findOne()

> **findOne**(`filter`, `ctx?`, `options?`): `Promise`\<[`ModelResult`](../type-aliases/ModelResult.md)\<`T`\> \| `null`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:958](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L958)

Finds a single document matching the provided filter.

This operation runs inside the active Ambiten runtime context, is instrumented
through [measureQuery](../functions/measureQuery.md), executes registered findOne middlewares,
supports optional result caching, triggers schema find hooks, and returns a
normalized model result when a document is found.

#### Parameters

##### filter

`Filter`\<`T`\>

MongoDB filter used to match the document.

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

Optional model execution context for tenant, database,
collection, session, and related runtime overrides.

##### options?

[`QueryOptions`](../interfaces/QueryOptions.md)

Optional query-level features such as caching.

#### Returns

`Promise`\<[`ModelResult`](../type-aliases/ModelResult.md)\<`T`\> \| `null`\>

The matched document as a normalized model result, or `null` if no document matched.

#### Throws

When the filter is missing or invalid.

***

### findOneAndDelete()

> **findOneAndDelete**(`filter`, `ctx?`): `Promise`\<[`ModelResult`](../type-aliases/ModelResult.md)\<`T`\> \| `null`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:2621](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L2621)

Finds a single document matching the provided filter and deletes it.

Supports both hard delete and middleware-driven soft delete flows.
When soft delete is enabled via middleware metadata, the matched document
is updated using the provided soft-delete update operation instead of being
physically removed from the collection.

The operation:
- runs within the active Ambiten runtime context
- is instrumented through [measureQuery](../functions/measureQuery.md)
- executes registered before/after model middlewares
- triggers schema delete/update hooks as appropriate
- invalidates relevant cache patterns after mutation
- publishes a database change event through PubSub

#### Parameters

##### filter

`Filter`\<`T`\>

MongoDB filter used to identify the document to delete.

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

Optional model execution context for tenant, database,
session, cache, and collection overrides.

#### Returns

`Promise`\<[`ModelResult`](../type-aliases/ModelResult.md)\<`T`\> \| `null`\>

The deleted document as a model result, or `null` if no document matched.

#### Throws

When the filter is missing or invalid.

***

### findOneAndReplace()

> **findOneAndReplace**(`filter`, `replacement`, `ctx?`): `Promise`\<[`ModelResult`](../type-aliases/ModelResult.md)\<`T`\> \| `null`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:2828](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L2828)

Finds a single document matching the provided filter and replaces it with the
supplied replacement document.

This operation runs inside the active Ambiten runtime context, executes model
middlewares, triggers schema update hooks, invalidates relevant cache entries,
and publishes a database change event after a successful replacement.

The replacement document is fully validated before being persisted.

#### Parameters

##### filter

`Filter`\<`T`\>

MongoDB filter used to identify the document to replace.

##### replacement

`T`

The full replacement document that will overwrite the matched document.

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

Optional model execution context for tenant, database,
collection, session, and related runtime overrides.

#### Returns

`Promise`\<[`ModelResult`](../type-aliases/ModelResult.md)\<`T`\> \| `null`\>

The replaced document in its updated form, or `null` if no document matched the filter.

#### Throws

When the filter is missing or invalid.

#### Throws

When the replacement document fails validation.

***

### findOneAndUpdate()

> **findOneAndUpdate**(`filter`, `update`, `ctx?`): `Promise`\<[`ModelResult`](../type-aliases/ModelResult.md)\<`T`\> \| `null`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:2486](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L2486)

Finds a single document matching the provided filter and updates it.

This operation runs inside the active Ambiten runtime context, is instrumented
through [measureQuery](../functions/measureQuery.md), executes registered findOneAndUpdate
middlewares, triggers schema update hooks, invalidates relevant cache
patterns, and publishes a database change event after completion.

The updated document is returned in its post-update state when a matching
document is found.

#### Parameters

##### filter

`Filter`\<`T`\>

MongoDB filter used to identify the document to update.

##### update

`UpdateFilter`\<`T`\>

MongoDB update document to apply.

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

Optional model execution context for tenant, database,
collection, session, and related runtime overrides.

#### Returns

`Promise`\<[`ModelResult`](../type-aliases/ModelResult.md)\<`T`\> \| `null`\>

The updated document as a normalized model result, or `null` if no
document matched the filter.

#### Throws

When the filter is missing or invalid.

#### Throws

When the update document is missing or invalid.

***

### findOneAndUpsert()

> **findOneAndUpsert**(`filter`, `update`, `ctx?`): `Promise`\<[`ModelResult`](../type-aliases/ModelResult.md)\<`T`\> \| `null`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:2950](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L2950)

Finds a single document matching the provided filter and updates it. If no
matching document exists, a new one is inserted using MongoDB upsert
semantics.

This operation runs within the active Ambiten runtime context, is instrumented
through [measureQuery](../functions/measureQuery.md), executes registered model middlewares, triggers
schema update hooks, invalidates relevant cache patterns, and publishes a
database change event after completion.

#### Parameters

##### filter

`Filter`\<`T`\>

MongoDB filter used to identify the document to update or insert.

##### update

`UpdateFilter`\<`T`\>

MongoDB update document applied to the matched document or to the inserted document during upsert.

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

Optional model execution context for tenant, database,
collection, session, and related runtime overrides.

#### Returns

`Promise`\<[`ModelResult`](../type-aliases/ModelResult.md)\<`T`\> \| `null`\>

The updated or newly upserted document in its final state, or `null`
if no document could be resolved from the operation result.

#### Throws

When the filter is missing or invalid.

#### Throws

When the update document is missing or invalid.

***

### findOneAndUpsertWithTransaction()

> **findOneAndUpsertWithTransaction**(`filter`, `update`, `ctx?`): `Promise`\<[`ModelResult`](../type-aliases/ModelResult.md)\<`T`\> \| `null`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:3072](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L3072)

Finds a single document matching the provided filter and updates it inside a
transaction. If no document matches, a new one is inserted using MongoDB
upsert semantics.

This transactional variant runs inside the active Ambiten runtime context,
executes registered model middlewares, triggers schema update hooks with
transactional metadata, invalidates relevant cache patterns, and publishes a
database change event after completion.

#### Parameters

##### filter

`Filter`\<`T`\>

MongoDB filter used to identify the document to update or insert.

##### update

`UpdateFilter`\<`T`\>

MongoDB update document applied to the matched document or inserted document.

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

Optional model execution context for tenant, database,
collection, session, and transaction-aware runtime overrides.

#### Returns

`Promise`\<[`ModelResult`](../type-aliases/ModelResult.md)\<`T`\> \| `null`\>

The updated or newly inserted document in its final state, or `null`
if no document could be resolved from the operation result.

#### Throws

When the filter is missing or invalid.

#### Throws

When the update document is missing or invalid.

***

### findOneAndUpsertWithTransactionSecure()

> **findOneAndUpsertWithTransactionSecure**(`filter`, `update`, `user`, `ctx?`): `Promise`\<[`ModelResult`](../type-aliases/ModelResult.md)\<`T`\> \| `null`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:3201](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L3201)

Finds a single document matching the provided filter and updates it inside a
secure transaction. If no document matches, a new one is inserted using
MongoDB upsert semantics.

This secure transactional variant enforces an admin-only authorization rule
before performing the operation. It runs inside the active Ambiten runtime
context, executes registered model middlewares, triggers schema update hooks
with transactional and security metadata, invalidates relevant cache patterns,
and publishes a database change event after completion.

#### Parameters

##### filter

`Filter`\<`T`\>

MongoDB filter used to identify the document to update or insert.

##### update

`UpdateFilter`\<`T`\>

MongoDB update document applied to the matched document or inserted document.

##### user

[`User`](../type-aliases/User.md)

Authenticated user performing the operation. Must have the `admin` role.

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

Optional model execution context for tenant, database,
collection, session, and transaction-aware runtime overrides.

#### Returns

`Promise`\<[`ModelResult`](../type-aliases/ModelResult.md)\<`T`\> \| `null`\>

The updated or newly inserted document in its final state, or `null`
if no document could be resolved from the operation result.

#### Throws

When the user is not authorized to perform the operation.

#### Throws

When the filter is missing or invalid.

#### Throws

When the update document is missing or invalid.

***

### getContext()

> **getContext**(): `object`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:4191](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L4191)

#### Returns

`object`

##### ctx

> **ctx**: [`ModelContext`](../type-aliases/ModelContext.md)

***

### getSchema()

> **getSchema**(): [`AmbitenSchema`](AmbitenSchema.md)\<`T`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:535](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L535)

Returns the schema attached to this model.

#### Returns

[`AmbitenSchema`](AmbitenSchema.md)\<`T`\>

***

### init()

> **init**(): `Promise`\<`void`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:425](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L425)

Initializes the model by validating configuration, resolving the collection,
and creating the GC TTL index when enabled.

#### Returns

`Promise`\<`void`\>

***

### invalidateDocumentCache()

> **invalidateDocumentCache**(`doc`, `ctx?`): `Promise`\<`number`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:4240](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L4240)

Invalidates cache entries related to a specific document within the current
model scope.

This helper is useful only when document-specific cache keys are part of the
active cache strategy.

#### Parameters

##### doc

`T`

The document whose cache entries should be invalidated.

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

Optional model execution context.

#### Returns

`Promise`\<`number`\>

A promise that resolves when invalidation completes.

#### Throws

When the document is missing a valid `_id`.

***

### invalidateModelPattern()

> **invalidateModelPattern**(`pattern`, `ctx?`): `Promise`\<`number`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:4206](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L4206)

Invalidates cache entries for the current model scope using a pattern.

This helper resolves tenant, database, and collection scope from the
provided context and applies the pattern within the Ambiten cache namespace.

#### Parameters

##### pattern

`string`

Partial cache pattern (e.g. "find:*", "aggregate:*").

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

Optional model execution context.

#### Returns

`Promise`\<`number`\>

Number of deleted cache entries.

#### Throws

When the pattern is invalid.

***

### off()

> **off**(`event`, `listener`): `void`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:392](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L392)

Removes a subscribed event listener.

#### Parameters

##### event

[`EventType`](../type-aliases/EventType.md)

Event type.

##### listener

(...`args`) => `void`

Event listener callback.

#### Returns

`void`

***

### on()

> **on**(`event`, `listener`): `void`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:372](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L372)

Subscribes to a model event.

#### Parameters

##### event

[`EventType`](../type-aliases/EventType.md)

Event type.

##### listener

(...`args`) => `void`

Event listener callback.

#### Returns

`void`

***

### once()

> **once**(`event`, `listener`): `void`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:382](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L382)

Subscribes to a model event once.

#### Parameters

##### event

[`EventType`](../type-aliases/EventType.md)

Event type.

##### listener

(...`args`) => `void`

Event listener callback.

#### Returns

`void`

***

### paginatedFind()

> **paginatedFind**(`filter`, `pageSize`, `lastId?`): `Promise`\<`T`[]\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:3979](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L3979)

Cursor-based pagination using _id comparison instead of skip.

#### Parameters

##### filter

`Partial`\<`T`\>

The filter for documents.

##### pageSize

`number`

Number of documents per page.

##### lastId?

`string`

Last document _id from the previous page.

#### Returns

`Promise`\<`T`[]\>

Array of documents for the current page.
This method uses the _id field for pagination, which is more efficient than using skip.

***

### populateMany()

> **populateMany**\<`K`\>(`doc`, `field`, `relatedModel`): `Promise`\<`T` & `Record`\<`string`, `unknown`\> \| `null`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:1910](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L1910)

Populates an array reference field on a document by resolving the related
documents from another model.

This helper performs a follow-up lookup using the referenced field values as
`_id` values of the related documents. If the target field is empty,
undefined, or not an array, the original document is returned unchanged.

#### Type Parameters

##### K

`K` *extends* [`Document`](../type-aliases/Document.md)

The related model document type.

#### Parameters

##### doc

`T`

The source document containing the reference array field.

##### field

keyof `T`

The field on the source document that stores related document identifiers.

##### relatedModel

`AmbitenModel`\<`K`\>

The model used to resolve the related documents.

#### Returns

`Promise`\<`T` & `Record`\<`string`, `unknown`\> \| `null`\>

The source document with the populated field replaced by the related
document results, or `null` when the input document is invalid.

***

### populateOne()

> **populateOne**\<`K`\>(`doc`, `field`, `relatedModel`): `Promise`\<`T` & `Record`\<`string`, `unknown`\> \| `null`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:1868](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L1868)

Populates a single reference field on a document by resolving the related
document from another model.

This helper performs a follow-up lookup using the referenced field value as
the `_id` of the related document. If the target field is empty or
undefined, the original document is returned unchanged.

#### Type Parameters

##### K

`K` *extends* [`Document`](../type-aliases/Document.md)

The related model document type.

#### Parameters

##### doc

`T`

The source document containing the reference field.

##### field

keyof `T`

The field on the source document that stores the related document identifier.

##### relatedModel

`AmbitenModel`\<`K`\>

The model used to resolve the related document.

#### Returns

`Promise`\<`T` & `Record`\<`string`, `unknown`\> \| `null`\>

The source document with the populated field replaced by the related
document result, or `null` when the input document is invalid.

***

### registerModel()

> **registerModel**(`options`): `Promise`\<`void`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:473](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L473)

Registers or reconfigures the model.

#### Parameters

##### options

[`AmbitenModelOptions`](../interfaces/AmbitenModelOptions.md)\<`T`\>

Model registration options.

#### Returns

`Promise`\<`void`\>

***

### removeListener()

> **removeListener**(`event`, `listener`): `void`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:402](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L402)

Removes a specific event listener.

#### Parameters

##### event

[`EventType`](../type-aliases/EventType.md)

Event type.

##### listener

(...`args`) => `void`

Event listener callback.

#### Returns

`void`

***

### restoreMany()

> **restoreMany**(`filter`, `ctx?`): `Promise`\<`void`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:5161](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L5161)

Restores multiple soft-deleted documents matching the provided filter.

This operation runs inside the active Ambiten runtime context, is instrumented
through [measureQuery](../functions/measureQuery.md), executes registered restore middlewares,
triggers schema update hooks, invalidates relevant cache patterns, and
publishes a document restoration event after completion.

The actual restore behavior is driven by the update document returned from
buildRestoreUpdate.

#### Parameters

##### filter

`Filter`\<`T`\>

MongoDB filter used to identify the documents to restore.

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

Optional model execution context for tenant, database,
collection, session, and related runtime overrides.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the operation completes.

#### Throws

When the filter is missing or invalid.

***

### restoreOne()

> **restoreOne**(`filter`, `ctx?`): `Promise`\<`void`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:5011](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L5011)

Restores a single soft-deleted document matching the provided filter.

This operation runs inside the active Ambiten runtime context, is instrumented
through [measureQuery](../functions/measureQuery.md), executes registered restore middlewares,
triggers schema update hooks, invalidates relevant cache patterns, and
publishes a document restoration event after completion.

The actual restore behavior is driven by the update document returned from
buildRestoreUpdate.

#### Parameters

##### filter

`Filter`\<`T`\>

MongoDB filter used to identify the document to restore.

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

Optional model execution context for tenant, database,
collection, session, and related runtime overrides.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the operation completes.

#### Throws

When the filter is missing or invalid.

***

### runCommand()

> **runCommand**(`command`, ...`args`): `Promise`\<`any`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:4359](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L4359)

Runs a custom command on the collection.

#### Parameters

##### command

`string`

The command to run.

##### args

...`any`[]

The arguments for the command.

#### Returns

`Promise`\<`any`\>

The result of the command.

***

### runGC()

> **runGC**(`ctx?`): `Promise`\<`void`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:4382](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L4382)

Runs garbage collection for expired documents in the model collection.

This operation uses the model GC configuration to locate expired documents
and either soft-delete them or permanently delete them. When configured,
expired documents may be archived before deletion.

The operation runs inside the active Ambiten runtime context, is instrumented
through [measureQuery](../functions/measureQuery.md), executes registered GC-related middlewares,
triggers schema update/delete hooks as appropriate, invalidates relevant
cache patterns, and publishes a garbage collection event after completion.

#### Parameters

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

Optional model execution context for tenant, database,
collection, session, and related runtime overrides.

#### Returns

`Promise`\<`void`\>

A promise that resolves when garbage collection completes.

***

### runInTransaction()

> **runInTransaction**\<`R`\>(`operation`, `ctx?`): `Promise`\<`R`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:3773](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L3773)

Executes the provided operation inside a transaction-aware Ambiten runtime context.

This helper ensures the operation runs with a resolved MongoDB client session
and within the active Ambiten runtime context for the current tenant,
database, and collection. If a session already exists in the merged model
context, that session is reused and no new transaction boundary is created.

Use this method when multiple model operations must be executed atomically
within a single transactional unit of work.

#### Type Parameters

##### R

`R`

The operation result type.

#### Parameters

##### operation

(`session`) => `Promise`\<`R`\>

Callback executed with the resolved MongoDB client session.

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

Optional model execution context for tenant, database,
collection, and session overrides.

#### Returns

`Promise`\<`R`\>

The resolved result of the transactional operation.

***

### setSoftDeleteConfig()

> **setSoftDeleteConfig**(`config`): `void`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:5344](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L5344)

#### Parameters

##### config

###### deletedAtField

`string`

###### isDeletedField

`string`

#### Returns

`void`

***

### startAutoGC()

> **startAutoGC**(`intervalMs?`): `void`

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:4617](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L4617)

Starts the automatic garbage collection process.

#### Parameters

##### intervalMs?

`number` = `3600000`

The interval in milliseconds for the garbage collection to run.

#### Returns

`void`

***

### streamAggregation()

> **streamAggregation**\<`U`\>(`pipeline`, `options?`, `ctx?`): `Promise`\<`Readable` & `AsyncIterable`\<`U`, `any`, `any`\>\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:3819](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L3819)

Creates a readable stream for an aggregation pipeline.

This method runs inside the active Ambiten runtime context, is instrumented
through [measureQuery](../functions/measureQuery.md), executes registered aggregate middlewares,
triggers schema aggregate hooks, and publishes a database change event after
the aggregation stream is created.

This method instruments stream creation only. It does not track the full
lifecycle of stream consumption unless additional listeners are attached by
the caller or by a higher-level observability layer.

#### Type Parameters

##### U

`U` *extends* [`Document`](../type-aliases/Document.md)

The aggregation result document shape.

#### Parameters

##### pipeline

`object`[]

MongoDB aggregation pipeline stages.

##### options?

`AggregateOptions` = `{}`

Optional MongoDB aggregation options.

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

Optional model execution context for tenant, database,
collection, session, and related runtime overrides.

#### Returns

`Promise`\<`Readable` & `AsyncIterable`\<`U`, `any`, `any`\>\>

A readable stream for the aggregation result set.

#### Throws

When the pipeline is missing or invalid.

***

### updateOne()

> **updateOne**(`filter`, `update`, `ctx?`): `Promise`\<`void`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:1106](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L1106)

Updates a single document matching the provided filter.

This operation runs inside the active Ambiten runtime context, is instrumented
through [measureQuery](../functions/measureQuery.md), executes registered update middlewares,
triggers schema update hooks, invalidates relevant cache patterns, and
publishes a database change event after completion.

#### Parameters

##### filter

`Filter`\<`T`\>

MongoDB filter used to identify the document to update.

##### update

`UpdateFilter`\<`T`\>

MongoDB update document to apply.

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

Optional model execution context for tenant, database,
collection, session, and related runtime overrides.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the operation completes.

#### Throws

When the filter is missing or invalid.

#### Throws

When the update document is missing or invalid.

***

### updateWithTransaction()

> **updateWithTransaction**(`filter`, `update`, `ctx?`): `Promise`\<[`ModelResult`](../type-aliases/ModelResult.md)\<`T`\> \| `null`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:2334](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L2334)

Updates a single document inside a transaction-aware runtime context.

This transactional variant runs within the active Ambiten runtime context,
executes registered update middlewares, validates the projected updated
document, triggers schema update hooks with transactional metadata,
invalidates relevant cache patterns, and publishes a database change event
after completion.

#### Parameters

##### filter

`Filter`\<`T`\>

MongoDB filter used to identify the document to update.

##### update

`UpdateFilter`\<`T`\>

MongoDB update document to apply.

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

Optional model execution context for tenant, database,
collection, session, and transaction-aware runtime overrides.

#### Returns

`Promise`\<[`ModelResult`](../type-aliases/ModelResult.md)\<`T`\> \| `null`\>

The updated document as a normalized model result, or `null` if no
document matched the filter.

#### Throws

When the filter is missing or invalid.

#### Throws

When the update document is missing or invalid.

***

### validateAsync()

> **validateAsync**(`doc`): `Promise`\<`T`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:556](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L556)

Validates a document asynchronously against the model schema.
Useful for schemas that perform async validation, such as checking uniqueness

#### Parameters

##### doc

`OptionalUnlessRequiredId`\<`T`\>

Document to validate.

#### Returns

`Promise`\<`T`\>

The validated document.

***

### warmCache()

> **warmCache**(`queries?`, `defaultTtl?`, `ctx?`): `Promise`\<`void`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:4894](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L4894)

Warms cache entries for selected model queries.

When query definitions are provided, this helper executes the corresponding
`find` operations and stores the results using Ambiten's scoped cache key
strategy. When no queries are provided, it warms a default collection-wide
`find({})` cache entry, subject to a safety threshold for large collections.

This helper is best suited for controlled cache priming scenarios such as
startup warmup, scheduled maintenance, or high-traffic query preparation.

#### Parameters

##### queries?

`object`[]

Optional list of query definitions to warm.

##### defaultTtl?

`number` = `3600`

Default TTL in seconds for warmed entries.

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

Optional model execution context for tenant, database,
collection, session, and related runtime overrides.

#### Returns

`Promise`\<`void`\>

A promise that resolves when cache warming completes.

#### Throws

When cache warming fails.

***

### watchChanges()

> **watchChanges**(`callback`, `ctx?`): `Promise`\<`ChangeStream`\<`T`, `ChangeStreamDocument`\<`T`\>\>\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:4014](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L4014)

Opens a MongoDB change stream on the model collection and registers a change
callback.

This helper initializes the model, resolves the collection within the active
Ambiten runtime context, creates a change stream, and subscribes the provided
callback to `"change"` events.

The method is intentionally lightweight: it manages change stream creation,
but does not yet instrument the full lifecycle of emitted change events. That
can be added later by higher-level observability or evidence collection
layers.

#### Parameters

##### callback

(`change`) => `void`

Function invoked whenever a change event is emitted by the collection change stream.

##### ctx?

[`ModelContext`](../type-aliases/ModelContext.md)

Optional model execution context for tenant, database,
collection, session, and related runtime overrides.

#### Returns

`Promise`\<`ChangeStream`\<`T`, `ChangeStreamDocument`\<`T`\>\>\>

The active MongoDB change stream.

#### Throws

When the callback is not a valid function.

***

### cacheResult()

> `static` **cacheResult**\<`R`\>(`key`, `data`, `ttl?`): `Promise`\<`void`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:4837](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L4837)

#### Type Parameters

##### R

`R`

#### Parameters

##### key

`string`

##### data

`R`

##### ttl?

`number` = `3600`

#### Returns

`Promise`\<`void`\>

***

### clearCache()

> `static` **clearCache**(`key`): `Promise`\<`void`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:4863](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L4863)

Clears a cached result by its key.

#### Parameters

##### key

`string`

The cache key.

#### Returns

`Promise`\<`void`\>

Resolves when the cache is cleared.

***

### getCacheStats()

> `static` **getCacheStats**(`tenantId?`): `Promise`\<[`AmbitenCacheStats`](../interfaces/AmbitenCacheStats.md)\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:4273](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L4273)

Returns cache statistics for the active Redis cache backend.

This helper retrieves Redis memory and keyspace statistics, along with Ambiten
cache hit/miss counters. When a tenant identifier is provided, it also counts
cache keys scoped to that tenant within the Ambiten cache namespace.

#### Parameters

##### tenantId?

`string`

Optional tenant identifier used to count tenant-scoped cache keys.

#### Returns

`Promise`\<[`AmbitenCacheStats`](../interfaces/AmbitenCacheStats.md)\>

Cache statistics for the current Redis backend.

#### Throws

When cache statistics cannot be retrieved.

***

### invalidatePattern()

> `static` **invalidatePattern**(`pattern`): `Promise`\<`number`\>

Defined in: [packages/core/src/lib-core/ambitenModelFactory.ts:4135](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/lib-core/ambitenModelFactory.ts#L4135)

Invalidates all cache entries matching the provided Redis key pattern.

This method uses Redis `SCAN` to iterate over matching keys in batches and
deletes them using a pipelined multi-operation for better efficiency.

#### Parameters

##### pattern

`string`

Redis key pattern to invalidate.

#### Returns

`Promise`\<`number`\>

The number of successfully deleted keys.

#### Throws

When the pattern is invalid or cache invalidation fails.
