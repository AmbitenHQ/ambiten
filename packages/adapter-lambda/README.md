# @ambiten/adapter-lambda

<p align="center">
  <img
    src="https://raw.githubusercontent.com/AmbitenHQ/ambiten/main/assets/ambiten-wordmark-logo.png"
    width="120"
    alt="Ambiten"
  />
</p>

<p align="center">
  <strong>AWS Lambda integration for the Ambiten runtime.</strong>
</p>

<p align="center">
  Establish runtime execution boundaries for serverless workloads while preserving context propagation, multi-tenancy, observability, and transaction-aware execution across Lambda invocations.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@ambiten/adapter-lambda">
    <img src="https://img.shields.io/npm/v/@ambiten/adapter-lambda?style=flat-square" alt="npm version" />
  </a>
  <a href="https://ambiten.dev">
    <img src="https://img.shields.io/badge/docs-ambiten.dev-22c55e?style=flat-square" alt="documentation" />
  </a>
</p>

---

## Overview

`@ambiten/adapter-lambda` connects AWS Lambda functions to the Ambiten runtime.

The adapter establishes an execution boundary for each Lambda invocation so runtime context remains available throughout the lifecycle of the function. Tenant information, request metadata, logging, instrumentation, transactions, and runtime services can then participate consistently across handlers, services, and model operations.

The adapter does not replace Lambda. It allows serverless execution to participate fully in the Ambiten runtime model.

## Installation

```bash
npm install @ambiten/core @ambiten/adapter-lambda
```

## Quick Start

```ts
import {
  AmbitenBootstrapFactory
} from "@ambiten/core";

import {
  createLambdaAdapter
} from "@ambiten/adapter-lambda";

const adapter = createLambdaAdapter();

const bootstrap =
  await AmbitenBootstrapFactory.create({
    adapter
  });

export const handler =
  adapter.wrap(async (event, context) => {
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true
      })
    };
  });
```

Each invocation automatically participates in the Ambiten execution model.

## What the Adapter Provides

The adapter acts as the bridge between AWS Lambda and the runtime.

It can establish invocation-scoped context, initialize tenant boundaries, propagate request metadata, participate in transaction-aware execution flows, and expose runtime state to downstream services and models.

This allows function handlers to remain focused on business logic while execution concerns remain coordinated by the runtime.

## Runtime Flow

```text
Lambda Invocation
        ↓
Lambda Adapter
        ↓
AmbitenContext
        ↓
Services
        ↓
Models
        ↓
MongoDB
```

The adapter creates the execution boundary. The runtime then carries execution state throughout the remainder of the invocation lifecycle.

## Invocation Context

Serverless applications frequently require request information to remain available across asynchronous execution paths.

The adapter can automatically expose invocation metadata through the runtime context so services and models can access request-scoped information without manually passing it between layers.

```text
Lambda Event
      ↓
Runtime Context
      ↓
Service Layer
      ↓
Model Operations
```

Execution context remains attached throughout the entire invocation.

## Multi-Tenancy

When multi-tenancy is enabled, tenant information can be resolved from the incoming event and made available throughout the active runtime context.

```text
Lambda Event
      ↓
Tenant Resolution
      ↓
AmbitenContext
      ↓
Tenant-Aware Execution
```

This allows models and services to operate against the correct tenant boundary without manually propagating tenant identifiers through the application.

## Serverless Execution

Unlike traditional servers, Lambda functions execute inside short-lived invocation boundaries.

The adapter is designed around this model and ensures runtime state is isolated per invocation while still allowing logging, instrumentation, transactions, and context propagation to behave consistently.

This makes it possible to share the same runtime model across serverless functions, APIs, workers, and long-running services.

## Observability

Logs, instrumentation events, and runtime metadata generated during an invocation remain correlated through the active runtime context.

This helps preserve operational visibility across distributed systems where requests may pass through multiple serverless functions before completing.

## Documentation

Complete documentation is available at:

https://ambiten.dev

## Related Packages

* `@ambiten/core`
* `@ambiten/logger`
* `@ambiten/create`

## License

MIT
