[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / AmbitenCache

# Class: AmbitenCache

Defined in: [packages/core/src/ambiten-cache/ambitenCache.ts:28](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/ambiten-cache/ambitenCache.ts#L28)

## Constructors

### Constructor

> **new AmbitenCache**(`client?`): `AmbitenCache`

Defined in: [packages/core/src/ambiten-cache/ambitenCache.ts:29](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/ambiten-cache/ambitenCache.ts#L29)

#### Parameters

##### client?

[`AmbitenCacheClient`](../interfaces/AmbitenCacheClient.md) = `redis`

#### Returns

`AmbitenCache`

## Methods

### get()

> **get**\<`T`\>(`key`, `options?`): `Promise`\<`T` \| `null`\>

Defined in: [packages/core/src/ambiten-cache/ambitenCache.ts:59](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/ambiten-cache/ambitenCache.ts#L59)

Reads and deserializes a cached value.

#### Type Parameters

##### T

`T`

#### Parameters

##### key

`string`

##### options?

[`AmbitenCacheOptions`](../interfaces/AmbitenCacheOptions.md)

#### Returns

`Promise`\<`T` \| `null`\>

***

### invalidate()

> **invalidate**(`key`, `options?`): `Promise`\<`void`\>

Defined in: [packages/core/src/ambiten-cache/ambitenCache.ts:120](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/ambiten-cache/ambitenCache.ts#L120)

Invalidates one cache key.

#### Parameters

##### key

`string`

##### options?

[`AmbitenCacheOptions`](../interfaces/AmbitenCacheOptions.md)

#### Returns

`Promise`\<`void`\>

***

### invalidatePattern()

> **invalidatePattern**(`pattern`): `Promise`\<`number`\>

Defined in: [packages/core/src/ambiten-cache/ambitenCache.ts:129](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/ambiten-cache/ambitenCache.ts#L129)

Invalidates cache keys by pattern using SCAN.

#### Parameters

##### pattern

`string`

#### Returns

`Promise`\<`number`\>

***

### set()

> **set**\<`T`\>(`key`, `value`, `options?`): `Promise`\<`void`\>

Defined in: [packages/core/src/ambiten-cache/ambitenCache.ts:81](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/ambiten-cache/ambitenCache.ts#L81)

Serializes and writes a cached value.

#### Type Parameters

##### T

`T`

#### Parameters

##### key

`string`

##### value

`T`

##### options?

[`AmbitenCacheOptions`](../interfaces/AmbitenCacheOptions.md) = `{}`

#### Returns

`Promise`\<`void`\>

***

### wrap()

> **wrap**\<`T`\>(`key`, `fetcher`, `options?`): `Promise`\<`T`\>

Defined in: [packages/core/src/ambiten-cache/ambitenCache.ts:100](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/ambiten-cache/ambitenCache.ts#L100)

Returns cached value if available, otherwise computes, stores, and returns it.

#### Type Parameters

##### T

`T`

#### Parameters

##### key

`string`

##### fetcher

() => `Promise`\<`T`\>

##### options?

[`AmbitenCacheOptions`](../interfaces/AmbitenCacheOptions.md) = `{}`

#### Returns

`Promise`\<`T`\>
