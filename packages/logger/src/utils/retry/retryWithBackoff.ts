export interface RetryWithBackoffOptions {
  attempts?: number;
  delay?: number;
  maxDelay?: number;
  backoffFactor?: number;
  jitter?: boolean;

  shouldRetry?: (error: unknown, attempt: number) => boolean;

  onRetry?: (
    error: unknown,
    attempt: number,
    nextDelay: number
  ) => void;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function applyJitter(delay: number): number {
  return Math.floor(delay * (0.5 + Math.random()));
}

/**
 * Retries an async operation with exponential backoff.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryWithBackoffOptions = {}
): Promise<T> {
  const attempts = options.attempts ?? 5;
  const delay = options.delay ?? 500;
  const maxDelay = options.maxDelay ?? 30_000;
  const backoffFactor = options.backoffFactor ?? 2;
  const jitter = options.jitter ?? true;

  let currentAttempt = 0;
  let lastError: unknown;

  while (currentAttempt < attempts) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      currentAttempt++;

      const shouldRetry =
        options.shouldRetry?.(error, currentAttempt) ?? true;

      if (!shouldRetry || currentAttempt >= attempts) {
        throw error;
      }

      let nextDelay = Math.min(
        delay * Math.pow(backoffFactor, currentAttempt - 1),
        maxDelay
      );

      if (jitter) {
        nextDelay = applyJitter(nextDelay);
      }

      options.onRetry?.(
        error,
        currentAttempt,
        nextDelay
      );

      await sleep(nextDelay);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Retry attempts exhausted');
}