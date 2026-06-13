[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [logger/src](../README.md) / AsyncBatchTransporter

# Class: AsyncBatchTransporter

Defined in: [packages/logger/src/transports/async-batch.transporter.ts:22](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/transports/async-batch.transporter.ts#L22)

## Implements

- [`Transporter`](../interfaces/Transporter.md)

## Constructors

### Constructor

> **new AsyncBatchTransporter**(`options`): `AsyncBatchTransporter`

Defined in: [packages/logger/src/transports/async-batch.transporter.ts:40](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/transports/async-batch.transporter.ts#L40)

#### Parameters

##### options

`AsyncBatchTransporterConfig`

#### Returns

`AsyncBatchTransporter`

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [packages/logger/src/transports/async-batch.transporter.ts:151](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/transports/async-batch.transporter.ts#L151)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Transporter`](../interfaces/Transporter.md).[`close`](../interfaces/Transporter.md#close)

***

### flush()

> **flush**(): `Promise`\<`void`\>

Defined in: [packages/logger/src/transports/async-batch.transporter.ts:94](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/transports/async-batch.transporter.ts#L94)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Transporter`](../interfaces/Transporter.md).[`flush`](../interfaces/Transporter.md#flush)

***

### start()

> **start**(): `void`

Defined in: [packages/logger/src/transports/async-batch.transporter.ts:133](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/transports/async-batch.transporter.ts#L133)

#### Returns

`void`

***

### stop()

> **stop**(): `Promise`\<`void`\>

Defined in: [packages/logger/src/transports/async-batch.transporter.ts:174](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/transports/async-batch.transporter.ts#L174)

#### Returns

`Promise`\<`void`\>

***

### write()

> **write**(`entry`, `_formatted`): `Promise`\<`void`\>

Defined in: [packages/logger/src/transports/async-batch.transporter.ts:58](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/transports/async-batch.transporter.ts#L58)

#### Parameters

##### entry

[`LogEntry`](../interfaces/LogEntry.md)

##### \_formatted

`string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Transporter`](../interfaces/Transporter.md).[`write`](../interfaces/Transporter.md#write)
