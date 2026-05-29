#!/usr/bin/env node
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const cfgPath = path.join(process.cwd(), '.changeset', 'config.json');
let cfg = {};
if (fs.existsSync(cfgPath)) {
  cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
}

// Use either GH_TOKEN (custom) or GITHUB_TOKEN (actions-provided) if available
const hasGHToken = Boolean(process.env.GH_TOKEN || process.env.GITHUB_TOKEN);
if (hasGHToken) {
  // prefer GitHub changelog when a token is available
  if (process.env.GITHUB_REPOSITORY) {
    cfg.changelog = [
      '@changesets/changelog-github',
      { repo: process.env.GITHUB_REPOSITORY }
    ];
  } else {
    cfg.changelog = '@changesets/changelog-github';
  }
  fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2), 'utf8');
  console.log('Wrote changeset config to use GitHub changelog adapter');
} else {
  console.log('No GH token found (GH_TOKEN or GITHUB_TOKEN); leaving changeset config as-is (git adapter)');
}
