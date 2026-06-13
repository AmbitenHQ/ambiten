[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / enforceRBAC

# Function: enforceRBAC()

> **enforceRBAC**(`resolver`, `permission`): (`parent`, `args`, `context`, `info`) => `Promise`\<`any`\>

Defined in: [packages/core/src/middleware/rbac/rbacMiddleware.ts:216](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/middleware/rbac/rbacMiddleware.ts#L216)

Middleware to enforce RBAC (Role-Based Access Control) on GraphQL resolvers

## Parameters

### resolver

`Function`

The original resolver function

### permission

[`Permission`](../type-aliases/Permission.md)

The required permission for the action

## Returns

A wrapped resolver function that checks permissions

(`parent`, `args`, `context`, `info`) => `Promise`\<`any`\>

## Throws

If the user does not have the required permission

## Example

```ts
// Wrap a resolver with RBAC enforcement
const securedResolver = enforceRBAC(originalResolver, 'createUser');

// Use the secured resolver in your GraphQL schema
const resolvers = {
  Mutation: {
    createUser: securedResolver,
	}, };

In this example, the `enforceRBAC` function wraps the `originalResolver` and checks if the user has the 'createUser' permission before allowing access to the resolver. If the user lacks the required permission, an error is thrown, preventing unauthorized access.
* This middleware is essential for implementing fine-grained access control in GraphQL APIs, ensuring that only authorized users can perform specific actions based on their roles and permissions.
```

## Remarks

This function is designed to be used in GraphQL resolvers to enforce role-based access control (RBAC). It checks if the user has the necessary permissions before allowing access to the resolver function. If the user lacks the required permission, an error is thrown, preventing unauthorized access.
*

## See

 - [checkPermission](checkPermission.md) for checking user permissions
*
 - [Role](../type-aliases/Role.md) and [Permission](../type-aliases/Permission.md) for role and permission types
*
 - [rolePermissions](../variables/rolePermissions.md) for the mapping of roles to permissions
*
 - [getCachedData](getCachedData.md) and [setCachedData](setCachedData.md) for caching permissions
