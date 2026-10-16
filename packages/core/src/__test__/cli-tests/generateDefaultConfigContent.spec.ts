import { DEFAULT_CONFIG_CONTENT } from '../../templates';
import { normalizeAmbitenConfig } from '../../config';
import { AmbitenConfig } from '../../types';
import configSchema from "../../config/ambiten.config.schema.json";
import Ajv from 'ajv';

describe('Bootstrap schema/model serialization', () => {
	it('preserves JSON-compatible schema and model configuration', () => {
		const output =
			DEFAULT_CONFIG_CONTENT({
				projectName: 'test-app',

				connection: {
					uri:
						'mongodb://localhost:27017/test-app',
				},

				schema: {
					User: {
						name: {
							type: 'string',
							required: true,
						},
					},
				},

				model: {
					collectionName: 'users',

					gcConfig: {
						ttl: 30,
						enableGC: true,
					},
				},
			});

		const parsed = JSON.parse(output);

		expect(parsed.schema).toEqual({
			User: {
				name: {
					type: 'string',
					required: true,
				},
			},
		});

		expect(parsed.model).toEqual({
			collectionName: 'users',

			gcConfig: {
				ttl: 30,
				enableGC: true,
			},
		});
	});

	it('rejects executable schema values instead of silently losing them', () => {
		expect(() =>
			DEFAULT_CONFIG_CONTENT({
				schema: {
					User: {
						name: {
							type: String,
						},
					},
				},
			})
		).toThrow(/non-JSON value/);
	});

	it('rejects runtime-only model properties', () => {
		expect(() =>
			DEFAULT_CONFIG_CONTENT({
				model: {
					collectionName: 'users',
					ctx: {} as never,
				},
			})
		).toThrow(/programmatic-only model properties/);
	});
});



describe('normalizeAmbitenConfig', () => {
	it('assigns shared runtime defaults', () => {
		const config =
			normalizeAmbitenConfig({
				connection: {
					uri: 'mongodb://localhost:27017/test',
				},

				multiTenant: {
					enabled: true,
					initOptions: {},
				},

				logger: {
					enabled: true,
				},
			});

		expect(config.configVersion).toBe('1.0.0');

		expect(config.multiTenant?.headerKey)
			.toBe('x-tenant-id');

		expect(config.multiTenant?.initOptions?.lazy)
			.toBe(false);

		// expect(config.multiTenant?)
		// 	.toBe(3);

		expect(config.logger?.enableMetrics).toEqual({
			enabled: false,
			logInterval: 60000,
		});

		expect(config.features?.useRedisCache)
			.toBe(false);

		expect(config.advanced?.gcCron)
			.toBe('0 * * * *');
	});

	it('does not overwrite explicitly configured values', () => {
		const config =
			normalizeAmbitenConfig({
				graphql: {
					enabled: false,
					playground: false,
				},

				features: {
					useRedisCache: true,
					redisUri: 'redis://localhost:6380',
				},

				advanced: {
					autoInstall: false,
					garbageCollector: {
						enabled: true,
						retentionPeriod: 7,
					},
				},
			});

		expect(config.graphql?.playground).toBe(false);

		expect(config.features?.useRedisCache)
			.toBe(true);

		expect(config.features?.redisUri)
			.toBe('redis://localhost:6380');

		expect(
			config.advanced?.garbageCollector?.retentionPeriod
		).toBe(7);
	});

	it('preserves schema and model configuration', () => {
		const schema = {
			User: {
				name: {
					type: String,
				},
			},
		};

		const model = {
			collectionName: 'users',
			gcConfig: {
				ttl: 30,
			},
		};

		const config =
			normalizeAmbitenConfig({
				schema,
				model,
			});

		expect(config.schema).toBe(schema);
		expect(config.model).toBe(model);
	});
});

describe("JSON schema/model configuration boundary", () => {
	const validate = new Ajv({ strict: false }).compile(configSchema);

	it("preserves inline definitions and model GC settings", () => {
		const options: AmbitenConfig = {
			schema: {
				username: { type: "string", required: true },
				tenantId: {
					type: "string",
					default: { $runtime: "context", key: "tenantId" },
				},
			},
			model: {
				collectionName: "users",
				gcConfig: { ttl: 30, enableGC: false },
			},
		};
		const output = JSON.parse(DEFAULT_CONFIG_CONTENT(options));
		expect(output.schema).toEqual(options.schema);
		expect(output.model).toEqual(options.model);
		expect(validate(output)).toBe(true);
	});

	it("preserves schema/model/tenant module references separately from scaffold folders", () => {
		const options: AmbitenConfig = {
			schema: { path: "./src/schemas/userSchema.ts", exportName: "userSchema" },
			model: {
				path: "./src/models/userModel.ts",
				exportName: "userModelOptions",
			},
			features: { schemas: "./src/schemas", models: "./src/models" },
			multiTenant: {
				enabled: true,
				tenantConfigResolverModule: {
					path: "./src/tenantResolver.ts",
					exportName: "resolveTenantConfig",
				},
			},
		};
		const output = JSON.parse(DEFAULT_CONFIG_CONTENT(options));
		expect(output.schema).toEqual(options.schema);
		expect(output.model).toEqual(options.model);
		expect(output.multiTenant.tenantConfigResolverModule).toEqual(
			options.multiTenant?.tenantConfigResolverModule,
		);
		expect(output.features.schemas).toBe("./src/schemas");
		expect(output.features.models).toBe("./src/models");
		expect(validate(output)).toBe(true);
	});

	it("rejects executable field values with their location and module guidance", () => {
		expect(() =>
			DEFAULT_CONFIG_CONTENT({ schema: { username: { type: String } } }),
		).toThrow(/schema\.username\.type.*non-JSON value/);
		expect(() =>
			DEFAULT_CONFIG_CONTENT({ schema: { username: { type: String } } }),
		).toThrow(/module reference/);
	});

	it.each(["provider", "Ambiten", "ctx", "collection", "schema"])(
		"rejects JSON-shaped runtime-only model property %s",
		(key) => {
			const options = {
				model: { collectionName: "users", [key]: {} },
			} as AmbitenConfig;
			expect(() => DEFAULT_CONFIG_CONTENT(options)).toThrow(
				/programmatic-only model properties/,
			);
			expect(() => DEFAULT_CONFIG_CONTENT(options)).toThrow(key);
		},
	);
});
