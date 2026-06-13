[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / checkPermission

# Function: checkPermission()

> **checkPermission**(`role`, `permission`): `Promise`\<`boolean`\>

Defined in: [packages/core/src/middleware/rbac/rbacMiddleware.ts:45](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/middleware/rbac/rbacMiddleware.ts#L45)

Check if a user has a specific permission

## Parameters

### role

[`Role`](../type-aliases/Role.md)

The role of the user

### permission

[`Permission`](../type-aliases/Permission.md)

The permission to check

## Returns

`Promise`\<`boolean`\>

A promise that resolves to true if the user has the permission, false otherwise

## Example

```ts
const hasPermission = await checkPermission('admin', 'createUser');
if (hasPermission) {
// User has permission to create a user
} else {
// User does not have permission to create a user
}
```
