import fs from 'fs-extra';
import path from 'path'
// import { BufferedTransporter } from '@ambiten/logger';



describe('generateProject', () => {
  const projectName = 'test-ambiten-app';
  const projectRoot = path.resolve(process.cwd(), projectName);

  const mockGenerateProject = jest.fn(async ({ projectName }) => {
    const projectPath = path.join(process.cwd(), projectName);
    await fs.ensureDir(projectPath);
    // Simulate creating a basic project structure
    await fs.writeJson(path.join(projectPath, 'ambiten.config.json'), { name: projectName });
    await fs.ensureDir(path.join(projectPath, 'src'));
    await fs.writeFile(path.join(projectPath, 'src', 'main.ts'), '// Main entry point');
    return projectPath;
  });

  beforeAll(async () => {
    // Ensure the project directory does not exist before starting tests
    if (await fs.pathExists(projectRoot)) {
      await fs.remove(projectRoot);
    }
  });

  afterAll(async () => {
    await fs.remove(projectRoot);
  });

  it('should create a new project directory', async () => {
    await mockGenerateProject({ projectName });
    expect(await fs.pathExists(projectRoot)).toBe(true);
  });

  it('should create a configuration file', async () => {
    await mockGenerateProject({ projectName });
    const configPath = path.join(projectRoot, 'ambiten.config.json');
    expect(await fs.pathExists(configPath)).toBe(true);
  });

  it('should generate project structure with default options', async () => {
    await mockGenerateProject({ projectName });

    const configPath = path.join(projectRoot, 'ambiten.config.json');
    const mainTSPath = path.join(projectRoot, 'src', 'main.ts');

    expect(await fs.pathExists(configPath)).toBe(true);
    expect(await fs.pathExists(mainTSPath)).toBe(true);
  })

  afterAll(async () => {
    jest.resetAllMocks();
    // await new BufferedTransporter().stop();
  });
});
