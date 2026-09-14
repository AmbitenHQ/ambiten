const fs = require('fs');
const path = require('path');

const targetDir = path.resolve(__dirname, '../dist/esm');

fs.mkdirSync(targetDir, { recursive: true });
fs.writeFileSync(
  path.join(targetDir, 'package.json'), 
  JSON.stringify({ type: 'module' }, null, 2)
);



// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';

// // 1. Convert the current file URL to a normal folder path string
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // 2. Resolve the destination folder path safely
// const targetDir = path.resolve(__dirname, '../dist/esm');

// // 3. Create the folder if missing, then write the config file
// fs.mkdirSync(targetDir, { recursive: true });
// fs.writeFileSync(
//   path.join(targetDir, 'package.json'), 
//   JSON.stringify({ type: 'module' }, null, 2)
// );

