export enum ErrorType {
  AmbitenError = 'AmbitenError',
  AmbitenErrorType = 'AmbitenErrorType',
  AmbitenErrorStack = 'AmbitenErrorStack',
  AmbitenErrorMessage = 'AmbitenErrorMessage',
  AmbitenErrorCause = 'AmbitenErrorCause',

  AmbitenCollectionError = 'CollectionError',
  AmbitenParseError = 'ParseError',
  AmbitenBulkWriteError = 'MongoBulkWriteError',
  AmbitenConnectionError = 'ConnectionError',
  AmbitenSchemaError = 'SchemaError',
  AmbitenModelError = 'ModelError',

  INITIALIZATION_ERROR = 'INITIALIZATION_ERROR',
  Ambiten_ERROR = 'Ambiten_ERROR',
  NULL_OR_UNDEFINED = 'NULL_OR_UNDEFINED',
  INVALID_SCHEME_ERROR = 'INVALID_SCHEME_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  UNEXPECTED_ERROR = 'UNEXPECTED_ERROR',
  SCHEMA_ERROR = 'SCHEMA_ERROR',
  SCHEMA_VALIDATION_ERROR = 'SCHEMA_VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  NO_DATABASE_FOUND = 'NO_DATABASE_FOUND',
  NOT_FOUND_IN_CACHE = 'NOT_FOUND_IN_CACHE',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNIQUE_CONSTRAINT_VIOLATION = 'UNIQUE_CONSTRAINT_VIOLATION'
}