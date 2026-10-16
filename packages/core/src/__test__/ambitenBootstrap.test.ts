import { AmbitenBootstrapFactory } from '../lib-core';
import { createBootstrapFixture } from './mock-helpers/bootstrapFixture';

describe('AmbitenBootstrapFactory', () => {
  let runtime:
    | Awaited<ReturnType<typeof AmbitenBootstrapFactory.create>>
    | undefined;

  afterEach(async () => {
    try {
      await runtime?.shutdown();
    } finally {
      runtime = undefined;
      jest.restoreAllMocks();
    }
  });

  it('creates and initializes the runtime through the public factory', async () => {
    const { config, provider } = createBootstrapFixture();

    runtime = await AmbitenBootstrapFactory.create({ config });

    expect(provider.connect).toHaveBeenCalledTimes(1);
    expect(runtime.getMongoClient()).toBe(provider);
    expect(runtime.getLogger()).toBeDefined();
    expect(runtime.getModel()).toBeDefined();
    expect(runtime.getSchema()).toBeDefined();

    expect(runtime.registerMultiTenancy).toEqual(
      expect.any(Function)
    );

    expect(runtime.shutdown).toEqual(expect.any(Function));

    await expect(
      runtime.registerMultiTenancy({})
    ).resolves.toBeUndefined();

    await runtime.shutdown();
    runtime = undefined;

    expect(provider.close).toHaveBeenCalledTimes(1);
  });

  it('returns a runtime rather than the factory itself', async () => {
    const { config } = createBootstrapFixture();

    runtime = await AmbitenBootstrapFactory.create({ config });

    expect(runtime.constructor.name).not.toBe(
      'AmbitenBootstrapFactory'
    );
  });
});