import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Targets your compiled ESM build artifacts
const targetDir = path.resolve(__dirname, '../dist/esm');

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(getFiles(filePath));
    } else if (file.endsWith('.js')) {
      results.push(filePath);
    }
  });
  return results;
}

if (fs.existsSync(targetDir)) {
  const files = getFiles(targetDir);

  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    
    // 1. Regex to handle local imports/exports paths (e.g., from "./redis-manager")
    const importRegex = /(from\s+['"])(\.\.?\/[^'"]+?)(?=['"])/g;
    
    content = content.replace(importRegex, (match, quote, importPath) => {
      // If it already explicitly mentions an extension, leave it alone
      if (importPath.endsWith('.js') || importPath.endsWith('.json') || importPath.endsWith('.mjs')) {
        return match;
      }
      
      const absoluteTarget = path.resolve(path.dirname(file), importPath);
      
      // If the target path points to a directory folder, route it to /index.js
      if (fs.existsSync(absoluteTarget) && fs.statSync(absoluteTarget).isDirectory()) {
        return `${quote}${importPath}/index.js`;
      }
      
      // Otherwise, it's a file missing its `.js` extension
      return `${quote}${importPath}.js`;
    });

    // 2. Regex to search for .json file paths and inject the ESM 'with' attribute
    // Looks for statements like: import schema from "./config/schema.json";
    // Transforms it to: import schema from "./config/schema.json" with { type: "json" };
    const jsonAttributeRegex = /(import\s+[\s\S]*?from\s+['"]\.\.?\/[^'"]+?\.json['"])(?=\s*;)/g;
    
    content = content.replace(jsonAttributeRegex, (match) => {
      // Prevent duplicating the attribute if the script runs multiple times
      if (match.includes('with') || match.includes('assert')) {
        return match;
      }
      return `${match} with { type: "json" }`;
    });
    
    fs.writeFileSync(file, content, 'utf8');
  }
  console.log('✅ Updated ESM files: Injected explicit .js extensions and verified JSON import attributes.');
}
