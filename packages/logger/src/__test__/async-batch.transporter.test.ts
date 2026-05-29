import { AsyncBatchTransporter } from '../transports';
import { LogEntry } from '../types';

const createEntry = (
  message: string,
  level: LogEntry['level'] = 'info'
): LogEntry => ({
  timestamp: new Date().toISOString(),
  level,
  message,
  meta: {},
});

describe('AsyncBatchTransporter', () => {
  let mockSendBatch: jest.Mock<Promise<void>, [LogEntry[]]>;
  let onError: jest.Mock;
  let onDrop: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();

    mockSendBatch = jest.fn().mockResolvedValue(undefined);
    onError = jest.fn();
    onDrop = jest.fn();
  });

  afterEach(async () => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should send logs when batch size is reached', async () => {
    const transporter = new AsyncBatchTransporter({
      batchSize: 3,
      flushInterval: 1000,
      sendBatch: mockSendBatch,
      startImmediately: false,
    });

    await transporter.write(createEntry('one'), 'one');
    await transporter.write(createEntry('two'), 'two');

    expect(mockSendBatch).not.toHaveBeenCalled();

    await transporter.write(createEntry('three'), 'three');

    expect(mockSendBatch).toHaveBeenCalledTimes(1);

    expect(mockSendBatch).toHaveBeenCalledWith([
      expect.objectContaining({ message: 'one' }),
      expect.objectContaining({ message: 'two' }),
      expect.objectContaining({ message: 'three' }),
    ]);
  });

  it('should flush pending logs manually', async () => {
    const transporter = new AsyncBatchTransporter({
      batchSize: 10,
      flushInterval: 1000,
      sendBatch: mockSendBatch,
      startImmediately: false,
    });

    await transporter.write(createEntry('one'), 'one');
    await transporter.write(createEntry('two'), 'two');

    await transporter.flush();

    expect(mockSendBatch).toHaveBeenCalledTimes(1);
    expect(mockSendBatch.mock.calls[0][0]).toHaveLength(2);
  });

  it('should flush pending logs when stopped', async () => {
    const transporter = new AsyncBatchTransporter({
      batchSize: 10,
      flushInterval: 1000,
      sendBatch: mockSendBatch,
      startImmediately: false,
    });

    await transporter.write(createEntry('one'), 'one');
    await transporter.write(createEntry('two'), 'two');

    await transporter.stop();

    expect(mockSendBatch).toHaveBeenCalledTimes(1);
    expect(mockSendBatch.mock.calls[0][0]).toHaveLength(2);
  });

  it('should not send if buffer is empty', async () => {
    const transporter = new AsyncBatchTransporter({
      batchSize: 10,
      flushInterval: 1000,
      sendBatch: mockSendBatch,
      startImmediately: false,
    });

    await transporter.flush();

    expect(mockSendBatch).not.toHaveBeenCalled();
  });

  it('should add tag into metadata when tag is provided', async () => {
    const transporter = new AsyncBatchTransporter({
      batchSize: 1,
      flushInterval: 1000,
      tag: 'remote',
      sendBatch: mockSendBatch,
      startImmediately: false,
    });

    await transporter.write(
      {
        ...createEntry('tagged'),
        meta: { foo: 'bar' },
      },
      'tagged'
    );

    expect(mockSendBatch).toHaveBeenCalledTimes(1);

    expect(mockSendBatch.mock.calls[0][0][0].meta).toMatchObject({
      foo: 'bar',
      type: 'remote',
    });
  });

  it('should call onError when sendBatch fails', async () => {
    const error = new Error('Network error');

    mockSendBatch.mockRejectedValueOnce(error);

    const transporter = new AsyncBatchTransporter({
      batchSize: 1,
      flushInterval: 1000,
      sendBatch: mockSendBatch,
      onError,
      retryAttempts: 0,
      startImmediately: false,
    });

    await transporter.write(createEntry('failure'), 'failure');

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledWith(
      error,
      [expect.objectContaining({ message: 'failure' })]
    );
  });

  it('should retry failed batches before reporting error', async () => {
    const error = new Error('Temporary failure');

    mockSendBatch
      .mockRejectedValueOnce(error)
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce(undefined);

    const transporter = new AsyncBatchTransporter({
      batchSize: 1,
      flushInterval: 1000,
      sendBatch: mockSendBatch,
      retryAttempts: 2,
      retryDelay: 10,
      startImmediately: false,
      onError,
    });

    const promise = transporter.write(createEntry('retry'), 'retry');

    await jest.runAllTimersAsync();
    await promise;

    expect(mockSendBatch).toHaveBeenCalledTimes(3);
    expect(onError).not.toHaveBeenCalled();
  });

  it('should drop the oldest log when maxBufferSize is exceeded and dropOnOverflow is true', async () => {
    const transporter = new AsyncBatchTransporter({
      batchSize: 10,
      flushInterval: 1000,
      maxBufferSize: 2,
      dropOnOverflow: true,
      sendBatch: mockSendBatch,
      onDrop,
      startImmediately: false,
    });

    await transporter.write(createEntry('one'), 'one');
    await transporter.write(createEntry('two'), 'two');
    await transporter.write(createEntry('three'), 'three');

    await transporter.flush();

    expect(onDrop).toHaveBeenCalledTimes(1);
    expect(onDrop).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'one' })
    );

    expect(mockSendBatch.mock.calls[0][0]).toEqual([
      expect.objectContaining({ message: 'two' }),
      expect.objectContaining({ message: 'three' }),
    ]);
  });

  it('should flush instead of dropping when maxBufferSize is exceeded and dropOnOverflow is false', async () => {
    const transporter = new AsyncBatchTransporter({
      batchSize: 10,
      flushInterval: 1000,
      maxBufferSize: 2,
      dropOnOverflow: false,
      sendBatch: mockSendBatch,
      onDrop,
      startImmediately: false,
    });

    await transporter.write(createEntry('one'), 'one');
    await transporter.write(createEntry('two'), 'two');
    await transporter.write(createEntry('three'), 'three');

    expect(onDrop).not.toHaveBeenCalled();
    expect(mockSendBatch).toHaveBeenCalledTimes(1);
    expect(mockSendBatch.mock.calls[0][0]).toHaveLength(2);

    await transporter.flush();

    expect(mockSendBatch).toHaveBeenCalledTimes(2);
    expect(mockSendBatch.mock.calls[1][0]).toEqual([
      expect.objectContaining({ message: 'three' }),
    ]);
  });

  it('should start and clear interval when enabled', async () => {
    const setIntervalSpy = jest.spyOn(globalThis, 'setInterval');
    const clearIntervalSpy = jest.spyOn(globalThis, 'clearInterval');

    const transporter = new AsyncBatchTransporter({
      batchSize: 10,
      flushInterval: 1000,
      sendBatch: mockSendBatch,
      startImmediately: true,
      enableTimerInTest: true,
    });

    expect(setIntervalSpy).toHaveBeenCalled();

    await transporter.stop();

    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it('should not start interval in test environment', async () => {
    const setIntervalSpy = jest.spyOn(globalThis, 'setInterval');

    const transporter = new AsyncBatchTransporter({
      batchSize: 10,
      flushInterval: 1000,
      sendBatch: mockSendBatch,
      startImmediately: true,
    });

    expect(setIntervalSpy).not.toHaveBeenCalled();

    await transporter.stop();
  });
});