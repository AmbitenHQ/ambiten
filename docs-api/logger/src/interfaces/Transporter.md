[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [logger/src](../README.md) / Transporter

# Interface: Transporter

Defined in: [packages/logger/src/types/logger.types.ts:52](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/logger.types.ts#L52)

## Methods

### close()?

> `optional` **close**(): `void` \| `Promise`\<`void`\>

Defined in: [packages/logger/src/types/logger.types.ts:55](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/logger.types.ts#L55)

#### Returns

`void` \| `Promise`\<`void`\>

***

### flush()?

> `optional` **flush**(): `void` \| `Promise`\<`void`\>

Defined in: [packages/logger/src/types/logger.types.ts:54](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/logger.types.ts#L54)

#### Returns

`void` \| `Promise`\<`void`\>

***

### write()

> **write**(`entry`, `formatted`): `void` \| `Promise`\<`void`\>

Defined in: [packages/logger/src/types/logger.types.ts:53](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/logger.types.ts#L53)

#### Parameters

##### entry

[`LogEntry`](LogEntry.md)

##### formatted

`string`

#### Returns

`void` \| `Promise`\<`void`\>
