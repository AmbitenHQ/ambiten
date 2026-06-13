[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [adapter-nestjs/src](../README.md) / AmbitenNestInterceptor

# Class: AmbitenNestInterceptor

Defined in: [packages/adapter-nestjs/src/nestjs-adapter.interceptor.ts:91](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/adapter-nestjs/src/nestjs-adapter.interceptor.ts#L91)

## Implements

- `NestInterceptor`

## Constructors

### Constructor

> **new AmbitenNestInterceptor**(`options?`): `AmbitenNestInterceptor`

Defined in: [packages/adapter-nestjs/src/nestjs-adapter.interceptor.ts:92](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/adapter-nestjs/src/nestjs-adapter.interceptor.ts#L92)

#### Parameters

##### options?

`AdapterContextOptions` = `{}`

#### Returns

`AmbitenNestInterceptor`

## Methods

### intercept()

> **intercept**(`context`, `next`): `Promise`\<`Observable`\<`unknown`\>\>

Defined in: [packages/adapter-nestjs/src/nestjs-adapter.interceptor.ts:97](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/adapter-nestjs/src/nestjs-adapter.interceptor.ts#L97)

Method to implement a custom interceptor.

#### Parameters

##### context

`ExecutionContext`

an `ExecutionContext` object providing methods to access the
route handler and class about to be invoked.

##### next

`CallHandler`

a reference to the `CallHandler`, which provides access to an
`Observable` representing the response stream from the route handler.

#### Returns

`Promise`\<`Observable`\<`unknown`\>\>

#### Implementation of

`NestInterceptor.intercept`
