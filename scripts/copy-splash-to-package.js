#!/usr/bin/env node
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

// Copy the central CLI splash into the package so `pnpm pack` and `npm pack`
// include it in the published tarball. This keeps a single source of truth
// (Ambiten-brand/extras/cli_splash.txt) while ensuring the package contains
// the file at pack/publish time.

const repoRoot = path.resolve(__dirname, '..');
const source = path.join(repoRoot, 'Ambiten-brand', 'extras', 'cli_splash.txt');
const destDir = path.join(repoRoot, 'packages', 'core', 'brand');
const dest = path.join(destDir, 'cli_splash.txt');

function copyFile() {
	if (!fs.existsSync(source)) {
		console.warn('copy-splash-to-package: source splash not found:', source);
		return;
	}
	fs.mkdirSync(destDir, { recursive: true });
	fs.copyFileSync(source, dest);
	console.log('copy-splash-to-package: copied splash to', dest);
}

try {
	copyFile();
} catch (e) {
	console.warn('copy-splash-to-package: failed to copy splash', e && e.message);
	// do not fail the pack/publish flow
}
