[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [logger/src](../README.md) / retryWithBackoff

# Function: retryWithBackoff()

> **retryWithBackoff**\<`T`\>(`fn`, `options?`): `Promise`\<`T`\>

Defined in: [packages/logger/src/utils/retry/retryWithBackoff.ts:30](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/utils/retry/retryWithBackoff.ts#L30)

Retries an async operation with exponential backoff.

## Type Parameters

### T

`T`

## Parameters

### fn

() => `Promise`\<`T`\>

### options?

`RetryWithBackoffOptions` = `{}`

## Returns

`Promise`\<`T`\>
