[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / configureAmbitenContext

# Function: configureAmbitenContext()

> **configureAmbitenContext**(`provider`): `void`

Defined in: [packages/core/src/utils/configureAmbitenContext.ts:15](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/utils/configureAmbitenContext.ts#L15)

Configures the Ambiten runtime context with a transaction client resolver.

The resolver is used by AmbitenContext.withTransaction to obtain the
correct MongoDB client for the current runtime scope. Tenant-specific clients
are resolved first when a tenant identifier is available; otherwise the
configured provider client factory is used.

## Parameters

### provider

[`BootstrapClient`](../interfaces/BootstrapClient.md)

Bootstrap client/provider used to resolve MongoDB clients.

## Returns

`void`
