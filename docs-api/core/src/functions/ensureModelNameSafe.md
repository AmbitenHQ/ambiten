[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / ensureModelNameSafe

# Function: ensureModelNameSafe()

> **ensureModelNameSafe**(`collectionName`): `string`

Defined in: [packages/core/src/utils/ensureModelNameSafe.ts:11](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/utils/ensureModelNameSafe.ts#L11)

Ensures that the provided model name is a valid, non-empty string.
Throws an error if the model name is invalid.

## Parameters

### collectionName

`string`

The collection name to validate.

## Returns

`string`

- The validated model name.

## Throws

- If the model name is invalid.

## Example

```ts
const safeModelName = ensureModelNameSafe('MyModel123');
```
