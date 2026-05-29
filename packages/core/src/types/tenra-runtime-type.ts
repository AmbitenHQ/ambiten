import { ILogger } from "@tenra/logger";
import {
	TenraClient,
	TenraModel,
	TenraSchema,
	type RegisterMultiTenancyOptions
} from "../lib-core";
import { TenraGraphQL } from "../graphql";
import { TenraGC } from "../gc";
import { TenraAdapter } from "@tenra/adapter-types";
import { Document } from "./document";
import { BootstrapClient } from "./bootstrapClient.type";
import { TenraCacheOptions } from "../tenra-cache";

export interface TenraRuntime<T extends Document = Document> {
	getMongoClient(): TenraClient | BootstrapClient

	onConnect(hook): void
	getModel(): TenraModel<T>;

	getSchema(): TenraSchema<T>;

	getGraphQL(): TenraGraphQL | undefined;

	getGCRunner(): TenraGC | undefined;
	getLogger(): ILogger;

	registerMultiTenancy(options: {
		tenants?: Record<string, string>;
		lazy?: boolean;
	}): Promise<void>;

	cache<T>(
		key: string,
		fetcher: () => Promise<T>,
		options?: TenraCacheOptions
	): Promise<T>;

	invalidateCache(
		tenantId: string,
		namespace?: string
	): Promise<void>;

	shutdown(): Promise<void>;
}