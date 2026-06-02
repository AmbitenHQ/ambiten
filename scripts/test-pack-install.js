#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

function run(cmd, args, opts = {}) {
	console.log('>', cmd, args.join(' '));
	const res = spawnSync(cmd, args, { stdio: 'inherit', ...opts });
	// If the command was not found, surface a friendly error (ENOENT)
	if (res.error) {
		if (res.error.code === 'ENOENT') {
			throw new Error(`${cmd} not found in PATH`);
		}
		throw res.error;
	}
	if (res.status !== 0) throw new Error(`${cmd} ${args.join(' ')} exited ${res.status}`);
}

function isCommandAvailable(cmd) {
	try {
		const res = spawnSync(cmd, ['--version'], { stdio: 'ignore' });
		if (res.error) {
			if (res.error.code === 'ENOENT') return false;
			// some other error, assume not available
			return false;
		}
		return res.status === 0 || res.status === null || typeof res.status === 'undefined';
	} catch (e) {
		return false;
	}
}

async function main() {
	const repoRoot = path.resolve(__dirname, '..');
	const pkgDir = path.join(repoRoot, 'packages', 'core');

	// 1) pack the package: try pnpm first, fall back to npm
	// Prefer pnpm, fall back to npm. If neither is available, abort with a helpful message.
	if (isCommandAvailable('pnpm')) {
		run('pnpm', ['pack'], { cwd: pkgDir });
	} else if (isCommandAvailable('npm')) {
		console.warn('pnpm not found; using npm pack');
		run('npm', ['pack'], { cwd: pkgDir });
	} else {
		console.error('Neither pnpm nor npm could be found in PATH. Install one of them and re-run this script.');
		process.exit(2);
	}

	// find the tarball
	const files = fs.readdirSync(pkgDir);
	const tar = files.find((f) => f.endsWith('.tgz'));
	if (!tar) throw new Error('pack tarball not found');
	const tarPath = path.join(pkgDir, tar);

	// 2) create a temp consumer dir and test `npm install` and `pnpm add`
	const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'Ambiten-test-'));
	console.log('Using temp dir', tmp);
	fs.writeFileSync(path.join(tmp, 'package.json'), JSON.stringify({ name: 'Ambiten-test', version: '0.0.0' }));

	// npm install
	if (isCommandAvailable('npm')) {
		try {
			run('npm', ['install', tarPath], { cwd: tmp });
			console.log('npm install succeeded');
		} catch (e) {
			console.error('npm install failed:', e && e.message);
		}
	} else {
		console.warn('npm not available — skipping npm install test');
	}

	// pnpm add
	if (isCommandAvailable('pnpm')) {
		try {
			run('pnpm', ['add', tarPath], { cwd: tmp });
			console.log('pnpm add succeeded');
		} catch (e) {
			console.error('pnpm add failed:', e && e.message);
		}
	} else {
		console.warn('pnpm not available — skipping pnpm add test');
	}

	console.log('Test completed. Temp dir:', tmp);
}

main().catch((e) => {
	console.error(e && e.stack ? e.stack : e);
	process.exit(1);
});
