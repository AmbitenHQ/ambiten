[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / MultiTenantManager

# Class: MultiTenantManager

Defined in: [packages/core/src/tanancy/MultiTenantManager.ts:35](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/tanancy/MultiTenantManager.ts#L35)

MultiTenantManager is responsible for managing tenant configurations and MongoDB client connections in a multi-tenant application.
It supports both lazy and immediate tenant registration, allowing for flexible connection management based on application needs.

## Constructors

### Constructor

> **new MultiTenantManager**(): `MultiTenantManager`

Defined in: [packages/core/src/tanancy/MultiTenantManager.ts:42](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/tanancy/MultiTenantManager.ts#L42)

#### Returns

`MultiTenantManager`

## Methods

### clearTenantConfigResolver()

> `static` **clearTenantConfigResolver**(): `void`

Defined in: [packages/core/src/tanancy/MultiTenantManager.ts:174](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/tanancy/MultiTenantManager.ts#L174)

#### Returns

`void`

***

### clearTenants()

> `static` **clearTenants**(): `void`

Defined in: [packages/core/src/tanancy/MultiTenantManager.ts:410](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/tanancy/MultiTenantManager.ts#L410)

Clears all tenants from the registry.

#### Returns

`void`

***

### getAllConnectedTenants()

> `static` **getAllConnectedTenants**(): `string`[]

Defined in: [packages/core/src/tanancy/MultiTenantManager.ts:336](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/tanancy/MultiTenantManager.ts#L336)

Returns all tenant IDs with active MongoDB clients
in the current Ambiten runtime.

Includes both statically registered and dynamically
discovered tenants that are currently connected.

#### Returns

`string`[]

***

### getAllTenants()

> `static` **getAllTenants**(): [`TenantConfig`](../interfaces/TenantConfig.md)[]

Defined in: [packages/core/src/tanancy/MultiTenantManager.ts:354](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/tanancy/MultiTenantManager.ts#L354)

Returns all tenants currently registered with this
Ambiten runtime.

This includes:
- statically configured tenants
- manually registered tenants
- externally discovered tenants after they have been resolved

It does not represent every tenant that may exist in an
external registry but has never been encountered by this runtime.

#### Returns

[`TenantConfig`](../interfaces/TenantConfig.md)[]

***

### getClient()

> `static` **getClient**(`tenantId`): `Promise`\<`MongoClient` \| `null`\>

Defined in: [packages/core/src/tanancy/MultiTenantManager.ts:133](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/tanancy/MultiTenantManager.ts#L133)

Retrieves the MongoClient instance for a specific tenant.
If the tenant was registered lazily, connection is established on first access.

#### Parameters

##### tenantId

`string`

The tenant ID.

#### Returns

`Promise`\<`MongoClient` \| `null`\>

The MongoClient or null if not registered.

***

### getConnectedTenant()

> `static` **getConnectedTenant**(): `string`

Defined in: [packages/core/src/tanancy/MultiTenantManager.ts:321](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/tanancy/MultiTenantManager.ts#L321)

Returns the first tenant with an active MongoDB client
in the current Ambiten runtime.

This reflects runtime connection state only.

#### Returns

`string`

***

### getStats()

> `static` **getStats**(): [`RegisteredTenantStatistics`](../interfaces/RegisteredTenantStatistics.md)

Defined in: [packages/core/src/tanancy/MultiTenantManager.ts:384](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/tanancy/MultiTenantManager.ts#L384)

#### Returns

[`RegisteredTenantStatistics`](../interfaces/RegisteredTenantStatistics.md)

***

### getTenant()

> `static` **getTenant**(`tenantId`): [`TenantConfig`](../interfaces/TenantConfig.md) \| `undefined`

Defined in: [packages/core/src/tanancy/MultiTenantManager.ts:275](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/tanancy/MultiTenantManager.ts#L275)

Retrieves a tenant that is already registered in the current runtime.

This method performs a synchronous local registry lookup only.
Dynamically discovered tenants are included once they have been
resolved and registered by MultiTenantManager.

Use resolveTenant() when the tenant may need to be discovered
through the configured TenantConfigResolver.

#### Parameters

##### tenantId

`string`

The tenant ID.

#### Returns

[`TenantConfig`](../interfaces/TenantConfig.md) \| `undefined`

The registered tenant configuration, if available.

***

### getTenantDbName()

> `static` **getTenantDbName**(`tenantId`): `Promise`\<`string` \| `undefined`\>

Defined in: [packages/core/src/tanancy/MultiTenantManager.ts:293](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/tanancy/MultiTenantManager.ts#L293)

Retrieves the database name for an already registered tenant.

This is a synchronous local-registry lookup.

#### Parameters

##### tenantId

`string`

The tenant ID.

#### Returns

`Promise`\<`string` \| `undefined`\>

The configured database name, if available.

***

### hasTenant()

> `static` **hasTenant**(`tenantId`): `boolean`

Defined in: [packages/core/src/tanancy/MultiTenantManager.ts:49](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/tanancy/MultiTenantManager.ts#L49)

Checks if a tenant is already registered.

#### Parameters

##### tenantId

`string`

The ID of the tenant to check.

#### Returns

`boolean`

`true` if the tenant is registered, `false` otherwise.

***

### isEnabled()

> `static` **isEnabled**(): `boolean`

Defined in: [packages/core/src/tanancy/MultiTenantManager.ts:362](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/tanancy/MultiTenantManager.ts#L362)

Returns true if at least one tenant is registered.

#### Returns

`boolean`

***

### registerLazyTenant()

> `static` **registerLazyTenant**(`tenantId`, `uri`, `options?`): [`TenantConfig`](../interfaces/TenantConfig.md)

Defined in: [packages/core/src/tanancy/MultiTenantManager.ts:61](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/tanancy/MultiTenantManager.ts#L61)

Registers a tenant for lazy connection.
Connection is established only when the tenant is accessed for the first time.

#### Parameters

##### tenantId

`string`

The tenant ID.

##### uri

`string`

The MongoDB URI.

##### options?

`Omit`\<[`RegisterTenantOptions`](../interfaces/RegisterTenantOptions.md), `"lazy"` \| `"client"`\> = `{}`

Optional tenant registration settings.

#### Returns

[`TenantConfig`](../interfaces/TenantConfig.md)

***

### registerTenant()

> `static` **registerTenant**(`tenantId`, `uri`, `options?`): `Promise`\<`MongoClient`\>

Defined in: [packages/core/src/tanancy/MultiTenantManager.ts:93](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/tanancy/MultiTenantManager.ts#L93)

Registers a tenant and establishes a connection immediately.

#### Parameters

##### tenantId

`string`

The tenant ID.

##### uri

`string`

The MongoDB URI.

##### options?

`Omit`\<[`RegisterTenantOptions`](../interfaces/RegisterTenantOptions.md), `"lazy"`\> = `{}`

Optional tenant registration settings.

#### Returns

`Promise`\<`MongoClient`\>

The connected MongoClient instance.

***

### removeTenant()

> `static` **removeTenant**(`tenantId`): `boolean`

Defined in: [packages/core/src/tanancy/MultiTenantManager.ts:376](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/tanancy/MultiTenantManager.ts#L376)

Removes a tenant from the current runtime registry.

This does not remove the tenant from an external tenant source.
If a TenantConfigResolver can still resolve the tenant, it may
be discovered and registered again on a future request.

#### Parameters

##### tenantId

`string`

The tenant ID.

#### Returns

`boolean`

true when a registered tenant was removed.

***

### resolveTenant()

> `static` **resolveTenant**(`tenantId`): `Promise`\<[`TenantConfig`](../interfaces/TenantConfig.md) \| `undefined`\>

Defined in: [packages/core/src/tanancy/MultiTenantManager.ts:188](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/tanancy/MultiTenantManager.ts#L188)

Resolves a tenant from the current runtime registry or, when
necessary, from the configured external TenantConfigResolver.

Dynamically resolved tenants are registered locally before
being returned, making subsequent lookups local.

#### Parameters

##### tenantId

`string`

The tenant ID.

#### Returns

`Promise`\<[`TenantConfig`](../interfaces/TenantConfig.md) \| `undefined`\>

The resolved tenant configuration, if available.

***

### resolveTenantDbName()

> `static` **resolveTenantDbName**(`tenantId`): `Promise`\<`string` \| `undefined`\>

Defined in: [packages/core/src/tanancy/MultiTenantManager.ts:306](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/tanancy/MultiTenantManager.ts#L306)

Resolves the tenant locally or externally and returns its
configured database name.

#### Parameters

##### tenantId

`string`

The tenant ID.

#### Returns

`Promise`\<`string` \| `undefined`\>

The resolved database name, if available.

***

### setTenantConfigResolver()

> `static` **setTenantConfigResolver**(`resolver`): `void`

Defined in: [packages/core/src/tanancy/MultiTenantManager.ts:168](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/tanancy/MultiTenantManager.ts#L168)

#### Parameters

##### resolver

[`TenantConfigResolver`](../type-aliases/TenantConfigResolver.md)

#### Returns

`void`
