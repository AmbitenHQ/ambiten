import path from 'path';
import { colorize } from './color-palatte';
import type { TenraConfig } from '../types';

export interface ScaffoldLog {
  files: string[];
  dirs: string[];
}

export function createScaffoldLogger(projectRoot: string) {
  const log: ScaffoldLog = {
    files: [],
    dirs: [],
  };

  const normalize = (p: string) =>
    path.relative(projectRoot, p).replace(/\\/g, '/');

  return {
    addFile(filePath: string) {
      log.files.push(normalize(filePath));
    },

    addDir(dirPath: string) {
      log.dirs.push(normalize(dirPath) + '/');
    },

    printSummary(projectName: string, options: TenraConfig, durationMs: number) {
      const enabledFeatures = [
        options.multiTenant?.enabled ? 'Multi-tenancy' : null,
        options.graphql?.enabled ? 'GraphQL' : null,
        options.logger?.enabled ? 'Logger' : null,
        options.features?.useRedisCache ? 'Redis Cache' : null,
        options.advanced?.garbageCollector?.enabled ? 'Garbage Collector' : null,
      ].filter(Boolean) as string[];

      const disabledFeatures = [
        !options.multiTenant?.enabled ? 'Multi-tenancy' : null,
        !options.graphql?.enabled ? 'GraphQL' : null,
        !options.logger?.enabled ? 'Logger' : null,
        !options.features?.useRedisCache ? 'Redis Cache' : null,
        !options.advanced?.garbageCollector?.enabled ? 'Garbage Collector' : null,
      ].filter(Boolean) as string[];

      const seconds = (durationMs / 1000).toFixed(2);

      console.log('');
      console.log(colorize(`✔ Project scaffold completed in ${seconds}s`, 'green'));
      console.log('');

      if (log.dirs.length) {
        console.log(colorize('Directories:', 'blue'));
        log.dirs.forEach((d) => {
          console.log(colorize(`  + ${d}`, 'green'));
        });
        console.log('');
      }

      if (log.files.length) {
        console.log(colorize('Files:', 'blue'));
        log.files.forEach((f) => {
          console.log(colorize(`  + ${f}`, 'green'));
        });
        console.log('');
      }

      console.log(colorize('Feature summary:', 'blue'));
      enabledFeatures.forEach((feature) => {
        console.log(colorize(`  ✓ ${feature}`, 'green'));
      });
      disabledFeatures.forEach((feature) => {
        console.log(colorize(`  ✗ ${feature}`, 'yellow'));
      });
      console.log('');

      console.log(colorize('Next steps:', 'blue'));
      console.log(colorize(`  cd ${projectName}`, 'green'));
      console.log(colorize(`  pnpm install`, 'green'));
      console.log(colorize(`  pnpm dev`, 'green'));
      console.log('');
    },
  };
}