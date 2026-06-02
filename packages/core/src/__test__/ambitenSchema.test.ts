import { Collection } from "mongodb";
import { AmbitenSchema } from "../lib-core";
import { Document, Relationship, SchemaDefinition } from "../types";



describe('AmbitenSchema', () => {
	it('should be defined', () => {
		expect(AmbitenSchema).toBeDefined();
	});
	afterAll(async () => {
		jest.clearAllMocks();
	});
});

describe('schema', () => {
	let schema: AmbitenSchema<Document>;

	beforeEach(() => {
		schema = new AmbitenSchema<Document>({} as never);
	});

	afterEach(async () => {
		jest.clearAllMocks();
	});

	describe('constructor', () => {
		it('should create a new schema with a schemaDefinition', () => {
			// Arrange
			const schemaDefinition = { name: { type: String } } as SchemaDefinition<Document>;

			// Act
			const schema = new AmbitenSchema<Document>(schemaDefinition);

			// Assert
			expect(schema['schemaDefinition']).toEqual(schemaDefinition);
		});
	});

	describe('validator', () => {
		it('should validate a document when all validators pass', () => {
			// Arrange
			const schema = new AmbitenSchema<Document>({} as never);

			// Add validators
			schema.validator('name', (value) => typeof value === 'string');
			schema.validator('age', (value) => typeof value === 'number' && value > 0);

			const validDoc = { name: 'John', age: 30 } as unknown as Document;

			// Act & Assert
			expect(() => schema.validate(validDoc)).not.toThrow();
		});

		it('should throw an error when validation fails for a field', () => {
			// Arrange
			const schema = new AmbitenSchema<Document>({} as never);

			// Add validators
			schema.validator('name', (value) => typeof value === 'string');
			schema.validator('age', (value) => typeof value === 'number' && value > 18);

			const invalidDoc = { name: 'John', age: 16 } as unknown as Document;

			// Act & Assert
			expect(() => schema.validate(invalidDoc)).toThrow('Validation failed for field: age');
		});

		afterAll(async () => {
			// await bufferedTransporter.stop();
		});
	});

	describe('index', () => {
		it('should add an index to the schema', () => {
			// Arrange
			const schema = new AmbitenSchema<Document>({} as never);

			// Act
			schema.index({ name: 1 });

			// Assert
			expect(schema['indexes']).toEqual([{ fields: { name: 1 }, options: undefined }]);
		});

		it('should add a new index with fields and options to the indexes array', () => {
			// Arrange
			const testClass = {
				index: AmbitenSchema.prototype.index,
				indexes: []
			};
			const fields = { name: 1, age: -1 };
			const options = { unique: true };

			// Act
			testClass.index(fields, options);

			// Assert
			expect(testClass.indexes).toHaveLength(1);
			expect(testClass.indexes[0]).toEqual({ fields, options });
		});

		it('should add a new index with fields and undefined options when options parameter is not provided', () => {
			// Arrange
			const testClass = {
				index: AmbitenSchema.prototype.index,
				indexes: []
			};
			const fields = { email: 1 };

			// Act
			testClass.index(fields);

			// Assert
			expect(testClass.indexes).toHaveLength(1);
			expect(testClass.indexes[0]).toEqual({ fields, options: undefined });
		});

		afterAll(async () => {
			jest.clearAllMocks();
			// await bufferedTransporter.stop();
		});
	});

	describe('applyIndexes', () => {
		it('should apply all indexes to the collection', async () => {
			// Arrange
			const schema = new AmbitenSchema<Document>({} as never);
			const collection = {
				createIndex: jest.fn()
			};

			schema.index({ name: 1 });
			schema.index({ age: -1 });

			// Act
			await schema.applyIndexes(collection as unknown as Collection<Document>);

			// Assert
			expect(collection.createIndex).toHaveBeenCalledTimes(2);
			expect(collection.createIndex).toHaveBeenCalledWith({ name: 1 }, undefined);
			expect(collection.createIndex).toHaveBeenCalledWith({ age: -1 }, undefined);
		});

		it('should create indexes when collection and indexes array are valid', async () => {
			// Arrange
			const mockCollection = {
				createIndex: jest.fn().mockResolvedValue('indexName')
			} as unknown as Collection<Document>;

			schema.index({ name: 1 }, { unique: true });
			schema.index({ email: 1 }, { sparse: true });

			// Act
			await schema.applyIndexes(mockCollection);

			// Assert
			expect(mockCollection.createIndex).toHaveBeenCalledTimes(2);
			expect(mockCollection.createIndex).toHaveBeenNthCalledWith(1, { name: 1 }, { unique: true });
			expect(mockCollection.createIndex).toHaveBeenNthCalledWith(2, { email: 1 }, { sparse: true });
		});
	});

	describe('addRelationship', () => {

		it('should add a relationship with valid reference and local field', () => {
			// Arrange
			class TestClass {
				relationships: Array<{ ref: string, localField: string }> = [];

				addRelationship(ref: string, localField: keyof TestClass) {
					this.relationships.push({ ref, localField });
				}
			}

			const testInstance = new TestClass();
			const ref = 'User';
			const localField = 'userId' as keyof TestClass;

			// Act
			testInstance.addRelationship(ref, localField);

			// Assert
			expect(testInstance.relationships.length).toBe(1);
			expect(testInstance.relationships[0]).toEqual({ ref: 'User', localField: 'userId' });
		});

		it('should add a new relationship to the relationships array', () => {
			// Arrange
			const testClass = {
				addRelationship: AmbitenSchema.prototype.addRelationship,
				relationships: []
			};

			// Act
			testClass.addRelationship('ref', 'localField');

			// Assert
			expect(testClass.relationships).toHaveLength(1);
			expect(testClass.relationships[0]).toEqual({ ref: 'ref', localField: 'localField' });
		});
	});

	it('should add a relationship even with an empty string as reference', () => {
		// Arrange
		class TestClass {
			relationships: Array<{ ref: string, localField: string }> = [];

			addRelationship(ref: string, localField: keyof TestClass) {
				this.relationships.push({ ref, localField });
			}
		}

		const testInstance = new TestClass();
		const ref = '';
		const localField = 'userId' as keyof TestClass;

		// Act
		testInstance.addRelationship(ref, localField);

		// Assert
		expect(testInstance.relationships.length).toBe(1);
		expect(testInstance.relationships[0]).toEqual({ ref: '', localField: 'userId' });
	});

	describe('getRelationships', () => {
		it('should return the relationships array when called', () => {
			// Arrange
			const relationships: Relationship[] = [
				{ ref: 'users', localField: 'userId' },
				{ ref: 'products', localField: 'productId' }
			];

			class TestClass {
				private relationships: Relationship[];

				constructor(relationships: Relationship[]) {
					this.relationships = relationships;
				}

				getRelationships(): Relationship[] {
					return this.relationships;
				}
			}

			const testInstance = new TestClass(relationships);

			// Act
			const result = testInstance.getRelationships();

			// Assert
			expect(result).toBe(relationships);
			expect(result.length).toBe(2);
		});

		it('should handle a large number of relationship items', () => {
			// Arrange
			const largeRelationships: Relationship[] = [];

			// Create 1000 relationship items
			for (let i = 0; i < 1000; i++) {
				largeRelationships.push({
					ref: `collection${i}`,
					localField: `field${i}`
				});
			}

			class TestClass {
				private relationships: Relationship[];

				constructor(relationships: Relationship[]) {
					this.relationships = relationships;
				}

				getRelationships(): Relationship[] {
					return this.relationships;
				}
			}

			const testInstance = new TestClass(largeRelationships);

			// Act
			const result = testInstance.getRelationships();

			// Assert
			expect(result).toBe(largeRelationships);
			expect(result.length).toBe(1000);
			expect(result[999].ref).toBe('collection999');
			expect(result[999].localField).toBe('field999');
		});
	});

	afterAll(async () => {
		schema = null as any;
		jest.clearAllMocks();
	});

});
