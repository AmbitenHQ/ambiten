# @tenra/adapter-graphql

<p align="center">
  <img src="../../tenra-brand/tenra_svg/tenra-primary-logo-dark.svg" alt="Tenra" width="250" />
</p>

<p align="center">
  <strong>GraphQL integration for the Tenra runtime.</strong>
</p>

<p align="center">
  Establish context-aware execution boundaries for GraphQL queries, mutations, subscriptions, and resolver pipelines while preserving runtime continuity across the Tenra ecosystem.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@tenra/adapter-graphql">
    <img src="https://img.shields.io/npm/v/@tenra/adapter-graphql?style=flat-square" alt="npm version" />
  </a>
  <a href="https://tenra.dev">
    <img src="https://img.shields.io/badge/docs-tenra.dev-22c55e?style=flat-square" alt="documentation" />
  </a>
</p>

---

## Overview

`@tenra/adapter-graphql` connects GraphQL execution to the Tenra runtime.

The adapter establishes execution boundaries for queries, mutations, and subscriptions so runtime context remains available throughout resolver execution. Tenant information, request metadata, transactions, logging, instrumentation, and runtime services can then participate consistently across GraphQL operations.

The adapter does not replace GraphQL. It allows GraphQL execution to participate fully in the Tenra runtime model.

## Installation

```bash
npm install @tenra/adapter-graphql
```

If you are starting a new application, installing the core runtime is also recommended:

```bash
npm install @tenra/core @tenra/adapter-graphql
```

## Quick Start

```ts
import {
  TenraBootstrapFactory
} from "@tenra/core";

import {
  createGraphQLAdapter
} from "@tenra/adapter-graphql";

const adapter = createGraphQLAdapter();

const bootstrap =
  await TenraBootstrapFactory.create({
    adapter
  });
```

Once installed, GraphQL operations automatically participate in the Tenra execution model.

## What the Adapter Provides

The adapter acts as the bridge between GraphQL execution and the runtime.

It can establish request-scoped context, initialize tenant boundaries, propagate request metadata, participate in transaction-aware execution flows, and expose runtime state to resolvers, services, and models.

This allows resolver code to remain focused on business logic while execution concerns remain coordinated by the runtime.

## Runtime Flow

```text
GraphQL Request
        ↓
GraphQL Adapter
        ↓
TenraContext
        ↓
Resolvers
        ↓
Models & Services
        ↓
MongoDB
```

The adapter creates the execution boundary. The runtime then carries execution state throughout the remainder of the operation lifecycle.

## Resolver Context

GraphQL applications often require execution state to flow across multiple resolver layers.

The adapter automatically makes runtime context available throughout resolver execution so tenant information, request metadata, transactions, logging, and instrumentation remain consistent regardless of how deeply nested a resolver chain becomes.

```text
Query
  ↓
Resolver
  ↓
Nested Resolver
  ↓
Service
  ↓
Model
```

Execution context remains attached throughout the entire flow.

## Multi-Tenancy

When multi-tenancy is enabled, tenant information can be resolved during GraphQL execution and made available throughout the active runtime context.

```text
GraphQL Request
        ↓
Tenant Resolution
        ↓
TenraContext
        ↓
Tenant-Aware Execution
```

This allows models and services to operate against the correct tenant boundary without manually passing tenant identifiers between resolvers.

## Subscriptions

The adapter also supports runtime-aware subscription execution.

Subscription events can participate in the same execution model used by queries and mutations, allowing tenant information, instrumentation, logging, and runtime metadata to remain consistent across real-time GraphQL workflows.

## Documentation

Complete documentation is available at:

https://tenra.dev

## Related Packages

* `@tenra/core`
* `@tenra/logger`
* `@tenra/create`

## License

MIT
