import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const esmEntryUrl = new URL("../dist/esm/index.js", import.meta.url);
const esmEntryPath = fileURLToPath(esmEntryUrl);

console.log("Checking ESM entry:", esmEntryPath);

if (!existsSync(esmEntryPath)) {
  throw new Error(
    `Ambiten ESM entry was not found at:\n${esmEntryPath}\n` +
    "Run the ESM build before verifying exports."
  );
}

const esm = await import(esmEntryUrl.href);

const requiredExports = [
  "AmbitenBootstrapFactory",
  "AmbitenClient",
  "AmbitenContext",
  "AmbitenModel",
  "AmbitenSchema"
];

for (const exportName of requiredExports) {
  if (!(exportName in esm)) {
    throw new Error(`Missing ESM runtime export: ${exportName}`);
  }
}

console.log("Ambiten ESM exports verified successfully.");

// const esm = await import("");

// const requiredExports = [
//   "AmbitenBootstrapFactory",
//   "AmbitenClient",
//   "AmbitenModel",
//   "AmbitenSchema",
//   "AmbitenContext"
// ];

// for (const exportName of requiredExports) {
//   if (!(exportName in esm)) {
//     throw new Error(
//       `Missing ESM runtime export: ${exportName}`
//     );
//   }
// }

// const { createRequire } = await import("node:module");
// const require = createRequire(import.meta.url);

// const cjs = require("../dist/cjs/index.cjs");

// for (const exportName of requiredExports) {
//   if (!(exportName in cjs)) {
//     throw new Error(
//       `Missing CommonJS runtime export: ${exportName}`
//     );
//   }
// }

// console.log("Ambiten ESM and CommonJS exports verified.");