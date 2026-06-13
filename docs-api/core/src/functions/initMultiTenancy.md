[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / initMultiTenancy

# Function: initMultiTenancy()

> **initMultiTenancy**(`tenants`, `options?`): `Promise`\<`void`\>

Defined in: [packages/core/src/tanancy/init/initMultiTenancy.ts:31](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/tanancy/init/initMultiTenancy.ts#L31)

Initializes multi-tenancy by registering tenants with their respective MongoDB URIs.
Supports both lazy (on-demand) and eager connection strategies.

## Parameters

### tenants

`Record`\<`string`, `string`\>

A record of tenant IDs mapped to their MongoDB URIs.

### options?

[`InitMultiTenancyOptions`](../interfaces/InitMultiTenancyOptions.md) = `{}`

Optional configuration for multi-tenancy initialization.

## Returns

`Promise`\<`void`\>

A promise that resolves when all tenants are registered.

## Throws

If a tenant's MongoDB URI is invalid or missing.

## Throws

If a tenant is already registered and `lazy` is `false`.

## Example

```ts
// Initialize multi-tenancy with eager connection. Practically, you should use applyMultiTenancy instead.
that implements this function.
await initMultiTenancy({
  'tenant-a': 'mongodb://localhost:27017/tenant-a',
 'tenant-b': 'mongodb://localhost:27017/tenant-b'
}, {
  lazy: false,
 config: {}
```
