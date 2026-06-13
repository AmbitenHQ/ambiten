[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [logger/src](../README.md) / AsyncBatchTransporterOptions

# Interface: AsyncBatchTransporterOptions

Defined in: [packages/logger/src/types/logger.types.ts:77](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/logger.types.ts#L77)

## Properties

### batchSize?

> `optional` **batchSize?**: `number`

Defined in: [packages/logger/src/types/logger.types.ts:78](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/logger.types.ts#L78)

***

### flushInterval?

> `optional` **flushInterval?**: `number`

Defined in: [packages/logger/src/types/logger.types.ts:79](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/logger.types.ts#L79)

***

### sendBatch

> **sendBatch**: (`entries`) => `Promise`\<`void`\>

Defined in: [packages/logger/src/types/logger.types.ts:80](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/logger.types.ts#L80)

#### Parameters

##### entries

[`LogEntry`](LogEntry.md)[]

#### Returns

`Promise`\<`void`\>
