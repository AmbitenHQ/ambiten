/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */
const fs = require("fs");
const path = require("path");

const deployDir = process.argv[2];
if (!deployDir) {
  console.error("Usage: node scripts/patch-deploy-deps.js <deploy-dir>");
  process.exit(1);
}

const pkgPath = path.join(deployDir, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

const local = {
  "@tenra/adapter-types": "file:C:\\Users\\User\\Documents\\GitHub\\tenra\\packages\\adapter-types",
  "@tenra/core": "file:C:\\Users\\User\\Documents\\GitHub\\tenra\\packages\\core",
};

pkg.dependencies = pkg.dependencies || {};
for (const [name, fileRef] of Object.entries(local)) {
  if (pkg.dependencies[name]) pkg.dependencies[name] = fileRef;
}

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");
console.log("Patched dependencies to local file: refs in", pkgPath);
