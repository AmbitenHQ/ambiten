<div style="display: flex; align-items: center;">
<p >
  <img
    src="https://cdn.jsdelivr.net/gh/AmbitenHQ/ambiten@main/assets/ambiten-mark-192x192.png"
    width="56"
    alt="Ambiten"
  />  
</p> <h2> @ambiten/logger</h2>
</div> 

<p align="center">
  <strong>Structured logging and runtime-aware telemetry for modern applications.</strong>
</p>

<p align="center">
  Context-aware logs, transport pipelines, metrics tracking, resilience handling, and production-grade operational visibility for Ambiten systems and standalone Node.js applications.
</p>

<p align="center">
<a href="https://www.npmjs.com/package/@ambiten/logger">
  <img src="https://img.shields.io/npm/v/@ambiten/logger?color=0ea5e9&label=npm&style=flat-square" alt="npm version" />
</a>
<!-- <a href="https://ambiten.dev">
  <img src="https://img.shields.io/badge/docs-ambiten.dev-22c55e?style=flat-square" alt="documentation" />
</a> -->
  <a href="https://github.com/AmbitenHQ/ambiten/stargazers">
    <img src="https://img.shields.io/github/stars/AmbitenHQ/ambiten?style=flat-square&color=1E88E5" alt="GitHub stars" />
  </a>
<img src="https://img.shields.io/badge/structured-logging-6366f1?style=flat-square" alt="structured logging" />
<img src="https://img.shields.io/badge/context-aware-14b8a6?style=flat-square" alt="context aware" />
</p>

---

## Overview

`@ambiten/logger` provides the structured logging and telemetry layer for the Ambiten ecosystem.

It is designed for runtime-aware systems where logs are not merely developer output, but operational events attached to execution boundaries.

The logger can operate independently inside standard Node.js applications, APIs, workers, queues, GraphQL servers, and serverless environments. Inside the Ambiten runtime, it becomes context-aware and can automatically enrich log entries with request identifiers, tenant metadata, database targets, collection names, runtime metadata, and execution context.

Rather than treating logging as scattered console output, `@ambiten/logger` treats logs as structured runtime events that can move through transport pipelines, observability systems, metrics tracking, resilience layers, and production debugging workflows.

## Installation

```bash
npm install @ambiten/logger
```

## Quick Start

```ts
import { createLogger, consoleTransport } from "@ambiten/logger";

const logger = createLogger({
  level: "info",
  transports: [
    consoleTransport()
  ]
});

logger.info("Application started");
```

Structured metadata can be attached directly to log entries.

```ts
logger.error("Query failed", {
  tenantId: "tenant-a",
  requestId: "req-001",
  operation: "findOne"
});
```

The logger keeps metadata structured internally so transports can serialize, batch, forward, or persist logs without reconstructing runtime meaning from formatted strings.

## What Ambiten Logger Is

Ambiten Logger is not a console wrapper.

It is a structured telemetry pipeline for runtime execution.

Traditional loggers focus on writing messages. Ambiten Logger focuses on preserving operational meaning as execution moves across requests, middleware, models, workers, transactions, queues, adapters, and distributed infrastructure.

Every emitted log becomes a structured runtime event that can participate in formatting, filtering, buffering, batching, metrics tracking, transport routing, and resilience handling.

```text
Application Runtime
        ↓
Structured Log Entry
        ↓
Transport Pipeline
        ↓
Observability Destination
```

## Structured Logging

Ambiten Logger preserves logs as structured runtime entries.

```ts
logger.info("User created", {
  userId: "usr_123",
  tenantId: "tenant-a",
  route: "/register"
});
```

A structured log entry can preserve fields such as timestamps, severity levels, runtime metadata, source information, execution context, and operational payloads.

This makes logs easier to index, search, filter, aggregate, and correlate inside systems such as Elasticsearch, Loki, OpenSearch, Datadog, CloudWatch, or custom telemetry pipelines.

Text output remains useful during local development, but the internal logging model remains structured.

## Context-Aware Logging

When used with the Ambiten runtime, the logger can inherit execution metadata from the active runtime context.

```ts
await AmbitenContext.run(
  {
    tenantId: "enterprise-a",
    requestId: "req-992"
  },
  async () => {
    logger.info("Processing request");
  }
);
```

Logs emitted during that execution boundary can automatically preserve runtime metadata such as tenant identity, request scope, database name, collection name, operation metadata, transaction state, and logger metadata.

This is especially valuable in multi-tenant systems and distributed applications where operational visibility depends on being able to reconstruct execution flow across layers.

## Transport Pipeline

Ambiten Logger separates log creation from log delivery.

Applications emit structured runtime events. Transports decide where those events go.

```ts
import {
  createLogger,
  consoleTransport,
  createRotatingFileTransporter
} from "@ambiten/logger";

const logger = createLogger({
  json: true,
  transports: [
    consoleTransport(),
    createRotatingFileTransporter({
      filename: "./logs/runtime.log",
      frequency: "daily",
      backupCount: 7,
      compress: true
    })
  ]
});
```

The transport layer is composable and can support console output, static files, rotating files, buffered delivery, asynchronous batching, HTTP ingestion, Loki, Elasticsearch, and custom infrastructure.

Because every transport receives normalized runtime entries, observability infrastructure can evolve without changing application logging logic.

## Metrics and Runtime Signals

The logger can track operational metrics about the logging pipeline itself.

Metrics can expose activity such as processed log volume, transport dispatches, successful writes, buffer flushes, file rotations, dropped logs, and transport errors.

```ts
const logger = createLogger({
  enableMetrics: {
    enabled: true,
    logInterval: 60_000
  }
});
```

These metrics are not application logs. They describe the behavior of the logging infrastructure so teams can understand transport pressure, delivery failures, buffering behavior, and runtime throughput under production workloads.

## Resilience

Production logging infrastructure can fail.

Remote endpoints may become unavailable, networks may degrade, filesystems may stall, or observability backends may reject ingestion under pressure.

Ambiten Logger supports resilience patterns that help isolate logging failures from application execution.

```ts
const transport = createResilientTransporter(
  createHttpTransport(process.env.LOG_INGEST_URL!)
);
```

Retries and circuit breaker behavior help prevent unstable observability infrastructure from creating runtime instability.

A transport failure should remain an operational signal, not become an application failure.

## Production Usage

In production, structured logging should be treated as part of the operational architecture.

A typical production setup uses JSON output, context-aware metadata, persistent or remote transports, graceful shutdown, and selective metrics tracking.

```ts
const logger = createLogger({
  level: "info",
  json: true,
  transports: [
    createRotatingFileTransporter({
      filename: "./logs/runtime.log",
      frequency: "daily",
      backupCount: 7,
      compress: true
    })
  ],
  enableMetrics: {
    enabled: true,
    logInterval: 60_000
  }
});
```

High-throughput systems should prefer buffering or asynchronous batching so logging does not introduce unnecessary filesystem or network pressure during sustained traffic.

## Runtime Environments

`@ambiten/logger` is designed to operate across different execution environments.

It can be used in local development, production APIs, background workers, queue processors, GraphQL systems, serverless functions, and containerized infrastructure.

The logging model remains consistent across environments because the logger operates on structured runtime entries before transport delivery occurs.

## Relationship with Ambiten

`@ambiten/logger` is part of the wider Ambiten runtime ecosystem.

It complements `@ambiten/core`, runtime instrumentation, adapter-driven execution, transaction-aware workflows, middleware pipelines, tenant-aware context propagation, and production observability tooling.

The package can still be used independently in non-Ambiten systems, but its full value appears when runtime context and structured execution metadata are available.

## Documentation

The official Ambiten documentation includes guides for structured logging, context-aware telemetry, transport pipelines, production configuration, metrics tracking, resilience handling, testing, shutdown behavior, and observability integration.

Documentation:

https://Ambiten.dev

## Philosophy

> Logs should describe runtime behavior, not just developer intent.

Ambiten Logger exists to make operational behavior visible, structured, and traceable across modern runtime systems.

## License

MIT
