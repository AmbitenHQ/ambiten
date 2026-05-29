import { consoleTransport } from '../transports';
import { LogEntry } from '../types';

const createEntry = (
  level: LogEntry['level'] = 'info'
): LogEntry => ({
  timestamp: new Date().toISOString(),
  level,
  message: 'Test message',
  meta: {},
});

describe('consoleTransport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should expose a write method', () => {
    const transport = consoleTransport(true);

    expect(transport).toHaveProperty('write');
    expect(typeof transport.write).toBe('function');
  });

  it('should write info logs using console.info', async () => {
    const infoSpy = jest
      .spyOn(console, 'info')
      .mockImplementation(() => {});

    const transport = consoleTransport(false);

    await transport.write(
      createEntry('info'),
      '[INFO] Test message'
    );

    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(infoSpy).toHaveBeenCalledWith(
      '[INFO] Test message'
    );
  });

  it('should write warn logs using console.warn', async () => {
    const warnSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => {});

    const transport = consoleTransport(false);

    await transport.write(
      createEntry('warn'),
      '[WARN] Test message'
    );

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledWith(
      '[WARN] Test message'
    );
  });

  it('should write error logs using console.error', async () => {
    const errorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const transport = consoleTransport(false);

    await transport.write(
      createEntry('error'),
      '[ERROR] Test message'
    );

    expect(errorSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(
      '[ERROR] Test message'
    );
  });

  it('should write debug logs using console.debug', async () => {
    const debugSpy = jest
      .spyOn(console, 'debug')
      .mockImplementation(() => {});

    const transport = consoleTransport(false);

    await transport.write(
      createEntry('debug'),
      '[DEBUG] Test message'
    );

    expect(debugSpy).toHaveBeenCalledTimes(1);
    expect(debugSpy).toHaveBeenCalledWith(
      '[DEBUG] Test message'
    );
  });

  it('should support colorized output', async () => {
    const infoSpy = jest
      .spyOn(console, 'info')
      .mockImplementation(() => {});

    const transport = consoleTransport(true);

    await transport.write(
      createEntry('info'),
      '[INFO] Colored message'
    );

    expect(infoSpy).toHaveBeenCalledTimes(1);
  });

  it('should support metadata in log entries', async () => {
    const infoSpy = jest
      .spyOn(console, 'info')
      .mockImplementation(() => {});

    const transport = consoleTransport(false);

    await transport.write(
      {
        ...createEntry('info'),
        meta: {
          tenantId: 'tenant-1',
          requestId: 'req-1',
        },
      },
      '[INFO] Metadata message'
    );

    expect(infoSpy).toHaveBeenCalledWith(
      '[INFO] Metadata message'
    );
  });
});