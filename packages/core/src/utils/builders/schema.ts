import { TenraSchema } from "../../lib-core";
import { Document, SchemaDefinition } from "../../types";

/**
 * Creates a new TenraSchema instance with the provided schema definition.
 * @param {SchemaDefinition<T> | Record<keyof T, any>} schema - The schema definition for the document.
 * @returns {TenraSchema<T>} The created TenraSchema instance.
 *
 * @template T - The type of the document.
 * @example 
 * const userSchema = createSchema({
 *   name: { type: String, required: true },
 *  age: { type: Number, required: true },
 *  email: { type: String, required: true },
 * });
 * const userModel = new TenraModel(userSchema, 'users', db);
 * 	
 * const user = await userModel.create({ name: 'John Doe', age: 30, email: 'example.com' });
 * console.log(user); // { _id: '...', name: 'John Doe', age: 30, email: 'example.com' }
 * 
 */

export const createSchema = <T extends Document>(
	schema: SchemaDefinition<T> | Record<keyof T, any>
): TenraSchema<T> => {
	return new TenraSchema<T>(schema as Record<keyof T, any>);
}