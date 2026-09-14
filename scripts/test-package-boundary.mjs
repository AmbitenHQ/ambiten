import assert from "node:assert/strict";
import {
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.resolve(__dirname, "..");
const pnpm = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

function run(command, args, cwd, env = process.env) {
  const result = spawnSync(command, args, {
    cwd,
    env,
    encoding: "utf8",
    stdio: "pipe",
  });

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  if (result.status !== 0) {
    throw new Error(
      `Command failed (${result.status}): ${command} ${args.join(" ")}`
    );
  }

  return result;
}

function toFileSpecifier(filePath) {
  return `file:${filePath.replace(/\\/g, "/")}`;
}

const artifactsDir = path.join(
  root,
  ".integration-artifacts"
);

rmSync(artifactsDir, {
  recursive: true,
  force: true,
});

mkdirSync(artifactsDir, {
  recursive: true,
});

console.log("\nPacking Ambiten packages...\n");

for (const packageName of [
  "core",
  "adapter-runtime",
  "adapter-express",
]) {
  run(
    pnpm,
    [
      "--dir",
      path.join(root, "packages", packageName),
      "pack",
      "--pack-destination",
      artifactsDir,
    ],
    root
  );
}

const packedFiles = readdirSync(artifactsDir);

function findPackage(prefix) {
  const filename = packedFiles.find(
    (file) =>
      file.startsWith(prefix) &&
      file.endsWith(".tgz")
  );

  assert.ok(
    filename,
    `Unable to find packed package ${prefix}`
  );

  return path.join(artifactsDir, filename);
}

const corePackage = findPackage("ambiten-core-");

const runtimePackage = findPackage(
  "ambiten-adapter-runtime-"
);

const expressPackage = findPackage(
  "ambiten-adapter-express-"
);

const integrationRoot = mkdtempSync(
  path.join(tmpdir(), "ambiten-package-integration-")
);

function createFixture(name, type, sourceName, source) {
  const directory = path.join(
    integrationRoot,
    name
  );

  mkdirSync(directory, {
    recursive: true,
  });

  const coreSpec = toFileSpecifier(corePackage);
  const runtimeSpec =
    toFileSpecifier(runtimePackage);
  const expressSpec =
    toFileSpecifier(expressPackage);

  const packageJson = {
    name: `ambiten-integration-${name}`,
    private: true,
    type,
    dependencies: {
      "@ambiten/core": coreSpec,
      "@ambiten/adapter-runtime": runtimeSpec,
      "@ambiten/adapter-express": expressSpec,
      express: "^5.2.1",
    },

    // Important for local tarball tests.
    // adapter-express's packed workspace:^ dependency
    // otherwise resolves runtime from npm.
    pnpm: {
      overrides: {
        "@ambiten/core": coreSpec,
        "@ambiten/adapter-runtime": runtimeSpec,
      },
    },
  };

  writeFileSync(
    path.join(directory, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );

  writeFileSync(
    path.join(directory, sourceName),
    source
  );

  return {
    directory,
    sourceName,
  };
}

const esmFixture = createFixture(
  "esm",
  "module",
  "index.mjs",
  `
import assert from "node:assert/strict";
import { once } from "node:events";
import express from "express";

import {
  AmbitenContext
} from "@ambiten/core";

import {
  createExpressAdapter
} from "@ambiten/adapter-express";

import {
  getAdapterRuntimeContext
} from "@ambiten/adapter-runtime";

//
// 1. Verify conditional package resolution.
//

assert.match(
  import.meta.resolve("@ambiten/core"),
  /[\\\\/]dist[\\\\/]esm[\\\\/]index\\.js$/
);

assert.match(
  import.meta.resolve("@ambiten/adapter-runtime"),
  /[\\\\/]dist[\\\\/]esm[\\\\/]index\\.js$/
);

assert.match(
  import.meta.resolve("@ambiten/adapter-express"),
  /[\\\\/]dist[\\\\/]esm[\\\\/]index\\.js$/
);

//
// 2. Build a real Express application.
//

const app = express();

const adapter = createExpressAdapter();

await adapter.install(app, {
  tenancy: {
    header: "x-tenant-id",

    validate(tenantId) {
      return tenantId === "tenant-esm";
    }
  }
});

//
// 3. Read context from BOTH sides.
//
// AmbitenContext comes directly from core.
// getAdapterRuntimeContext comes through adapter-runtime.
//
// If runtime accidentally loads Core CJS while this application
// loads Core ESM, these values will diverge.
//

app.get("/context", async (_req, res) => {

  // Intentionally cross an async boundary.
  // This also verifies AsyncLocalStorage propagation.
  await new Promise((resolve) =>
    setTimeout(resolve, 10)
  );

  const applicationContext =
    AmbitenContext.get();

  const adapterContext =
    getAdapterRuntimeContext();

  res.json({
    applicationTenant:
      applicationContext.tenantId,

    adapterTenant:
      adapterContext.tenantId
  });
});

//
// 4. Start on an ephemeral port.
//

const server = app.listen(
  0,
  "127.0.0.1"
);

await once(server, "listening");

const address = server.address();

assert.ok(
  address &&
  typeof address === "object"
);

try {

  const response = await fetch(
    \`http://127.0.0.1:\${address.port}/context\`,
    {
      headers: {
        "x-tenant-id": "tenant-esm"
      }
    }
  );

  assert.equal(
    response.status,
    200
  );

  const body = await response.json();

  assert.deepEqual(
    body,
    {
      applicationTenant: "tenant-esm",
      adapterTenant: "tenant-esm"
    }
  );

  console.log(
    "✅ ESM package-boundary context test passed"
  );

} finally {

  server.close();

  await once(server, "close");
}
`
);

const cjsFixture = createFixture(
  "cjs",
  "commonjs",
  "index.cjs",
  `
const assert =
  require("node:assert/strict");

const { once } =
  require("node:events");

const express =
  require("express");

const {
  AmbitenContext
} = require("@ambiten/core");

const {
  createExpressAdapter
} = require("@ambiten/adapter-express");

const {
  getAdapterRuntimeContext
} = require("@ambiten/adapter-runtime");

async function main() {

  //
  // 1. Verify CJS conditional exports.
  //

  assert.match(
    require.resolve("@ambiten/core"),
    /[\\\\/]dist[\\\\/]cjs[\\\\/]index\\.cjs$/
  );

  assert.match(
    require.resolve(
      "@ambiten/adapter-runtime"
    ),
    /[\\\\/]dist[\\\\/]cjs[\\\\/]index\\.js$/
  );

  assert.match(
    require.resolve(
      "@ambiten/adapter-express"
    ),
    /[\\\\/]dist[\\\\/]cjs[\\\\/]index\\.js$/
  );

  //
  // 2. Real Express application.
  //

  const app = express();

  const adapter =
    createExpressAdapter();

  await adapter.install(app, {
    tenancy: {
      header: "x-tenant-id",

      validate(tenantId) {
        return tenantId === "tenant-cjs";
      }
    }
  });

  app.get(
    "/context",
    async (_req, res) => {

      // Verify context survives await.
      await new Promise((resolve) =>
        setTimeout(resolve, 10)
      );

      const applicationContext =
        AmbitenContext.get();

      const adapterContext =
        getAdapterRuntimeContext();

      res.json({
        applicationTenant:
          applicationContext.tenantId,

        adapterTenant:
          adapterContext.tenantId
      });
    }
  );

  const server = app.listen(
    0,
    "127.0.0.1"
  );

  await once(
    server,
    "listening"
  );

  const address =
    server.address();

  assert.ok(
    address &&
    typeof address === "object"
  );

  try {

    const response = await fetch(
      \`http://127.0.0.1:\${address.port}/context\`,
      {
        headers: {
          "x-tenant-id": "tenant-cjs"
        }
      }
    );

    assert.equal(
      response.status,
      200
    );

    const body =
      await response.json();

    assert.deepEqual(
      body,
      {
        applicationTenant: "tenant-cjs",
        adapterTenant: "tenant-cjs"
      }
    );

    console.log(
      "✅ CJS package-boundary context test passed"
    );

  } finally {

    server.close();

    await once(
      server,
      "close"
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
`
);

for (const fixture of [
  esmFixture,
  cjsFixture,
]) {
  console.log(
    `\n📥 Installing ${fixture.sourceName} fixture...\n`
  );

  run(
    pnpm,
    [
      "install",
      "--no-frozen-lockfile",
    ],
    fixture.directory
  );

  console.log(
    `\nRunning ${fixture.sourceName}...\n`
  );

  run(
    process.execPath,
    [fixture.sourceName],
    fixture.directory
  );
}

console.log(
  "\n✅ All Ambiten package-boundary integration tests passed.\n"
);

rmSync(integrationRoot, {
  recursive: true,
  force: true,
});