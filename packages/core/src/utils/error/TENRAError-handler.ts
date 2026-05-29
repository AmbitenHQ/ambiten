import { ErrorType } from './errorTypes';

export interface TenraErrorOptions {
  type: ErrorType;
  message: string;
  cause?: unknown;
  details?: Record<string, unknown>;
}

export class TenraError extends Error {
  public readonly type: ErrorType;
  public readonly details?: Record<string, unknown>;

  constructor(options: TenraErrorOptions) {
    super(options.message, { cause: options.cause });

    this.name = options.type;
    this.type = options.type;
    this.details = options.details;

    Error.captureStackTrace?.(this, TenraError);
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      message: this.message,
      details: this.details,
      cause: this.cause instanceof Error
        ? {
            name: this.cause.name,
            message: this.cause.message
          }
        : this.cause
    };
  }
}

export function createTenraError(
  type: ErrorType,
  message: string,
  options: {
    cause?: unknown;
    details?: Record<string, unknown>;
  } = {}
): TenraError {
  return new TenraError({
    type,
    message,
    cause: options.cause,
    details: options.details
  });
};
