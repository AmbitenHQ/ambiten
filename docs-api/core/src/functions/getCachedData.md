[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / getCachedData

# Function: getCachedData()

> **getCachedData**(`role`, `key`): `Promise`\<`any`\>

Defined in: [packages/core/src/middleware/rbac/rbacMiddleware.ts:101](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/middleware/rbac/rbacMiddleware.ts#L101)

Get cached data for a specific role and key

## Parameters

### role

`string` \| `string`[] \| \{ `tenantId`: `string`; \}

The role or tenant object

### key

`string`

The key to retrieve from the cache

## Returns

`Promise`\<`any`\>

A promise that resolves to the cached data or null if not found
This function retrieves cached data from Redis based on the provided role and key.
It constructs a unique cache key using the role and key, checks if the data exists in the cache,
and returns the parsed data if found. If the data is not found, it logs a cache miss and returns null.

## Throws

If there is an issue with the Redis operation

## Example

```ts
// Get cached permissions for role 'admin'
const cachedPermissions = await getCachedData('admin', 'permissions');
if (cachedPermissions) {
  console.log('Cached permissions:', cachedPermissions);
} else {
 console.log('No cached permissions found');
}
```
