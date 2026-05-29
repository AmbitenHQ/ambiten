/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */
// ...existing code...
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

function resolveWebpackBin() {
    try {
        // Prefer normal Node resolution
        return require.resolve('webpack/bin/webpack.js');
    } catch (e) {}

    // Check common .bin locations (package-local or cwd)
    const binCandidates = [
        path.resolve(__dirname, '..', 'node_modules', '.bin', 'webpack'),
        path.resolve(process.cwd(), 'node_modules', '.bin', 'webpack'),
    ];
    for (const c of binCandidates) {
        if (fs.existsSync(c)) return c;
        if (fs.existsSync(c + '.cmd')) return c + '.cmd';
    }

    // Fallback: pnpm .pnpm layout under repo root
    const root = path.resolve(__dirname, '..');
    const pnpmDir = path.join(root, 'node_modules', '.pnpm');
    if (fs.existsSync(pnpmDir)) {
        const entries = fs.readdirSync(pnpmDir).filter(d => d.startsWith('webpack@'));
        for (const entry of entries) {
            const candidate = path.join(pnpmDir, entry, 'node_modules', 'webpack', 'bin', 'webpack.js');
            if (fs.existsSync(candidate)) return candidate;
        }
    }

    return null;
}

const args = process.argv.slice(2);
const webpackBin = resolveWebpackBin();

if (webpackBin) {
    // If it's a JS file, run with node; otherwise execute the bin (use shell for Windows .cmd)
    if (webpackBin.endsWith('.js')) {
        const res = spawnSync(process.execPath, [webpackBin, ...args], { stdio: 'inherit' });
        process.exit(res.status ?? 0);
    } else {
        const res = spawnSync(webpackBin, args, { stdio: 'inherit', shell: true });
        process.exit(res.status ?? 0);
    }
}

// Final fallback: let pnpm resolve and run webpack for us
const res = spawnSync('pnpm', ['exec', 'webpack', '--', ...args], { stdio: 'inherit', shell: true });
if (res.error) {
    console.error('Failed to run webpack via pnpm exec:', res.error);
    process.exit(res.status ?? 1);
}
process.exit(res.status ?? 0);