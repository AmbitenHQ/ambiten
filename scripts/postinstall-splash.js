#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');
const https = require('https');

// This script is intentionally simple and opt-in. It prints the curated
// `Ambiten-brand/extras/cli_splash.txt` file when the environment variable
// Ambiten_SHOW_SPLASH is truthy (1/true/yes). This keeps the postinstall
// behavior non-intrusive for consumers.

function isFalsy(v) {
  if (typeof v === 'undefined' || v === null) return false;
  return ['0', 'false', 'no'].includes(String(v).toLowerCase());
}

// If Ambiten_SHOW_SPLASH is explicitly set to a falsy value, skip showing the splash.
if (isFalsy(process.env.Ambiten_SHOW_SPLASH)) process.exit(0);

const splashPath = path.resolve(__dirname, '..', 'Ambiten-brand', 'extras', 'cli_splash.txt');
const GITHUB_RAW = 'https://raw.githubusercontent.com/Ambitenhq/Ambiten/main/Ambiten-brand/extras/cli_splash.txt';

function fetchWithHttps(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode && res.statusCode >= 400) {
          res.resume();
          return resolve(null);
        }
        let data = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
      })
      .on('error', () => resolve(null))
      .setTimeout(5000, function () {
        this.abort();
      });
  });
}

async function tryPrintLocalOrRemote() {
  try {
    if (fs.existsSync(splashPath)) {
      try {
        const txt = fs.readFileSync(splashPath, 'utf8');
        if (txt && txt.length > 0) console.log(txt);
        return;
      } catch (e) {
        // fallthrough to remote fetch
      }
    }

    // fallback: try to fetch from GitHub raw if network available
    // prefer global fetch when available (Node >=18), otherwise use https fallback
    let text = null;
    if (typeof fetch === 'function') {
      try {
        const res = await fetch(GITHUB_RAW, { timeout: 5000 });
        if (res && res.ok) text = await res.text();
      } catch (e) {
        text = null;
      }
    } else {
      text = await fetchWithHttps(GITHUB_RAW);
    }

    if (text && text.length > 10) {
      console.log(text);
      return;
    }
  } catch (err) {
    // ignore any errors during postinstall
  }

  // last-resort friendly message so postinstall doesn't fail or hang
  try {
    console.log('Ambiten: install complete. Set Ambiten_SHOW_SPLASH=1 to display CLI splash.');
  } catch (e) {
    // noop
  }
}

// Run it and exit quickly (postinstall should not block)
tryPrintLocalOrRemote().catch(() => { }).finally(() => {
  // allow process to exit normally
});
