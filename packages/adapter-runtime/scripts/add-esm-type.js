const fs = require('fs');
const path = require('path');

const targetDir = path.resolve(__dirname, '../dist/esm');

// Safely create the folder if it doesn't exist yet, then write the file
fs.mkdirSync(targetDir, { recursive: true });
fs.writeFileSync(
  path.join(targetDir, 'package.json'), 
  JSON.stringify({ type: 'module' }, null, 2)
);
