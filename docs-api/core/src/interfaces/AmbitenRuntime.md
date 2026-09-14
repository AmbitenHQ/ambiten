[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / AmbitenRuntime

# Interface: AmbitenRuntime\<T\>

Defined in: [packages/core/src/types/ambiten-runtime-type.ts:13](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten-runtime-type.ts#L13)

## Type Parameters

### T

`T` *extends* [`Document`](../type-aliases/Document.md) = [`Document`](../type-aliases/Document.md)

## Methods

### cache()

> **cache**\<`T`\>(`key`, `fetcher`, `options?`): `Promise`\<`T`\>

Defined in: [packages/core/src/types/ambiten-runtime-type.ts:34](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten-runtime-type.ts#L34)

#### Type Parameters

##### T

`T`

#### Parameters

##### key

`string`

##### fetcher

() => `Promise`\<`T`\>

##### options?

[`AmbitenCacheOptions`](AmbitenCacheOptions.md)

#### Returns

`Promise`\<`T`\>

***

### getGCRunner()

> **getGCRunner**(): [`AmbitenGC`](../classes/AmbitenGC.md) \| `undefined`

Defined in: [packages/core/src/types/ambiten-runtime-type.ts:26](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten-runtime-type.ts#L26)

#### Returns

[`AmbitenGC`](../classes/AmbitenGC.md) \| `undefined`

***

### getGraphQL()

> **getGraphQL**(): [`AmbitenGraphQL`](../classes/AmbitenGraphQL.md) \| `undefined`

Defined in: [packages/core/src/types/ambiten-runtime-type.ts:24](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten-runtime-type.ts#L24)

#### Returns

[`AmbitenGraphQL`](../classes/AmbitenGraphQL.md) \| `undefined`

***

### getLogger()

> **getLogger**(): `ILogger`

Defined in: [packages/core/src/types/ambiten-runtime-type.ts:27](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten-runtime-type.ts#L27)

#### Returns

`ILogger`

***

### getModel()

> **getModel**(): [`AmbitenModel`](../classes/AmbitenModel.md)\<`T`\>

Defined in: [packages/core/src/types/ambiten-runtime-type.ts:20](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten-runtime-type.ts#L20)

#### Returns

[`AmbitenModel`](../classes/AmbitenModel.md)\<`T`\>

***

### getMongoClient()

> **getMongoClient**(): [`AmbitenClient`](../classes/AmbitenClient.md) \| [`BootstrapClient`](BootstrapClient.md)

Defined in: [packages/core/src/types/ambiten-runtime-type.ts:14](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten-runtime-type.ts#L14)

#### Returns

[`AmbitenClient`](../classes/AmbitenClient.md) \| [`BootstrapClient`](BootstrapClient.md)

***

### getSchema()

> **getSchema**(): [`AmbitenSchema`](../classes/AmbitenSchema.md)\<`T`\>

Defined in: [packages/core/src/types/ambiten-runtime-type.ts:22](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten-runtime-type.ts#L22)

#### Returns

[`AmbitenSchema`](../classes/AmbitenSchema.md)\<`T`\>

***

### invalidateCache()

> **invalidateCache**(`tenantId`, `namespace?`): `Promise`\<`void`\>

Defined in: [packages/core/src/types/ambiten-runtime-type.ts:40](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten-runtime-type.ts#L40)

#### Parameters

##### tenantId

`string`

##### namespace?

`string`

#### Returns

`Promise`\<`void`\>

***

### onConnect()

> **onConnect**(`callback`): `void`

Defined in: [packages/core/src/types/ambiten-runtime-type.ts:16](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten-runtime-type.ts#L16)

#### Parameters

##### callback

() => `void` \| `Promise`\<`void`\>

#### Returns

`void`

***

### registerMultiTenancy()

> **registerMultiTenancy**(`options`): `Promise`\<`void`\>

Defined in: [packages/core/src/types/ambiten-runtime-type.ts:29](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten-runtime-type.ts#L29)

#### Parameters

##### options

###### lazy?

`boolean`

###### tenants?

`Record`\<`string`, `string`\>

#### Returns

`Promise`\<`void`\>

***

### shutdown()

> **shutdown**(): `Promise`\<`void`\>

Defined in: [packages/core/src/types/ambiten-runtime-type.ts:45](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten-runtime-type.ts#L45)

#### Returns

`Promise`\<`void`\>
