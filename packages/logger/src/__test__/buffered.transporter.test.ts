import { BufferedTransporter } from '../transports';
import { LogEntry, Transporter } from '../types';

const createEntry = (message: string): LogEntry => ({
  timestamp: new Date().toISOString(),
  level: 'info',
  message,
  meta: {},
});

describe('BufferedTransporter', () => {
  let transporter: BufferedTransporter;
  let mockUnderlying: jest.Mocked<Transporter>;

  beforeEach(() => {
    jest.useFakeTimers();

    mockUnderlying = {
      write: jest.fn().mockResolvedValue(undefined),
      flush: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
    };

    transporter = new BufferedTransporter(mockUnderlying, {
      flushInterval: 1000,
      flushSize: 5,
    });
  });

  afterEach(async () => {
    await transporter.close();
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should flush when buffer reaches flushSize', async () => {
    await transporter.write(createEntry('one'), 'one');
    await transporter.write(createEntry('two'), 'two');
    await transporter.write(createEntry('three'), 'three');
    await transporter.write(createEntry('four'), 'four');

    expect(mockUnderlying.write).not.toHaveBeenCalled();

    await transporter.write(createEntry('five'), 'five');

    expect(mockUnderlying.write).toHaveBeenCalledTimes(5);
    expect(mockUnderlying.flush).toHaveBeenCalledTimes(1);
  });

  it('should flush pending entries manually', async () => {
    await transporter.write(createEntry('one'), 'one');
    await transporter.write(createEntry('two'), 'two');

    await transporter.flush();

    expect(mockUnderlying.write).toHaveBeenCalledTimes(2);

    expect(mockUnderlying.write).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ message: 'one' }),
      'one'
    );

    expect(mockUnderlying.write).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ message: 'two' }),
      'two'
    );
  });

  it('should flush pending entries when stopped', async () => {
    await transporter.write(createEntry('one'), 'one');
    await transporter.write(createEntry('two'), 'two');
    await transporter.write(createEntry('three'), 'three');
    await transporter.write(createEntry('four'), 'four');

    await transporter.stop();

    expect(mockUnderlying.write).toHaveBeenCalledTimes(4);
    expect(mockUnderlying.close).toHaveBeenCalledTimes(1);
  });

  it('should not write if buffer is empty', async () => {
    await transporter.flush();

    expect(mockUnderlying.write).not.toHaveBeenCalled();
    expect(mockUnderlying.flush).not.toHaveBeenCalled();
  });

  it('should drop oldest entry when maxBufferSize is exceeded and dropOnOverflow is true', async () => {
    const onDrop = jest.fn();

    transporter = new BufferedTransporter(mockUnderlying, {
      flushInterval: 1000,
      flushSize: 10,
      maxBufferSize: 2,
      dropOnOverflow: true,
      onDrop,
    });

    await transporter.write(createEntry('one'), 'one');
    await transporter.write(createEntry('two'), 'two');
    await transporter.write(createEntry('three'), 'three');

    await transporter.flush();

    expect(onDrop).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'one' })
    );

    expect(mockUnderlying.write).toHaveBeenCalledTimes(2);

    expect(mockUnderlying.write).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ message: 'two' }),
      'two'
    );

    expect(mockUnderlying.write).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ message: 'three' }),
      'three'
    );
  });

  it('should flush instead of dropping when maxBufferSize is exceeded and dropOnOverflow is false', async () => {
    transporter = new BufferedTransporter(mockUnderlying, {
      flushInterval: 1000,
      flushSize: 10,
      maxBufferSize: 2,
      dropOnOverflow: false,
    });

    await transporter.write(createEntry('one'), 'one');
    await transporter.write(createEntry('two'), 'two');
    await transporter.write(createEntry('three'), 'three');

    expect(mockUnderlying.write).toHaveBeenCalledTimes(2);

    await transporter.flush();

    expect(mockUnderlying.write).toHaveBeenCalledTimes(3);

    expect(mockUnderlying.write).toHaveBeenLastCalledWith(
      expect.objectContaining({ message: 'three' }),
      'three'
    );
  });
});