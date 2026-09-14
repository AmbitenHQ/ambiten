[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / cacheWithRedis

# Function: cacheWithRedis()

> **cacheWithRedis**\<`T`\>(`client`, `key`, `fetcher`, `options?`): `Promise`\<`T`\>

Defined in: [packages/core/src/utils/cacheWithRedis.ts:28](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/utils/cacheWithRedis.ts#L28)

Caches a value in Redis with optional tenant and namespace scoping.
If the value is not found in cache, it runs the provided fetcher function
to get the value, caches it, and then returns it.

## Type Parameters

### T

`T`

## Parameters

### client

`any`

### key

`string`

The cache key to use.

### fetcher

() => `Promise`\<`T`\>

A function that fetches the value if not cached.

### options?

`AmbitenCacheOptions` = `{}`

Options for caching behavior.

## Returns

`Promise`\<`T`\>

- The cached or fetched value.

## Example

```ts
const value = await cacheWithRedis(redisClient, 'myKey', async () => {
  // Fetch from database or external API
 return await fetchDataFromSource();
```
