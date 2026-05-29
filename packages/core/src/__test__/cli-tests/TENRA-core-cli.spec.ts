
import { generateProject } from '../../init-cli/generate.project';
import { buildInteractiveConfig } from '../../cli/buildInteractiveConfig';
import runBootstrapCLI from '../../cli/tenra-core-cli';

jest.mock('../../init-cli/generate.project', () => ({
  generateProject: jest.fn(),
}));

jest.mock('../../cli/buildInteractiveConfig', () => ({
  buildInteractiveConfig: jest.fn(),
}));

describe('tenra-core-cli', () => {
  const originalArgv = process.argv;

  beforeEach(() => {
    jest.clearAllMocks();
    process.argv = ['node', 'tenra', 'init', 'my-app'];
  });

  afterEach(() => {
    process.argv = originalArgv;
  });

  it('should build config and call generateProject for init command', async () => {
    (buildInteractiveConfig as jest.Mock).mockResolvedValue({
      projectName: 'my-app',
      connection: {
        uri: 'mongodb://localhost:27017/my-app',
      },
    });

    (generateProject as jest.Mock).mockResolvedValue(undefined);

    await runBootstrapCLI();

    expect(buildInteractiveConfig).toHaveBeenCalledWith(
      'my-app',
      expect.any(Object)
    );
    expect(generateProject).toHaveBeenCalled();
  });
});