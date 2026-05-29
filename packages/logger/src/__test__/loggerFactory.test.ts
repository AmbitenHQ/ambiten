import { createLogger } from '../logger';
import { ILogger, LoggerConfig, LogEntry, Transporter } from '../types';

const flushPromises = () => new Promise<void>((resolve) => setImmediate(resolve));

describe('createLogger', () => {
  let mockTransport: jest.Mocked<Transporter>;
  let mockLogger: jest.Mocked<ILogger>;
  let config: LoggerConfig;

  beforeEach(() => {
    jest.clearAllMocks();

    mockTransport = {
      write: jest.fn().mockResolvedValue(undefined),
      flush: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
    };

    mockLogger = {
      log: jest.fn(),
      trace: jest.fn(),
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      fatal: jest.fn(),
      shutdown: jest.fn(),
      stop: jest.fn(),
      close: jest.fn(),
    };

    config = {
      level: 'info',
      transports: [mockTransport],
      colorize: false,
      json: false,
      excludedSources: [],
      formatOptions: {
        colorize: false,
        timestamp: true,
      },
      logger: mockLogger,
      hooks: {
        onLog: jest.fn(),
        onError: jest.fn(),
      },
    };
  });

  it('should log info messages and call transport write', async () => {
    const logger = createLogger(config);

    logger.info('Test message', { foo: 'bar' });

    await flushPromises();

    expect(mockTransport.write).toHaveBeenCalledTimes(1);
    expect(mockLogger.log).not.toHaveBeenCalled();
    expect(config.hooks?.onLog).toHaveBeenCalledTimes(1);

    const [entry, formatted] = mockTransport.write.mock.calls[0];

    expect(entry).toMatchObject({
      level: 'info',
      message: 'Test message',
      meta: { foo: 'bar' },
    });

    expect(formatted).toContain('Test message');
  });

  it('should not log messages below the configured level', async () => {
    config.level = 'warn';

    const logger = createLogger(config);

    logger.info('Should not log');

    await flushPromises();

    expect(mockTransport.write).not.toHaveBeenCalled();
    expect(mockLogger.log).not.toHaveBeenCalled();
    expect(config.hooks?.onLog).not.toHaveBeenCalled();
  });

  it('should not log if source is excluded', async () => {
    config.excludedSources = ['excludedSource'];

    const logger = createLogger(config);

    logger.info('Should not log', { source: 'excludedSource' });

    await flushPromises();

    expect(mockTransport.write).not.toHaveBeenCalled();
    expect(mockLogger.log).not.toHaveBeenCalled();
  });

  it('should use enrichMetadata if provided', async () => {
    config.enrichMetadata = (entry: LogEntry): LogEntry => ({
      ...entry,
      meta: {
        ...entry.meta,
        enriched: true,
      },
    });

    const logger = createLogger(config);

    logger.info('Enrich test', { foo: 'bar' });

    await flushPromises();

    expect(mockTransport.write).toHaveBeenCalledTimes(1);

    const [entry, formatted] = mockTransport.write.mock.calls[0];

    expect(entry.meta).toMatchObject({
      foo: 'bar',
      enriched: true,
    });

    expect(formatted).toContain('Enrich test');
  });

  it('should log in JSON format if json=true', async () => {
    config.json = true;

    const logger = createLogger(config);

    logger.info('Json test', { foo: 'baz' });

    await flushPromises();

    expect(mockTransport.write).toHaveBeenCalledTimes(1);

    const [, formatted] = mockTransport.write.mock.calls[0];
    const parsed = JSON.parse(formatted);

    expect(parsed).toMatchObject({
      level: 'info',
      message: 'Json test',
    });

    expect(parsed.meta).toMatchObject({
      foo: 'baz',
    });
  });

  it('should use shouldLog function if provided', async () => {
    config.shouldLog = jest.fn(() => false);

    const logger = createLogger(config);

    logger.info('Should not log');

    await flushPromises();

    expect(mockTransport.write).not.toHaveBeenCalled();
    expect(config.shouldLog).toHaveBeenCalledTimes(1);
  });

  it('should attach context from contextProvider', async () => {
    config.contextProvider = () => ({
      tenantId: 'tenant-1',
      requestId: 'req-1',
      dbName: 'tenant_db',
      collectionName: 'users',
      operation: 'create',
      meta: {
        runtime: 'test',
      },
    });

    const logger = createLogger(config);

    logger.info('Context test', { foo: 'bar' });

    await flushPromises();

    expect(mockTransport.write).toHaveBeenCalledTimes(1);

    const [entry] = mockTransport.write.mock.calls[0];

    expect(entry.context).toMatchObject({
      tenantId: 'tenant-1',
      requestId: 'req-1',
      dbName: 'tenant_db',
      collectionName: 'users',
      operation: 'create',
    });

    expect(entry.meta).toMatchObject({
      runtime: 'test',
      foo: 'bar',
    });
  });

  it('should call all log levels allowed by configured level', async () => {
    config.level = 'trace';

    const logger = createLogger(config);

    logger.trace('trace');
    logger.debug('debug');
    logger.info('info');
    logger.warn('warn');
    logger.error('error');
    logger.fatal('fatal');

    await flushPromises();

    expect(mockTransport.write).toHaveBeenCalledTimes(6);
    expect(mockLogger.log).not.toHaveBeenCalled();

    const levels = mockTransport.write.mock.calls.map(
      ([entry]) => entry.level
    );

    expect(levels).toEqual([
      'trace',
      'debug',
      'info',
      'warn',
      'error',
      'fatal',
    ]);
  });

  it('should call onError when transport write fails', async () => {
    const error = new Error('Transport failed');

    mockTransport.write.mockRejectedValueOnce(error);

    const logger = createLogger(config);

    logger.info('Failure test');

    await flushPromises();

    expect(config.hooks?.onError).toHaveBeenCalled();
  });

  it('should shutdown transports and external logger', async () => {
    const logger = createLogger(config);

    await logger.shutdown?.();

    expect(mockTransport.flush).toHaveBeenCalled();
    expect(mockTransport.close).toHaveBeenCalled();
    expect(mockLogger.shutdown).toHaveBeenCalled();
  });
});