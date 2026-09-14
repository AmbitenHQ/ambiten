[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [logger/src](../README.md) / createCircuitBreaker

# Function: createCircuitBreaker()

> **createCircuitBreaker**\<`TArgs`, `TResult`\>(`fn`, `options?`): (...`args`) => `Promise`\<`TResult`\>

Defined in: [packages/logger/src/utils/circuitBreaker/circuitBreaker.ts:12](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/logger/src/utils/circuitBreaker/circuitBreaker.ts#L12)

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
