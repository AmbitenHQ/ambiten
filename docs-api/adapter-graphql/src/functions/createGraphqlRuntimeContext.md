[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [adapter-graphql/src](../README.md) / createGraphqlRuntimeContext

# Function: createGraphqlRuntimeContext()

> **createGraphqlRuntimeContext**\<`TExtra`\>(`input`, `options?`, `extend?`): `Promise`\<[`AmbitenGraphqlRuntimeContext`](../interfaces/AmbitenGraphqlRuntimeContext.md) & `TExtra`\>

Defined in: [packages/adapter-graphql/src/graphql-context.ts:30](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/adapter-graphql/src/graphql-context.ts#L30)

## Type Parameters

### TExtra

`TExtra` *extends* `Record`\<`string`, `unknown`\> = `Record`\<`string`, `unknown`\>

## Parameters

### input

#### rawInput?

`unknown`

#### rawRequest?

`unknown`

#### request

[`AmbitenRequestLike`](../../../adapter-types/src/interfaces/AmbitenRequestLike.md)

### options?

`AdapterContextOptions` = `{}`

### extend?

(`runtime`) => `TExtra` \| `Promise`\<`TExtra`\>

## Returns

`Promise`\<[`AmbitenGraphqlRuntimeContext`](../interfaces/AmbitenGraphqlRuntimeContext.md) & `TExtra`\>
