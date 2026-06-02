import { setupLogger, LogLevel } from "@ambiten/logger";
import { EventType, ILogger } from "../types";

/**
 * Mapping from event type to option key.
 */
const eventOptionMap: Record<EventType, string> = {
	"pre-save": "save",
	"post-save": "save",
	"pre-update": "update",
	"post-update": "update",
	"pre-delete": "delete",
	"post-delete": "delete",
	"aggregate": "aggregate",
	"disconnect": "disconnect",
	"connect": "connect",
	"dropDatabase": "dropDatabase",
	"createIndex": "index",
	"dropIndex": "index",
	"create": "create",
	"find": "find",
	"findOne": "find",
	"insertOne": "insertOne",
	"insertMany": "insertMany",
	"updateOne": "updateOne",
	"updateMany": "updateMany",
	"deleteOne": "deleteOne",
	"deleteMany": "deleteMany",
	"pre-bulkWrite": "bulkWrite",
	"post-bulkWrite": "bulkWrite",
	"pre-insertMany": "insertMany",
	"post-insertMany": "insertMany",
	"pre-updateMany": "updateMany",
	"post-updateMany": "updateMany",
	"pre-deleteMany": "deleteMany",
	"post-deleteMany": "deleteMany",
	"transaction": "transaction"
};

/**
 * Returns the options object for the given event type.
 * @param eventType - The type of the event.
 * @returns The options for the event.
 */
export function getEventOptions(eventType: EventType): Record<string, boolean> {
	const key = eventOptionMap[eventType] || eventType;
	return { [key]: true };
}

/**
 * Returns the event type based on the options provided.
 * @param options - The options for the event.
 * @returns The event type, or null if not found.
 */
export function getEventType(options: Record<string, any>): EventType | null {
	const key = Object.keys(options).find((k) =>
		Object.values(eventOptionMap).includes(k)
	);
	if (!key) return null;
	// Find the first eventType that maps to this key
	const eventType = (Object.keys(eventOptionMap) as EventType[]).find(
		(et) => eventOptionMap[et] === key
	);
	return eventType || null;
}

/**
 * Returns a human-readable description for the given event type.
 * @param eventType - The type of the event.
 * @returns The event description.
 */
export function describeEvent(eventType: EventType): string {
	const descriptions: Partial<Record<EventType, string>> = {
		"pre-save": "Before Save",
		"post-save": "After Save",
		"pre-update": "Before Update",
		"post-update": "After Update",
		"pre-delete": "Before Delete",
		"post-delete": "After Delete",
		aggregate: "Aggregation",
		disconnect: "Disconnect",
		connect: "Connect",
		dropDatabase: "Drop Database",
		createIndex: "Create Index",
		dropIndex: "Drop Index",
		create: "Create",
		find: "Find",
		findOne: "Find One",
		insertOne: "Insert One",
		insertMany: "Insert Many",
		updateOne: "Update One",
		updateMany: "Update Many",
		deleteOne: "Delete One",
		deleteMany: "Delete Many",
	};
	return descriptions[eventType] || eventType;
};



/**
 * Logs the event action using a provided logger.
 * @param logger - The logger instance (must have a log method).
 * @param eventType - The type of the event.
 * @param message - Optional custom message.
 * @param level - Log level (default: 'info').
 * @param context - Optional context or payload to log.
 */
export function logEvent(
	logger: ILogger,
	eventType: EventType,
	message?: string,
	level: LogLevel = 'info',
	context?: any
) {
	const eventDesc = describeEvent(eventType);
	const logMsg = message
		? `[Ambiten EVENT]: ${eventDesc}: ${message}`
		: `[Ambiten] Event: ${eventDesc}`;

	const log = {
		level,
		message: logMsg,
		context
	};

	logger.info(`${log.level}${log.message} ${log.context ? JSON.stringify(log.context) : ''}`);
}

;

/**
 * Logs an event with a default logger.
 * @param eventType - The type of the event.
 * @param message - Optional custom message.
 * @param context - Optional context or payload to log.
 * @param level - Log level (default: 'info').
 */
export function logDefaultEvent(
	eventType: EventType,
	message?: string,
	level?: LogLevel,
	context?: any
) {
	const logger = setupLogger(); // Get the default logger instance
	logEvent(logger, eventType, message, level, context);
	return eventType
}

