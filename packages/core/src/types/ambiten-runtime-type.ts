import { ILogger } from "@ambiten/logger";
import {
	AmbitenClient,
	AmbitenModel,
	AmbitenSchema,
	type RegisterMultiTenancyOptions
} from "../lib-core";
import { AmbitenGraphQL } from "../graphql";
import { AmbitenGC } from "../gc";
import { Document } from "./document";
import { BootstrapClient } from "./bootstrapClient.type";
import { AmbitenCacheOptions } from "../ambiten-cache";

export interface AmbitenRuntime<T extends Document = Document> {
	getMongoClient(): AmbitenClient | BootstrapClient

	onConnect(hook): void
	getModel(): AmbitenModel<T>;

	getSchema(): AmbitenSchema<T>;

	getGraphQL(): AmbitenGraphQL | undefined;

	getGCRunner(): AmbitenGC | undefined;
	getLogger(): ILogger;

	registerMultiTenancy(options: {
		tenants?: Record<string, string>;
		lazy?: boolean;
	}): Promise<void>;

	cache<T>(
		key: string,
		fetcher: () => Promise<T>,
		options?: AmbitenCacheOptions
	): Promise<T>;

	invalidateCache(
		tenantId: string,
		namespace?: string
	): Promise<void>;

	shutdown(): Promise<void>;
}