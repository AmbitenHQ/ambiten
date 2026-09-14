[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [adapter-lambda/src](../README.md) / LambdaHandlerLike

# Interface: LambdaHandlerLike()\<TEvent, TResult\>

Defined in: [packages/adapter-lambda/src/types.ts:5](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/adapter-lambda/src/types.ts#L5)

## Type Parameters

### TEvent

`TEvent` = `unknown`

### TResult

`TResult` = `unknown`

> **LambdaHandlerLike**(`event`, `context?`): `TResult` \| `Promise`\<`TResult`\>

Defined in: [packages/adapter-lambda/src/types.ts:6](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/adapter-lambda/src/types.ts#L6)

## Parameters

### event

`TEvent`

### context?

`unknown`

## Returns

`TResult` \| `Promise`\<`TResult`\>
