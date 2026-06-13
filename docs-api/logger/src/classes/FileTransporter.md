[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [logger/src](../README.md) / FileTransporter

# Class: FileTransporter

Defined in: [packages/logger/src/transports/fileTransport.ts:5](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/transports/fileTransport.ts#L5)

## Implements

- [`Transporter`](../interfaces/Transporter.md)

## Constructors

### Constructor

> **new FileTransporter**(`stream`): `FileTransporter`

Defined in: [packages/logger/src/transports/fileTransport.ts:6](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/transports/fileTransport.ts#L6)

#### Parameters

##### stream

`WriteStream`

#### Returns

`FileTransporter`

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [packages/logger/src/transports/fileTransport.ts:25](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/transports/fileTransport.ts#L25)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Transporter`](../interfaces/Transporter.md).[`close`](../interfaces/Transporter.md#close)

***

### flush()

> **flush**(): `Promise`\<`void`\>

Defined in: [packages/logger/src/transports/fileTransport.ts:19](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/transports/fileTransport.ts#L19)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Transporter`](../interfaces/Transporter.md).[`flush`](../interfaces/Transporter.md#flush)

***

### write()

> **write**(`_entry`, `formatted`): `Promise`\<`void`\>

Defined in: [packages/logger/src/transports/fileTransport.ts:8](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/transports/fileTransport.ts#L8)

#### Parameters

##### \_entry

[`LogEntry`](../interfaces/LogEntry.md)

##### formatted

`string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Transporter`](../interfaces/Transporter.md).[`write`](../interfaces/Transporter.md#write)
