# @ambiten/adapter-fastify

<p align="center">
  <img
    src="https://raw.githubusercontent.com/AmbitenHQ/ambiten/main/assets/ambiten-wordmark1.png"
    width="500"
    alt="Ambiten" 
    style="border-radius: 50%"
  />
</p>

<p align="center"> <strong>Fastify integration for the Ambiten runtime.</strong>
</p>

<p align="center"> Establish request-scoped execution boundaries, context propagation, multi-tenancy, and transaction-aware runtime behavior inside Fastify applications. </p>

 <p align="center"> 
  <a href="https://www.npmjs.com/package/@ambiten/adapter-fastify"> <img src="https://img.shields.io/npm/v/@ambiten/adapter-fastify?style=flat-square" alt="npm version" /> 
 </a>
  <!-- <a href="https://ambiten.dev"> <img src="https://img.shields.io/badge/docs-ambiten.dev-22c55e?style=flat-square" alt="documentation" />
</a> -->
  <a href="https://github.com/AmbitenHQ/ambiten/stargazers">
    <img src="https://img.shields.io/github/stars/AmbitenHQ/ambiten?style=flat-square&color=1E88E5" alt="GitHub stars" />
  </a>
 </p>

## Overview

`@ambiten/adapter-fastify` connects Fastify applications to the Ambiten runtime.

The adapter establishes request execution boundaries using Fastify's lifecycle hooks so runtime context remains available throughout the lifecycle of each request. Tenant information, request metadata, transactions, logging, instrumentation, and runtime services can then participate consistently across handlers, plugins, services, and model operations.

The adapter does not replace Fastify. It allows Fastify to operate as an execution entry point for the Ambiten runtime.

## Installation

```text
npm install @ambiten/adapter-fastify
```

If you are starting a new application, installing the core runtime is also recommended:

```bash
npm install @ambiten/core @ambiten/adapter-fastify
```

## Quick Start

```text
import Fastify from "fastify";
import { AmbitenBootstrapFactory } from "@ambiten/core";
import { createFastifyAdapter } from "@ambiten/adapter-fastify";

const app = Fastify();

const adapter = createFastifyAdapter();

const bootstrap =
  await AmbitenBootstrapFactory.create({
    adapter
  });

await bootstrap.registerMultiTenancy(app);

await app.listen({
  port: 3000
});
```

Once installed, incoming requests automatically participate in the Ambiten execution model.

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
Ambiten Adapter
        ↓
AmbitenContext
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
AmbitenContext
   ↓
Tenant-Aware Execution
```

This allows models and services to operate against the correct tenant boundary without manually passing tenant identifiers through application layers.

## Documentation

Complete documentation is available at:

https://ambiten.dev

- Related Packages
- @ambiten/core
- @ambiten/logger
- @ambiten/create

## License

MIT
