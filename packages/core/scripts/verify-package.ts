import fs from 'fs';
import path from 'path';

const root = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const errors: string[] = [];

function checkFileExists(relPath: string) {
  const fullPath = path.join(root, relPath);
  if (!fs.existsSync(fullPath)) errors.push(`Missing file: ${relPath}`);
}

console.log('🧪 Verifying Ambiten core publish configuration...');

checkFileExists(pkg.main || 'dist/index.js');
checkFileExists(pkg.types || 'dist/index.d.ts');

if (pkg.exports) {
  for (const [subpath, mapping] of Object.entries(pkg.exports)) {
    if (typeof mapping === 'object' && mapping !== null) {
      for (const key of ['require', 'import', 'types']) {
        if ((mapping as Record<string, string>)[key])
          checkFileExists((mapping as Record<string, string>)[key]);
      }
    }
  }
}

if (pkg.bin) {
  for (const name in pkg.bin) {
    checkFileExists(pkg.bin[name]);
  }
}

checkFileExists('README.md');

if (errors.length > 0) {
  console.error('❌ Publish validation failed:\n' + errors.map(e => `- ${e}`).join('\n'));
  process.exit(1);
}

console.log('✅ Publish configuration looks good.');
