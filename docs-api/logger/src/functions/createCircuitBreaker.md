[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [logger/src](../README.md) / createCircuitBreaker

# Function: createCircuitBreaker()

> **createCircuitBreaker**\<`TArgs`, `TResult`\>(`fn`, `options?`): (...`args`) => `Promise`\<`TResult`\>

Defined in: [packages/logger/src/utils/circuitBreaker/circuitBreaker.ts:12](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/utils/circuitBreaker/circuitBreaker.ts#L12)

## Type Parameters

### TArgs

`TArgs` *extends* `unknown`[]

### TResult

`TResult`

## Parameters

### fn

(...`args`) => `Promise`\<`TResult`\>

### options?

`CircuitBreakerOptions` = `{}`

## Returns

(...`args`) => `Promise`\<`TResult`\>
