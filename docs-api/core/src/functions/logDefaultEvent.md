[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / logDefaultEvent

# Function: logDefaultEvent()

> **logDefaultEvent**(`eventType`, `message?`, `level?`, `context?`): [`EventType`](../type-aliases/EventType.md)

Defined in: [packages/core/src/utils/eventOptions.ts:139](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/utils/eventOptions.ts#L139)

Logs an event with a default logger.

## Parameters

### eventType

[`EventType`](../type-aliases/EventType.md)

The type of the event.

### message?

`string`

Optional custom message.

### level?

`LogLevel`

Log level (default: 'info').

### context?

`any`

Optional context or payload to log.

## Returns

[`EventType`](../type-aliases/EventType.md)
