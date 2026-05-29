#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

function copyDirSync(srcDir, destDir) {
	if (!fs.existsSync(srcDir)) return false;
	if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
	const entries = fs.readdirSync(srcDir, { withFileTypes: true });
	for (const ent of entries) {
		const srcPath = path.join(srcDir, ent.name);
		const destPath = path.join(destDir, ent.name);
		if (ent.isDirectory()) {
			copyDirSync(srcPath, destPath);
		} else if (ent.isFile()) {
			fs.copyFileSync(srcPath, destPath);
		}
	}
	return true;
}

async function main() {
	const arg = process.argv[2] || 'packages/create';
	const pkgDir = path.resolve(arg);
	const distFontsDir = path.join(pkgDir, 'dist', 'fonts');

	let figletMain;
	try {
		figletMain = require.resolve('figlet');
	} catch (err) {
		console.error('Could not resolve `figlet` package. Make sure it is installed.');
		process.exit(0);
	}

	// The figlet package keeps fonts in a sibling "fonts" directory
	const figletFontsDir = path.join(path.dirname(figletMain), '..', 'fonts');

	if (!fs.existsSync(figletFontsDir)) {
		console.warn('figlet fonts directory not found; skipping copy.');
		process.exit(0);
	}

	const ok = copyDirSync(figletFontsDir, distFontsDir);
	if (ok) {
		console.log(`Copied figlet fonts to ${distFontsDir}`);
	} else {
		console.warn('No fonts copied');
	}
}

main();
