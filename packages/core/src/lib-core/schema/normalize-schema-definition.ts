import type {
	Document,
	SchemaDefinition,
	SchemaFieldConstructor,
	SchemaFieldTypeName,
} from '../../types';

import {
	assertSchemaJsonValue,
	assertSchemaRuntimeDefault,
	hasRuntimeDirective,
} from './schema-runtime-default';

const FIELD_TYPE_ALIASES = {
	string: String,
	number: Number,
	boolean: Boolean,
	date: Date,
	array: Array,
	object: Object,
} as const satisfies Record<
	SchemaFieldTypeName,
	SchemaFieldConstructor
>;

function normalizeFieldType(
	field: string,
	type: unknown
): SchemaFieldConstructor {
	if (typeof type === 'function') {
		return type as SchemaFieldConstructor;
	}

	if (
		typeof type === 'string' &&
		Object.prototype.hasOwnProperty.call(
			FIELD_TYPE_ALIASES,
			type
		)
	) {
		return FIELD_TYPE_ALIASES[
			type as SchemaFieldTypeName
		];
	}

	throw new Error(
		`Invalid schema type for field "${field}". ` +
		'Expected a supported constructor or one of: ' +
		Object.keys(
			FIELD_TYPE_ALIASES
		).join(', ')
	);
}

function validateConfiguredDefault(
	field: string,
	value: unknown
): void {
	if (hasRuntimeDirective(value)) {
		try {
			assertSchemaRuntimeDefault(value);
		} catch (error) {
			const message =
				error instanceof Error
					? error.message
					: String(error);

			throw new Error(
				`Invalid default for schema field "${field}": ${message}`
			);
		}

		return;
	}

	try {
		assertSchemaJsonValue(value,`field "${field}" default`);
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: String(error);

		throw new Error(
			`Invalid default for schema field "${field}": ${message}`
		);
	}
}

export function normalizeSchemaDefinition<
	T extends Document
>(schemaDefinition: SchemaDefinition<T>): SchemaDefinition<T> {
	if (
		schemaDefinition === null ||
		typeof schemaDefinition !== 'object' ||
		Array.isArray(schemaDefinition)
	) {
		throw new Error(
			'Schema definition must be an object.'
		);
	}

	const normalized:	Record<string, any> = {};
	
	for (const [field, rawOptions] of Object.entries(schemaDefinition)) {
		if (
			rawOptions === null ||
			typeof rawOptions !== 'object' ||
			Array.isArray(rawOptions)
		) {
			throw new Error(
				`Schema field "${field}" must contain an options object.`
			);
		}

		const options = {...rawOptions};

		if (
			options.required !== undefined &&
			typeof options.required !== 'boolean'
		) {
			throw new Error(
				`Schema field "${field}" has an invalid "required" value.`
			);
		}

		if (options.type !== undefined) {
			options.type = normalizeFieldType(field, options.type);
		}

		if (
			Object.prototype.hasOwnProperty.call(
				options,
				'default'
			)
		) {
			if (
				options.default === undefined
			) {
				throw new Error(
					`Schema field "${field}" has an explicit undefined default.`
				);
			}

			validateConfiguredDefault(
				field,
				options.default
			);
		}

		normalized[field] = options;

	}

	return normalized as SchemaDefinition<T>;

}