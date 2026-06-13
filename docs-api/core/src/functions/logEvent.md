[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / logEvent

# Function: logEvent()

> **logEvent**(`logger`, `eventType`, `message?`, `level?`, `context?`): `void`

Defined in: [packages/core/src/utils/eventOptions.ts:109](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/utils/eventOptions.ts#L109)

Logs the event action using a provided logger.

## Parameters

### logger

[`ILogger`](../interfaces/ILogger.md)

The logger instance (must have a log method).

### eventType

[`EventType`](../type-aliases/EventType.md)

The type of the event.

### message?

`string`

Optional custom message.

### level?

`LogLevel` = `'info'`

Log level (default: 'info').

### context?

`any`

Optional context or payload to log.

## Returns

`void`
