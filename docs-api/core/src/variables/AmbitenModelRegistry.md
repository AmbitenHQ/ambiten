[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / AmbitenModelRegistry

# Variable: AmbitenModelRegistry

> `const` **AmbitenModelRegistry**: `object`

Defined in: [packages/core/src/utils/ModelRegistry.ts:9](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/utils/ModelRegistry.ts#L9)

AmbitenModelRegistry manages registered Ambiten model instances.

## Type Declaration

### clear()

> **clear**(): `void`

#### Returns

`void`

### getAllModels()

> **getAllModels**(): [`AmbitenModel`](../classes/AmbitenModel.md)\<`any`\>[]

#### Returns

[`AmbitenModel`](../classes/AmbitenModel.md)\<`any`\>[]

### getRegisteredModel()

> **getRegisteredModel**\<`T`\>(`model`): [`AmbitenModel`](../classes/AmbitenModel.md)\<`T`\> \| `null`

#### Type Parameters

##### T

`T` *extends* [`Document`](../type-aliases/Document.md) = [`Document`](../type-aliases/Document.md)

#### Parameters

##### model

[`AmbitenModel`](../classes/AmbitenModel.md)\<`T`\>

#### Returns

[`AmbitenModel`](../classes/AmbitenModel.md)\<`T`\> \| `null`

### isModelRegistered()

> **isModelRegistered**(`model`): `boolean`

#### Parameters

##### model

[`AmbitenModel`](../classes/AmbitenModel.md)\<`any`\>

#### Returns

`boolean`

### registerModel()

> **registerModel**(`model`): `void`

#### Parameters

##### model

[`AmbitenModel`](../classes/AmbitenModel.md)\<`any`\>

#### Returns

`void`

### unregisterModel()

> **unregisterModel**(`model`): `void`

#### Parameters

##### model

[`AmbitenModel`](../classes/AmbitenModel.md)\<`any`\>

#### Returns

`void`
