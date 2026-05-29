# Tenra

<p align="center">
  <img src="./tenra-brand/tenra-primary-logo-dark.png" alt="Tenra" />
</p>

<p align="center">
  <strong>Context-driven runtime infrastructure for MongoDB systems.</strong>
</p>

<p align="center">
  Multi-tenancy, transactions, middleware, observability, and execution context — unified behind a single runtime model.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@tenra/core">
    <img src="https://img.shields.io/npm/v/@tenra/core?style=flat-square" alt="npm version" />
  </a>
  <a href="https://tenra.dev">
    <img src="https://img.shields.io/badge/docs-tenra.dev-22c55e?style=flat-square" alt="documentation" />
  </a>
  <a href="https://github.com/tenrahq/tenra">
    <img src="https://img.shields.io/github/stars/tenrahq/tenra?style=flat-square" alt="GitHub stars" />
  </a>
</p>

---

## What is Tenra?

Tenra is a runtime platform for MongoDB applications.

Most frameworks help structure code. Most ODMs help map data. Tenra focuses on something different: execution itself.

As systems grow, infrastructure concerns begin spreading across application layers. Tenant routing, transaction handling, middleware execution, logging, instrumentation, caching, and operational policies become increasingly difficult to coordinate consistently.

Tenra brings those concerns together behind a unified runtime model.

Instead of manually passing execution state through services and handlers, applications execute inside a structured runtime boundary where context, transactions, middleware, observability, and infrastructure behavior remain coordinated automatically.

```text
Request
   ↓
Adapter
   ↓
TenraContext
   ↓
Middleware
   ↓
Models
   ↓
MongoDB
```

The application focuses on business logic.

The runtime carries execution state.

---

## Why Tenra?

Modern systems are rarely limited by database access alone.

The real challenge is maintaining consistent execution behavior across requests, services, workers, background jobs, APIs, and distributed infrastructure.

Tenra provides a runtime foundation for:

* Multi-tenant applications
* Transaction-aware workflows
* Context propagation
* Middleware orchestration
* Runtime instrumentation
* Operational observability
* Framework portability

The result is a system that remains predictable as complexity grows.

---

## Quick Start

Install the core runtime:

```bash
npm install @tenra/core mongodb
```

Create a model:

```ts
import {
  TenraClient,
  TenraContext,
  TenraModel,
  TenraSchema
} from "@tenra/core";

const client = new TenraClient({
  uri: process.env.MONGO_URI,
  options: {
    dbName: "app"
  }
});

await client.connect();

const UserModel = new TenraModel({
  collectionName: "users",
  schema: new TenraSchema({
    name: String,
    email: String
  }),
  provider: client
});

await TenraContext.run(
  {
    tenantId: "tenant-a"
  },
  async () => {
    await UserModel.create({
      name: "Alice",
      email: "alice@example.com"
    });
  }
);
```

---

## Packages

The repository contains the complete Tenra platform.

### @tenra/core

The runtime engine.

Provides models, schemas, context propagation, transactions, middleware execution, instrumentation, provider resolution, and multi-tenancy support.

### @tenra/logger

Structured logging and observability infrastructure.

Provides context-aware logging, transport pipelines, batching, metrics, resilience handling, and production telemetry workflows.

### @tenra/create

Project scaffolding and runtime bootstrapping.

Generate REST APIs, GraphQL services, Next.js applications, MERN projects, and production-ready Tenra environments.

### Adapters

Framework integrations for:

* Express
* Fastify
* NestJS
* GraphQL
* AWS Lambda

Each adapter establishes execution boundaries so applications participate in the same runtime model regardless of deployment environment.

---

## Runtime Philosophy

Tenra is built around a simple idea:

> Execution behavior should be enforced by the runtime, not maintained manually across application code.

Context, transactions, middleware, observability, and infrastructure concerns should move together through a shared execution lifecycle instead of being managed independently.

---

## Documentation

Comprehensive documentation is available at:

https://tenra.dev

Documentation covers:

* Runtime architecture
* Context propagation
* Transactions
* Middleware
* Multi-tenancy
* Instrumentation
* Adapters
* Production deployment
* Operational patterns

---

## Project History

Tenra evolved from the Abimongo project.

What began as a MongoDB ODM gradually expanded into a broader runtime architecture focused on execution coordination, operational visibility, and tenant-aware infrastructure.

Future development continues under the Tenra platform.

---

## Contributing

Contributions are welcome.

Changes should preserve runtime consistency, execution safety, and the broader architectural principles of the platform.

Please ensure tests pass and documentation remains aligned with runtime behavior before submitting pull requests.

---

## License

MIT
