
[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / TenantConfigResolver

# Type Alias: TenantConfigResolver

> **TenantConfigResolver** = (`tenantId`) => [`ResolvedTenantConfig`](../interfaces/ResolvedTenantConfig.md) \| `null` \| `undefined` \| `Promise`\<[`ResolvedTenantConfig`](../interfaces/ResolvedTenantConfig.md) \| `null` \| `undefined`\>

Defined in: [packages/core/src/types/tenant-config-resolver.ts:47](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/tenant-config-resolver.ts#L47)

Dynamically resolves database configuration for a tenant.

The tenant ID has already been resolved by the Ambiten
request/adapter layer and propagated through AmbitenContext.

Returning `undefined` or `null` indicates that the tenant
could not be resolved.

## Parameters

### tenantId

`string`

## Returns

[`ResolvedTenantConfig`](../interfaces/ResolvedTenantConfig.md) \| `null` \| `undefined` \| `Promise`\<[`ResolvedTenantConfig`](../interfaces/ResolvedTenantConfig.md) \| `null` \| `undefined`\>
