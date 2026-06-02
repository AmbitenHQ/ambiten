import fs from 'fs-extra';
import path from 'path';
import type { AmbitenConfig } from '../../types';
import {
  colorize,
  createScaffoldLogger,
  detectPackageManager,
  installPackages
} from '../../utils';
import { generateMainTS } from '../generateMainEntry';
import { DEFAULT_CONFIG_CONTENT } from '../generateDefaultConfigContent';
import { generateGCManager } from '../generateGCManagerFile';
import { generateGCRunner } from '../generateGCRunnerFile';

function buildPackageJson(options: AmbitenConfig) {
  const dependencies: Record<string, string> = {
    '@ambiten/core': '^1.0.0',
    mongodb: '^6.14.2',
  };

  if (options.logger?.enabled) {
    dependencies['@ambiten/logger'] = '^1.0.0';
  }

  if (options.graphql?.enabled) {
    dependencies['graphql'] = '^16.11.0';
    dependencies['@apollo/server'] = '^5.1.0';
  }

  if (options.features?.useRedisCache) {
    dependencies['redis'] = '^4.7.1';
  }

  return {
    name: options.projectName ?? 'my-ambiten-app',
    description: 'A Ambiten-powered application',
    private: true,
    version: '1.0.0',
    type: 'commonjs',
    main: 'dist/main.js',
    scripts: {
      dev: 'ts-node src/main.ts',
      build: 'tsc',
      start: 'node dist/main.js',
    },
    license: 'ISC',
    dependencies,
    devDependencies: {
      typescript: '^5.9.3',
      'ts-node': '^10.9.2',
      '@types/node': '^22.15.30',
    },
  };
}

function buildTsConfig() {
  return {
    compilerOptions: {
      "target": "ES2021",
      "module": "commonjs",
      "moduleResolution": "node",
      "rootDir": './src',
      "outDir": './dist',
      "sourceMap": true,
      "declaration": true,
      "declarationMap": true,
      "esModuleInterop": true,
      "resolveJsonModule": true,
      "strict": true,
      "noImplicitAny": true,
      "noImplicitReturns": true,
      "noUncheckedIndexedAccess": true,
      "exactOptionalPropertyTypes": true,
      "forceConsistentCasingInFileNames": true,
      "skipLibCheck": true,

      types: ['node'],
      lib: ['ES2021']
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist']
  };
}

function generateInitAmbitenTS(): string {
  return `import { AmbitenBootstrapFactory } from '@ambiten/core';
import type { AmbitenRuntime } from '@ambiten/core';

export async function run(): Promise<AmbitenRuntime> {
  return AmbitenBootstrapFactory.create();
}
`;
}

function generateGraphqlStarterTS(): string {
  return `/**
 * Optional GraphQL starter file.
 *
 * Use this file if you want to separate GraphQL setup from your bootstrap flow.
 * If your bootstrap already initializes GraphQL, this file can be removed.
 */

export {};
`;
}

export async function generateAppStructure(
  projectRoot: string,
  options: AmbitenConfig,
  logger?: ReturnType<typeof createScaffoldLogger>
): Promise<void> {
  const srcDir = path.join(projectRoot, 'src');
  const coreDir = path.join(srcDir, 'core');
  const utilsDir = path.join(srcDir, 'utils');
  const typesDir = path.join(srcDir, 'types');
  const modelsDir = path.join(srcDir, 'models');
  const graphqlDir = path.join(srcDir, 'graphql');
  const gcDir = path.join(srcDir, 'gc');

  await fs.ensureDir(srcDir);
  logger?.addDir(srcDir);

  await fs.ensureDir(coreDir);
  logger?.addDir(coreDir);

  await fs.ensureDir(utilsDir);
  logger?.addDir(utilsDir);

  await fs.ensureDir(typesDir);
  logger?.addDir(typesDir);

  await fs.ensureDir(modelsDir);
  logger?.addDir(modelsDir);

  if (options.graphql?.enabled) {
    await fs.ensureDir(graphqlDir);
    logger?.addDir(graphqlDir);
  }

  if (options.advanced?.garbageCollector?.enabled) {
    await fs.ensureDir(gcDir);
    logger?.addDir(gcDir);
  }

  const mainPath = path.join(srcDir, 'main.ts');
  await fs.writeFile(mainPath, generateMainTS(options));
  logger?.addFile(mainPath);

  const initAmbitenPath = path.join(coreDir, 'initAmbiten.ts');
  await fs.writeFile(initAmbitenPath, generateInitAmbitenTS());
  logger?.addFile(initAmbitenPath);

  const helperPath = path.join(utilsDir, 'helper.ts');
  await fs.writeFile(helperPath, `export function noop(): void {}\n`);
  logger?.addFile(helperPath);

  const configTypesPath = path.join(typesDir, 'config.ts');
  await fs.writeFile(configTypesPath, `export {};\n`);
  logger?.addFile(configTypesPath);

  if (options.graphql?.enabled) {
    const schemaPath = path.join(graphqlDir, 'schema.gql');
    await fs.writeFile(
      schemaPath,
      `type Query {
  hello: String
}
`
    );
    logger?.addFile(schemaPath);

    const resolversPath = path.join(graphqlDir, 'resolvers.ts');
    await fs.writeFile(
      resolversPath,
      `export const resolvers = {
  Query: {
    hello: () => 'Hello, world!',
  },
};
`
    );
    logger?.addFile(resolversPath);

    await fs.writeFile(
      path.join(graphqlDir, 'graphql.ts'),
      generateGraphqlStarterTS()
    );
  }

  if (options.advanced?.garbageCollector?.enabled) {
    const gcManagerPath = path.join(gcDir, 'gcManager.ts');
    await fs.writeFile(gcManagerPath, generateGCManager());
    logger?.addFile(gcManagerPath);

    const gcRunnerPath = path.join(gcDir, 'gcRunner.ts');
    await fs.writeFile(gcRunnerPath, generateGCRunner());
    logger?.addFile(gcRunnerPath);
  }

  const configPath = path.join(projectRoot, 'ambiten.config.json');
  await fs.writeFile(configPath, DEFAULT_CONFIG_CONTENT(options));
  logger?.addFile(configPath);

  const packageJsonPath = path.join(projectRoot, 'package.json');
  await fs.writeJson(packageJsonPath, buildPackageJson(options), { spaces: 2 });
  logger?.addFile(packageJsonPath);

  const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
  await fs.writeJson(tsconfigPath, buildTsConfig(), { spaces: 2 });
  logger?.addFile(tsconfigPath);

  const gitignorePath = path.join(projectRoot, '.gitignore');
  await fs.writeFile(gitignorePath, `node_modules
dist
lib
.store
.env
`
  );
  logger?.addFile(gitignorePath);

  if (options.advanced?.autoInstall) {
    const packageManager = detectPackageManager(projectRoot);

    try {
      await installPackages([], projectRoot);

      console.log(
        colorize(
          `[Installing dependencies]: Installed project dependencies using ${packageManager}.`,
          'green'
        )
      );
    } catch (error) {
      console.log(
        colorize(
          '⚠️  Dependency installation failed or was interrupted. Skipping install.',
          'yellow'
        ),
        error
      );
    }
  } else {
    const packageManager = detectPackageManager(projectRoot);
    const installCommand =
      packageManager === 'npm'
        ? 'npm install'
        : `${packageManager} install`;

    console.log(
      colorize(
        '[Skipping install]: Set advanced.autoInstall=true to install dependencies automatically.',
        'blue'
      )
    );

    console.log(
      colorize(`[Next steps]: cd ${projectRoot} && ${installCommand}`, 'blue')
    );
  }
}