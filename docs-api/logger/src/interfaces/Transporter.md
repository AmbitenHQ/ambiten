[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [logger/src](../README.md) / Transporter

# Interface: Transporter

Defined in: [packages/logger/src/types/logger.types.ts:52](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/logger/src/types/logger.types.ts#L52)

## Methods

### close()?

> `optional` **close**(): `void` \| `Promise`\<`void`\>

Defined in: [packages/logger/src/types/logger.types.ts:55](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/logger/src/types/logger.types.ts#L55)

#### Returns

`void` \| `Promise`\<`void`\>

***

### flush()?

> `optional` **flush**(): `void` \| `Promise`\<`void`\>

Defined in: [packages/logger/src/types/logger.types.ts:54](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/logger/src/types/logger.types.ts#L54)

#### Returns

`void` \| `Promise`\<`void`\>

***

### write()

> **write**(`entry`, `formatted`): `void` \| `Promise`\<`void`\>

Defined in: [packages/logger/src/types/logger.types.ts:53](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/logger/src/types/logger.types.ts#L53)

#### Parameters

##### entry

[`LogEntry`](LogEntry.md)

##### formatted

`string`

#### Returns

`void` \| `Promise`\<`void`\>
