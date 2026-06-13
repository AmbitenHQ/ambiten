[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [logger/src](../README.md) / createElasticTransport

# Function: createElasticTransport()

> **createElasticTransport**(`url`, `index`, `options?`): [`RemoteTransporter`](../type-aliases/RemoteTransporter.md)

Defined in: [packages/logger/src/transports/remote-transports/elastic-search.ts:17](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/transports/remote-transports/elastic-search.ts#L17)

ElasticSearch transport with retry and circuit breaker

## Parameters

### url

`string`

### index

`string`

### options?

`ElasticTransportOptions` = `{}`

## Returns

[`RemoteTransporter`](../type-aliases/RemoteTransporter.md)
