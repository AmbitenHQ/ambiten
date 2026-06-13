[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / Model

# Function: Model()

> **Model**\<`T`\>(`options`): [`AmbitenModel`](../classes/AmbitenModel.md)\<`T`\>

Defined in: [packages/core/src/utils/builders/createModel.ts:38](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/utils/builders/createModel.ts#L38)

Creates a new model for a MongoDB collection.
In Multi-Tenancy mode, the model will be created for the specified tenant.
If no tenant ID is provided, the model will be created for the default tenant. 
Note: Once a the applyMultiTenancy() middleware is applied to a connection to register tenant/s, the tenantId will be automatically set for all models created after that.
This allows you to create models for different tenants without having to specify the tenantId each time. Then a tenantId or db instance or client instance is required to create a model.

## Type Parameters

### T

`T` *extends* [`Document`](../type-aliases/Document.md) = `any`

The type of the document in the collection.

## Parameters

### options

`CreateModelParams`\<`T`\>

## Returns

[`AmbitenModel`](../classes/AmbitenModel.md)\<`T`\>

The created model.

## Example

```ts
const userSchema = createSchema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  email: { type: String, required: true },
});

const userModel = Model({
  name: 'users',
  schema: userSchema,
  provider: (client/db - whichever you naming is)/new MyCustomDbProvider(), // Your custom database provider instance
  ctx: {
    tenantId: 'tenant-a', // Optional: specify tenant ID if using multi-tenancy
    dbName: 'myDatabase', // Optional: specify database name if needed
} read docs for more details on what context options you can provide
});
```
