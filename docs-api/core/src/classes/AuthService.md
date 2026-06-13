[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / AuthService

# Class: AuthService

Defined in: [packages/core/src/utils/AuthUtils.ts:10](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/utils/AuthUtils.ts#L10)

## Constructors

### Constructor

> **new AuthService**(): `AuthService`

#### Returns

`AuthService`

## Methods

### generateRefreshToken()

> `static` **generateRefreshToken**(`user`): `string`

Defined in: [packages/core/src/utils/AuthUtils.ts:17](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/utils/AuthUtils.ts#L17)

#### Parameters

##### user

###### _id

`string`

###### role

`string`

#### Returns

`string`

***

### generateToken()

> `static` **generateToken**(`user`): `string`

Defined in: [packages/core/src/utils/AuthUtils.ts:11](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/utils/AuthUtils.ts#L11)

#### Parameters

##### user

###### _id

`string`

###### role

`string`

###### tenantId

`string`

#### Returns

`string`

***

### verifyToken()

> `static` **verifyToken**(`token`): `string` \| `JwtPayload`

Defined in: [packages/core/src/utils/AuthUtils.ts:26](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/utils/AuthUtils.ts#L26)

#### Parameters

##### token

`string`

#### Returns

`string` \| `JwtPayload`
