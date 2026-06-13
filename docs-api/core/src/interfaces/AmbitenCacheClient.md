[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / AmbitenCacheClient

# Interface: AmbitenCacheClient

Defined in: [packages/core/src/ambiten-cache/ambitenCache.ts:11](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/ambiten-cache/ambitenCache.ts#L11)

## Methods

### del()

> **del**(`key`): `Promise`\<`unknown`\>

Defined in: [packages/core/src/ambiten-cache/ambitenCache.ts:18](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/ambiten-cache/ambitenCache.ts#L18)

#### Parameters

##### key

`string` \| `string`[]

#### Returns

`Promise`\<`unknown`\>

***

### get()

> **get**(`key`): `Promise`\<`string` \| `null`\>

Defined in: [packages/core/src/ambiten-cache/ambitenCache.ts:12](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/ambiten-cache/ambitenCache.ts#L12)

#### Parameters

##### key

`string`

#### Returns

`Promise`\<`string` \| `null`\>

***

### scan()?

> `optional` **scan**(`cursor`, `options?`): `Promise`\<\[`string`, `string`[]\] \| \{ `cursor`: `number`; `keys`: `string`[]; \}\>

Defined in: [packages/core/src/ambiten-cache/ambitenCache.ts:19](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/ambiten-cache/ambitenCache.ts#L19)

#### Parameters

##### cursor

`number`

##### options?

###### COUNT?

`number`

###### MATCH?

`string`

#### Returns

`Promise`\<\[`string`, `string`[]\] \| \{ `cursor`: `number`; `keys`: `string`[]; \}\>

***

### set()

> **set**(`key`, `value`, `options?`): `Promise`\<`unknown`\>

Defined in: [packages/core/src/ambiten-cache/ambitenCache.ts:13](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/ambiten-cache/ambitenCache.ts#L13)

#### Parameters

##### key

`string`

##### value

`string`

##### options?

###### EX?

`number`

#### Returns

`Promise`\<`unknown`\>
