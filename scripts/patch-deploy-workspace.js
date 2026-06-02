/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */
const fs = require("fs");
const path = require("path");

const deployDir = process.argv[2];
if (!deployDir) {
  console.error("Usage: node scripts/patch-deploy-workspace.js <deploy-dir>");
  process.exit(1);
}

const pkgPath = path.join(deployDir, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));

// hardcode known versions (or read them dynamically from monorepo)
const versions = {
  "@Ambiten/adapter-types": "1.0.0",
  "@Ambiten/core": "1.0.0",
  "@Ambiten/logger": "1.0.0",
};

function patchDeps(obj) {
  if (!obj) return;
  for (const [name, ver] of Object.entries(obj)) {
    if (ver === "workspace:*" && versions[name]) {
      obj[name] = versions[name];
    }
  }
}

patchDeps(pkg.dependencies);
patchDeps(pkg.devDependencies);
patchDeps(pkg.optionalDependencies);
patchDeps(pkg.peerDependencies);

fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n", "utf8");
console.log("Patched workspace:* versions in", pkgPath);
