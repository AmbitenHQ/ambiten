[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [logger/src](../README.md) / LoggerConfig

# Interface: LoggerConfig

Defined in: [packages/logger/src/types/ambitenConfig.ts:22](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/ambitenConfig.ts#L22)

## Properties

### circuitBreaker?

> `optional` **circuitBreaker?**: `object`

Defined in: [packages/logger/src/types/ambitenConfig.ts:49](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/ambitenConfig.ts#L49)

#### enabled?

> `optional` **enabled?**: `boolean`

#### retryAttempts?

> `optional` **retryAttempts?**: `number`

#### retryDelay?

> `optional` **retryDelay?**: `number`

***

### colorize?

> `optional` **colorize?**: `boolean`

Defined in: [packages/logger/src/types/ambitenConfig.ts:25](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/ambitenConfig.ts#L25)

***

### compress?

> `optional` **compress?**: `object`

Defined in: [packages/logger/src/types/ambitenConfig.ts:57](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/ambitenConfig.ts#L57)

#### enabled?

> `optional` **enabled?**: `boolean`

***

### contextProvider?

> `optional` **contextProvider?**: [`LoggerContextProvider`](../type-aliases/LoggerContextProvider.md)

Defined in: [packages/logger/src/types/ambitenConfig.ts:37](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/ambitenConfig.ts#L37)

Allows @ambiten/core to inject AmbitenContext.get()
without @ambiten/logger importing @ambiten/core.

***

### enableMetrics?

> `optional` **enableMetrics?**: `LoggerMetricsOptions`

Defined in: [packages/logger/src/types/ambitenConfig.ts:55](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/ambitenConfig.ts#L55)

***

### enrichMetadata?

> `optional` **enrichMetadata?**: (`entry`) => [`LogEntry`](LogEntry.md)

Defined in: [packages/logger/src/types/ambitenConfig.ts:42](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/ambitenConfig.ts#L42)

Allows users to enrich structured metadata.

#### Parameters

##### entry

[`LogEntry`](LogEntry.md)

#### Returns

[`LogEntry`](LogEntry.md)

***

### excludedSources?

> `optional` **excludedSources?**: `string`[]

Defined in: [packages/logger/src/types/ambitenConfig.ts:29](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/ambitenConfig.ts#L29)

***

### formatOptions?

> `optional` **formatOptions?**: [`LoggerFormatOptions`](LoggerFormatOptions.md)

Defined in: [packages/logger/src/types/ambitenConfig.ts:30](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/ambitenConfig.ts#L30)

***

### hooks?

> `optional` **hooks?**: [`LoggerHooks`](LoggerHooks.md)

Defined in: [packages/logger/src/types/ambitenConfig.ts:31](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/ambitenConfig.ts#L31)

***

### json?

> `optional` **json?**: `boolean`

Defined in: [packages/logger/src/types/ambitenConfig.ts:26](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/ambitenConfig.ts#L26)

***

### level?

> `optional` **level?**: [`LogLevel`](../type-aliases/LogLevel.md)

Defined in: [packages/logger/src/types/ambitenConfig.ts:24](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/ambitenConfig.ts#L24)

***

### logger?

> `optional` **logger?**: [`ILogger`](ILogger.md)

Defined in: [packages/logger/src/types/ambitenConfig.ts:23](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/ambitenConfig.ts#L23)

***

### shouldLog?

> `optional` **shouldLog?**: (`level`, `entry`) => `boolean`

Defined in: [packages/logger/src/types/ambitenConfig.ts:47](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/ambitenConfig.ts#L47)

Allows advanced filtering by level, entry, tenant, source, etc.

#### Parameters

##### level

[`LogLevel`](../type-aliases/LogLevel.md)

##### entry

[`LogEntry`](LogEntry.md)

#### Returns

`boolean`

***

### transportConfigs?

> `optional` **transportConfigs?**: [`LoggerTransportConfig`](../type-aliases/LoggerTransportConfig.md)[]

Defined in: [packages/logger/src/types/ambitenConfig.ts:27](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/ambitenConfig.ts#L27)

***

### transports?

> `optional` **transports?**: ([`Transporter`](Transporter.md) \| [`RemoteTransporter`](../type-aliases/RemoteTransporter.md))[]

Defined in: [packages/logger/src/types/ambitenConfig.ts:28](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/types/ambitenConfig.ts#L28)
