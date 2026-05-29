import { ObjectId } from "mongodb";

/**
 * Represents the schema definition for a document.
 * @template T - The type of the document.
 */
export type SchemaDefinition<T> = {
	[key: string]: Record<keyof T, any>;
};


/**
 * MongoDB schema types.
 */
export const SchemaType = {
	Types: { ObjectId },
} as const;




/**
 * Represents a hook function for middleware.
 * @param {any} data - The data passed to the hook.
 * @returns {Promise<void>} A promise that resolves when the hook is executed.
 */
export type HookFunction = (data: any) => Promise<void>;