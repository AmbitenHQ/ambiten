#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */

const path = require('path');
const { spawnSync } = require('child_process');

const cliPath = path.resolve(__dirname, '../dist/index-cli.js');

const result = spawnSync(
  process.execPath,
  [cliPath, ...process.argv.slice(2)],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      Ambiten_DISABLE_SIGNAL_HANDLERS: '1',
    },
  }
);

if (result.error) {
  console.error('Failed to launch Ambiten CLI:', result.error);
  process.exit(1);
}

process.exit(result.status ?? 0);