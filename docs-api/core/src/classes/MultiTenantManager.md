[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / MultiTenantManager

# Class: MultiTenantManager

Defined in: [packages/core/src/tanancy/MultiTenantManager.ts:23](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/tanancy/MultiTenantManager.ts#L23)

MultiTenantManager is responsible for managing tenant configurations and MongoDB client connections in a multi-tenant application.
It supports both lazy and immediate tenant registration, allowing for flexible connection management based on application needs.

## Constructors

### Constructor

> **new MultiTenantManager**(): `MultiTenantManager`

Defined in: [packages/core/src/tanancy/MultiTenantManager.ts:26](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/tanancy/MultiTenantManager.ts#L26)

#### Returns

`MultiTenantManager`

## Methods

### clearTenants()

> `static` **clearTenants**(): `void`

Defined in: [packages/core/src/tanancy/MultiTenantManager.ts:209](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/tanancy/MultiTenantManager.ts#L209)

Clears all tenants from the registry.

#### Returns

`void`

***

### getAllConnectedTenants()

> `static` **getAllConnectedTenants**(): `string`[]

Defined in: [packages/core/src/tanancy/MultiTenantManager.ts:178](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/tanancy/MultiTenantManager.ts#L178)

Returns all currently connected tenant IDs.

#### Returns

`string`[]

***

### getAllTenants()

> `static` **getAllTenants**(): [`TenantConfig`](../interfaces/TenantConfig.md)[]

Defined in: [packages/core/src/tanancy/MultiTenantManager.ts:187](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/tanancy/MultiTenantManager.ts#L187)

Returns all registered tenant configs.

#### Returns

[`TenantConfig`](../interfaces/TenantConfig.md)[]

***

### getClient()

> `static` **getClient**(`tenantId`): `Promise`\<`MongoClient` \| `null`\>

Defined in: [packages/core/src/tanancy/MultiTenantManager.ts:117](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/tanancy/MultiTenantManager.ts#L117)

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

Defined in: [packages/core/src/tanancy/MultiTenantManager.ts:170](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/tanancy/MultiTenantManager.ts#L170)

Returns the first connected tenant ID.
Useful for backward compatibility, though not ideal in multi-tenant flows.

#### Returns

`string`

***

### getTenant()

> `static` **getTenant**(`tenantId`): [`TenantConfig`](../interfaces/TenantConfig.md) \| `undefined`

Defined in: [packages/core/src/tanancy/MultiTenantManager.ts:151](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/tanancy/MultiTenantManager.ts#L151)

Retrieves the full tenant configuration.

#### Parameters

##### tenantId

`string`

The tenant ID.

#### Returns

[`TenantConfig`](../interfaces/TenantConfig.md) \| `undefined`

The tenant configuration if found.

***

### getTenantDbName()

> `static` **getTenantDbName**(`tenantId`): `string` \| `undefined`

Defined in: [packages/core/src/tanancy/MultiTenantManager.ts:162](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/tanancy/MultiTenantManager.ts#L162)

Retrieves the configured database name for a tenant.

#### Parameters

##### tenantId

`string`

The tenant ID.

#### Returns

`string` \| `undefined`

The database name if found.

***

### hasTenant()

> `static` **hasTenant**(`tenantId`): `boolean`

Defined in: [packages/core/src/tanancy/MultiTenantManager.ts:33](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/tanancy/MultiTenantManager.ts#L33)

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

Defined in: [packages/core/src/tanancy/MultiTenantManager.ts:194](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/tanancy/MultiTenantManager.ts#L194)

Returns true if at least one tenant is registered.

#### Returns

`boolean`

***

### registerLazyTenant()

> `static` **registerLazyTenant**(`tenantId`, `uri`, `options?`): [`TenantConfig`](../interfaces/TenantConfig.md)

Defined in: [packages/core/src/tanancy/MultiTenantManager.ts:45](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/tanancy/MultiTenantManager.ts#L45)

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

Defined in: [packages/core/src/tanancy/MultiTenantManager.ts:77](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/tanancy/MultiTenantManager.ts#L77)

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

Defined in: [packages/core/src/tanancy/MultiTenantManager.ts:201](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/tanancy/MultiTenantManager.ts#L201)

Removes a tenant from the registry.

#### Parameters

##### tenantId

`string`

#### Returns

`boolean`
