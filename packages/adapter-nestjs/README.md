# @ambiten/adapter-nestjs

<p align="center">
  <img
    src="https://cdn.jsdelivr.net/gh/AmbitenHQ/ambiten@main/assets/ambiten-wordmark-logo.png"
    width="120"
    alt="Ambiten"
  />
</p>

<p align="center">
  <strong>NestJS integration for the Ambiten runtime.</strong>
</p>

<p align="center">
  Establish request-scoped execution boundaries, context propagation, multi-tenancy, and transaction-aware runtime behavior throughout NestJS applications.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@ambiten/adapter-nestjs">
    <img src="https://img.shields.io/npm/v/@ambiten/adapter-nestjs?style=flat-square" alt="npm version" />
  </a>
  <a href="https://ambiten.dev">
    <img src="https://img.shields.io/badge/docs-ambiten.dev-22c55e?style=flat-square" alt="documentation" />
  </a>
    </a>
    <a href="https://github.com/AmbitenHQ/ambiten/stargazers">
    <img src="https://img.shields.io/github/stars/AmbitenHQ/ambiten?style=flat-square&color=1E88E5" alt="GitHub stars" />
  </a>
</p>

---

## Overview

`@ambiten/adapter-nestjs` connects NestJS applications to the Ambiten runtime.

The adapter establishes execution boundaries using NestJS lifecycle mechanisms such as middleware, guards, interceptors, and request pipelines so runtime context remains available throughout the lifecycle of a request. Tenant information, request metadata, transactions, logging, instrumentation, and runtime services can then participate consistently across controllers, providers, services, and model operations.

The adapter does not replace NestJS. It allows NestJS to operate as an execution entry point for the Ambiten runtime.

## Installation

```bash
npm install @ambiten/core @ambiten/adapter-nestjs
```

## Quick Start

```ts
import { Module } from '@nestjs/common';
import { AmbitenBootstrapFactory } from '@ambiten/core';
import { createNestJSAdapter } from '@ambiten/adapter-nestjs';

const adapter = createNestJSAdapter();

await AmbitenBootstrapFactory.create({
  adapter
});

@Module({})
export class AppModule {}
```

Once installed, incoming requests automatically participate in the Ambiten execution model.

## What the Adapter Provides

The adapter acts as the bridge between NestJS and the runtime.

It can establish request-scoped context, initialize tenant boundaries, propagate request metadata, participate in transaction-aware execution flows, and expose runtime state to controllers, providers, services, and models.

This allows application code to remain focused on business logic while execution concerns remain coordinated by the runtime.

## Runtime Flow

```text
Incoming Request
        ↓
NestJS
        ↓
Ambiten Adapter
        ↓
AmbitenContext
        ↓
Controllers
        ↓
Services
        ↓
Models
        ↓
MongoDB
```

The adapter creates the execution boundary. The runtime then carries execution state throughout the remainder of the request lifecycle.

## NestJS Integration

The adapter integrates naturally with NestJS architecture.

Runtime context remains available throughout controllers, providers, guards, interceptors, middleware, pipes, and services without requiring request metadata to be manually passed through every layer.

```text
Request
   ↓
Guard
   ↓
Interceptor
   ↓
Controller
   ↓
Service
   ↓
Model
```

Execution context remains attached throughout the entire flow.

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

This allows services and models to operate against the correct tenant boundary without manually propagating tenant identifiers throughout the application.

## Transaction-Aware Execution

NestJS applications often involve multiple service layers participating in a single business workflow.

The adapter allows transaction state to remain available throughout the active runtime context so model operations can participate in the same transaction boundary without manually passing sessions between services.

This helps maintain consistent execution behavior across complex application architectures.

## Observability

Logs, instrumentation events, runtime metrics, and execution metadata generated throughout the request lifecycle remain correlated through the active runtime context.

This provides a consistent operational view across controllers, services, repositories, middleware, and model operations.

## Documentation

Complete documentation is available at:

https://ambiten.dev

## Related Packages

* `@ambiten/core`
* `@ambiten/logger`
* `@ambiten/create`

## License

MIT
