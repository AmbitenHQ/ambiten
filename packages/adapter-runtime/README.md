<div style="display: flex; align-items: center;">
<p >
  <img
    src="https://raw.githubusercontent.com/AmbitenHQ/ambiten/main/assets/ambiten-mark-192x192.png"
    width="56"
    alt="Ambiten"
  />  
</p> <h2> @ambiten/adapter-runtime</h2>
</div>

<p align="center">
  <strong>Shared execution runtime for Ambiten adapters.</strong>
</p>

<p align="center">
  Provides the execution boundary, context propagation, tenant resolution, transaction coordination, and runtime lifecycle primitives used by the Ambiten adapter ecosystem.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@ambiten/adapter-runtime">
    <img src="https://img.shields.io/npm/v/@ambiten/adapter-runtime?style=flat-square" alt="npm version" />
  </a>
  <!-- <a href="https://ambiten.dev">
    <img src="https://img.shields.io/badge/docs-ambiten.dev-22c55e?style=flat-square" alt="documentation" />
  </a> -->
    <a href="https://github.com/AmbitenHQ/ambiten/stargazers">
    <img src="https://img.shields.io/github/stars/AmbitenHQ/ambiten?style=flat-square&color=1E88E5" alt="GitHub stars" />
  </a>
</p>

---

## Overview

`@ambiten/adapter-runtime` is the shared execution layer that powers the Ambiten adapter ecosystem.

It provides the common runtime infrastructure used by framework integrations such as Express, Fastify, NestJS, GraphQL, and AWS Lambda.

Most applications will never interact with this package directly. Instead, it operates behind the scenes to establish execution boundaries, propagate runtime context, coordinate transactions, resolve tenants, and maintain execution continuity across different environments.

The purpose of the package is to ensure that every adapter participates in the same runtime model regardless of framework or deployment target.

## Installation

This package is installed automatically by Ambiten adapter packages and typically does not need to be added manually.

```bash
npm install @ambiten/adapter-runtime
```

## Runtime Responsibility

The adapter runtime exists between the framework layer and the Ambiten runtime.

```text
Incoming Request
        ↓
Framework Adapter
        ↓
Adapter Runtime
        ↓
AmbitenContext
        ↓
Models & Services
        ↓
MongoDB
```

The framework adapter establishes the entry point.

The adapter runtime establishes the execution boundary.

The Ambiten runtime then carries execution state throughout the remainder of the operation.

## What the Runtime Provides

The adapter runtime provides the shared capabilities required by all adapter implementations.

Execution context can be established consistently regardless of whether a request originates from Express, Fastify, GraphQL, NestJS, Lambda, or future adapter integrations.

Tenant resolution, request metadata propagation, transaction coordination, runtime instrumentation, and execution lifecycle management are all handled through a common runtime contract.

This allows adapter implementations to remain lightweight while sharing the same operational behavior.

## Context Propagation

One of the primary responsibilities of the runtime is maintaining execution continuity.

```text
Request
   ↓
Execution Boundary
   ↓
AmbitenContext
   ↓
Services
   ↓
Models
```

Once context has been established, runtime state remains available throughout middleware, services, repositories, transactions, asynchronous operations, and model execution.

This allows application code to remain focused on business behavior rather than infrastructure plumbing.

## Multi-Tenancy

The runtime provides shared tenant resolution primitives used by all Ambiten adapters.

```text
Request
   ↓
Tenant Resolution
   ↓
Runtime Context
   ↓
Tenant-Aware Execution
```

This ensures tenant-aware behavior remains consistent regardless of framework choice.

## Transaction Coordination

The runtime also provides the execution mechanisms required for transaction-aware operations.

Transaction state can propagate through the active runtime context, allowing multiple model operations to participate in a shared execution boundary without manual session management.

This behavior remains consistent across all supported adapters.

## Who Should Use This Package?

Most developers should use one of the framework-specific adapters:

* `@ambiten/adapter-express`
* `@ambiten/adapter-fastify`
* `@ambiten/adapter-nestjs`
* `@ambiten/adapter-graphql`
* `@ambiten/adapter-lambda`

Direct usage of `@ambiten/adapter-runtime` is generally reserved for adapter authors, framework integrations, and advanced runtime extensions.

## Documentation

Complete documentation is available at:

https://ambiten.dev

## Related Packages

* `@ambiten/core`
* `@ambiten/adapter-express`
* `@ambiten/adapter-fastify`
* `@ambiten/adapter-nestjs`
* `@ambiten/adapter-graphql`
* `@ambiten/adapter-lambda`

## License

MIT
