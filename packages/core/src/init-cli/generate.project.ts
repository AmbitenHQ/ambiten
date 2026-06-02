import fs from 'fs-extra';
import path from 'path';
import { generateAppStructure } from '../templates';
import { createScaffoldLogger, colorize } from '../utils';
import type { AmbitenConfig } from '../types';

export interface GeneratedProjectResult {
  projectRoot: string;
  configPath: string;
  entryFilePath: string;
}

export async function generateProject(
  options: AmbitenConfig
): Promise<GeneratedProjectResult> {
  const startedAt = Date.now();

  const projectName = options.projectName?.trim() || 'Ambiten-app';
  const projectRoot = path.resolve(process.cwd(), projectName);
  const configPath = path.join(projectRoot, 'Ambiten.config.json');
  const entryFilePath = path.join(projectRoot, 'src', 'main.ts');

  console.log(colorize(`\n🚀 Creating project "${projectName}"`, 'green'));
  console.log(colorize(`📁 Location: ${projectRoot}\n`, 'blue'));

  await fs.ensureDir(projectRoot);

  const logger = createScaffoldLogger(projectRoot);

  const resolvedOptions: AmbitenConfig = {
    ...options,
    projectName,
  };

  await generateAppStructure(projectRoot, resolvedOptions, logger);

  const durationMs = Date.now() - startedAt;
  logger.printSummary(projectName, resolvedOptions, durationMs);

  return {
    projectRoot,
    configPath,
    entryFilePath,
  };
}

export async function generateProjectWithConfig(
  config: AmbitenConfig
): Promise<GeneratedProjectResult> {
  return generateProject({
    ...config,
    projectName: config.projectName || 'Ambiten-app',
  });
}