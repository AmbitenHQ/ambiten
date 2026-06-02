/* eslint-disable */
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const assert = require('assert');

const tmpInput = path.join(__dirname, 'tmp_splash_input.txt');
const outPath = path.join('Ambiten-brand', 'extras', 'cli_splash.txt');
const plainOut = outPath.replace(/(\.txt)$/i, '.plain$1');
const origOut = outPath.replace(/(\.txt)$/i, '.orig$1');

// Prepare a minimal input
const sample = [
	'Ambiten — A runtime and context-aware framework for modern data systems.',
	'Built for Scalable Node.js Architectures',
	'https://github.com/Ambitenhq/Ambiten'
].join('\n') + '\n';
fs.writeFileSync(tmpInput, sample, 'utf8');

// Run the converter (write mode)
const res = cp.spawnSync(process.execPath, [path.join(__dirname, 'convert-splash-text.js'), tmpInput], { encoding: 'utf8' });
if (res.error) throw res.error;
if (res.status !== 0) {
	console.error('converter stderr:', res.stderr);
	throw new Error('converter failed');
}

// Verify outputs created
assert.ok(fs.existsSync(outPath), 'ANSI output exists');
assert.ok(fs.existsSync(plainOut), 'plain output exists');
assert.ok(fs.existsSync(origOut), 'orig output exists');

const plain = fs.readFileSync(plainOut, 'utf8');
// Ensure wordmark is present before the box (look for Ambiten literal)
assert.ok(plain.indexOf('Ambiten') !== -1, 'plain output contains wordmark');

console.log('splash test passed');

// cleanup
try { fs.unlinkSync(tmpInput); } catch (e) { void e; }
