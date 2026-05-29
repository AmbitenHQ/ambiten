import { setupLogger } from '../logger';
import { ILogger, LoggerConfig, Transporter } from '../types';

describe('setupLogger', () => {
  let mockTransporter: jest.Mocked<Transporter>;
  let mockLogger: jest.Mocked<ILogger>;
  let mockHooks: LoggerConfig['hooks'];

  beforeEach(() => {
    mockTransporter = {
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

    mockHooks = {
      onLog: jest.fn(),
      onError: jest.fn(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should create a logger with the provided config', () => {
    const logger = setupLogger({
      level: 'info',
      logger: mockLogger,
      transports: [mockTransporter],
      hooks: mockHooks,
      colorize: false,
    });

    expect(logger).toHaveProperty('info');
    expect(logger).toHaveProperty('error');
    expect(logger).toHaveProperty('fatal');
    expect(logger).toHaveProperty('shutdown');
  });

  it('should use the provided external logger when logging', async () => {
    const logger = setupLogger({
      level: 'info',
      logger: mockLogger,
      transports: [mockTransporter],
      hooks: mockHooks,
      colorize: false,
    });

    logger.info('Setup logger test', { foo: 'bar' });

    await new Promise((resolve) => setImmediate(resolve));

    expect(mockLogger.log).not.toHaveBeenCalled();
    expect(mockTransporter.write).toHaveBeenCalledTimes(1);
    expect(mockHooks?.onLog).toHaveBeenCalledTimes(1);
  });

  it('should create a logger even with an empty config', () => {
    const logger = setupLogger();

    expect(logger).toHaveProperty('trace');
    expect(logger).toHaveProperty('debug');
    expect(logger).toHaveProperty('info');
    expect(logger).toHaveProperty('warn');
    expect(logger).toHaveProperty('error');
    expect(logger).toHaveProperty('fatal');
  });
});