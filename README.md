
<p align="center">
  <img
    src="https://raw.githubusercontent.com/AmbitenHQ/ambiten/main/assets/ambiten-mark-300x300.png"
    width="350"
    alt="Ambiten"
  />  
</p>

<h1 align="center">Ambiten</h1>

<p align="center">
  <strong>Context-driven runtime infrastructure for MongoDB systems.</strong>
</p>

<p align="center">
  Multi-tenancy, transactions, middleware, observability, and execution context — unified behind a single runtime model.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@ambiten">
    <img src="https://img.shields.io/npm/v/@ambiten/core?style=flat-square" alt="npm version" />
  </a>
  <!-- <a href="https://ambiten.dev">
    <img src="https://img.shields.io/badge/docs-ambiten.dev-22c55e?style=flat-square" alt="documentation" />
  </a> -->
  <a href="https://github.com/AmbitenHQ/ambiten/stargazers">
    <img src="https://img.shields.io/github/stars/AmbitenHQ/ambiten?style=flat-squaree&cacheSeconds=60" alt="GitHub stars" />
  </a>
</p>

---

## What is Ambiten?

Ambiten is a runtime platform for MongoDB applications.

Most frameworks help structure code. Most ODMs help map data. Ambiten focuses on something different: execution itself.

As systems grow, infrastructure concerns begin spreading across application layers. Tenant routing, transaction handling, middleware execution, logging, instrumentation, caching, and operational policies become increasingly difficult to coordinate consistently.

Ambiten brings those concerns together behind a unified runtime model.

Instead of manually passing execution state through services and handlers, applications execute inside a structured runtime boundary where context, transactions, middleware, observability, and infrastructure behavior remain coordinated automatically.

```text
Request
   ↓
Adapter
   ↓
AmbitenContext
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

## Why Ambiten?

Modern systems are rarely limited by database access alone.

The real challenge is maintaining consistent execution behavior across requests, services, workers, background jobs, APIs, and distributed infrastructure.

Ambiten provides a runtime foundation for:

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
npm install @ambiten/core mongodb
```

Create a model:

```ts
import {
  AmbitenClient,
  AmbitenContext,
  AmbitenModel,
  AmbitenSchema
} from "@ambiten/core";

const client = new AmbitenClient({
  uri: process.env.MONGO_URI,
  options: {
    dbName: "app"
  }
});

await client.connect();

const UserModel = new AmbitenModel({
  collectionName: "users",
  schema: new AmbitenSchema({
    name: String,
    email: String
  }),
  provider: client
});

await AmbitenContext.run(
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

The repository contains the complete Ambiten platform.

### @ambiten/core

The runtime engine.

Provides models, schemas, context propagation, transactions, middleware execution, instrumentation, provider resolution, and multi-tenancy support.

### @ambiten/logger

Structured logging and observability infrastructure.

Provides context-aware logging, transport pipelines, batching, metrics, resilience handling, and production telemetry workflows.

### @ambiten/create

Project scaffolding and runtime bootstrapping.

Generate REST APIs, GraphQL services, Next.js applications, MERN projects, and production-ready Ambiten environments.

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

Ambiten is built around a simple idea:

> Execution behavior should be enforced by the runtime, not maintained manually across application code.

Context, transactions, middleware, observability, and infrastructure concerns should move together through a shared execution lifecycle instead of being managed independently.

---

## Documentation

Comprehensive documentation is available at:

https://docs.ambiten.dev

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

Ambiten evolved from the Abimongo project.

What began as a MongoDB ODM gradually expanded into a broader runtime architecture focused on execution coordination, operational visibility, and tenant-aware infrastructure.

Future development continues under the Ambiten platform.

---

## Contributing

Contributions are welcome.

Changes should preserve runtime consistency, execution safety, and the broader architectural principles of the platform.

Please ensure tests pass and documentation remains aligned with runtime behavior before submitting pull requests.

---

## License

MIT
