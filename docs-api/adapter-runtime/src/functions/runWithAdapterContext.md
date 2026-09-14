[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [adapter-runtime/src](../README.md) / runWithAdapterContext

# Function: runWithAdapterContext()

> **runWithAdapterContext**\<`T`\>(`req`, `handler`, `options?`): `Promise`\<`T`\>

Defined in: [packages/adapter-runtime/src/context-runner.ts:17](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/adapter-runtime/src/context-runner.ts#L17)

## Type Parameters

### T

`T`

## Parameters

### req

[`AmbitenRequestLike`](../../../adapter-types/src/interfaces/AmbitenRequestLike.md)

### handler

() => `T` \| `Promise`\<`T`\>

### options?

`AdapterContextOptions` = `{}`

## Returns

`Promise`\<`T`\>
