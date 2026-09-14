[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [adapter-graphql/src](../README.md) / createGraphqlRuntimeContext

# Function: createGraphqlRuntimeContext()

> **createGraphqlRuntimeContext**\<`TExtra`\>(`input`, `options?`, `extend?`): `Promise`\<[`AmbitenGraphqlRuntimeContext`](../interfaces/AmbitenGraphqlRuntimeContext.md) & `TExtra`\>

Defined in: [packages/adapter-graphql/src/graphql-context.ts:30](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/adapter-graphql/src/graphql-context.ts#L30)

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
