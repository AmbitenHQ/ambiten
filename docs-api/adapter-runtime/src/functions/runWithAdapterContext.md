[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [adapter-runtime/src](../README.md) / runWithAdapterContext

# Function: runWithAdapterContext()

> **runWithAdapterContext**\<`T`\>(`req`, `handler`, `options?`): `Promise`\<`T`\>

Defined in: [packages/adapter-runtime/src/context-runner.ts:17](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/adapter-runtime/src/context-runner.ts#L17)

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
