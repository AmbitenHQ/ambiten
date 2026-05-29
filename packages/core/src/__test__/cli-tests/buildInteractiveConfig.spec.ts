import prompts from 'prompts';
import { confirm } from '@inquirer/prompts';
import { buildInteractiveConfig } from '../../cli/buildInteractiveConfig';

jest.mock('prompts');
jest.mock('@inquirer/prompts', () => ({
  confirm: jest.fn(),
}));

const mockedPrompts = prompts as jest.MockedFunction<typeof prompts>;
const mockedConfirm = confirm as jest.MockedFunction<typeof confirm>;

describe('buildInteractiveConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should build config from prompt answers when no flags are provided', async () => {
    mockedPrompts
      .mockResolvedValueOnce({
        projectName: 'my-app',
        uri: 'mongodb://localhost:27017/my-app',
        withGraphql: true,
        multiTenant: true,
        logger: true,
        withRedis: true,
        withGarbageCollector: true,
        install: true,
      })
      .mockResolvedValueOnce({
        proceed: true,
      });

    mockedConfirm.mockResolvedValue(true);

    const config = await buildInteractiveConfig(undefined, {});

    expect(config.projectName).toBe('my-app');
    expect(config.connection?.uri).toBe('mongodb://localhost:27017/my-app');
    expect(config.graphql?.enabled).toBe(true);
    expect(config.multiTenant?.enabled).toBe(true);
    expect(config.logger?.enabled).toBe(true);
    expect(config.features?.useRedisCache).toBe(true);
    expect(config.advanced?.garbageCollector?.enabled).toBe(true);
    expect(config.advanced?.autoInstall).toBe(true);
  });

  it('should use provided projectName argument instead of prompting for it', async () => {
    mockedPrompts
      .mockResolvedValueOnce({
        uri: 'mongodb://localhost:27017/custom-app',
        withGraphql: false,
        multiTenant: false,
        logger: true,
        withRedis: false,
        withGarbageCollector: false,
        install: false,
      })
      .mockResolvedValueOnce({
        proceed: true,
      });

    mockedConfirm.mockResolvedValue(true);

    const config = await buildInteractiveConfig('custom-app', {});

    expect(config.projectName).toBe('custom-app');
    expect(mockedPrompts).toHaveBeenCalled();
  });

  it('should allow flags to override prompt values', async () => {
    mockedPrompts
      .mockResolvedValueOnce({
        projectName: 'ignored-name',
        uri: 'mongodb://localhost:27017/from-prompt',
        withGraphql: false,
        multiTenant: false,
        logger: false,
        withRedis: false,
        withGarbageCollector: false,
        install: false,
      })
      .mockResolvedValueOnce({
        proceed: true,
      });

    mockedConfirm.mockResolvedValue(true);

    const config = await buildInteractiveConfig('my-app', {
      withGraphql: true,
      logger: true,
      withRedis: true,
      multiTenant: true,
      withGarbageCollector: true,
      install: true,
      uri: 'mongodb://localhost:27017/from-flag',
    });

    expect(config.projectName).toBe('my-app');
    expect(config.connection?.uri).toBe('mongodb://localhost:27017/from-flag');
    expect(config.graphql?.enabled).toBe(true);
    expect(config.multiTenant?.enabled).toBe(true);
    expect(config.logger?.enabled).toBe(true);
    expect(config.features?.useRedisCache).toBe(true);
    expect(config.advanced?.garbageCollector?.enabled).toBe(true);
    expect(config.advanced?.autoInstall).toBe(true);
  });

  it('should throw if user declines confirmation', async () => {
    mockedPrompts.mockResolvedValue({
      projectName: 'my-app',
      uri: 'mongodb://localhost:27017/my-app',
      withGraphql: false,
      multiTenant: false,
      logger: true,
      withRedis: false,
      withGarbageCollector: false,
      install: false,
    });

    mockedConfirm.mockResolvedValue(false);

    await expect(buildInteractiveConfig(undefined, {})).rejects.toThrow(
      'Project generation cancelled by user.'
    );
  });

  it('should normalize project name', async () => {
    mockedPrompts
      .mockResolvedValueOnce({
        projectName: 'My App',
        uri: 'mongodb://localhost:27017/my-app',
        withGraphql: false,
        multiTenant: false,
        logger: true,
        withRedis: false,
        withGarbageCollector: false,
        install: false,
      })
      .mockResolvedValueOnce({
        proceed: true,
      });

    mockedConfirm.mockResolvedValue(true);

    const config = await buildInteractiveConfig(undefined, {});

    expect(config.projectName).toBe('my-app');
  });
});