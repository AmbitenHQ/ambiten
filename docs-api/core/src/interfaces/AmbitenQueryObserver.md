[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / AmbitenQueryObserver

# Interface: AmbitenQueryObserver

Defined in: [packages/core/src/types/db.provider.ts:45](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/db.provider.ts#L45)

## Properties

### onQuery?

> `optional` **onQuery?**: (`payload`) => `void` \| `Promise`\<`void`\>

Defined in: [packages/core/src/types/db.provider.ts:46](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/db.provider.ts#L46)

#### Parameters

##### payload

`Record`\<`string`, `any`\>

#### Returns

`void` \| `Promise`\<`void`\>

***

### onQueryError?

> `optional` **onQueryError?**: (`payload`) => `void` \| `Promise`\<`void`\>

Defined in: [packages/core/src/types/db.provider.ts:47](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/db.provider.ts#L47)

#### Parameters

##### payload

`Record`\<`string`, `any`\>

#### Returns

`void` \| `Promise`\<`void`\>
