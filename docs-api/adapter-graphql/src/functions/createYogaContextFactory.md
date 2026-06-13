[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [adapter-graphql/src](../README.md) / createYogaContextFactory

# Function: createYogaContextFactory()

> **createYogaContextFactory**\<`TContext`\>(`options?`, `extend?`): (`input`) => `Promise`\<[`AmbitenGraphqlRuntimeContext`](../interfaces/AmbitenGraphqlRuntimeContext.md) & `TContext`\>

Defined in: [packages/adapter-graphql/src/yoga.ts:8](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/adapter-graphql/src/yoga.ts#L8)

## Type Parameters

### TContext

`TContext` *extends* `Record`\<`string`, `unknown`\> = `Record`\<`string`, `unknown`\>

## Parameters

### options?

`AdapterContextOptions` = `{}`

### extend?

(`input`, `runtime`) => `TContext` \| `Promise`\<`TContext`\>

## Returns

(`input`) => `Promise`\<[`AmbitenGraphqlRuntimeContext`](../interfaces/AmbitenGraphqlRuntimeContext.md) & `TContext`\>
