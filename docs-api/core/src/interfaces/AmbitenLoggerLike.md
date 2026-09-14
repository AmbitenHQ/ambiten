[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / AmbitenLoggerLike

# Interface: AmbitenLoggerLike

Defined in: [packages/core/src/types/db.provider.ts:25](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/db.provider.ts#L25)

## Properties

### debug?

> `optional` **debug?**: (`message`, `meta?`) => `void`

Defined in: [packages/core/src/types/db.provider.ts:29](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/db.provider.ts#L29)

#### Parameters

##### message

`string`

##### meta?

`Record`\<`string`, `any`\>

#### Returns

`void`

***

### error?

> `optional` **error?**: (`message`, `meta?`) => `void`

Defined in: [packages/core/src/types/db.provider.ts:28](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/db.provider.ts#L28)

#### Parameters

##### message

`string`

##### meta?

`Record`\<`string`, `any`\>

#### Returns

`void`

***

### info?

> `optional` **info?**: (`message`, `meta?`) => `void`

Defined in: [packages/core/src/types/db.provider.ts:26](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/db.provider.ts#L26)

#### Parameters

##### message

`string`

##### meta?

`Record`\<`string`, `any`\>

#### Returns

`void`

***

### warn?

> `optional` **warn?**: (`message`, `meta?`) => `void`

Defined in: [packages/core/src/types/db.provider.ts:27](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/db.provider.ts#L27)

#### Parameters

##### message

`string`

##### meta?

`Record`\<`string`, `any`\>

#### Returns

`void`
