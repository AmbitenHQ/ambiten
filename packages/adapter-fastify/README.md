# @tenra/adapter-fastify

<p align="center"> <img src="../../tenra-brand/tenra_svg/tenra-primary-logo-dark.svg" alt="Tenra" width="250" /> </p> <p align="center"> <strong>Fastify integration for the Tenra runtime.</strong> </p> <p align="center"> Establish request-scoped execution boundaries, context propagation, multi-tenancy, and transaction-aware runtime behavior inside Fastify applications. </p> <p align="center"> <a href="https://www.npmjs.com/package/@tenra/adapter-fastify"> <img src="https://img.shields.io/npm/v/@tenra/adapter-fastify?style=flat-square" alt="npm version" /> </a> <a href="https://tenra.dev"> <img src="https://img.shields.io/badge/docs-tenra.dev-22c55e?style=flat-square" alt="documentation" /> </a> </p>

## Overview

`@tenra/adapter-fastify` connects Fastify applications to the Tenra runtime.

The adapter establishes request execution boundaries using Fastify's lifecycle hooks so runtime context remains available throughout the lifecycle of each request. Tenant information, request metadata, transactions, logging, instrumentation, and runtime services can then participate consistently across handlers, plugins, services, and model operations.

The adapter does not replace Fastify. It allows Fastify to operate as an execution entry point for the Tenra runtime.

## Installation

```text
npm install @tenra/adapter-fastify
```

If you are starting a new application, installing the core runtime is also recommended:

```bash
npm install @tenra/core @tenra/adapter-fastify
```

## Quick Start

```text
import Fastify from "fastify";
import { TenraBootstrapFactory } from "@tenra/core";
import { createFastifyAdapter } from "@tenra/adapter-fastify";

const app = Fastify();

const adapter = createFastifyAdapter();

const bootstrap =
  await TenraBootstrapFactory.create({
    adapter
  });

await bootstrap.registerMultiTenancy(app);

await app.listen({
  port: 3000
});
```

Once installed, incoming requests automatically participate in the Tenra execution model.

## What the Adapter Provides

The adapter acts as the bridge between Fastify and the runtime.

It can establish request-scoped context, initialize tenant boundaries, propagate request metadata, participate in transaction-aware execution flows, and expose runtime state to downstream services and models.

This allows application code to remain focused on business logic while execution concerns remain coordinated by the runtime.

Runtime Flow

```text
Incoming Request
        ↓
Fastify
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

## Fastify Integration

The adapter integrates directly with Fastify's request lifecycle and plugin system.

Runtime context is established before application handlers execute and remains available throughout middleware, services, model operations, transactions, and asynchronous execution paths triggered by the request.

This ensures runtime state remains consistent while preserving Fastify's performance-oriented architecture.

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

- Related Packages
- @tenra/core
- @tenra/logger
- @tenra/create

## License

MIT