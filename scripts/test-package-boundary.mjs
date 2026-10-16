import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packages = ["adapter-types", "core", "adapter-runtime", "adapter-express"];
const packageIds = packages.map((name) => "@ambiten/" + name);
const artifactsDir = path.join(root, ".integration-artifacts");

function run(command, args, cwd, capture = false, options = {}) {
  const result = spawnSync(command, args, {
    cwd,
    env: process.env,
    encoding: "utf8",
    stdio: capture ? "pipe" : "inherit",
    windowsHide: true,
    ...options,
  });
  if (result.error) {
    throw new Error(`Unable to start ${command}: ${result.error.message}`, {
      cause: result.error,
    });
  }
  if (result.status !== 0) {
    if (capture) {
      if (result.stdout) process.stdout.write(result.stdout);
      if (result.stderr) process.stderr.write(result.stderr);
    }
    throw new Error(
      `Command failed (${result.status ?? result.signal}): ${command} ${args.join(" ")}`
    );
  }
  return result;
}

function runPnpm(args, cwd, capture = false) {
  // npm_execpath is optional: pnpm exec does not always provide it.
  // Prefer a direct entrypoint when one is available.
  const entry = process.env.npm_execpath;
  if (entry && /pnpm/i.test(entry) && existsSync(entry)) {
    if (/\.(?:c?js|mjs)$/i.test(entry)) {
      return run(process.execPath, [entry, ...args], cwd, capture);
    }
    if (/\.exe$/i.test(entry)) {
      return run(entry, args, cwd, capture);
    }
  }
  if (process.platform === "win32") {
    // A .cmd shim needs cmd.exe. Quote each argument, including paths
    // containing spaces, and disable command-processor AutoRun hooks.
    const quote = (value) => {
      const text = String(value);
      if (/["%\r\n]/.test(text)) {
        throw new Error("Unsupported character in pnpm command argument: " + text);
      }
      return '"' + text.replace(/(\\+)$/, "$1$1") + '"';
    };
    const commandLine = ["pnpm.cmd", ...args].map(quote).join(" ");
    return run(
      process.env.ComSpec || "cmd.exe",
      ["/d", "/s", "/v:off", "/c", '"' + commandLine + '"'],
      cwd,
      capture,
      { windowsVerbatimArguments: true }
    );
  }
  return run("pnpm", args, cwd, capture);
}

function toFileSpecifier(filename) {
  return "file:" + filename.replace(/\\/g, "/");
}

function findPackage(prefix) {
  const matches = readdirSync(artifactsDir).filter(
    (file) => file.startsWith(prefix) && file.endsWith(".tgz")
  );
  assert.equal(matches.length, 1, `Expected exactly one tarball for ${prefix}`);
  return path.join(artifactsDir, matches[0]);
}

function fixtureSource(format) {
  const header = format === "esm" ? String.raw`
import assert from "node:assert/strict";
import { once } from "node:events";
const resolvePackage = (id) => import.meta.resolve(id);
const loadPackage = (id) => import(id);
` : String.raw`
const assert = require("node:assert/strict");
const { once } = require("node:events");
const resolvePackage = (id) => require.resolve(id);
const loadPackage = (id) => require(id);
`;

  // String.raw avoids double-escaping regular expressions and fixture code.
  const expected = format === "esm" ? String.raw`{
    "@ambiten/core": /[\\/]dist[\\/]esm[\\/]index\.js$/,
    "@ambiten/adapter-types": /[\\/]dist[\\/]esm[\\/]index\.js$/,
    "@ambiten/adapter-runtime": /[\\/]dist[\\/]esm[\\/]index\.js$/,
    "@ambiten/adapter-express": /[\\/]dist[\\/]esm[\\/]index\.js$/,
  }` : String.raw`{
    "@ambiten/core": /[\\/]dist[\\/]cjs[\\/]index\.cjs$/,
    "@ambiten/adapter-types": /[\\/]dist[\\/]cjs[\\/]index\.js$/,
    "@ambiten/adapter-runtime": /[\\/]dist[\\/]cjs[\\/]index\.js$/,
    "@ambiten/adapter-express": /[\\/]dist[\\/]cjs[\\/]index\.js$/,
  }`;

  const configuration = "\nconst expected = " + expected + ";\n" +
    "const tenantId = " + JSON.stringify("tenant-" + format) + ";\n";

  return header + configuration + String.raw`
async function main() {
  // Print ALL entrypoints before loading packages. Static package imports
  // would fail before these useful diagnostics can run.
  for (const [id, pattern] of Object.entries(expected)) {
    const resolved = resolvePackage(id);
    console.log(id + " -> " + resolved);
    assert.match(resolved, pattern, "Wrong conditional export for " + id);
  }

  // Load adapter-types explicitly, before adapters can import it transitively.
  await loadPackage("@ambiten/adapter-types");
  const { AmbitenContext } = await loadPackage("@ambiten/core");
  const { getAdapterRuntimeContext } = await loadPackage("@ambiten/adapter-runtime");
  const { createExpressAdapter } = await loadPackage("@ambiten/adapter-express");
  const expressModule = await loadPackage("express");
  const express = expressModule.default ?? expressModule;

  const app = express();
  const adapter = createExpressAdapter();
  await adapter.install(app, {
    tenancy: {
      header: "x-tenant-id",
      validate(value) { return value === tenantId; },
    },
  });

  app.get("/context", async (_req, res, next) => {
    try {
      // Verify request context propagation through an async boundary.
      await new Promise((resolve) => setTimeout(resolve, 10));
      const applicationContext = AmbitenContext.get();
      const adapterContext = getAdapterRuntimeContext();
      res.json({
        applicationTenant: applicationContext.tenantId,
        adapterTenant: adapterContext.tenantId,
      });
    } catch (error) {
      next(error);
    }
  });

  const server = app.listen(0, "127.0.0.1");
  try {
    await once(server, "listening");
    const address = server.address();
    assert.ok(address && typeof address === "object");
    const response = await fetch("http://127.0.0.1:" + address.port + "/context", {
      headers: { "x-tenant-id": tenantId },
      signal: AbortSignal.timeout(10000),
    });
    const bodyText = await response.text();
    assert.equal(response.status, 200, bodyText);
    assert.deepEqual(JSON.parse(bodyText), {
      applicationTenant: tenantId,
      adapterTenant: tenantId,
    });
    console.log("Package-boundary context test passed: " + tenantId);
  } finally {
    if (server.listening) {
      await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
        server.closeAllConnections();
      });
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
`;
}

function createFixture(integrationRoot, format, specifications, pnpmMajor) {
  const directory = path.join(integrationRoot, format);
  const sourceName = format === "esm" ? "index.mjs" : "index.cjs";
  mkdirSync(directory, { recursive: true });
  const manifest = {
    name: "ambiten-integration-" + format,
    private: true,
    type: format === "esm" ? "module" : "commonjs",
    dependencies: { ...specifications, express: "^5.2.1" },
  };
  // Override ALL four packages, including adapter-types transitively.
  // pnpm <=10 reads this from package.json; pnpm >=11 uses workspace YAML.
  if (pnpmMajor < 11) {
    manifest.pnpm = { overrides: { ...specifications } };
  }
  writeFileSync(path.join(directory, "package.json"),
    JSON.stringify(manifest, null, 2) + "\n");

  // Give each temporary fixture its own pnpm workspace root.
  let workspace = "packages:\n  - '.'\n";
  if (pnpmMajor >= 11) {
    workspace += "overrides:\n" + Object.entries(specifications).map(
      ([id, spec]) => "  " + JSON.stringify(id) + ": " + JSON.stringify(spec)
    ).join("\n") + "\n";
  }
  writeFileSync(path.join(directory, "pnpm-workspace.yaml"), workspace);
  writeFileSync(path.join(directory, sourceName), fixtureSource(format));
  return { directory, sourceName };
}

let integrationRoot;
let succeeded = false;
try {
  const version = runPnpm(["--version"], root, true).stdout.trim();
  const pnpmMajor = Number(version.split(".")[0]);
  assert.ok(Number.isInteger(pnpmMajor) && pnpmMajor > 0,
    "Could not determine pnpm version: " + version);
  console.log("Using pnpm " + version);

  // Use existing package build scripts, including adapter-types' ESM fixer.
  // --skip-build is for callers that already completed a full build.
  if (!process.argv.includes("--skip-build")) {
    for (const name of packages) {
      console.log("\nBuilding @ambiten/" + name + "...");
      runPnpm(["--dir", path.join(root, "packages", name), "run", "build"], root);
    }
  }

  rmSync(artifactsDir, { recursive: true, force: true });
  mkdirSync(artifactsDir, { recursive: true });
  for (const name of packages) {
    console.log("\nPacking @ambiten/" + name + "...");
    runPnpm(["--dir", path.join(root, "packages", name), "pack",
      "--pack-destination", artifactsDir], root);
  }
  const specifications = Object.fromEntries(packages.map((name) => [
    "@ambiten/" + name,
    toFileSpecifier(findPackage("ambiten-" + name + "-")),
  ]));

  integrationRoot = mkdtempSync(path.join(tmpdir(), "ambiten-package-integration-"));
  for (const format of ["esm", "cjs"]) {
    const fixture = createFixture(integrationRoot, format, specifications, pnpmMajor);
    console.log("\nInstalling " + format + " fixture...");
    runPnpm(["install", "--no-frozen-lockfile"], fixture.directory);
    runPnpm(["why", "@ambiten/adapter-types"], fixture.directory);
    console.log("\nRunning " + fixture.sourceName + "...");
    run(process.execPath, [fixture.sourceName], fixture.directory);
  }
  succeeded = true;
  console.log("\nAll Ambiten package-boundary integration tests passed.");
} finally {
  if (integrationRoot) {
    if (succeeded) {
      rmSync(integrationRoot, { recursive: true, force: true });
    } else {
      console.error("Fixtures retained for inspection: " + integrationRoot);
    }
  }
}