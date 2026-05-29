import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

export type PackageManager = 'pnpm' | 'npm' | 'yarn';

export function detectPackageManager(cwd = process.cwd()): PackageManager {
	if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
	if (fs.existsSync(path.join(cwd, 'yarn.lock'))) return 'yarn';
	if (fs.existsSync(path.join(cwd, 'package-lock.json'))) return 'npm';

	const userAgent = process.env.npm_config_user_agent ?? '';

	if (userAgent.includes('pnpm')) return 'pnpm';
	if (userAgent.includes('yarn')) return 'yarn';
	if (userAgent.includes('npm')) return 'npm';

	return 'npm';
}

export function getInstallCommand(
	manager: PackageManager,
	packages: string[]
): string[] {
	switch (manager) {
		case 'pnpm':
			return ['pnpm', ['add', ...packages].join(' ')];
		case 'yarn':
			return ['yarn', ['add', ...packages].join(' ')];
		case 'npm':
		default:
			return ['npm', ['install', ...packages].join(' ')];
	}
}

export async function installPackages(
  packages: string[] = [],
  cwd = process.cwd()
): Promise<void> {
  const manager = detectPackageManager(cwd);

  const args =
    packages.length === 0
      ? ['install']
      : manager === 'npm'
        ? ['install', ...packages]
        : ['add', ...packages];

  await new Promise<void>((resolve, reject) => {
    const child = spawn(manager, args, {
      cwd,
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    child.on('error', reject);

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `${manager} ${args.join(' ')} failed with exit code ${code}`
        )
      );
    });
  });
}