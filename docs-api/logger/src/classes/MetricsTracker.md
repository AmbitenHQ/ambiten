[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [logger/src](../README.md) / MetricsTracker

# Class: MetricsTracker

Defined in: [packages/logger/src/utils/MetricsTracker.ts:4](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/utils/MetricsTracker.ts#L4)

## Constructors

### Constructor

> **new MetricsTracker**(`options?`): `MetricsTracker`

Defined in: [packages/logger/src/utils/MetricsTracker.ts:19](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/utils/MetricsTracker.ts#L19)

#### Parameters

##### options?

`MetricsTrackerOptions` = `{}`

#### Returns

`MetricsTracker`

## Methods

### getSnapshot()

> **getSnapshot**(): `MetricsSnapshot`

Defined in: [packages/logger/src/utils/MetricsTracker.ts:82](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/utils/MetricsTracker.ts#L82)

#### Returns

`MetricsSnapshot`

***

### isTrackingMetrics()

> **isTrackingMetrics**(): `boolean`

Defined in: [packages/logger/src/utils/MetricsTracker.ts:78](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/utils/MetricsTracker.ts#L78)

#### Returns

`boolean`

***

### start()

> **start**(`interval?`): `void`

Defined in: [packages/logger/src/utils/MetricsTracker.ts:49](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/utils/MetricsTracker.ts#L49)

#### Parameters

##### interval?

`number` = `...`

#### Returns

`void`

***

### stop()

> **stop**(): `Promise`\<`void`\>

Defined in: [packages/logger/src/utils/MetricsTracker.ts:69](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/utils/MetricsTracker.ts#L69)

#### Returns

`Promise`\<`void`\>

***

### trackDroppedLog()

> **trackDroppedLog**(`count?`): `void`

Defined in: [packages/logger/src/utils/MetricsTracker.ts:45](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/utils/MetricsTracker.ts#L45)

#### Parameters

##### count?

`number` = `1`

#### Returns

`void`

***

### trackFlush()

> **trackFlush**(`count?`): `void`

Defined in: [packages/logger/src/utils/MetricsTracker.ts:25](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/utils/MetricsTracker.ts#L25)

#### Parameters

##### count?

`number` = `1`

#### Returns

`void`

***

### trackLog()

> **trackLog**(`count?`): `void`

Defined in: [packages/logger/src/utils/MetricsTracker.ts:21](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/utils/MetricsTracker.ts#L21)

#### Parameters

##### count?

`number` = `1`

#### Returns

`void`

***

### trackRotation()

> **trackRotation**(`count?`): `void`

Defined in: [packages/logger/src/utils/MetricsTracker.ts:29](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/utils/MetricsTracker.ts#L29)

#### Parameters

##### count?

`number` = `1`

#### Returns

`void`

***

### trackSuccessfulTransportWrite()

> **trackSuccessfulTransportWrite**(`count?`): `void`

Defined in: [packages/logger/src/utils/MetricsTracker.ts:37](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/utils/MetricsTracker.ts#L37)

#### Parameters

##### count?

`number` = `1`

#### Returns

`void`

***

### trackTransportDispatch()

> **trackTransportDispatch**(`count?`): `void`

Defined in: [packages/logger/src/utils/MetricsTracker.ts:33](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/utils/MetricsTracker.ts#L33)

#### Parameters

##### count?

`number` = `1`

#### Returns

`void`

***

### trackTransportError()

> **trackTransportError**(`count?`): `void`

Defined in: [packages/logger/src/utils/MetricsTracker.ts:41](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/logger/src/utils/MetricsTracker.ts#L41)

#### Parameters

##### count?

`number` = `1`

#### Returns

`void`
