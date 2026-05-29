#!/usr/bin/env node

const path = require('path');
const { spawnSync } = require('child_process');

const cliPath = path.resolve(__dirname, '../dist/tenra-core-cli.js');

const result = spawnSync(
  process.execPath,
  [cliPath, ...process.argv.slice(2)],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      TENRA_DISABLE_SIGNAL_HANDLERS: '1',
    },
  }
);

if (result.error) {
  console.error('Failed to launch Tenra CLI:', result.error);
  process.exit(1);
}

process.exit(result.status ?? 0);