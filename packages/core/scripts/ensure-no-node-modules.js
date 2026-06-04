#!/usr/bin/env node
// const { execSync } = require('child_process');
// const path = require('path');
import { execSync as execSyncEsm } from 'child_process';
import path from 'path';

function run() {
  console.log('Checking package pack contents for node_modules...');
  try {
    // Use npm pack --dry-run to list files that would be included in the tarball
    const out = execSync('npm pack --dry-run', { encoding: 'utf8' });
    // npm pack --dry-run prints a list of files; search for any node_modules entries
    const lower = out.toLowerCase();
    if (lower.indexOf('node_modules') !== -1) {
      console.error('\nERROR: package pack would include node_modules files.');
      console.error('This often causes duplicate runtime modules (e.g. graphql) to be published.');
      console.error('Ensure your package.json "files" does not include node_modules and that you do not ship node_modules in the tarball.');
      console.error('\nPack output excerpt:\n');
      const lines = out.split(/\r?\n/).filter(Boolean);
      lines.slice(0, 200).forEach((l) => console.error(l));
      process.exit(1);
    }
    console.log('OK: pack would not include node_modules.');
  } catch (err) {
    console.error('Failed to run npm pack --dry-run:', err && (err.message || err));
    process.exit(1);
  }
}

run();
