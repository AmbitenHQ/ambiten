const { spawnSync } = require('node:child_process');

let jestEntry;

try {
  jestEntry = require.resolve('jest/bin/jest', {
    paths: [process.cwd()],
  });
} catch (error) {
  console.error('Cannot resolve Jest from the current package.');
  console.error(error.message);
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  [
    '--experimental-vm-modules',
    jestEntry,
    ...process.argv.slice(2),
  ],
  {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'inherit',
    windowsHide: true,
  }
);

if (result.error) {
  console.error(result.error);
  process.exit(1);
}

process.exit(result.status ?? 1);



// const { spawnSync } = require("node:child_process");

// // Resolve Jest from the package running this script, including pnpm workspaces.
// let jestEntry;
// try {
//   jestEntry = require.resolve("jest/bin/jest", { paths: [process.cwd()] });
// } catch (error) {
//   console.error(
//     "Cannot resolve Jest from the current package. Install its test dependencies first.",
//   );
//   console.error(error.message);
//   process.exit(1);
// }

// const result = spawnSync(
//   process.execPath,
//   ["--experimental-vm-modules", jestEntry, ...process.argv.slice(2)],
//   { cwd: process.cwd(), env: process.env, stdio: "inherit", windowsHide: true },
// );

// if (result.error) {
//   console.error(result.error);
//   process.exit(1);
// }
// if (result.signal) {
//   console.error(`Jest stopped by signal ${result.signal}.`);
// }
// process.exit(result.status ?? 1);
