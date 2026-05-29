import { createLogger } from '../logger';
import { LogEntry, MetricsSnapshot, Transporter } from '../types';

const flushPromises = () =>
  new Promise<void>((resolve) => setImmediate(resolve));

describe('logger runtime metrics integration', () => {
  it('tracks logs, dispatches, successful writes, and transport errors correctly', async () => {
    const snapshots: MetricsSnapshot[] = [];

    const successfulTransport: jest.Mocked<Transporter> = {
      write: jest.fn().mockResolvedValue(undefined),
      flush: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
    };

    const failingTransport: jest.Mocked<Transporter> = {
      write: jest.fn().mockRejectedValue(new Error('transport failed')),
      flush: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
    };

    const onError = jest.fn();

    const logger = createLogger({
      level: 'info',
      colorize: false,
      json: true,
      transports: [successfulTransport, failingTransport],
      hooks: {
        onError,
      },
      enableMetrics: {
        enabled: true,
        logInterval: 60_000,
        reporter: (snapshot) => {
          snapshots.push(snapshot);
        },
      },
    });

    logger.info('Runtime metric test', {
      source: 'LoggerTest',
      tenantId: 'tenant-1',
    });

    await flushPromises();

    expect(successfulTransport.write).toHaveBeenCalledTimes(1);
    expect(failingTransport.write).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);

    const metrics = logger.getMetrics?.();

    expect(metrics).toBeDefined();

    const snapshot = metrics!.getSnapshot();

    expect(snapshot.totalLogs).toBe(1);
    expect(snapshot.transportDispatches).toBe(2);
    expect(snapshot.successfulTransportWrites).toBe(1);
    expect(snapshot.transportErrors).toBe(1);
    expect(snapshot.droppedLogs).toBe(0);

    await logger.shutdown?.();
  });

  it('attaches runtime context from contextProvider', async () => {
    const transport: jest.Mocked<Transporter> = {
      write: jest.fn().mockResolvedValue(undefined),
      flush: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
    };

    const logger = createLogger({
      level: 'info',
      colorize: false,
      json: true,
      transports: [transport],
      contextProvider: () => ({
        tenantId: 'tenant-runtime',
        requestId: 'req-runtime',
        dbName: 'tenant_db',
        collectionName: 'orders',
        meta: {
          runtime: 'test',
        },
      }),
    });

    logger.info('Context-aware log', {
      operation: 'findOne',
    });

    await flushPromises();

    const [entry] = transport.write.mock.calls[0] as [LogEntry, string];

    expect(entry.context).toMatchObject({
      tenantId: 'tenant-runtime',
      requestId: 'req-runtime',
      dbName: 'tenant_db',
      collectionName: 'orders',
    });

    expect(entry.meta).toMatchObject({
      runtime: 'test',
      operation: 'findOne',
    });

    await logger.shutdown?.();
  });
});