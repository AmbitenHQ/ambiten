import { AmbitenSchema } from "../../lib-core";
import { Document, SchemaDefinition } from "../../types";

/**
 * Creates a new AmbitenSchema instance with the provided schema definition.
 * @param {SchemaDefinition<T> | Record<keyof T, any>} schema - The schema definition for the document.
 * @returns {AmbitenSchema<T>} The created AmbitenSchema instance.
 *
 * @template T - The type of the document.
 * @example 
 * const userSchema = createSchema({
 *   name: { type: String, required: true },
 *  age: { type: Number, required: true },
 *  email: { type: String, required: true },
 * });
 * const userModel = new AmbitenModel(userSchema, 'users', db);
 * 	
 * const user = await userModel.create({ name: 'John Doe', age: 30, email: 'example.com' });
 * console.log(user); // { _id: '...', name: 'John Doe', age: 30, email: 'example.com' }
 * 
 */

export const createSchema = <T extends Document>(
	schema: SchemaDefinition<T> | Record<keyof T, any>
): AmbitenSchema<T> => {
	return new AmbitenSchema<T>(schema as Record<keyof T, any>);
}