[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / createSchema

# Function: createSchema()

> **createSchema**\<`T`\>(`schema`): [`AmbitenSchema`](../classes/AmbitenSchema.md)\<`T`\>

Defined in: [packages/core/src/utils/builders/schema.ts:23](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/utils/builders/schema.ts#L23)

Creates a new AmbitenSchema instance with the provided schema definition.

## Type Parameters

### T

`T` *extends* [`Document`](../type-aliases/Document.md)

The type of the document.

## Parameters

### schema

[`SchemaDefinition`](../type-aliases/SchemaDefinition.md)\<`T`\> \| `Record`\<keyof `T`, `any`\>

The schema definition for the document.

## Returns

[`AmbitenSchema`](../classes/AmbitenSchema.md)\<`T`\>

The created AmbitenSchema instance.

## Example

```ts
const userSchema = createSchema({
  name: { type: String, required: true },
 age: { type: Number, required: true },
 email: { type: String, required: true },
});
const userModel = new AmbitenModel(userSchema, 'users', db);
	
const user = await userModel.create({ name: 'John Doe', age: 30, email: 'example.com' });
console.log(user); // { _id: '...', name: 'John Doe', age: 30, email: 'example.com' }
```
