[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [adapter-graphql/src](../README.md) / runWithGraphqlContext

# Function: runWithGraphqlContext()

> **runWithGraphqlContext**\<`T`\>(`request`, `handler`, `options?`): `Promise`\<`T`\>

Defined in: [packages/adapter-graphql/src/graphql-context.ts:22](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/adapter-graphql/src/graphql-context.ts#L22)

## Type Parameters

### T

`T`

## Parameters

### request

[`AmbitenRequestLike`](../../../adapter-types/src/interfaces/AmbitenRequestLike.md)

### handler

() => `T` \| `Promise`\<`T`\>

### options?

`AdapterContextOptions` = `{}`

## Returns

`Promise`\<`T`\>
