[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [logger/src](../README.md) / retryWithBackoff

# Function: retryWithBackoff()

> **retryWithBackoff**\<`T`\>(`fn`, `options?`): `Promise`\<`T`\>

Defined in: [packages/logger/src/utils/retry/retryWithBackoff.ts:30](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/logger/src/utils/retry/retryWithBackoff.ts#L30)

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
