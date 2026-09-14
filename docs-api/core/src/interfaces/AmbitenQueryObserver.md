[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / AmbitenQueryObserver

# Interface: AmbitenQueryObserver

Defined in: [packages/core/src/types/db.provider.ts:46](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/db.provider.ts#L46)

## Properties

### onQuery?

> `optional` **onQuery?**: (`payload`) => `void` \| `Promise`\<`void`\>

Defined in: [packages/core/src/types/db.provider.ts:47](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/db.provider.ts#L47)

#### Parameters

##### payload

`Record`\<`string`, `any`\>

#### Returns

`void` \| `Promise`\<`void`\>

***

### onQueryError?

> `optional` **onQueryError?**: (`payload`) => `void` \| `Promise`\<`void`\>

Defined in: [packages/core/src/types/db.provider.ts:48](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/db.provider.ts#L48)

#### Parameters

##### payload

`Record`\<`string`, `any`\>

#### Returns

`void` \| `Promise`\<`void`\>
