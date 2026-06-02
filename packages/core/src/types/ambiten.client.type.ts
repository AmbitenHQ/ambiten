import { ClientSession, Collection, Db, MongoClient } from "mongodb";
import { AmbitenConfig } from "./ambitenConfig.js";
import { Document } from "./document.js";

/**
 * Configuration options for the AmbitenClient.
 */
export interface AmbitenClientConfig {
	/**
	 * The MongoDB connection URI.
	 */
	uri: string;

	/**
	 * Optional configuration options for the client.
	 */
	options?: AmbitenClientOptions;

	/**
	 * An optional MongoClient instance.
	 */
	tenantResolver?: TenantClientResolver; // optional
}

export interface TenantClientResolver {
	getClient(tenantId: string): Promise<MongoClient | null>;
}

export interface AmbitenResolvedClientScope {
	tenantId?: string;
	requestId?: string;
	dbName: string;
	collectionName?: string;
	session?: ClientSession;
}





/**
 * Options for configuring the AmbitenClient.
 */
export interface AmbitenClientOptions {
	/**
	 * The name of the database to connect to.
	 */
	dbName?: string;

	/**
	 * The name of the collection to use.
	 */
	collectionName?: string;

	/**
	 * An optional MongoClient instance.
	 */
	client?: MongoClient;

	/**
	 * Optional configuration for Ambiten.
	 */
	config?: AmbitenConfig;
};


/**
 * Represents the AmbitenClient interface for interacting with MongoDB.
 * @template T - The type of the document in the collection.
 */
export interface AmbitenClientType<T extends Document> {
	/**
	 * The MongoDB connection URI.
	 */
	uri: string;

	/**
	 * Connects to the MongoDB database.
	 * @returns {Promise<Db>} A promise that resolves to the connected database instance.
	 */
	connect(): Promise<Db>;

	/**
	 * Drops the entire database.
	 * @returns {Promise<boolean>} A promise that resolves to `true` if the database is dropped successfully.
	 */
	dropDatabase(): Promise<boolean>;

	/**
	 * Retrieves the current database instance.
	 * @returns {Db} The connected database instance.
	 */
	getDb(): Db;

	/**
	 * Retrieves a collection by name.
	 * @param {string} collectionName - The name of the collection.
	 * @returns {Promise<Collection<T>>} A promise that resolves to the collection instance.
	 */
	collection(collectionName: string): Promise<Collection<T>>;

	/**
	 * Retrieves a collection by name.
	 * @param {string} name - The name of the collection.
	 * @returns {Promise<Collection<T>>} A promise that resolves to the collection instance.
	 */
	getCollection(name: string): Promise<Collection<T>>;

	/**
	 * Retrieves the database instance for a specific tenant.
	 * @param {string} tenantId - The ID of the tenant.
	 * @returns {Db} The database instance for the tenant.
	 */
	getTenantDB(tenantId: string): Db;

	/**
	 * Sets the MongoDB driver.
	 * @param {any} mongodbDriver - The MongoDB driver to set.
	 */
	setDriver(mongodbDriver: any): void;

	/**
	 * Retrieves a collection for a specific tenant.
	 * @param {string} tenantId - The ID of the tenant.
	 * @param {string} collectionName - The name of the collection.
	 * @returns {Promise<Collection<T>>} A promise that resolves to the collection instance.
	 */
	getTenantCollection(tenantId: string, collectionName: string): Promise<Collection<T>>;

	/**
	 * Retrieves the database instance for a specific tenant and URI.
	 * @param {string} tenantId - The ID of the tenant.
	 * @param {string} uri - The MongoDB connection URI.
	 * @returns {Promise<{db: Db, client: MongoClient}>} A promise that resolves to the database instance and its MongoClient.
	 */
	getDatabase(tenantId: string, uri: string): Promise<{ db: Db; client: MongoClient }>;

	/**
	 * Switches to a different database by name.
	 * @param {string} dbName - The name of the database to switch to.
	 * @returns {Promise<{db: Db, client: MongoClient}>} A promise that resolves to the new database instance and its MongoClient.
	 */
	useDatabase(dbName: string): Promise<{ db: Db; client: MongoClient }>;

	/**
	 * Validates the MongoDB connection URI.
	 * @param {string} uri - The MongoDB connection URI.
	 */
	validateUri(uri: string): void;

	/**
	 * Retrieves the MongoClient instance.
	 * @returns {MongoClient} The MongoClient instance.
	 */
	getClient(): MongoClient;
}

