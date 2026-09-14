[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / getTenantDB

# Function: getTenantDB()

> **getTenantDB**(`tenantId`): `Promise`\<`Db`\>

Defined in: [packages/core/src/utils/builders/getTenantDb.ts:15](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/utils/builders/getTenantDb.ts#L15)

Retrieves the database instance for a specific tenant.
If the database is already cached, it returns the cached instance. 
Otherwise, it initializes a new database connection for the tenant, caches it, and returns it.

## Parameters

### tenantId

`string`

The ID of the tenant whose database is to be retrieved.

## Returns

`Promise`\<`Db`\>

A promise that resolves to the MongoDB database instance for the tenant.

## Throws

If the database for the specified tenant is not found.
