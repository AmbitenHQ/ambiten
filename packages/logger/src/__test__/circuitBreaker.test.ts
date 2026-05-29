import { createCircuitBreaker } from '../utils';

describe('createCircuitBreaker', () => {
  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should call the wrapped function and return its result', async () => {
    const fn = jest.fn().mockResolvedValue('success');

    const breaker = createCircuitBreaker(fn);

    const result = await breaker('test');

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledWith('test');
  });

  it('should reset failures after a successful call', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('ok')
      .mockRejectedValueOnce(new Error('fail again'));

    const breaker = createCircuitBreaker(fn, {
      failureThreshold: 2,
      cooldownPeriod: 1000,
    });

    await expect(breaker()).rejects.toThrow('fail');

    await expect(breaker()).resolves.toBe('ok');

    await expect(breaker()).rejects.toThrow('fail again');

    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should open the circuit after the failure threshold is reached', async () => {
    jest.useFakeTimers();

    const fn = jest.fn().mockRejectedValue(new Error('fail'));
    const onOpen = jest.fn();

    const breaker = createCircuitBreaker(fn, {
      failureThreshold: 2,
      cooldownPeriod: 10_000,
      onOpen,
    });

    await expect(breaker()).rejects.toThrow('fail');
    await expect(breaker()).rejects.toThrow('fail');

    await expect(breaker()).rejects.toThrow(
      'Circuit breaker is open. Execution skipped.'
    );

    expect(fn).toHaveBeenCalledTimes(2);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('should move to half-open after cooldown and try again', async () => {
    jest.useFakeTimers();

    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('recovered');

    const onHalfOpen = jest.fn();
    const onClose = jest.fn();

    const breaker = createCircuitBreaker(fn, {
      failureThreshold: 1,
      cooldownPeriod: 5000,
      successThreshold: 1,
      onHalfOpen,
      onClose,
    });

    await expect(breaker()).rejects.toThrow('fail');

    await expect(breaker()).rejects.toThrow(
      'Circuit breaker is open. Execution skipped.'
    );

    jest.advanceTimersByTime(5001);

    await expect(breaker()).resolves.toBe('recovered');

    expect(onHalfOpen).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should reopen if half-open attempt fails', async () => {
    jest.useFakeTimers();

    const fn = jest.fn().mockRejectedValue(new Error('still failing'));
    const onOpen = jest.fn();
    const onHalfOpen = jest.fn();

    const breaker = createCircuitBreaker(fn, {
      failureThreshold: 1,
      cooldownPeriod: 5000,
      onOpen,
      onHalfOpen,
    });

    await expect(breaker()).rejects.toThrow('still failing');

    jest.advanceTimersByTime(5001);

    await expect(breaker()).rejects.toThrow('still failing');

    await expect(breaker()).rejects.toThrow(
      'Circuit breaker is open. Execution skipped.'
    );

    expect(onHalfOpen).toHaveBeenCalledTimes(1);
    expect(onOpen).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should require multiple successful calls in half-open state when successThreshold is greater than 1', async () => {
    jest.useFakeTimers();

    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValueOnce('ok-1')
      .mockResolvedValueOnce('ok-2');

    const onClose = jest.fn();

    const breaker = createCircuitBreaker(fn, {
      failureThreshold: 1,
      cooldownPeriod: 5000,
      successThreshold: 2,
      onClose,
    });

    await expect(breaker()).rejects.toThrow('fail');

    jest.advanceTimersByTime(5001);

    await expect(breaker()).resolves.toBe('ok-1');

    expect(onClose).not.toHaveBeenCalled();

    await expect(breaker()).resolves.toBe('ok-2');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should work with functions that take arguments', async () => {
    const fn = jest.fn(async (a: number, b: number) => a + b);

    const breaker = createCircuitBreaker(fn);

    const result = await breaker(2, 3);

    expect(result).toBe(5);
    expect(fn).toHaveBeenCalledWith(2, 3);
  });
});