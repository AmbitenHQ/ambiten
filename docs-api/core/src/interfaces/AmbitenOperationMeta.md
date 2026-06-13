[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / AmbitenOperationMeta

# Interface: AmbitenOperationMeta

Defined in: [packages/core/src/types/ambiten.model.type.ts:86](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.model.type.ts#L86)

## Properties

### bulkWrite?

> `optional` **bulkWrite?**: `boolean`

Defined in: [packages/core/src/types/ambiten.model.type.ts:115](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.model.type.ts#L115)

Indicates the operation is a bulk write or bulk-style mutation.

***

### cacheHit?

> `optional` **cacheHit?**: `boolean`

Defined in: [packages/core/src/types/ambiten.model.type.ts:125](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.model.type.ts#L125)

Indicates the operation result came from cache.

***

### extra?

> `optional` **extra?**: `Record`\<`string`, `unknown`\>

Defined in: [packages/core/src/types/ambiten.model.type.ts:158](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.model.type.ts#L158)

Free-form extension point for future enterprise features.

***

### gc?

> `optional` **gc?**: `boolean`

Defined in: [packages/core/src/types/ambiten.model.type.ts:110](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.model.type.ts#L110)

Indicates the operation is part of garbage collection.

***

### policy?

> `optional` **policy?**: `string`

Defined in: [packages/core/src/types/ambiten.model.type.ts:141](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.model.type.ts#L141)

Optional tenant policy or compliance classification.
Reserved for future Sovereign Shield integration.

***

### region?

> `optional` **region?**: `string`

Defined in: [packages/core/src/types/ambiten.model.type.ts:147](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.model.type.ts#L147)

Optional region or sovereignty zone identifier.
Reserved for future geofencing and data-governance features.

***

### restore?

> `optional` **restore?**: `boolean`

Defined in: [packages/core/src/types/ambiten.model.type.ts:100](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.model.type.ts#L100)

Indicates the operation is part of a restore flow.

***

### secure?

> `optional` **secure?**: `boolean`

Defined in: [packages/core/src/types/ambiten.model.type.ts:95](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.model.type.ts#L95)

Indicates the operation is security-sensitive or explicitly access-controlled.

***

### softDelete?

> `optional` **softDelete?**: `boolean`

Defined in: [packages/core/src/types/ambiten.model.type.ts:105](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.model.type.ts#L105)

Indicates the operation is performing a soft delete rather than a hard delete.

***

### streaming?

> `optional` **streaming?**: `boolean`

Defined in: [packages/core/src/types/ambiten.model.type.ts:120](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.model.type.ts#L120)

Indicates the operation is creating or handling a stream.

***

### trace?

> `optional` **trace?**: `string`

Defined in: [packages/core/src/types/ambiten.model.type.ts:153](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.model.type.ts#L153)

Optional evidence or trace classification tag.
Reserved for future evidence collection and audit systems.

***

### transactional?

> `optional` **transactional?**: `boolean`

Defined in: [packages/core/src/types/ambiten.model.type.ts:90](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.model.type.ts#L90)

Indicates the operation is executing inside a transaction boundary.

***

### userId?

> `optional` **userId?**: `string`

Defined in: [packages/core/src/types/ambiten.model.type.ts:130](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.model.type.ts#L130)

User identifier associated with the operation, when available.

***

### userRole?

> `optional` **userRole?**: `string`

Defined in: [packages/core/src/types/ambiten.model.type.ts:135](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambiten.model.type.ts#L135)

User role associated with the operation, when available.
