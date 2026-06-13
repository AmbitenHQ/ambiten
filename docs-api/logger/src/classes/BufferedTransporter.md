[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [logger/src](../README.md) / BufferedTransporter

# Class: BufferedTransporter

Defined in: [packages/logger/src/transports/buffered-transporter.ts:18](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/transports/buffered-transporter.ts#L18)

## Implements

- [`Transporter`](../interfaces/Transporter.md)

## Constructors

### Constructor

> **new BufferedTransporter**(`transporter`, `options?`): `BufferedTransporter`

Defined in: [packages/logger/src/transports/buffered-transporter.ts:32](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/transports/buffered-transporter.ts#L32)

#### Parameters

##### transporter

[`Transporter`](../interfaces/Transporter.md)

##### options?

`BufferedTransporterOptions` = `{}`

#### Returns

`BufferedTransporter`

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [packages/logger/src/transports/buffered-transporter.ts:105](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/transports/buffered-transporter.ts#L105)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Transporter`](../interfaces/Transporter.md).[`close`](../interfaces/Transporter.md#close)

***

### flush()

> **flush**(): `Promise`\<`void`\>

Defined in: [packages/logger/src/transports/buffered-transporter.ts:66](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/transports/buffered-transporter.ts#L66)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Transporter`](../interfaces/Transporter.md).[`flush`](../interfaces/Transporter.md#flush)

***

### stop()

> **stop**(): `Promise`\<`void`\>

Defined in: [packages/logger/src/transports/buffered-transporter.ts:120](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/transports/buffered-transporter.ts#L120)

#### Returns

`Promise`\<`void`\>

***

### write()

> **write**(`entry`, `formatted`): `Promise`\<`void`\>

Defined in: [packages/logger/src/transports/buffered-transporter.ts:44](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/transports/buffered-transporter.ts#L44)

#### Parameters

##### entry

[`LogEntry`](../interfaces/LogEntry.md)

##### formatted

`string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Transporter`](../interfaces/Transporter.md).[`write`](../interfaces/Transporter.md#write)
