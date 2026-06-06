# @ambiten/core

<p align="center">
  <img
    src="https://cdn.jsdelivr.net/gh/AmbitenHQ/ambiten@main/assets/ambiten-mark-300x300.png"
    width="350"
    alt="Ambiten"
  />  
</p> 

<p align="center">
  <strong>A runtime and context-aware data platform for MongoDB applications.</strong>
</p>

<p align="center">
  Runtime-aware models, transactions, middleware, multi-tenancy, observability, and execution boundaries designed for modern applications.
</p>

<p align="center">
<a href="https://www.npmjs.com/package/@ambiten/core">
  <img src="https://img.shields.io/npm/v/@Ambiten/core?color=0ea5e9&label=npm&style=flat-square" alt="npm version" />
</a>
<!-- <a href="https://ambiten.dev">
  <img src="https://img.shields.io/badge/docs-ambiten.dev-22c55e?style=flat-square" alt="documentation" />
</a> -->
  <a href="https://github.com/AmbitenHQ/ambiten/stargazers">
    <img src="https://img.shields.io/github/stars/AmbitenHQ/ambiten?style=flat-square&color=1E88E5" alt="GitHub stars" />
  </a>
<img src="https://img.shields.io/badge/multi--tenant-native-6366f1?style=flat-square" alt="multi-tenant native" />
<img src="https://img.shields.io/badge/context-aware-14b8a6?style=flat-square" alt="context aware" />
</p>

---

## Overview

@ambiten/core is the foundation of the Ambiten platform.

It provides the runtime responsible for context propagation, model execution, transaction coordination, multi-tenancy, middleware orchestration, and operational observability across MongoDB applications.

Rather than treating data access as an isolated persistence concern, Ambiten treats execution itself as a runtime responsibility.

The goal is to reduce infrastructure plumbing while keeping execution predictable, observable, and safe under real production conditions.

## What Ambiten Is

Ambiten is not just a MongoDB ODM.

It is a runtime and context-aware execution platform that coordinates context propagation, transactions, multi-tenancy, middleware, instrumentation, and runtime policies across the entire execution lifecycle of an application.

Traditional ODMs focus on mapping data.

Ambiten focuses on coordinating execution.

> Mongoose manages models.
> Ambiten manages execution.

## Installation

```bash
npm install @ambiten/core mongodb
```

```ts
import {
  AmbitenClient,
  AmbitenModel,
  AmbitenSchema,
  AmbitenContext
} from "@ambiten/core";

const client = new AmbitenClient({
  uri: process.env.MONGODB_URI,
  options: {
    dbName: "app"
  }
});

await client.connect();

const userSchema = new AmbitenSchema({
  name: String,
  email: String
});

const UserModel = new AmbitenModel({
  collectionName: "users",
  schema: userSchema,
  provider: client
});

await AmbitenContext.run(
  {
    tenantId: "tenant-a",
    requestId: "req-001"
  },
  async () => {
    await UserModel.create({
      name: "Alice",
      email: "alice@example.com"
    });
  }
);
```

The application code remains focused on product behavior.

The runtime carries execution state.

## Execution Model

Ambiten organizes execution around request-scoped runtime boundaries.

```text
Request
  ↓
Adapter
  ↓
AmbitenContext
  ↓
Middleware
  ↓
AmbitenModel
  ↓
Provider / AmbitenClient
  ↓
MongoDB
```

Instead of manually threading tenant IDs, transaction sessions, request metadata, instrumentation payloads, or infrastructure state across services, the runtime keeps execution context attached to the active boundary.

This allows the same execution model to remain consistent across HTTP requests, background workers, queues, scheduled jobs, transactions, and serverless environments.

## Core Capabilities

### Context Runtime

AmbitenContext provides request-scoped runtime state through AsyncLocalStorage.

```ts
await AmbitenContext.run(
  {
    tenantId: "tenant-a"
  },
  async () => {
    await UserModel.find({});
  }
);
```

The active context can carry tenant identity, request metadata, sessions, budgets, runtime observers, instrumentation metadata, and operational state without forcing application services to manually pass them through every execution layer.

### Runtime Models

AmbitenModel provides CRUD and aggregation capabilities that participate directly in the runtime.

```ts
await UserModel.updateOne(
  { email: "alice@example.com" },
  {
    $set: {
      active: true
    }
  }
);
```

Operations can execute inside middleware boundaries, transaction scopes, tenant-aware resolution, instrumentation flows, caching layers, and policy enforcement without departing from familiar MongoDB patterns.

### Multi-Tenancy & Transactions

Tenant isolation and transactional execution are coordinated through the runtime.

```ts
await AmbitenContext.withTransaction(async () => {
  await UserModel.create(user);
  await AuditModel.create(log);
});
```

The runtime propagates active sessions automatically while tenant-aware resolution remains attached to the current execution boundary.

Application code stays focused on business logic rather than infrastructure coordination.

### Observability & Instrumentation

Ambiten includes runtime instrumentation through utilities such as `measureQuery()`.

```ts
await measureQuery(
  {
    operation: "find",
    collectionName: "users"
  },
  async () => {
    return UserModel.find({});
  }
);
```

Instrumentation can expose execution duration, tenant scope, transaction state, cache behavior, collection activity, and operational metadata for downstream observability systems.

## Adapter-Driven Runtime

Ambiten is adapter-driven.

The same runtime model can operate across Express, Fastify, GraphQL systems, NestJS applications, background workers, queues, and serverless environments while preserving consistent execution behavior.

The runtime remains responsible for execution coordination regardless of deployment model.

## Why Ambiten Exists

As applications grow, execution concerns become scattered across services, middleware, repositories, background workers, and infrastructure layers.

Context propagation becomes manual.

Transactions become difficult to coordinate.

Tenant isolation becomes inconsistent.

Observability becomes fragmented.

Ambiten exists to centralize those concerns inside the runtime itself so applications remain focused on business logic while execution behavior stays consistent, observable, and safe.

## Documentation

The official documentation covers runtime architecture, context propagation, transactions, middleware, instrumentation, multi-tenancy, adapters, deployment strategy, and production-oriented workflows.

Documentation:

https://Ambiten.dev

## Ecosystem

The Ambiten ecosystem extends beyond the core runtime and includes adapters, logging infrastructure, project scaffolding, GraphQL integration, observability tooling, and future platform capabilities built around the same execution model.

Additional packages continue to evolve around the platform.

## Philosophy

> Execution behavior should be enforced by the runtime, not maintained manually across application code.

Ambiten exists to make systems more predictable, observable, and operationally consistent as complexity grows.

## License

MIT
