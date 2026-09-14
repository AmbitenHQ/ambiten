[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [adapter-nestjs/src](../README.md) / AmbitenNestInterceptor

# Class: AmbitenNestInterceptor

Defined in: [packages/adapter-nestjs/src/nestjs-adapter.interceptor.ts:112](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/adapter-nestjs/src/nestjs-adapter.interceptor.ts#L112)

## Implements

- `NestInterceptor`

## Constructors

### Constructor

> **new AmbitenNestInterceptor**(`options?`): `AmbitenNestInterceptor`

Defined in: [packages/adapter-nestjs/src/nestjs-adapter.interceptor.ts:114](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/adapter-nestjs/src/nestjs-adapter.interceptor.ts#L114)

#### Parameters

##### options?

`AdapterContextOptions` = `{}`

#### Returns

`AmbitenNestInterceptor`

## Methods

### intercept()

> **intercept**(`context`, `next`): `Observable`\<`unknown`\>

Defined in: [packages/adapter-nestjs/src/nestjs-adapter.interceptor.ts:120](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/adapter-nestjs/src/nestjs-adapter.interceptor.ts#L120)

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

`Observable`\<`unknown`\>

#### Implementation of

`NestInterceptor.intercept`
