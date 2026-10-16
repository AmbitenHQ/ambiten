import { randomUUID } from 'node:crypto';
import { AmbitenContext } from '../../context/ambitenContext';
import type {
	SchemaJsonValue,
	SchemaRuntimeContextKey,
	SchemaRuntimeDefault,
	SchemaRuntimeDefaultMap,
} from '../../types';


export const SCHEMA_RUNTIME_CONTEXT_KEYS =
	[
		'tenantId',
		'requestId',
		'dbName',
		'collectionName',
	] as const satisfies readonly SchemaRuntimeContextKey[];

type SchemaRuntimeDefaultKind = keyof SchemaRuntimeDefaultMap;
	
type RuntimeDirective<
	K extends SchemaRuntimeDefaultKind
> = Extract<SchemaRuntimeDefault, { $runtime: K; }>;

type RuntimeResolverMap = {
	[K in SchemaRuntimeDefaultKind]:
	(directive: RuntimeDirective<K>) => unknown;
};

interface AmbitenRuntimeCrypto {
	randomUUID?: () => string;
	getRandomValues?: (values: Uint8Array) => Uint8Array;
}

function getRuntimeCrypto():
	AmbitenRuntimeCrypto {
	const runtimeCrypto =
		(
			globalThis as typeof globalThis & {
				crypto?: AmbitenRuntimeCrypto;
			}
		).crypto;

	if (!runtimeCrypto) {
		throw new Error(
			'Ambiten runtime UUID generation requires a cryptographically secure runtime.'
		);
	}

	return runtimeCrypto;
}

function createRuntimeUuid(): string {
	const crypto = getRuntimeCrypto();
	/*
	 * Preferred implementation in modern Node
	 * and browsers.
	 */
	if (typeof crypto.randomUUID === 'function') {
		return crypto.randomUUID();
	}

	/*
	 * Secure compatibility path for environments
	 * that expose getRandomValues() but not
	 * randomUUID().
	 */
	if (typeof crypto.getRandomValues === 'function') {
		const bytes = crypto.getRandomValues(new Uint8Array(16));

		// RFC 4122 version 4.
		bytes[6] = (bytes[6]! & 0x0f) | 0x40;

		bytes[8] = (bytes[8]! & 0x3f) | 0x80;

		const hex = Array.from(bytes, byte => byte.toString(16).padStart(2, '0'));

		return [
			hex.slice(0, 4).join(''),
			hex.slice(4, 6).join(''),
			hex.slice(6, 8).join(''),
			hex.slice(8, 10).join(''),
			hex.slice(10, 16).join(''),
		].join('-');
	}

	throw new Error(
		'Ambiten runtime UUID generation requires crypto.randomUUID() or crypto.getRandomValues().'
	);
}

function isRecord(
	value: unknown
): value is Record<string, unknown> {
	if (
		value === null ||
		typeof value !== 'object' ||
		Array.isArray(value)
	) {
		return false;
	}

	const prototype = Object.getPrototypeOf(value);

	return (
		prototype === Object.prototype || prototype === null
	);
}

function hasOnlyKeys(
	value: Record<string, unknown>,
	allowed: readonly string[]
): boolean {
	return Object.keys(value).every(
		key => allowed.includes(key)
	);
}

function isRuntimeContextKey(
	value: unknown
): value is SchemaRuntimeContextKey {
	return (
		typeof value === 'string' &&
		(
			SCHEMA_RUNTIME_CONTEXT_KEYS as
			readonly string[]
		).includes(value)
	);
}

/**
 * Returns true when the value uses Ambiten's reserved
 * `$runtime` namespace.
 *
 * It does not imply the directive is valid.
 */
export function hasRuntimeDirective(
	value: unknown
): value is Record<string, unknown> {
	return (
		isRecord(value) &&
		Object.prototype.hasOwnProperty.call(
			value,
			'$runtime'
		)
	);
}

/**
 * Validates a runtime directive without resolving it.
 *
 * This means malformed programmatic schemas fail during
 * schema registration instead of later during a write.
 */
export function assertSchemaRuntimeDefault(
	value: unknown
): asserts value is SchemaRuntimeDefault {
	if (!isRecord(value)) {
		throw new Error(
			'Schema runtime default must be an object.'
		);
	}

	const runtime = value.$runtime;

	if (typeof runtime !== 'string') {
		throw new Error(
			'Schema runtime default requires a string "$runtime" property.'
		);
	}

	switch (runtime) {
		case 'now':
		case 'uuid': {
			if (!hasOnlyKeys(value, ['$runtime'])) {
				throw new Error(
					`Runtime default "${runtime}" does not accept additional properties.`
				);
			}

			return;
		}

		case 'context': {
			if (!hasOnlyKeys(value, ['$runtime', 'key'])) {
				throw new Error(
					'Runtime default "context" only accepts "$runtime" and "key".'
				);
			}

			if (!isRuntimeContextKey(value.key)) {
				throw new Error(
					'Runtime default "context" requires one of: ' +
					SCHEMA_RUNTIME_CONTEXT_KEYS.join(', ')
				);
			}

			return;
		}

		default:
			throw new Error(
				`Unsupported schema runtime default "${runtime}".`
			);
	}
}

function readContextValue(key: SchemaRuntimeContextKey): unknown {
	let context:
		ReturnType<typeof AmbitenContext.get>;
	try {
		context = AmbitenContext.get();
	} catch {
		throw new Error(
			`Cannot resolve schema runtime context value "${key}" because no Ambiten execution context is active.`
		);
	}

	const value = context[key];

	if (value === undefined) {
		throw new Error(
			`Schema runtime context value "${key}" is unavailable in the current execution.`
		);
	}

	return value;
}

const RUNTIME_DEFAULT_RESOLVERS = {
	now: () => new Date(),
	uuid: () => createRuntimeUuid(),
	context: (directive) => readContextValue(directive.key),
} satisfies RuntimeResolverMap;

/**
 * Resolves one declarative runtime default.
 */
export function resolveSchemaRuntimeDefault(
	directive: SchemaRuntimeDefault
): unknown {
	assertSchemaRuntimeDefault(directive);

	/*
	 * The cast is deliberately isolated at this dispatch
	 * boundary. Individual resolver entries remain
	 * strongly typed through RuntimeResolverMap.
	 */
	const resolver = RUNTIME_DEFAULT_RESOLVERS[
		directive.$runtime
	] as (value: SchemaRuntimeDefault) => unknown;

	return resolver(directive);

}

/**
 * Ensures static defaults remain JSON-safe.
 *
 * `$runtime` is reserved and therefore cannot occur in
 * an ordinary literal object.
 */
export function assertSchemaJsonValue(
	value: unknown,
	location = 'default',
	active = new WeakSet<object>()
): asserts value is SchemaJsonValue {
	if (
		value === null ||
		typeof value === 'string' ||
		typeof value === 'boolean'
	) {
		return;
	}

	if (typeof value === 'number') {
		if (!Number.isFinite(value)) {
			throw new Error(
				`Schema ${location} contains a non-finite number.`
			);
		}

		return;
	}

	if (typeof value !== 'object') {
		throw new Error(
			`Schema ${location} must contain JSON-compatible data.`
		);
	}

	if (active.has(value)) {
		throw new Error(`Circular value found in schema ${location}.`);

	}

	if (Array.isArray(value)) {
		active.add(value);

		for (let index = 0; index < value.length; index++) {
			assertSchemaJsonValue(
				value[index],
				`${location}[${index}]`,
				active
			);
		}

		active.delete(value);

		return;
	}

	if (!isRecord(value)) {
		throw new Error(
			`Schema ${location} must contain plain JSON objects.`
		);
	}

	if (
		Object.prototype.hasOwnProperty.call(
			value,
			'$runtime'
		)
	) {
		throw new Error(
			`"$runtime" is reserved for Ambiten runtime defaults at schema ${location}.`
		);
	}

	active.add(value);

	for (const [key, child] of Object.entries(value)) {
		assertSchemaJsonValue(
			child,
			`${location}.${key}`,
			active
		);
	}

	active.delete(value);
}

/**
 * Creates a fresh copy of a literal default.
 *
 * Arrays/objects must never be shared across documents.
 */
export function cloneSchemaJsonValue(
	value: SchemaJsonValue
): SchemaJsonValue {
	if (value === null || typeof value !== 'object') {
		return value;
	}

	if (Array.isArray(value)) {
		return value.map(item => cloneSchemaJsonValue(item));
	}

	return Object.fromEntries(
		Object.entries(value).map(
			([key, child]) => [
				key,
				cloneSchemaJsonValue(child),
			]
		)
	);
}