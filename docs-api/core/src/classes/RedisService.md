[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / RedisService

# Class: RedisService

Defined in: [packages/core/src/redis-manager/redisClient.ts:180](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/redis-manager/redisClient.ts#L180)

## Constructors

### Constructor

> **new RedisService**(): `RedisService`

#### Returns

`RedisService`

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [packages/core/src/redis-manager/redisClient.ts:193](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/redis-manager/redisClient.ts#L193)

#### Returns

`Promise`\<`void`\>

***

### connect()

> **connect**(`url?`): `Promise`\<`void`\>

Defined in: [packages/core/src/redis-manager/redisClient.ts:185](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/redis-manager/redisClient.ts#L185)

#### Parameters

##### url?

`string`

#### Returns

`Promise`\<`void`\>

***

### getClient()

> **getClient**(): `Promise`\<`RedisLike`\>

Defined in: [packages/core/src/redis-manager/redisClient.ts:189](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/redis-manager/redisClient.ts#L189)

#### Returns

`Promise`\<`RedisLike`\>

***

### getInstance()

> `static` **getInstance**(): `RedisService`

Defined in: [packages/core/src/redis-manager/redisClient.ts:181](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/redis-manager/redisClient.ts#L181)

#### Returns

`RedisService`
