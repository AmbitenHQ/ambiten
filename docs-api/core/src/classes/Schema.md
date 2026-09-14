[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / Schema

# Class: Schema\<T\>

Defined in: [packages/core/src/lib-core/ambitenSchema.ts:400](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenSchema.ts#L400)

The AmbitenSchema class allows you to define a schema for MongoDB documents.
It supports:
- schema definition
- custom validation
- indexes
- relationships
- virtual fields
- context-aware middleware
- garbage collection metadata

## Extends

- [`AmbitenSchema`](AmbitenSchema.md)\<`T`\>

## Type Parameters

### T

`T` *extends* [`Document`](../type-aliases/Document.md)

## Constructors

### Constructor

> **new Schema**\<`T`\>(`schemaDefinition`): `Schema`\<`T`\>

Defined in: [packages/core/src/lib-core/ambitenSchema.ts:401](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenSchema.ts#L401)

#### Parameters

##### schemaDefinition

[`SchemaDefinition`](../type-aliases/SchemaDefinition.md)\<`T`\>

#### Returns

`Schema`\<`T`\>

#### Overrides

[`AmbitenSchema`](AmbitenSchema.md).[`constructor`](AmbitenSchema.md#constructor)

## Methods

### addRelationship()

> **addRelationship**(`ref`, `localField`): `void`

Defined in: [packages/core/src/lib-core/ambitenSchema.ts:237](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenSchema.ts#L237)

Adds a relationship to the schema.

#### Parameters

##### ref

`string`

##### localField

keyof `T`

#### Returns

`void`

#### Inherited from

[`AmbitenSchema`](AmbitenSchema.md).[`addRelationship`](AmbitenSchema.md#addrelationship)

***

### applyIndexes()

> **applyIndexes**(`collection`): `Promise`\<`void`\>

Defined in: [packages/core/src/lib-core/ambitenSchema.ts:228](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenSchema.ts#L228)

Applies all defined indexes to a MongoDB collection.

#### Parameters

##### collection

`Collection`\<`any`\>

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`AmbitenSchema`](AmbitenSchema.md).[`applyIndexes`](AmbitenSchema.md#applyindexes)

***

### applyVirtuals()

> **applyVirtuals**(`doc`): `void`

Defined in: [packages/core/src/lib-core/ambitenSchema.ts:258](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenSchema.ts#L258)

Applies all virtual fields to a document.

#### Parameters

##### doc

`T`

#### Returns

`void`

#### Inherited from

[`AmbitenSchema`](AmbitenSchema.md).[`applyVirtuals`](AmbitenSchema.md#applyvirtuals)

***

### create()

> **create**(`data`): `Promise`\<`T`\>

Defined in: [packages/core/src/lib-core/ambitenSchema.ts:406](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenSchema.ts#L406)

#### Parameters

##### data

`OptionalUnlessRequiredId`\<`T`\>

#### Returns

`Promise`\<`T`\>

***

### executeMiddleware()

> **executeMiddleware**(`phase`, `operation`, `ctx`): `Promise`\<`void`\>

Defined in: [packages/core/src/lib-core/ambitenSchema.ts:355](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenSchema.ts#L355)

Executes middleware for a given phase and operation.

#### Parameters

##### phase

`"pre"` \| `"post"`

##### operation

[`AmbitenMiddlewareOperation`](../type-aliases/AmbitenMiddlewareOperation.md)

##### ctx

[`AmbitenMiddlewareContext`](../interfaces/AmbitenMiddlewareContext.md)\<`T`\>

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`AmbitenSchema`](AmbitenSchema.md).[`executeMiddleware`](AmbitenSchema.md#executemiddleware)

***

### executePost()

> **executePost**(`operation`, `ctx`): `Promise`\<`void`\>

Defined in: [packages/core/src/lib-core/ambitenSchema.ts:342](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenSchema.ts#L342)

Executes post-middleware for an operation.

#### Parameters

##### operation

[`AmbitenMiddlewareOperation`](../type-aliases/AmbitenMiddlewareOperation.md)

##### ctx

[`AmbitenMiddlewareContext`](../interfaces/AmbitenMiddlewareContext.md)\<`T`\>

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`AmbitenSchema`](AmbitenSchema.md).[`executePost`](AmbitenSchema.md#executepost)

***

### executePre()

> **executePre**(`operation`, `ctx`): `Promise`\<`void`\>

Defined in: [packages/core/src/lib-core/ambitenSchema.ts:329](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenSchema.ts#L329)

Executes pre-middleware for an operation.

#### Parameters

##### operation

[`AmbitenMiddlewareOperation`](../type-aliases/AmbitenMiddlewareOperation.md)

##### ctx

[`AmbitenMiddlewareContext`](../interfaces/AmbitenMiddlewareContext.md)\<`T`\>

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`AmbitenSchema`](AmbitenSchema.md).[`executePre`](AmbitenSchema.md#executepre)

***

### getGCConfig()

> **getGCConfig**(): [`GCConfig`](../type-aliases/GCConfig.md) \| `undefined`

Defined in: [packages/core/src/lib-core/ambitenSchema.ts:395](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenSchema.ts#L395)

Gets garbage collection configuration.

#### Returns

[`GCConfig`](../type-aliases/GCConfig.md) \| `undefined`

#### Inherited from

[`AmbitenSchema`](AmbitenSchema.md).[`getGCConfig`](AmbitenSchema.md#getgcconfig)

***

### getHooks()

> **getHooks**(`operation`, `phase?`): [`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>[]

Defined in: [packages/core/src/lib-core/ambitenSchema.ts:317](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenSchema.ts#L317)

Backward-compatible hook reader.
Defaults to pre hooks to avoid breaking older callers that expect getHooks(action).

#### Parameters

##### operation

[`AmbitenMiddlewareOperation`](../type-aliases/AmbitenMiddlewareOperation.md)

##### phase?

`"pre"` \| `"post"`

#### Returns

[`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>[]

#### Inherited from

[`AmbitenSchema`](AmbitenSchema.md).[`getHooks`](AmbitenSchema.md#gethooks)

***

### getPostHooks()

> **getPostHooks**(`operation`): [`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>[]

Defined in: [packages/core/src/lib-core/ambitenSchema.ts:307](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenSchema.ts#L307)

Returns all post-middleware for an operation.

#### Parameters

##### operation

[`AmbitenMiddlewareOperation`](../type-aliases/AmbitenMiddlewareOperation.md)

#### Returns

[`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>[]

#### Inherited from

[`AmbitenSchema`](AmbitenSchema.md).[`getPostHooks`](AmbitenSchema.md#getposthooks)

***

### getPreHooks()

> **getPreHooks**(`operation`): [`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>[]

Defined in: [packages/core/src/lib-core/ambitenSchema.ts:298](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenSchema.ts#L298)

Returns all pre-middleware for an operation.

#### Parameters

##### operation

[`AmbitenMiddlewareOperation`](../type-aliases/AmbitenMiddlewareOperation.md)

#### Returns

[`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>[]

#### Inherited from

[`AmbitenSchema`](AmbitenSchema.md).[`getPreHooks`](AmbitenSchema.md#getprehooks)

***

### getRelationships()

> **getRelationships**(): [`Relationship`](../interfaces/Relationship.md)\<`any`\>[]

Defined in: [packages/core/src/lib-core/ambitenSchema.ts:244](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenSchema.ts#L244)

Retrieves all relationships defined in the schema.

#### Returns

[`Relationship`](../interfaces/Relationship.md)\<`any`\>[]

#### Inherited from

[`AmbitenSchema`](AmbitenSchema.md).[`getRelationships`](AmbitenSchema.md#getrelationships)

***

### getSchema()

> **getSchema**(): [`SchemaDefinition`](../type-aliases/SchemaDefinition.md)\<`T`\>

Defined in: [packages/core/src/lib-core/ambitenSchema.ts:62](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenSchema.ts#L62)

Retrieves the schema definition.

#### Returns

[`SchemaDefinition`](../type-aliases/SchemaDefinition.md)\<`T`\>

#### Inherited from

[`AmbitenSchema`](AmbitenSchema.md).[`getSchema`](AmbitenSchema.md#getschema)

***

### index()

> **index**(`fields`, `options?`): `void`

Defined in: [packages/core/src/lib-core/ambitenSchema.ts:221](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenSchema.ts#L221)

Adds an index to the schema.

#### Parameters

##### fields

`any`

##### options?

`any`

#### Returns

`void`

#### Inherited from

[`AmbitenSchema`](AmbitenSchema.md).[`index`](AmbitenSchema.md#index)

***

### post()

> **post**(`operation`, `fn`): `this`

Defined in: [packages/core/src/lib-core/ambitenSchema.ts:284](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenSchema.ts#L284)

Adds a post-middleware handler for a specific operation.

#### Parameters

##### operation

[`AmbitenMiddlewareOperation`](../type-aliases/AmbitenMiddlewareOperation.md)

##### fn

[`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>

#### Returns

`this`

#### Inherited from

[`AmbitenSchema`](AmbitenSchema.md).[`post`](AmbitenSchema.md#post)

***

### pre()

> **pre**(`operation`, `fn`): `this`

Defined in: [packages/core/src/lib-core/ambitenSchema.ts:270](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenSchema.ts#L270)

Adds a pre-middleware handler for a specific operation.

#### Parameters

##### operation

[`AmbitenMiddlewareOperation`](../type-aliases/AmbitenMiddlewareOperation.md)

##### fn

[`AmbitenMiddlewareHandler`](../type-aliases/AmbitenMiddlewareHandler.md)\<`T`\>

#### Returns

`this`

#### Inherited from

[`AmbitenSchema`](AmbitenSchema.md).[`pre`](AmbitenSchema.md#pre)

***

### registerSchema()

> **registerSchema**(`schemaDefinition`): `void`

Defined in: [packages/core/src/lib-core/ambitenSchema.ts:69](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenSchema.ts#L69)

Re-registers the schema definition.

#### Parameters

##### schemaDefinition

[`SchemaDefinition`](../type-aliases/SchemaDefinition.md)\<`T`\>

#### Returns

`void`

#### Inherited from

[`AmbitenSchema`](AmbitenSchema.md).[`registerSchema`](AmbitenSchema.md#registerschema)

***

### setGCConfig()

> **setGCConfig**(`config`): `this`

Defined in: [packages/core/src/lib-core/ambitenSchema.ts:387](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenSchema.ts#L387)

Sets garbage collection configuration.

#### Parameters

##### config

[`GCConfig`](../type-aliases/GCConfig.md)

#### Returns

`this`

#### Inherited from

[`AmbitenSchema`](AmbitenSchema.md).[`setGCConfig`](AmbitenSchema.md#setgcconfig)

***

### triggerMiddleware()

> **triggerMiddleware**(`phase`, `operation`, `ctx`): `Promise`\<`void`\>

Defined in: [packages/core/src/lib-core/ambitenSchema.ts:376](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenSchema.ts#L376)

Backward-compatible alias.
If older callers use triggerMiddleware(action, data), they should be upgraded
to pass explicit phase + operation + context.

#### Parameters

##### phase

`"pre"` \| `"post"`

##### operation

[`AmbitenMiddlewareOperation`](../type-aliases/AmbitenMiddlewareOperation.md)

##### ctx

[`AmbitenMiddlewareContext`](../interfaces/AmbitenMiddlewareContext.md)\<`T`\>

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`AmbitenSchema`](AmbitenSchema.md).[`triggerMiddleware`](AmbitenSchema.md#triggermiddleware)

***

### validate()

> **validate**(`doc`): `void`

Defined in: [packages/core/src/lib-core/ambitenSchema.ts:175](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenSchema.ts#L175)

Validates a document synchronously.
Throws if an async validator is encountered.

#### Parameters

##### doc

`OptionalUnlessRequiredId`\<`T`\>

#### Returns

`void`

#### Inherited from

[`AmbitenSchema`](AmbitenSchema.md).[`validate`](AmbitenSchema.md#validate)

***

### validateAsync()

> **validateAsync**(`doc`): `Promise`\<`void`\>

Defined in: [packages/core/src/lib-core/ambitenSchema.ts:201](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenSchema.ts#L201)

Validates a document asynchronously.

#### Parameters

##### doc

`OptionalUnlessRequiredId`\<`T`\>

#### Returns

`Promise`\<`void`\>

#### Inherited from

[`AmbitenSchema`](AmbitenSchema.md).[`validateAsync`](AmbitenSchema.md#validateasync)

***

### validator()

> **validator**(`field`, `fn`): `void`

Defined in: [packages/core/src/lib-core/ambitenSchema.ts:149](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenSchema.ts#L149)

Adds a custom validator for a specific field.

#### Parameters

##### field

`string`

##### fn

(`value`, `doc?`) => `boolean` \| `Promise`\<`boolean`\>

#### Returns

`void`

#### Inherited from

[`AmbitenSchema`](AmbitenSchema.md).[`validator`](AmbitenSchema.md#validator)

***

### virtual()

> **virtual**(`name`, `getter`): `void`

Defined in: [packages/core/src/lib-core/ambitenSchema.ts:251](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenSchema.ts#L251)

Adds a virtual field to the schema.

#### Parameters

##### name

`string`

##### getter

(`doc`) => `any`

#### Returns

`void`

#### Inherited from

[`AmbitenSchema`](AmbitenSchema.md).[`virtual`](AmbitenSchema.md#virtual)

***

### create()

> `static` **create**\<`T`\>(`schemaDefinition`): `Schema`\<`T`\>

Defined in: [packages/core/src/lib-core/ambitenSchema.ts:432](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/lib-core/ambitenSchema.ts#L432)

#### Type Parameters

##### T

`T` *extends* [`Document`](../type-aliases/Document.md)

#### Parameters

##### schemaDefinition

[`SchemaDefinition`](../type-aliases/SchemaDefinition.md)\<`T`\>

#### Returns

`Schema`\<`T`\>
