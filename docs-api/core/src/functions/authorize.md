[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / authorize

# Function: authorize()

> **authorize**(`roles`): (`req`, `res`, `next`) => `Response` \| \{ `_id`: `string`; `role`: `string`; `tenantId`: `string`; \} \| `undefined`

Defined in: [packages/core/src/middleware/authorization/auth.ts:17](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/middleware/authorization/auth.ts#L17)

Middleware to authorize access to routes based on user roles.
 This middleware checks if the request contains a valid JWT token,

## Parameters

### roles

`string`[]

An array of roles that are allowed to access the route.

## Returns

(`req`, `res`, `next`) => `Response` \| \{ `_id`: `string`; `role`: `string`; `tenantId`: `string`; \} \| `undefined`
