export type CircuitBreakerState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerOptions {
  failureThreshold?: number;
  cooldownPeriod?: number;
  successThreshold?: number;
  onOpen?: (error: unknown) => void;
  onClose?: () => void;
  onHalfOpen?: () => void;
}

export function createCircuitBreaker<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: CircuitBreakerOptions = {}
): (...args: TArgs) => Promise<TResult> {
  const failureThreshold = options.failureThreshold ?? 3;
  const cooldownPeriod = options.cooldownPeriod ?? 10_000;
  const successThreshold = options.successThreshold ?? 1;

  let state: CircuitBreakerState = 'closed';
  let failures = 0;
  let successes = 0;
  let lastFailureTime = 0;

  return async (...args: TArgs): Promise<TResult> => {
    const currentTime = Date.now();

    if (state === 'open') {
      const canAttemptAgain =
        currentTime - lastFailureTime >= cooldownPeriod;

      if (!canAttemptAgain) {
        throw new Error('Circuit breaker is open. Execution skipped.');
      }

      state = 'half-open';
      options.onHalfOpen?.();
    }

    try {
      const result = await fn(...args);

      if (state === 'half-open') {
        successes++;

        if (successes >= successThreshold) {
          state = 'closed';
          failures = 0;
          successes = 0;
          options.onClose?.();
        }
      } else {
        failures = 0;
      }

      return result;
    } catch (error) {
      failures++;
      successes = 0;
      lastFailureTime = Date.now();

      if (failures >= failureThreshold) {
        state = 'open';
        options.onOpen?.(error);
      }

      throw error;
    }
  };
}