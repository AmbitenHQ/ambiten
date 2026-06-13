[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / AmbitenGraphQL

# Class: AmbitenGraphQL

Defined in: [packages/core/src/graphql/ambitenGraphQL.ts:17](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/graphql/ambitenGraphQL.ts#L17)

## Constructors

### Constructor

> **new AmbitenGraphQL**(`options`): `AmbitenGraphQL`

Defined in: [packages/core/src/graphql/ambitenGraphQL.ts:25](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/graphql/ambitenGraphQL.ts#L25)

#### Parameters

##### options

[`AmbitenGraphQLOptions`](../interfaces/AmbitenGraphQLOptions.md)

#### Returns

`AmbitenGraphQL`

## Methods

### customResolvers()

> **customResolvers**(`resolver`): `this`

Defined in: [packages/core/src/graphql/ambitenGraphQL.ts:41](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/graphql/ambitenGraphQL.ts#L41)

#### Parameters

##### resolver

`Record`\<`string`, `any`\>

#### Returns

`this`

***

### customTypeDefs()

> **customTypeDefs**(`schema`): `this`

Defined in: [packages/core/src/graphql/ambitenGraphQL.ts:32](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/graphql/ambitenGraphQL.ts#L32)

#### Parameters

##### schema

`string` \| `string`[]

#### Returns

`this`

***

### generateSchema()

> **generateSchema**(): `Promise`\<`GraphQLSchema`\>

Defined in: [packages/core/src/graphql/ambitenGraphQL.ts:273](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/graphql/ambitenGraphQL.ts#L273)

#### Returns

`Promise`\<`GraphQLSchema`\>

***

### subscriptions()

> **subscriptions**(): `boolean`

Defined in: [packages/core/src/graphql/ambitenGraphQL.ts:269](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/graphql/ambitenGraphQL.ts#L269)

#### Returns

`boolean`
