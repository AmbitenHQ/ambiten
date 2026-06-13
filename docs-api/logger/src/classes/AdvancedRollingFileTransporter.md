[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [logger/src](../README.md) / AdvancedRollingFileTransporter

# Class: AdvancedRollingFileTransporter

Defined in: [packages/logger/src/transports/AdvancedRollingFileTransporter.ts:29](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/transports/AdvancedRollingFileTransporter.ts#L29)

## Implements

- [`Transporter`](../interfaces/Transporter.md)

## Constructors

### Constructor

> **new AdvancedRollingFileTransporter**(`options`): `AdvancedRollingFileTransporter`

Defined in: [packages/logger/src/transports/AdvancedRollingFileTransporter.ts:40](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/transports/AdvancedRollingFileTransporter.ts#L40)

#### Parameters

##### options

`RollingFileOptions`

#### Returns

`AdvancedRollingFileTransporter`

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Defined in: [packages/logger/src/transports/AdvancedRollingFileTransporter.ts:287](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/transports/AdvancedRollingFileTransporter.ts#L287)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Transporter`](../interfaces/Transporter.md).[`close`](../interfaces/Transporter.md#close)

***

### ensureDirectoryExists()

> **ensureDirectoryExists**(): `void`

Defined in: [packages/logger/src/transports/AdvancedRollingFileTransporter.ts:275](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/transports/AdvancedRollingFileTransporter.ts#L275)

#### Returns

`void`

***

### flush()

> **flush**(): `Promise`\<`void`\>

Defined in: [packages/logger/src/transports/AdvancedRollingFileTransporter.ts:232](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/transports/AdvancedRollingFileTransporter.ts#L232)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Transporter`](../interfaces/Transporter.md).[`flush`](../interfaces/Transporter.md#flush)

***

### getLogDirectory()

> **getLogDirectory**(): `string`

Defined in: [packages/logger/src/transports/AdvancedRollingFileTransporter.ts:283](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/transports/AdvancedRollingFileTransporter.ts#L283)

#### Returns

`string`

***

### write()

> **write**(`entry`, `formatted`): `Promise`\<`void`\>

Defined in: [packages/logger/src/transports/AdvancedRollingFileTransporter.ts:215](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/transports/AdvancedRollingFileTransporter.ts#L215)

#### Parameters

##### entry

[`LogEntry`](../interfaces/LogEntry.md)

##### formatted

`string`

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`Transporter`](../interfaces/Transporter.md).[`write`](../interfaces/Transporter.md#write)
