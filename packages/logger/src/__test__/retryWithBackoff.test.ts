import { retryWithBackoff } from '../utils';

describe('retryWithBackoff', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
		jest.clearAllMocks();
		jest.clearAllTimers();
	});

	it('should resolve if function succeeds on first try', async () => {
		const fn = jest.fn().mockResolvedValue('success');

		await expect(
			retryWithBackoff(fn)
		).resolves.toBe('success');

		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('should retry until success', async () => {
		const fn = jest
			.fn()
			.mockRejectedValueOnce(new Error('fail-1'))
			.mockRejectedValueOnce(new Error('fail-2'))
			.mockResolvedValueOnce('success');

		const promise = retryWithBackoff(fn, {
			attempts: 3,
			delay: 100,
			jitter: false,
		});

		await jest.runAllTimersAsync();

		await expect(promise).resolves.toBe('success');

		expect(fn).toHaveBeenCalledTimes(3);
	});

	it('should throw after exhausting retries', async () => {
		const fn = jest.fn().mockRejectedValue(new Error('permanent failure'));

		const promise = retryWithBackoff(fn, {
			attempts: 3,
			delay: 100,
			jitter: false,
		});

		const expectation = expect(promise).rejects.toThrow('permanent failure');

		await jest.runAllTimersAsync();

		await expectation;

		expect(fn).toHaveBeenCalledTimes(3);
	});

	it('should stop retrying when shouldRetry returns false', async () => {
		const fn = jest.fn().mockRejectedValue(new Error('fatal'));
		const shouldRetry = jest.fn(() => false);

		const promise = retryWithBackoff(fn, {
			attempts: 5,
			delay: 100,
			jitter: false,
			shouldRetry,
		});

		const expectation = expect(promise).rejects.toThrow('fatal');

		await jest.runAllTimersAsync();

		await expectation;

		expect(fn).toHaveBeenCalledTimes(1);
		expect(shouldRetry).toHaveBeenCalledTimes(1);
	});

	it('should call onRetry callback', async () => {
		const fn = jest
			.fn()
			.mockRejectedValueOnce(new Error('temporary'))
			.mockResolvedValueOnce('ok');

		const onRetry = jest.fn();

		const promise = retryWithBackoff(fn, {
			attempts: 2,
			delay: 100,
			jitter: false,
			onRetry,
		});

		await jest.runAllTimersAsync();

		await expect(promise).resolves.toBe('ok');

		expect(onRetry).toHaveBeenCalledTimes(1);

		expect(onRetry).toHaveBeenCalledWith(
			expect.any(Error),
			1,
			100
		);
	});
});