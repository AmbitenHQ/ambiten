[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / AmbitenLoggerSettings

# Interface: AmbitenLoggerSettings

Defined in: [packages/core/src/types/ambitenConfig.ts:9](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambitenConfig.ts#L9)

## Extends

- `LoggerConfig`

## Properties

### circuitBreaker?

> `optional` **circuitBreaker?**: `object`

Defined in: [packages/core/src/types/ambitenConfig.ts:24](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambitenConfig.ts#L24)

#### enabled?

> `optional` **enabled?**: `boolean`

#### retryAttempts?

> `optional` **retryAttempts?**: `number`

#### retryDelay?

> `optional` **retryDelay?**: `number`

#### Overrides

`LoggerConfig.circuitBreaker`

***

### colorize?

> `optional` **colorize?**: `boolean`

Defined in: [packages/core/src/types/ambitenConfig.ts:14](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambitenConfig.ts#L14)

#### Overrides

`LoggerConfig.colorize`

***

### compress?

> `optional` **compress?**: `object`

Defined in: [packages/core/src/types/ambitenConfig.ts:25](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambitenConfig.ts#L25)

#### enabled?

> `optional` **enabled?**: `boolean`

#### Overrides

`LoggerConfig.compress`

***

### contextProvider?

> `optional` **contextProvider?**: `LoggerContextProvider`

Defined in: packages/logger/dist/types/ambitenConfig.d.ts:23

Allows @ambiten/core to inject AmbitenContext.get()
without @ambiten/logger importing @ambiten/core.

#### Inherited from

`LoggerConfig.contextProvider`

***

### enabled?

> `optional` **enabled?**: `boolean`

Defined in: [packages/core/src/types/ambitenConfig.ts:10](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambitenConfig.ts#L10)

***

### enableMetrics?

> `optional` **enableMetrics?**: `LoggerMetricsOptions`

Defined in: [packages/core/src/types/ambitenConfig.ts:22](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambitenConfig.ts#L22)

#### Overrides

`LoggerConfig.enableMetrics`

***

### enrichMetadata?

> `optional` **enrichMetadata?**: (`entry`) => `LogEntry`

Defined in: [packages/core/src/types/ambitenConfig.ts:21](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambitenConfig.ts#L21)

Allows users to enrich structured metadata.

#### Parameters

##### entry

`LogEntry`

#### Returns

`LogEntry`

#### Overrides

`LoggerConfig.enrichMetadata`

***

### excludedSources?

> `optional` **excludedSources?**: `string`[]

Defined in: [packages/core/src/types/ambitenConfig.ts:19](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambitenConfig.ts#L19)

#### Overrides

`LoggerConfig.excludedSources`

***

### formatOptions?

> `optional` **formatOptions?**: `LoggerFormatOptions`

Defined in: [packages/core/src/types/ambitenConfig.ts:18](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambitenConfig.ts#L18)

#### Overrides

`LoggerConfig.formatOptions`

***

### hooks?

> `optional` **hooks?**: `LoggerHooks`

Defined in: [packages/core/src/types/ambitenConfig.ts:20](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambitenConfig.ts#L20)

#### Overrides

`LoggerConfig.hooks`

***

### json?

> `optional` **json?**: `boolean`

Defined in: [packages/core/src/types/ambitenConfig.ts:17](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambitenConfig.ts#L17)

#### Overrides

`LoggerConfig.json`

***

### level?

> `optional` **level?**: `LogLevel`

Defined in: packages/logger/dist/types/ambitenConfig.d.ts:11

#### Inherited from

`LoggerConfig.level`

***

### logger?

> `optional` **logger?**: `ILogger`

Defined in: [packages/core/src/types/ambitenConfig.ts:11](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambitenConfig.ts#L11)

#### Overrides

`LoggerConfig.logger`

***

### logLevel?

> `optional` **logLevel?**: `LogLevel`

Defined in: [packages/core/src/types/ambitenConfig.ts:12](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambitenConfig.ts#L12)

***

### shouldLog?

> `optional` **shouldLog?**: (`level`, `entry`) => `boolean`

Defined in: [packages/core/src/types/ambitenConfig.ts:23](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambitenConfig.ts#L23)

Allows advanced filtering by level, entry, tenant, source, etc.

#### Parameters

##### level

`LogLevel`

##### entry

`LogEntry`

#### Returns

`boolean`

#### Overrides

`LoggerConfig.shouldLog`

***

### transportConfigs

> **transportConfigs**: `LoggerTransportConfig`[] \| `undefined`

Defined in: [packages/core/src/types/ambitenConfig.ts:15](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambitenConfig.ts#L15)

#### Overrides

`LoggerConfig.transportConfigs`

***

### transports?

> `optional` **transports?**: (`Transporter` \| `RemoteTransporter`)[]

Defined in: [packages/core/src/types/ambitenConfig.ts:16](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambitenConfig.ts#L16)

#### Overrides

`LoggerConfig.transports`

***

### useColor?

> `optional` **useColor?**: `boolean`

Defined in: [packages/core/src/types/ambitenConfig.ts:13](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/types/ambitenConfig.ts#L13)
