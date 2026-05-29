import { TenraGC } from '../../gc';
import { TenraModelRegistry } from '../../utils/ModelRegistry';

describe('TenraGC (registry-driven)', () => {
  jest.setTimeout(10000);

  let errorSpy: jest.SpyInstance;
  let logSpy: jest.SpyInstance;

  afterEach(async () => {
    TenraModelRegistry.clear?.();

    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => { });
  });

  afterAll(async () => {
    errorSpy.mockRestore();
    logSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('should run GC on registered models', async () => {
    const runGC = jest.fn().mockResolvedValue(undefined);

    const mockModel = {
      runGC,
      getContext: () => ({
        ctx: {
          collectionName: 'posts'
        }
      })
    } as any;

    TenraModelRegistry.registerModel(mockModel);

    const gc = new TenraGC({
      enabled: true,
      logResults: true
    });

    const result = await gc.runOnce();

    expect(runGC).toHaveBeenCalledTimes(1);

    expect(result).toEqual({
      scanned: 1,
      succeeded: 1,
      failed: 0,
      models: [
        {
          collectionName: 'posts',
          success: true
        }
      ]
    });

    gc.stop();
  });

  it('should return empty result when GC is disabled', async () => {
    const runGC = jest.fn();

    const mockModel = {
      runGC,
      getContext: () => ({
        ctx: {
          collectionName: 'posts'
        }
      })
    } as any;

    TenraModelRegistry.registerModel(mockModel);

    const gc = new TenraGC({
      enabled: false
    });

    const result = await gc.runOnce();

    expect(runGC).not.toHaveBeenCalled();

    expect(result).toEqual({
      scanned: 0,
      succeeded: 0,
      failed: 0,
      models: []
    });

    gc.stop();
  });

  it('should continue when one model fails if continueOnError is true', async () => {
    const failedRunGC = jest.fn().mockRejectedValue(new Error('GC failed'));
    const successfulRunGC = jest.fn().mockResolvedValue(undefined);

    const failedModel = {
      runGC: failedRunGC,
      getContext: () => ({
        ctx: {
          collectionName: 'failed_posts'
        }
      })
    } as any;

    const successfulModel = {
      runGC: successfulRunGC,
      getContext: () => ({
        ctx: {
          collectionName: 'successful_posts'
        }
      })
    } as any;

    TenraModelRegistry.registerModel(failedModel);
    TenraModelRegistry.registerModel(successfulModel);

    const gc = new TenraGC({
      enabled: true,
      continueOnError: true
    });

    const result = await gc.runOnce();

    expect(failedRunGC).toHaveBeenCalledTimes(1);
    expect(successfulRunGC).toHaveBeenCalledTimes(1);

    expect(result.scanned).toBe(2);
    expect(result.succeeded).toBe(1);
    expect(result.failed).toBe(1);

    expect(result.models).toEqual([
      expect.objectContaining({
        collectionName: 'failed_posts',
        success: false
      }),
      expect.objectContaining({
        collectionName: 'successful_posts',
        success: true
      })
    ]);

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[GC] Failed on collection "failed_posts"'),
      expect.any(Error)
    );

    gc.stop();
  });

  it('should throw when one model fails if continueOnError is false', async () => {
    const failedRunGC = jest.fn().mockRejectedValue(new Error('GC failed'));

    const failedModel = {
      runGC: failedRunGC,
      getContext: () => ({
        ctx: {
          collectionName: 'failed_posts'
        }
      })
    } as any;

    TenraModelRegistry.registerModel(failedModel);

    const gc = new TenraGC({
      enabled: true,
      continueOnError: false
    });

    await expect(gc.runOnce()).rejects.toThrow('GC failed');

    expect(failedRunGC).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('[GC] Failed on collection "failed_posts"'),
      expect.any(Error)
    );

    gc.stop();
  });
});