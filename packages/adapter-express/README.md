# @tenra/adapter-express

<p align="center">
  <img src="../../tenra-brand/tenra_svg/tenra-primary-logo-dark.svg" alt="Tenra" width="250" />
</p>

<p align="center">
  <strong>Express integration for the Tenra runtime.</strong>
</p>

<p align="center">
  Establish request-scoped execution boundaries, context propagation, multi-tenancy, and transaction-aware runtime behavior inside Express applications.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@tenra/adapter-express">
    <img src="https://img.shields.io/npm/v/@tenra/adapter-express?style=flat-square" alt="npm version" />
  </a>
  <a href="https://tenra.dev">
    <img src="https://img.shields.io/badge/docs-tenra.dev-22c55e?style=flat-square" alt="documentation" />
  </a>
</p>

---

## Overview

`@tenra/adapter-express` connects Express applications to the Tenra runtime.

The adapter establishes request execution boundaries so runtime context remains available throughout the lifecycle of an incoming request. Tenant information, request metadata, transactions, logging, instrumentation, and runtime services can then participate consistently across controllers, services, middleware, and model operations.

The adapter does not replace Express. It allows Express to operate as an execution entry point for the Tenra runtime.

## Installation

```bash
npm install @tenra/adapter-express
```

If you are starting a new application, installing the core runtime is also recommended:

```bash
npm install @tenra/core @tenra/adapter-express
```

## Quick Start

```ts
import express from "express";
import { TenraBootstrapFactory } from "@tenra/core";
import { createExpressAdapter } from "@tenra/adapter-express";

const app = express();

const adapter = createExpressAdapter();

const bootstrap =
  await TenraBootstrapFactory.create({
    adapter
  });

await bootstrap.registerMultiTenancy(app);

app.listen(3000);
```

Once installed, incoming requests automatically participate in the Tenra execution model.

## What the Adapter Provides

The adapter acts as the bridge between Express and the runtime.

It can establish request-scoped context, initialize tenant boundaries, propagate request metadata, participate in transaction-aware execution flows, and expose runtime state to downstream services and models.

This allows application code to remain focused on business logic while execution concerns remain coordinated by the runtime.

## Runtime Flow

```text
Incoming Request
        ↓
Express
        ↓
Tenra Adapter
        ↓
TenraContext
        ↓
Models & Services
        ↓
MongoDB
```

The adapter creates the execution boundary. The runtime then carries execution state throughout the remainder of the request lifecycle.

## Multi-Tenancy

When multi-tenancy is enabled, tenant information can be resolved from incoming requests and made available throughout the active runtime context.

```text
Request
   ↓
Tenant Resolution
   ↓
TenraContext
   ↓
Tenant-Aware Execution
```

This allows models and services to operate against the correct tenant boundary without manually passing tenant identifiers through application layers.

## Documentation

Complete documentation is available at:

https://tenra.dev

## Related Packages

* `@tenra/core`
* `@tenra/logger`
* `@tenra/create`

## License

MIT
