[**ambiten**](../../../README.md)

***

[ambiten](../../../README.md) / [core/src](../README.md) / ManualTransactionSession

# Interface: ManualTransactionSession

Defined in: [packages/core/src/context/helpers/transactionSession.ts:3](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/context/helpers/transactionSession.ts#L3)

## Extends

- `ClientSession`

## Properties

### clientOptions

> **clientOptions**: `MongoOptions`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:2356

#### Inherited from

`ClientSession.clientOptions`

***

### clusterTime?

> `optional` **clusterTime?**: `ClusterTime`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:2360

#### Inherited from

`ClientSession.clusterTime`

***

### defaultTransactionOptions

> **defaultTransactionOptions**: `TransactionOptions`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:2364

#### Inherited from

`ClientSession.defaultTransactionOptions`

***

### explicit

> **explicit**: `boolean`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:2362

#### Inherited from

`ClientSession.explicit`

***

### hasEnded

> **hasEnded**: `boolean`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:2355

#### Inherited from

`ClientSession.hasEnded`

***

### operationTime?

> `optional` **operationTime?**: `Timestamp`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:2361

#### Inherited from

`ClientSession.operationTime`

***

### snapshotEnabled

> `readonly` **snapshotEnabled**: `boolean`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:2368

#### Inherited from

`ClientSession.snapshotEnabled`

***

### supports

> **supports**: `object`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:2357

#### causalConsistency

> **causalConsistency**: `boolean`

#### Inherited from

`ClientSession.supports`

***

### timeoutMS?

> `optional` **timeoutMS?**: `number`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:2377

**`Experimental`**

Specifies the time an operation in a given `ClientSession` will run until it throws a timeout error

#### Inherited from

`ClientSession.timeoutMS`

***

### ~~transaction~~

> **transaction**: `Transaction`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:2366

#### Deprecated

- Will be made internal in the next major release

#### Inherited from

`ClientSession.transaction`

## Accessors

### id

#### Get Signature

> **get** **id**(): `ServerSessionId` \| `undefined`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:2381

The server id associated with this session

##### Returns

`ServerSessionId` \| `undefined`

#### Inherited from

`ClientSession.id`

***

### isPinned

#### Get Signature

> **get** **isPinned**(): `boolean`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:2386

##### Returns

`boolean`

#### Inherited from

`ClientSession.isPinned`

***

### loadBalanced

#### Get Signature

> **get** **loadBalanced**(): `boolean`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:2383

##### Returns

`boolean`

#### Inherited from

`ClientSession.loadBalanced`

***

### serverSession

#### Get Signature

> **get** **serverSession**(): `ServerSession`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:2382

##### Returns

`ServerSession`

#### Inherited from

`ClientSession.serverSession`

## Methods

### \[captureRejectionSymbol\]()?

> `optional` **\[captureRejectionSymbol\]**\<`K`\>(`error`, `event`, ...`args`): `void`

Defined in: node\_modules/.pnpm/@types+node@22.19.19/node\_modules/@types/node/events.d.ts:103

#### Type Parameters

##### K

`K`

#### Parameters

##### error

`Error`

##### event

`string` \| `symbol`

##### args

...`AnyRest`

#### Returns

`void`

#### Inherited from

`ClientSession.[captureRejectionSymbol]`

***

### abortTransaction()

> **abortTransaction**(): `Promise`\<`void`\>

Defined in: [packages/core/src/context/helpers/transactionSession.ts:6](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/context/helpers/transactionSession.ts#L6)

Aborts the currently active transaction in this session.

#### Returns

`Promise`\<`void`\>

#### Overrides

`ClientSession.abortTransaction`

***

### addListener()

#### Call Signature

> **addListener**\<`EventKey`\>(`event`, `listener`): `this`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:8775

Alias for `emitter.on(eventName, listener)`.

##### Type Parameters

###### EventKey

`EventKey` *extends* `"ended"`

##### Parameters

###### event

`EventKey`

###### listener

`ClientSessionEvents`\[`EventKey`\]

##### Returns

`this`

##### Since

v0.1.26

##### Inherited from

`ClientSession.addListener`

#### Call Signature

> **addListener**(`event`, `listener`): `this`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:8776

Alias for `emitter.on(eventName, listener)`.

##### Parameters

###### event

`CommonEvents`

###### listener

(`eventName`, `listener`) => `void`

##### Returns

`this`

##### Since

v0.1.26

##### Inherited from

`ClientSession.addListener`

#### Call Signature

> **addListener**(`event`, `listener`): `this`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:8777

Alias for `emitter.on(eventName, listener)`.

##### Parameters

###### event

`string` \| `symbol`

###### listener

`GenericListener`

##### Returns

`this`

##### Since

v0.1.26

##### Inherited from

`ClientSession.addListener`

***

### advanceClusterTime()

> **advanceClusterTime**(`clusterTime`): `void`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:2409

Advances the clusterTime for a ClientSession to the provided clusterTime of another ClientSession

#### Parameters

##### clusterTime

`ClusterTime`

the $clusterTime returned by the server from another session in the form of a document containing the `BSON.Timestamp` clusterTime and signature

#### Returns

`void`

#### Inherited from

`ClientSession.advanceClusterTime`

***

### advanceOperationTime()

> **advanceOperationTime**(`operationTime`): `void`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:2403

Advances the operationTime for a ClientSession.

#### Parameters

##### operationTime

`Timestamp`

the `BSON.Timestamp` of the operation type it is desired to advance to

#### Returns

`void`

#### Inherited from

`ClientSession.advanceOperationTime`

***

### commitTransaction()

> **commitTransaction**(): `Promise`\<`void`\>

Defined in: [packages/core/src/context/helpers/transactionSession.ts:5](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/context/helpers/transactionSession.ts#L5)

Commits the currently active transaction in this session.

#### Returns

`Promise`\<`void`\>

#### Overrides

`ClientSession.commitTransaction`

***

### emit()

> **emit**\<`EventKey`\>(`event`, ...`args`): `boolean`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:8793

Synchronously calls each of the listeners registered for the event named `eventName`, in the order they were registered, passing the supplied arguments
to each.

Returns `true` if the event had listeners, `false` otherwise.

```js
import { EventEmitter } from 'node:events';
const myEmitter = new EventEmitter();

// First listener
myEmitter.on('event', function firstListener() {
  console.log('Helloooo! first listener');
});
// Second listener
myEmitter.on('event', function secondListener(arg1, arg2) {
  console.log(`event with parameters ${arg1}, ${arg2} in second listener`);
});
// Third listener
myEmitter.on('event', function thirdListener(...args) {
  const parameters = args.join(', ');
  console.log(`event with parameters ${parameters} in third listener`);
});

console.log(myEmitter.listeners('event'));

myEmitter.emit('event', 1, 2, 3, 4, 5);

// Prints:
// [
//   [Function: firstListener],
//   [Function: secondListener],
//   [Function: thirdListener]
// ]
// Helloooo! first listener
// event with parameters 1, 2 in second listener
// event with parameters 1, 2, 3, 4, 5 in third listener
```

#### Type Parameters

##### EventKey

`EventKey` *extends* `"ended"`

#### Parameters

##### event

`symbol` \| `EventKey`

##### args

...`Parameters`\<`ClientSessionEvents`\[`EventKey`\]\>

#### Returns

`boolean`

#### Since

v0.1.26

#### Inherited from

`ClientSession.emit`

***

### endSession()

> **endSession**(): `Promise`\<`void`\>

Defined in: [packages/core/src/context/helpers/transactionSession.ts:7](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/context/helpers/transactionSession.ts#L7)

Frees any client-side resources held by the current session.  If a session is in a transaction,
the transaction is aborted.

Does not end the session on the server.

#### Returns

`Promise`\<`void`\>

#### Overrides

`ClientSession.endSession`

***

### equals()

> **equals**(`session`): `boolean`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:2415

Used to determine if this session equals another

#### Parameters

##### session

`ClientSession`

The session to compare to

#### Returns

`boolean`

#### Inherited from

`ClientSession.equals`

***

### eventNames()

> **eventNames**(): `string`[]

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:8801

Returns an array listing the events for which the emitter has registered
listeners. The values in the array are strings or `Symbol`s.

```js
import { EventEmitter } from 'node:events';

const myEE = new EventEmitter();
myEE.on('foo', () => {});
myEE.on('bar', () => {});

const sym = Symbol('symbol');
myEE.on(sym, () => {});

console.log(myEE.eventNames());
// Prints: [ 'foo', 'bar', Symbol(symbol) ]
```

#### Returns

`string`[]

#### Since

v6.0.0

#### Inherited from

`ClientSession.eventNames`

***

### getMaxListeners()

> **getMaxListeners**(): `number`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:8802

Returns the current max listener value for the `EventEmitter` which is either
set by `emitter.setMaxListeners(n)` or defaults to EventEmitter.defaultMaxListeners.

#### Returns

`number`

#### Since

v1.0.0

#### Inherited from

`ClientSession.getMaxListeners`

***

### incrementTransactionNumber()

> **incrementTransactionNumber**(): `void`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:2424

Increment the transaction number on the internal ServerSession

#### Returns

`void`

#### Inherited from

`ClientSession.incrementTransactionNumber`

***

### inTransaction()

> **inTransaction**(): `boolean`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:2426

#### Returns

`boolean`

whether this session is currently in a transaction or not

#### Inherited from

`ClientSession.inTransaction`

***

### listenerCount()

> **listenerCount**\<`EventKey`\>(`type`): `number`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:8794

Returns the number of listeners listening for the event named `eventName`.
If `listener` is provided, it will return how many times the listener is found
in the list of the listeners of the event.

#### Type Parameters

##### EventKey

`EventKey` *extends* `"ended"`

#### Parameters

##### type

`string` \| `symbol` \| `EventKey`

#### Returns

`number`

#### Since

v3.2.0

#### Inherited from

`ClientSession.listenerCount`

***

### listeners()

> **listeners**\<`EventKey`\>(`event`): `ClientSessionEvents`\[`EventKey`\][]

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:8791

Returns a copy of the array of listeners for the event named `eventName`.

```js
server.on('connection', (stream) => {
  console.log('someone connected!');
});
console.log(util.inspect(server.listeners('connection')));
// Prints: [ [Function] ]
```

#### Type Parameters

##### EventKey

`EventKey` *extends* `"ended"`

#### Parameters

##### event

`string` \| `symbol` \| `EventKey`

#### Returns

`ClientSessionEvents`\[`EventKey`\][]

#### Since

v0.1.26

#### Inherited from

`ClientSession.listeners`

***

### off()

#### Call Signature

> **off**\<`EventKey`\>(`event`, `listener`): `this`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:8787

Alias for `emitter.removeListener()`.

##### Type Parameters

###### EventKey

`EventKey` *extends* `"ended"`

##### Parameters

###### event

`EventKey`

###### listener

`ClientSessionEvents`\[`EventKey`\]

##### Returns

`this`

##### Since

v10.0.0

##### Inherited from

`ClientSession.off`

#### Call Signature

> **off**(`event`, `listener`): `this`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:8788

Alias for `emitter.removeListener()`.

##### Parameters

###### event

`CommonEvents`

###### listener

(`eventName`, `listener`) => `void`

##### Returns

`this`

##### Since

v10.0.0

##### Inherited from

`ClientSession.off`

#### Call Signature

> **off**(`event`, `listener`): `this`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:8789

Alias for `emitter.removeListener()`.

##### Parameters

###### event

`string` \| `symbol`

###### listener

`GenericListener`

##### Returns

`this`

##### Since

v10.0.0

##### Inherited from

`ClientSession.off`

***

### on()

#### Call Signature

> **on**\<`EventKey`\>(`event`, `listener`): `this`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:8778

Adds the `listener` function to the end of the listeners array for the event
named `eventName`. No checks are made to see if the `listener` has already
been added. Multiple calls passing the same combination of `eventName` and
`listener` will result in the `listener` being added, and called, multiple times.

```js
server.on('connection', (stream) => {
  console.log('someone connected!');
});
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

By default, event listeners are invoked in the order they are added. The `emitter.prependListener()` method can be used as an alternative to add the
event listener to the beginning of the listeners array.

```js
import { EventEmitter } from 'node:events';
const myEE = new EventEmitter();
myEE.on('foo', () => console.log('a'));
myEE.prependListener('foo', () => console.log('b'));
myEE.emit('foo');
// Prints:
//   b
//   a
```

##### Type Parameters

###### EventKey

`EventKey` *extends* `"ended"`

##### Parameters

###### event

`EventKey`

###### listener

`ClientSessionEvents`\[`EventKey`\]

The callback function

##### Returns

`this`

##### Since

v0.1.101

##### Inherited from

`ClientSession.on`

#### Call Signature

> **on**(`event`, `listener`): `this`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:8779

Adds the `listener` function to the end of the listeners array for the event
named `eventName`. No checks are made to see if the `listener` has already
been added. Multiple calls passing the same combination of `eventName` and
`listener` will result in the `listener` being added, and called, multiple times.

```js
server.on('connection', (stream) => {
  console.log('someone connected!');
});
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

By default, event listeners are invoked in the order they are added. The `emitter.prependListener()` method can be used as an alternative to add the
event listener to the beginning of the listeners array.

```js
import { EventEmitter } from 'node:events';
const myEE = new EventEmitter();
myEE.on('foo', () => console.log('a'));
myEE.prependListener('foo', () => console.log('b'));
myEE.emit('foo');
// Prints:
//   b
//   a
```

##### Parameters

###### event

`CommonEvents`

###### listener

(`eventName`, `listener`) => `void`

The callback function

##### Returns

`this`

##### Since

v0.1.101

##### Inherited from

`ClientSession.on`

#### Call Signature

> **on**(`event`, `listener`): `this`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:8780

Adds the `listener` function to the end of the listeners array for the event
named `eventName`. No checks are made to see if the `listener` has already
been added. Multiple calls passing the same combination of `eventName` and
`listener` will result in the `listener` being added, and called, multiple times.

```js
server.on('connection', (stream) => {
  console.log('someone connected!');
});
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

By default, event listeners are invoked in the order they are added. The `emitter.prependListener()` method can be used as an alternative to add the
event listener to the beginning of the listeners array.

```js
import { EventEmitter } from 'node:events';
const myEE = new EventEmitter();
myEE.on('foo', () => console.log('a'));
myEE.prependListener('foo', () => console.log('b'));
myEE.emit('foo');
// Prints:
//   b
//   a
```

##### Parameters

###### event

`string` \| `symbol`

###### listener

`GenericListener`

The callback function

##### Returns

`this`

##### Since

v0.1.101

##### Inherited from

`ClientSession.on`

***

### once()

#### Call Signature

> **once**\<`EventKey`\>(`event`, `listener`): `this`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:8781

Adds a **one-time** `listener` function for the event named `eventName`. The
next time `eventName` is triggered, this listener is removed and then invoked.

```js
server.once('connection', (stream) => {
  console.log('Ah, we have our first user!');
});
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

By default, event listeners are invoked in the order they are added. The `emitter.prependOnceListener()` method can be used as an alternative to add the
event listener to the beginning of the listeners array.

```js
import { EventEmitter } from 'node:events';
const myEE = new EventEmitter();
myEE.once('foo', () => console.log('a'));
myEE.prependOnceListener('foo', () => console.log('b'));
myEE.emit('foo');
// Prints:
//   b
//   a
```

##### Type Parameters

###### EventKey

`EventKey` *extends* `"ended"`

##### Parameters

###### event

`EventKey`

###### listener

`ClientSessionEvents`\[`EventKey`\]

The callback function

##### Returns

`this`

##### Since

v0.3.0

##### Inherited from

`ClientSession.once`

#### Call Signature

> **once**(`event`, `listener`): `this`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:8782

Adds a **one-time** `listener` function for the event named `eventName`. The
next time `eventName` is triggered, this listener is removed and then invoked.

```js
server.once('connection', (stream) => {
  console.log('Ah, we have our first user!');
});
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

By default, event listeners are invoked in the order they are added. The `emitter.prependOnceListener()` method can be used as an alternative to add the
event listener to the beginning of the listeners array.

```js
import { EventEmitter } from 'node:events';
const myEE = new EventEmitter();
myEE.once('foo', () => console.log('a'));
myEE.prependOnceListener('foo', () => console.log('b'));
myEE.emit('foo');
// Prints:
//   b
//   a
```

##### Parameters

###### event

`CommonEvents`

###### listener

(`eventName`, `listener`) => `void`

The callback function

##### Returns

`this`

##### Since

v0.3.0

##### Inherited from

`ClientSession.once`

#### Call Signature

> **once**(`event`, `listener`): `this`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:8783

Adds a **one-time** `listener` function for the event named `eventName`. The
next time `eventName` is triggered, this listener is removed and then invoked.

```js
server.once('connection', (stream) => {
  console.log('Ah, we have our first user!');
});
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

By default, event listeners are invoked in the order they are added. The `emitter.prependOnceListener()` method can be used as an alternative to add the
event listener to the beginning of the listeners array.

```js
import { EventEmitter } from 'node:events';
const myEE = new EventEmitter();
myEE.once('foo', () => console.log('a'));
myEE.prependOnceListener('foo', () => console.log('b'));
myEE.emit('foo');
// Prints:
//   b
//   a
```

##### Parameters

###### event

`string` \| `symbol`

###### listener

`GenericListener`

The callback function

##### Returns

`this`

##### Since

v0.3.0

##### Inherited from

`ClientSession.once`

***

### prependListener()

#### Call Signature

> **prependListener**\<`EventKey`\>(`event`, `listener`): `this`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:8795

Adds the `listener` function to the _beginning_ of the listeners array for the
event named `eventName`. No checks are made to see if the `listener` has
already been added. Multiple calls passing the same combination of `eventName`
and `listener` will result in the `listener` being added, and called, multiple times.

```js
server.prependListener('connection', (stream) => {
  console.log('someone connected!');
});
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

##### Type Parameters

###### EventKey

`EventKey` *extends* `"ended"`

##### Parameters

###### event

`EventKey`

###### listener

`ClientSessionEvents`\[`EventKey`\]

The callback function

##### Returns

`this`

##### Since

v6.0.0

##### Inherited from

`ClientSession.prependListener`

#### Call Signature

> **prependListener**(`event`, `listener`): `this`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:8796

Adds the `listener` function to the _beginning_ of the listeners array for the
event named `eventName`. No checks are made to see if the `listener` has
already been added. Multiple calls passing the same combination of `eventName`
and `listener` will result in the `listener` being added, and called, multiple times.

```js
server.prependListener('connection', (stream) => {
  console.log('someone connected!');
});
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

##### Parameters

###### event

`CommonEvents`

###### listener

(`eventName`, `listener`) => `void`

The callback function

##### Returns

`this`

##### Since

v6.0.0

##### Inherited from

`ClientSession.prependListener`

#### Call Signature

> **prependListener**(`event`, `listener`): `this`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:8797

Adds the `listener` function to the _beginning_ of the listeners array for the
event named `eventName`. No checks are made to see if the `listener` has
already been added. Multiple calls passing the same combination of `eventName`
and `listener` will result in the `listener` being added, and called, multiple times.

```js
server.prependListener('connection', (stream) => {
  console.log('someone connected!');
});
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

##### Parameters

###### event

`string` \| `symbol`

###### listener

`GenericListener`

The callback function

##### Returns

`this`

##### Since

v6.0.0

##### Inherited from

`ClientSession.prependListener`

***

### prependOnceListener()

#### Call Signature

> **prependOnceListener**\<`EventKey`\>(`event`, `listener`): `this`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:8798

Adds a **one-time**`listener` function for the event named `eventName` to the _beginning_ of the listeners array. The next time `eventName` is triggered, this
listener is removed, and then invoked.

```js
server.prependOnceListener('connection', (stream) => {
  console.log('Ah, we have our first user!');
});
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

##### Type Parameters

###### EventKey

`EventKey` *extends* `"ended"`

##### Parameters

###### event

`EventKey`

###### listener

`ClientSessionEvents`\[`EventKey`\]

The callback function

##### Returns

`this`

##### Since

v6.0.0

##### Inherited from

`ClientSession.prependOnceListener`

#### Call Signature

> **prependOnceListener**(`event`, `listener`): `this`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:8799

Adds a **one-time**`listener` function for the event named `eventName` to the _beginning_ of the listeners array. The next time `eventName` is triggered, this
listener is removed, and then invoked.

```js
server.prependOnceListener('connection', (stream) => {
  console.log('Ah, we have our first user!');
});
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

##### Parameters

###### event

`CommonEvents`

###### listener

(`eventName`, `listener`) => `void`

The callback function

##### Returns

`this`

##### Since

v6.0.0

##### Inherited from

`ClientSession.prependOnceListener`

#### Call Signature

> **prependOnceListener**(`event`, `listener`): `this`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:8800

Adds a **one-time**`listener` function for the event named `eventName` to the _beginning_ of the listeners array. The next time `eventName` is triggered, this
listener is removed, and then invoked.

```js
server.prependOnceListener('connection', (stream) => {
  console.log('Ah, we have our first user!');
});
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

##### Parameters

###### event

`string` \| `symbol`

###### listener

`GenericListener`

The callback function

##### Returns

`this`

##### Since

v6.0.0

##### Inherited from

`ClientSession.prependOnceListener`

***

### rawListeners()

> **rawListeners**\<`EventKey`\>(`event`): `ClientSessionEvents`\[`EventKey`\][]

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:8792

Returns a copy of the array of listeners for the event named `eventName`,
including any wrappers (such as those created by `.once()`).

```js
import { EventEmitter } from 'node:events';
const emitter = new EventEmitter();
emitter.once('log', () => console.log('log once'));

// Returns a new Array with a function `onceWrapper` which has a property
// `listener` which contains the original listener bound above
const listeners = emitter.rawListeners('log');
const logFnWrapper = listeners[0];

// Logs "log once" to the console and does not unbind the `once` event
logFnWrapper.listener();

// Logs "log once" to the console and removes the listener
logFnWrapper();

emitter.on('log', () => console.log('log persistently'));
// Will return a new Array with a single function bound by `.on()` above
const newListeners = emitter.rawListeners('log');

// Logs "log persistently" twice
newListeners[0]();
emitter.emit('log');
```

#### Type Parameters

##### EventKey

`EventKey` *extends* `"ended"`

#### Parameters

##### event

`string` \| `symbol` \| `EventKey`

#### Returns

`ClientSessionEvents`\[`EventKey`\][]

#### Since

v9.4.0

#### Inherited from

`ClientSession.rawListeners`

***

### removeAllListeners()

> **removeAllListeners**\<`EventKey`\>(`event?`): `this`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:8790

Removes all listeners, or those of the specified `eventName`.

It is bad practice to remove listeners added elsewhere in the code,
particularly when the `EventEmitter` instance was created by some other
component or module (e.g. sockets or file streams).

Returns a reference to the `EventEmitter`, so that calls can be chained.

#### Type Parameters

##### EventKey

`EventKey` *extends* `"ended"`

#### Parameters

##### event?

`string` \| `symbol` \| `EventKey`

#### Returns

`this`

#### Since

v0.1.26

#### Inherited from

`ClientSession.removeAllListeners`

***

### removeListener()

#### Call Signature

> **removeListener**\<`EventKey`\>(`event`, `listener`): `this`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:8784

Removes the specified `listener` from the listener array for the event named `eventName`.

```js
const callback = (stream) => {
  console.log('someone connected!');
};
server.on('connection', callback);
// ...
server.removeListener('connection', callback);
```

`removeListener()` will remove, at most, one instance of a listener from the
listener array. If any single listener has been added multiple times to the
listener array for the specified `eventName`, then `removeListener()` must be
called multiple times to remove each instance.

Once an event is emitted, all listeners attached to it at the
time of emitting are called in order. This implies that any `removeListener()` or `removeAllListeners()` calls _after_ emitting and _before_ the last listener finishes execution
will not remove them from`emit()` in progress. Subsequent events behave as expected.

```js
import { EventEmitter } from 'node:events';
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

const callbackA = () => {
  console.log('A');
  myEmitter.removeListener('event', callbackB);
};

const callbackB = () => {
  console.log('B');
};

myEmitter.on('event', callbackA);

myEmitter.on('event', callbackB);

// callbackA removes listener callbackB but it will still be called.
// Internal listener array at time of emit [callbackA, callbackB]
myEmitter.emit('event');
// Prints:
//   A
//   B

// callbackB is now removed.
// Internal listener array [callbackA]
myEmitter.emit('event');
// Prints:
//   A
```

Because listeners are managed using an internal array, calling this will
change the position indices of any listener registered _after_ the listener
being removed. This will not impact the order in which listeners are called,
but it means that any copies of the listener array as returned by
the `emitter.listeners()` method will need to be recreated.

When a single function has been added as a handler multiple times for a single
event (as in the example below), `removeListener()` will remove the most
recently added instance. In the example the `once('ping')` listener is removed:

```js
import { EventEmitter } from 'node:events';
const ee = new EventEmitter();

function pong() {
  console.log('pong');
}

ee.on('ping', pong);
ee.once('ping', pong);
ee.removeListener('ping', pong);

ee.emit('ping');
ee.emit('ping');
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

##### Type Parameters

###### EventKey

`EventKey` *extends* `"ended"`

##### Parameters

###### event

`EventKey`

###### listener

`ClientSessionEvents`\[`EventKey`\]

##### Returns

`this`

##### Since

v0.1.26

##### Inherited from

`ClientSession.removeListener`

#### Call Signature

> **removeListener**(`event`, `listener`): `this`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:8785

Removes the specified `listener` from the listener array for the event named `eventName`.

```js
const callback = (stream) => {
  console.log('someone connected!');
};
server.on('connection', callback);
// ...
server.removeListener('connection', callback);
```

`removeListener()` will remove, at most, one instance of a listener from the
listener array. If any single listener has been added multiple times to the
listener array for the specified `eventName`, then `removeListener()` must be
called multiple times to remove each instance.

Once an event is emitted, all listeners attached to it at the
time of emitting are called in order. This implies that any `removeListener()` or `removeAllListeners()` calls _after_ emitting and _before_ the last listener finishes execution
will not remove them from`emit()` in progress. Subsequent events behave as expected.

```js
import { EventEmitter } from 'node:events';
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

const callbackA = () => {
  console.log('A');
  myEmitter.removeListener('event', callbackB);
};

const callbackB = () => {
  console.log('B');
};

myEmitter.on('event', callbackA);

myEmitter.on('event', callbackB);

// callbackA removes listener callbackB but it will still be called.
// Internal listener array at time of emit [callbackA, callbackB]
myEmitter.emit('event');
// Prints:
//   A
//   B

// callbackB is now removed.
// Internal listener array [callbackA]
myEmitter.emit('event');
// Prints:
//   A
```

Because listeners are managed using an internal array, calling this will
change the position indices of any listener registered _after_ the listener
being removed. This will not impact the order in which listeners are called,
but it means that any copies of the listener array as returned by
the `emitter.listeners()` method will need to be recreated.

When a single function has been added as a handler multiple times for a single
event (as in the example below), `removeListener()` will remove the most
recently added instance. In the example the `once('ping')` listener is removed:

```js
import { EventEmitter } from 'node:events';
const ee = new EventEmitter();

function pong() {
  console.log('pong');
}

ee.on('ping', pong);
ee.once('ping', pong);
ee.removeListener('ping', pong);

ee.emit('ping');
ee.emit('ping');
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

##### Parameters

###### event

`CommonEvents`

###### listener

(`eventName`, `listener`) => `void`

##### Returns

`this`

##### Since

v0.1.26

##### Inherited from

`ClientSession.removeListener`

#### Call Signature

> **removeListener**(`event`, `listener`): `this`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:8786

Removes the specified `listener` from the listener array for the event named `eventName`.

```js
const callback = (stream) => {
  console.log('someone connected!');
};
server.on('connection', callback);
// ...
server.removeListener('connection', callback);
```

`removeListener()` will remove, at most, one instance of a listener from the
listener array. If any single listener has been added multiple times to the
listener array for the specified `eventName`, then `removeListener()` must be
called multiple times to remove each instance.

Once an event is emitted, all listeners attached to it at the
time of emitting are called in order. This implies that any `removeListener()` or `removeAllListeners()` calls _after_ emitting and _before_ the last listener finishes execution
will not remove them from`emit()` in progress. Subsequent events behave as expected.

```js
import { EventEmitter } from 'node:events';
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

const callbackA = () => {
  console.log('A');
  myEmitter.removeListener('event', callbackB);
};

const callbackB = () => {
  console.log('B');
};

myEmitter.on('event', callbackA);

myEmitter.on('event', callbackB);

// callbackA removes listener callbackB but it will still be called.
// Internal listener array at time of emit [callbackA, callbackB]
myEmitter.emit('event');
// Prints:
//   A
//   B

// callbackB is now removed.
// Internal listener array [callbackA]
myEmitter.emit('event');
// Prints:
//   A
```

Because listeners are managed using an internal array, calling this will
change the position indices of any listener registered _after_ the listener
being removed. This will not impact the order in which listeners are called,
but it means that any copies of the listener array as returned by
the `emitter.listeners()` method will need to be recreated.

When a single function has been added as a handler multiple times for a single
event (as in the example below), `removeListener()` will remove the most
recently added instance. In the example the `once('ping')` listener is removed:

```js
import { EventEmitter } from 'node:events';
const ee = new EventEmitter();

function pong() {
  console.log('pong');
}

ee.on('ping', pong);
ee.once('ping', pong);
ee.removeListener('ping', pong);

ee.emit('ping');
ee.emit('ping');
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

##### Parameters

###### event

`string` \| `symbol`

###### listener

`GenericListener`

##### Returns

`this`

##### Since

v0.1.26

##### Inherited from

`ClientSession.removeListener`

***

### setMaxListeners()

> **setMaxListeners**(`n`): `this`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:8803

By default `EventEmitter`s will print a warning if more than `10` listeners are
added for a particular event. This is a useful default that helps finding
memory leaks. The `emitter.setMaxListeners()` method allows the limit to be
modified for this specific `EventEmitter` instance. The value can be set to `Infinity` (or `0`) to indicate an unlimited number of listeners.

Returns a reference to the `EventEmitter`, so that calls can be chained.

#### Parameters

##### n

`number`

#### Returns

`this`

#### Since

v0.3.5

#### Inherited from

`ClientSession.setMaxListeners`

***

### startTransaction()

> **startTransaction**(): `void`

Defined in: [packages/core/src/context/helpers/transactionSession.ts:4](https://github.com/AmbitenHQ/ambiten/blob/cc0e7b03036ce0e549488b37d6b1276a65498bee/packages/core/src/context/helpers/transactionSession.ts#L4)

Starts a new transaction with the given options.

#### Returns

`void`

#### Remarks

**IMPORTANT**: Running operations in parallel is not supported during a transaction. The use of `Promise.all`,
`Promise.allSettled`, `Promise.race`, etc to parallelize operations inside a transaction is
undefined behaviour.

#### Overrides

`ClientSession.startTransaction`

***

### toBSON()

> **toBSON**(): `never`

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:2458

This is here to ensure that ClientSession is never serialized to BSON.

#### Returns

`never`

#### Inherited from

`ClientSession.toBSON`

***

### withTransaction()

> **withTransaction**\<`T`\>(`fn`, `options?`): `Promise`\<`T`\>

Defined in: node\_modules/.pnpm/mongodb@6.21.0/node\_modules/mongodb/mongodb.d.ts:2494

Starts a transaction and runs a provided function, ensuring the commitTransaction is always attempted when all operations run in the function have completed.

**IMPORTANT:** This method requires the function passed in to return a Promise. That promise must be made by `await`-ing all operations in such a way that rejections are propagated to the returned promise.

**IMPORTANT:** Running operations in parallel is not supported during a transaction. The use of `Promise.all`,
`Promise.allSettled`, `Promise.race`, etc to parallelize operations inside a transaction is
undefined behaviour.

**IMPORTANT:** When running an operation inside a `withTransaction` callback, if it is not
provided the explicit session in its options, it will not be part of the transaction and it will not respect timeoutMS.

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### fn

`WithTransactionCallback`\<`T`\>

callback to run within a transaction

##### options?

`TransactionOptions` & `object`

optional settings for the transaction

#### Returns

`Promise`\<`T`\>

A raw command response or undefined

#### Remarks

- If all operations successfully complete and the `commitTransaction` operation is successful, then the provided function will return the result of the provided function.
- If the transaction is unable to complete or an error is thrown from within the provided function, then the provided function will throw an error.
  - If the transaction is manually aborted within the provided function it will not throw.
- If the driver needs to attempt to retry the operations, the provided function may be called multiple times.

Checkout a descriptive example here:

#### See

https://www.mongodb.com/blog/post/quick-start-nodejs--mongodb--how-to-implement-transactions

If a command inside withTransaction fails:
- It may cause the transaction on the server to be aborted.
- This situation is normally handled transparently by the driver.
- However, if the application catches such an error and does not rethrow it, the driver will not be able to determine whether the transaction was aborted or not.
- The driver will then retry the transaction indefinitely.

To avoid this situation, the application must not silently handle errors within the provided function.
If the application needs to handle errors within, it must await all operations such that if an operation is rejected it becomes the rejection of the callback function passed into withTransaction.

#### Inherited from

`ClientSession.withTransaction`
