import { ErrorType } from './errorTypes';

export interface AmbitenErrorOptions {
  type: ErrorType;
  message: string;
  cause?: unknown;
  details?: Record<string, unknown>;
}

export class AmbitenError extends Error {
  public readonly type: ErrorType;
  public readonly details?: Record<string, unknown>;

  constructor(options: AmbitenErrorOptions) {
    super(options.message, { cause: options.cause });

    this.name = options.type;
    this.type = options.type;
    this.details = options.details;

    Error.captureStackTrace?.(this, AmbitenError);
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

export function createAmbitenError(
  type: ErrorType,
  message: string,
  options: {
    cause?: unknown;
    details?: Record<string, unknown>;
  } = {}
): AmbitenError {
  return new AmbitenError({
    type,
    message,
    cause: options.cause,
    details: options.details
  });
};
