[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / AmbitenRuntime

# Interface: AmbitenRuntime\<T\>

Defined in: [packages/core/src/types/ambiten-runtime-type.ts:14](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten-runtime-type.ts#L14)

## Type Parameters

### T

`T` *extends* [`Document`](../type-aliases/Document.md) = [`Document`](../type-aliases/Document.md)

## Methods

### cache()

> **cache**\<`T`\>(`key`, `fetcher`, `options?`): `Promise`\<`T`\>

Defined in: [packages/core/src/types/ambiten-runtime-type.ts:32](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten-runtime-type.ts#L32)

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

Defined in: [packages/core/src/types/ambiten-runtime-type.ts:24](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten-runtime-type.ts#L24)

#### Returns

[`AmbitenGC`](../classes/AmbitenGC.md) \| `undefined`

***

### getGraphQL()

> **getGraphQL**(): [`AmbitenGraphQL`](../classes/AmbitenGraphQL.md) \| `undefined`

Defined in: [packages/core/src/types/ambiten-runtime-type.ts:22](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten-runtime-type.ts#L22)

#### Returns

[`AmbitenGraphQL`](../classes/AmbitenGraphQL.md) \| `undefined`

***

### getLogger()

> **getLogger**(): `ILogger`

Defined in: [packages/core/src/types/ambiten-runtime-type.ts:25](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten-runtime-type.ts#L25)

#### Returns

`ILogger`

***

### getModel()

> **getModel**(): [`AmbitenModel`](../classes/AmbitenModel.md)\<`T`\>

Defined in: [packages/core/src/types/ambiten-runtime-type.ts:18](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten-runtime-type.ts#L18)

#### Returns

[`AmbitenModel`](../classes/AmbitenModel.md)\<`T`\>

***

### getMongoClient()

> **getMongoClient**(): [`AmbitenClient`](../classes/AmbitenClient.md) \| [`BootstrapClient`](BootstrapClient.md)

Defined in: [packages/core/src/types/ambiten-runtime-type.ts:15](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten-runtime-type.ts#L15)

#### Returns

[`AmbitenClient`](../classes/AmbitenClient.md) \| [`BootstrapClient`](BootstrapClient.md)

***

### getSchema()

> **getSchema**(): [`AmbitenSchema`](../classes/AmbitenSchema.md)\<`T`\>

Defined in: [packages/core/src/types/ambiten-runtime-type.ts:20](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten-runtime-type.ts#L20)

#### Returns

[`AmbitenSchema`](../classes/AmbitenSchema.md)\<`T`\>

***

### invalidateCache()

> **invalidateCache**(`tenantId`, `namespace?`): `Promise`\<`void`\>

Defined in: [packages/core/src/types/ambiten-runtime-type.ts:38](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten-runtime-type.ts#L38)

#### Parameters

##### tenantId

`string`

##### namespace?

`string`

#### Returns

`Promise`\<`void`\>

***

### onConnect()

> **onConnect**(`hook`): `void`

Defined in: [packages/core/src/types/ambiten-runtime-type.ts:17](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten-runtime-type.ts#L17)

#### Parameters

##### hook

`any`

#### Returns

`void`

***

### registerMultiTenancy()

> **registerMultiTenancy**(`options`): `Promise`\<`void`\>

Defined in: [packages/core/src/types/ambiten-runtime-type.ts:27](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten-runtime-type.ts#L27)

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

Defined in: [packages/core/src/types/ambiten-runtime-type.ts:43](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten-runtime-type.ts#L43)

#### Returns

`Promise`\<`void`\>
