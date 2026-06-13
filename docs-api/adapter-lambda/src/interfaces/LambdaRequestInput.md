[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [adapter-lambda/src](../README.md) / LambdaRequestInput

# Interface: LambdaRequestInput

Defined in: [packages/adapter-lambda/src/types.ts:9](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/adapter-lambda/src/types.ts#L9)

## Properties

### body?

> `optional` **body?**: `string` \| `null`

Defined in: [packages/adapter-lambda/src/types.ts:31](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/adapter-lambda/src/types.ts#L31)

***

### cookies?

> `optional` **cookies?**: `string`[]

Defined in: [packages/adapter-lambda/src/types.ts:29](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/adapter-lambda/src/types.ts#L29)

***

### headers?

> `optional` **headers?**: `Record`\<`string`, `string` \| `undefined`\> \| `null`

Defined in: [packages/adapter-lambda/src/types.ts:10](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/adapter-lambda/src/types.ts#L10)

***

### httpMethod?

> `optional` **httpMethod?**: `string`

Defined in: [packages/adapter-lambda/src/types.ts:27](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/adapter-lambda/src/types.ts#L27)

***

### isBase64Encoded?

> `optional` **isBase64Encoded?**: `boolean`

Defined in: [packages/adapter-lambda/src/types.ts:32](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/adapter-lambda/src/types.ts#L32)

***

### multiValueHeaders?

> `optional` **multiValueHeaders?**: `Record`\<`string`, `string`[] \| `undefined`\> \| `null`

Defined in: [packages/adapter-lambda/src/types.ts:11](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/adapter-lambda/src/types.ts#L11)

***

### multiValueQueryStringParameters?

> `optional` **multiValueQueryStringParameters?**: `Record`\<`string`, `string`[] \| `undefined`\> \| `null`

Defined in: [packages/adapter-lambda/src/types.ts:16](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/adapter-lambda/src/types.ts#L16)

***

### path?

> `optional` **path?**: `string`

Defined in: [packages/adapter-lambda/src/types.ts:26](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/adapter-lambda/src/types.ts#L26)

***

### pathParameters?

> `optional` **pathParameters?**: `Record`\<`string`, `string` \| `undefined`\> \| `null`

Defined in: [packages/adapter-lambda/src/types.ts:13](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/adapter-lambda/src/types.ts#L13)

***

### queryStringParameters?

> `optional` **queryStringParameters?**: `Record`\<`string`, `string` \| `undefined`\> \| `null`

Defined in: [packages/adapter-lambda/src/types.ts:15](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/adapter-lambda/src/types.ts#L15)

***

### rawPath?

> `optional` **rawPath?**: `string`

Defined in: [packages/adapter-lambda/src/types.ts:25](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/adapter-lambda/src/types.ts#L25)

***

### requestContext?

> `optional` **requestContext?**: `object`

Defined in: [packages/adapter-lambda/src/types.ts:18](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/adapter-lambda/src/types.ts#L18)

#### http?

> `optional` **http?**: `object`

##### http.method?

> `optional` **method?**: `string`

##### http.path?

> `optional` **path?**: `string`
