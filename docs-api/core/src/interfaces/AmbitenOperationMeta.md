[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / AmbitenOperationMeta

# Interface: AmbitenOperationMeta

Defined in: [packages/core/src/types/ambiten.model.type.ts:93](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L93)

## Properties

### bulkWrite?

> `optional` **bulkWrite?**: `boolean`

Defined in: [packages/core/src/types/ambiten.model.type.ts:122](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L122)

Indicates the operation is a bulk write or bulk-style mutation.

***

### cacheHit?

> `optional` **cacheHit?**: `boolean`

Defined in: [packages/core/src/types/ambiten.model.type.ts:132](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L132)

Indicates the operation result came from cache.

***

### extra?

> `optional` **extra?**: `Record`\<`string`, `unknown`\>

Defined in: [packages/core/src/types/ambiten.model.type.ts:165](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L165)

Free-form extension point for future enterprise features.

***

### gc?

> `optional` **gc?**: `boolean`

Defined in: [packages/core/src/types/ambiten.model.type.ts:117](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L117)

Indicates the operation is part of garbage collection.

***

### policy?

> `optional` **policy?**: `string`

Defined in: [packages/core/src/types/ambiten.model.type.ts:148](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L148)

Optional tenant policy or compliance classification.
Reserved for future Sovereign Shield integration.

***

### region?

> `optional` **region?**: `string`

Defined in: [packages/core/src/types/ambiten.model.type.ts:154](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L154)

Optional region or sovereignty zone identifier.
Reserved for future geofencing and data-governance features.

***

### restore?

> `optional` **restore?**: `boolean`

Defined in: [packages/core/src/types/ambiten.model.type.ts:107](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L107)

Indicates the operation is part of a restore flow.

***

### secure?

> `optional` **secure?**: `boolean`

Defined in: [packages/core/src/types/ambiten.model.type.ts:102](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L102)

Indicates the operation is security-sensitive or explicitly access-controlled.

***

### softDelete?

> `optional` **softDelete?**: `boolean`

Defined in: [packages/core/src/types/ambiten.model.type.ts:112](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L112)

Indicates the operation is performing a soft delete rather than a hard delete.

***

### streaming?

> `optional` **streaming?**: `boolean`

Defined in: [packages/core/src/types/ambiten.model.type.ts:127](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L127)

Indicates the operation is creating or handling a stream.

***

### trace?

> `optional` **trace?**: `string`

Defined in: [packages/core/src/types/ambiten.model.type.ts:160](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L160)

Optional evidence or trace classification tag.
Reserved for future evidence collection and audit systems.

***

### transactional?

> `optional` **transactional?**: `boolean`

Defined in: [packages/core/src/types/ambiten.model.type.ts:97](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L97)

Indicates the operation is executing inside a transaction boundary.

***

### userId?

> `optional` **userId?**: `string`

Defined in: [packages/core/src/types/ambiten.model.type.ts:137](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L137)

User identifier associated with the operation, when available.

***

### userRole?

> `optional` **userRole?**: `string`

Defined in: [packages/core/src/types/ambiten.model.type.ts:142](https://github.com/AmbitenHQ/ambiten/blob/e30d8aa39363c5a87d56414ab76b4b08bc2a477d/packages/core/src/types/ambiten.model.type.ts#L142)

User role associated with the operation, when available.
