#!/usr/bin/env node
import { Command } from 'commander';
import { generateProject } from '../init-cli/generate.project';
import { buildInteractiveConfig } from './buildInteractiveConfig';
import type { BootstrapCliOptions } from './types';

export async function runBootstrapCLI(argv = process.argv) {
  const program = new Command();

  program
    .name('ambiten')
    .description('Ambiten CLI')
    .version('1.0.0', '-v, --version', 'Output the current CLI version');

  program
    .command('init')
    .description('Initialize an Ambiten-powered project')
    .argument('[projectName]', 'Name of the project')
    .option('--with-graphql', 'Include GraphQL starter support')
    .option('--with-redis', 'Enable Redis cache defaults')
    .option('--schema', 'Configure bootstrap schema definitions')
    .option('--no-schema', 'Skip bootstrap schema configuration')
    .option('--model', 'Configure bootstrap model options')
    .option('--no-model', 'Skip bootstrap model configuration')
    .option('--logger', 'Enable logger configuration')
    .option('--multi-tenant', 'Enable multi-tenant mode')
    .option('--uri <mongodbUri>', 'MongoDB connection URI')
    .option('--rbac', 'Reserved for future RBAC scaffolding')
    .option('--with-garbage-collector', 'Enable garbage collector starter files')
    .option('--install', 'Auto-install dependencies after scaffolding')
    .action(async (projectName: string | undefined, options: BootstrapCliOptions) => {
      try {
        if (options.rbac) {
          throw new Error(
            '--rbac is reserved but is not yet implemented.'
          );
        }
        const config = await buildInteractiveConfig(projectName, options);
        await generateProject(config);
      } catch (error) {
        console.error(
          '[Ambiten CLI] Failed to initialize project:',
          error
        );
        process.exitCode = 1;
      }
    });

  await program.parseAsync(argv);
}

export default runBootstrapCLI;

if (require.main === module) {
  void runBootstrapCLI(process.argv);
};
