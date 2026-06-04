# @ambiten/adapter-express

<p align="center">
  <img
    src="https://raw.githubusercontent.com/AmbitenHQ/ambiten/main/assets/ambiten-logo-mark-dark-plain.svg"
    width="120"
    alt="Ambiten"
  />
</p>

<p align="center">
  <strong>Express integration for the Ambiten runtime.</strong>
</p>

<p align="center">
  Establish request-scoped execution boundaries, context propagation, multi-tenancy, and transaction-aware runtime behavior inside Express applications.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@ambiten/adapter-express">
    <img src="https://img.shields.io/npm/v/@ambiten/adapter-express?style=flat-square" alt="npm version" />
  </a>
  <a href="https://ambiten.dev">
    <img src="https://img.shields.io/badge/docs-ambiten.dev-22c55e?style=flat-square" alt="documentation" />
  </a>
</p>

---

## Overview

`@ambiten/adapter-express` connects Express applications to the Ambiten runtime.

The adapter establishes request execution boundaries so runtime context remains available throughout the lifecycle of an incoming request. Tenant information, request metadata, transactions, logging, instrumentation, and runtime services can then participate consistently across controllers, services, middleware, and model operations.

The adapter does not replace Express. It allows Express to operate as an execution entry point for the Ambiten runtime.

## Installation

```bash
npm install @ambiten/adapter-express
```

If you are starting a new application, installing the core runtime is also recommended:

```bash
npm install @ambiten/core @ambiten/adapter-express
```

## Quick Start

```ts
import express from "express";
import { AmbitenBootstrapFactory } from "@ambiten/core";
import { createExpressAdapter } from "@ambiten/adapter-express";

const app = express();

const adapter = createExpressAdapter();

const bootstrap =
  await AmbitenBootstrapFactory.create({
    adapter
  });

await bootstrap.registerMultiTenancy(app);

app.listen(3000);
```

Once installed, incoming requests automatically participate in the Ambiten execution model.

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
Ambiten Adapter
        ↓
AmbitenContext
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
AmbitenContext
   ↓
Tenant-Aware Execution
```

This allows models and services to operate against the correct tenant boundary without manually passing tenant identifiers through application layers.

## Documentation

Complete documentation is available at:

https://ambiten.dev

## Related Packages

* `@ambiten/core`
* `@ambiten/logger`
* `@ambiten/create`

## License

MIT
