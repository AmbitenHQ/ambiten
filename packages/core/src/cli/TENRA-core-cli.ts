#!/usr/bin/env node
import { Command } from 'commander';
import { generateProject } from '../init-cli/generate.project';
import { buildInteractiveConfig } from './buildInteractiveConfig';
import type { BootstrapCliOptions } from './types';

export async function runBootstrapCLI(argv = process.argv) {
  const program = new Command();

  program
    .name('tenra')
    .description('Tenra CLI')
    .version('1.0.0', '-v, --version', 'Output the current CLI version');

  program
    .command('init')
    .description('Initialize an Tenra-powered project')
    .argument('[projectName]', 'Name of the project')
    .option('--with-graphql', 'Include GraphQL starter support')
    .option('--with-redis', 'Enable Redis cache defaults')
    .option('--logger', 'Enable logger configuration')
    .option('--multi-tenant', 'Enable multi-tenant mode')
    .option('--uri <mongodbUri>', 'MongoDB connection URI')
    .option('--rbac', 'Reserve RBAC feature scaffolding')
    .option('--with-garbage-collector', 'Enable garbage collector starter files')
    .option('--install', 'Auto-install dependencies after scaffolding')
    .action(async (projectName: string | undefined, options: BootstrapCliOptions) => {
      try {
        const config = await buildInteractiveConfig(projectName, options);
        await generateProject(config);
      } catch (error) {
        console.error('[Tenra CLI] Failed to initialize project:', error);
        process.exit(1);
      }
    });

  await program.parseAsync(argv);
}

export default runBootstrapCLI;

if (require.main === module) {
  void runBootstrapCLI(process.argv);
}