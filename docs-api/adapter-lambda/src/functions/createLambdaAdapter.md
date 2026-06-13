[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [adapter-lambda/src](../README.md) / createLambdaAdapter

# Function: createLambdaAdapter()

> **createLambdaAdapter**\<`TEvent`, `TResult`\>(`handler`, `options?`): [`LambdaHandlerLike`](../interfaces/LambdaHandlerLike.md)\<`TEvent`, `TResult`\>

Defined in: [packages/adapter-lambda/src/lambda-adapter.ts:9](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/adapter-lambda/src/lambda-adapter.ts#L9)

## Type Parameters

### TEvent

`TEvent` *extends* [`LambdaRequestInput`](../interfaces/LambdaRequestInput.md)

### TResult

`TResult`

## Parameters

### handler

[`LambdaHandlerLike`](../interfaces/LambdaHandlerLike.md)\<`TEvent`, `TResult`\>

### options?

`AdapterContextOptions` = `{}`

## Returns

[`LambdaHandlerLike`](../interfaces/LambdaHandlerLike.md)\<`TEvent`, `TResult`\>
