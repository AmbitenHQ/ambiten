[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / authorize

# Function: authorize()

> **authorize**(`roles`): (`req`, `res`, `next`) => `Response`\<`any`, `Record`\<`string`, `any`\>\> \| \{ `_id`: `string`; `role`: `string`; `tenantId`: `string`; \} \| `undefined`

Defined in: [packages/core/src/middleware/authorization/auth.ts:17](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/middleware/authorization/auth.ts#L17)

Middleware to authorize access to routes based on user roles.
 This middleware checks if the request contains a valid JWT token,

## Parameters

### roles

`string`[]

An array of roles that are allowed to access the route.

## Returns

(`req`, `res`, `next`) => `Response`\<`any`, `Record`\<`string`, `any`\>\> \| \{ `_id`: `string`; `role`: `string`; `tenantId`: `string`; \} \| `undefined`
