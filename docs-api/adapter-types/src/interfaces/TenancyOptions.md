[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [adapter-types/src](../README.md) / TenancyOptions

# Interface: TenancyOptions

Defined in: [packages/adapter-types/src/types.ts:21](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/adapter-types/src/types.ts#L21)

## Properties

### cookie?

> `optional` **cookie?**: `string`

Defined in: [packages/adapter-types/src/types.ts:23](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/adapter-types/src/types.ts#L23)

***

### fallback?

> `optional` **fallback?**: `string`

Defined in: [packages/adapter-types/src/types.ts:27](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/adapter-types/src/types.ts#L27)

***

### header?

> `optional` **header?**: `string`

Defined in: [packages/adapter-types/src/types.ts:22](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/adapter-types/src/types.ts#L22)

***

### jwtClaim?

> `optional` **jwtClaim?**: `string`

Defined in: [packages/adapter-types/src/types.ts:26](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/adapter-types/src/types.ts#L26)

***

### param?

> `optional` **param?**: `string`

Defined in: [packages/adapter-types/src/types.ts:24](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/adapter-types/src/types.ts#L24)

***

### resolver?

> `optional` **resolver?**: [`TenantResolver`](../type-aliases/TenantResolver.md)

Defined in: [packages/adapter-types/src/types.ts:29](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/adapter-types/src/types.ts#L29)

***

### subdomain?

> `optional` **subdomain?**: `boolean`

Defined in: [packages/adapter-types/src/types.ts:25](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/adapter-types/src/types.ts#L25)

***

### validate?

> `optional` **validate?**: (`id`) => `boolean` \| `Promise`\<`boolean`\>

Defined in: [packages/adapter-types/src/types.ts:28](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/adapter-types/src/types.ts#L28)

#### Parameters

##### id

`string`

#### Returns

`boolean` \| `Promise`\<`boolean`\>
