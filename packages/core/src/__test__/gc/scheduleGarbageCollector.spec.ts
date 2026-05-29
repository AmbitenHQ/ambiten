import cron from 'node-cron';
import { scheduleGarbageCollector, runGarbageCollectorOnAllModels } from '../../gc';
import { TenraModelRegistry } from '../../utils/ModelRegistry';
// import { bufferedTransporter } from '../../utils';

jest.mock('node-cron', () => ({
  schedule: jest.fn()
}));

jest.mock('../../utils/ModelRegistry', () => ({
  TenraModelRegistry: {
    getAllModels: jest.fn()
  }
}));

jest.mock('../../gc/gcManager', () => ({
  runGarbageCollectorOnAllModels: jest.fn()
}));

describe('scheduleGarbageCollector', () => {
  let cronCallback: (() => Promise<void>) | undefined;

  beforeEach(() => {
    jest.clearAllMocks();

    cronCallback = undefined;

    (cron.schedule as jest.Mock).mockImplementation(
      (_expr: string, cb: () => Promise<void>) => {
        cronCallback = cb;
        return {
          stop: jest.fn()
        } as any;
      }
    );

    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    // await bufferedTransporter.stop();
  });

  it('should schedule the garbage collector with the provided cron expression', () => {
    scheduleGarbageCollector('0 * * * *');

    expect(cron.schedule).toHaveBeenCalledWith(
      '0 * * * *',
      expect.any(Function)
    );
  });

  it('should use the default cron expression when none is provided', () => {
    scheduleGarbageCollector();

    expect(cron.schedule).toHaveBeenCalledWith(
      '0 * * * *',
      expect.any(Function)
    );
  });

  it('should run garbage collector when registered models exist', async () => {
    const mockModel = {
      getContext: jest.fn().mockReturnValue({
        ctx: { collectionName: 'users' }
      })
    };

    (TenraModelRegistry.getAllModels as jest.Mock).mockReturnValue([mockModel]);
    (runGarbageCollectorOnAllModels as jest.Mock).mockResolvedValue({
      scanned: 1,
      succeeded: 1,
      failed: 0,
      models: [
        {
          collectionName: 'users',
          success: true
        }
      ]
    });

    scheduleGarbageCollector('*/5 * * * *');

    expect(cronCallback).toBeDefined();

    await cronCallback!();

    expect(TenraModelRegistry.getAllModels).toHaveBeenCalledTimes(1);
    expect(runGarbageCollectorOnAllModels).toHaveBeenCalledWith({
      ctx: undefined,
      continueOnError: true
    });
  });

  it('should skip when no registered models exist', async () => {
    (TenraModelRegistry.getAllModels as jest.Mock).mockReturnValue([]);

    scheduleGarbageCollector();

    expect(cronCallback).toBeDefined();

    await cronCallback!();

    expect(TenraModelRegistry.getAllModels).toHaveBeenCalledTimes(1);
    expect(runGarbageCollectorOnAllModels).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalled();
  });

  it('should no longer skip models only because context is missing', async () => {
    const modelWithoutContext = {
      getContext: jest.fn().mockReturnValue(undefined)
    };

    (TenraModelRegistry.getAllModels as jest.Mock).mockReturnValue([
      modelWithoutContext
    ]);

    (runGarbageCollectorOnAllModels as jest.Mock).mockResolvedValue({
      scanned: 1,
      succeeded: 1,
      failed: 0,
      models: [
        {
          collectionName: undefined,
          success: true
        }
      ]
    });

    scheduleGarbageCollector();

    await cronCallback!();

    expect(runGarbageCollectorOnAllModels).toHaveBeenCalledTimes(1);
  });

  it('should log an error when garbage collector execution fails', async () => {
    const mockModel = {
      getContext: jest.fn().mockReturnValue({
        ctx: { collectionName: 'users' }
      })
    };

    const error = new Error('GC failed');

    (TenraModelRegistry.getAllModels as jest.Mock).mockReturnValue([mockModel]);
    (runGarbageCollectorOnAllModels as jest.Mock).mockRejectedValue(error);

    scheduleGarbageCollector();

    await cronCallback!();

    expect(runGarbageCollectorOnAllModels).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalled();
  });

  it('should pass scheduler options to the garbage collector manager', async () => {
    const ctx = {
      tenantId: 'tenant-a',
      dbName: 'tenant-db'
    };

    (TenraModelRegistry.getAllModels as jest.Mock).mockReturnValue([
      {
        getContext: jest.fn().mockReturnValue({
          ctx: { collectionName: 'users' }
        })
      }
    ]);

    (runGarbageCollectorOnAllModels as jest.Mock).mockResolvedValue({
      scanned: 1,
      succeeded: 1,
      failed: 0,
      models: []
    });

    scheduleGarbageCollector({
      cronExpr: '*/10 * * * *',
      ctx,
      continueOnError: false
    });

    await cronCallback!();

    expect(cron.schedule).toHaveBeenCalledWith(
      '*/10 * * * *',
      expect.any(Function)
    );

    expect(runGarbageCollectorOnAllModels).toHaveBeenCalledWith({
      ctx,
      continueOnError: false
    });
  });

  it('should process multiple registered models through one manager call', async () => {
    const modelA = {
      getContext: jest.fn().mockReturnValue({
        ctx: { collectionName: 'users' }
      })
    };

    const modelB = {
      getContext: jest.fn().mockReturnValue({
        ctx: { collectionName: 'orders' }
      })
    };

    (TenraModelRegistry.getAllModels as jest.Mock).mockReturnValue([
      modelA,
      modelB
    ]);

    (runGarbageCollectorOnAllModels as jest.Mock).mockResolvedValue({
      scanned: 2,
      succeeded: 2,
      failed: 0,
      models: [
        {
          collectionName: 'users',
          success: true
        },
        {
          collectionName: 'orders',
          success: true
        }
      ]
    });

    scheduleGarbageCollector();

    await cronCallback!();

    expect(runGarbageCollectorOnAllModels).toHaveBeenCalledTimes(1);
  });
});