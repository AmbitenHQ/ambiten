/**
 * Represents the types of events supported by TENRA.
 */
export type EventType =
	| 'pre-save'
	| 'post-save'
	| 'pre-update'
	| 'post-update'
	| 'pre-delete'
	| 'post-delete'
	| 'aggregate'
	| 'disconnect'
	| 'connect'
	| 'dropDatabase'
	| 'createIndex'
	| 'dropIndex'
	| 'create'
	| 'find'
	| 'findOne'
	| 'insertOne'
	| 'insertMany'
	| 'updateOne'
	| 'updateMany'
	| 'deleteOne'
	| 'deleteMany'
	| 'pre-bulkWrite'
	| 'post-bulkWrite'
	| 'pre-insertMany'
	| 'post-insertMany'
	| 'pre-updateMany'
	| 'post-updateMany'
	| 'pre-deleteMany'
	| 'post-deleteMany'
	| 'transaction'

export const eventTypes: EventType[] = [
	'pre-save',
	'post-save',
	'pre-update',
	'post-update',
	'pre-delete',
	'post-delete',
	'aggregate',
	'disconnect',
	'connect',
	'dropDatabase',
	'createIndex',
	'dropIndex',
	'create',
	'find',
	'findOne',
	'insertOne',
	'insertMany',
	'updateOne',
	'updateMany',
	'deleteOne',
	'deleteMany',
	'transaction'
];
