# @tenra/adapter-types

<p align="center">
  <img src="../../tenra-brand/tenra_svg/tenra-primary-logo-dark.svg" alt="Tenra" width="250" />
</p>

<p align="center">
  <strong>Shared adapter contracts for the Tenra ecosystem.</strong>
</p>

<p align="center">
  Provides the TypeScript interfaces, runtime contracts, and adapter definitions used by the Tenra adapter architecture.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@tenra/adapter-types">
    <img src="https://img.shields.io/npm/v/@tenra/adapter-types?style=flat-square" alt="npm version" />
  </a>
  <a href="https://tenra.dev">
    <img src="https://img.shields.io/badge/docs-tenra.dev-22c55e?style=flat-square" alt="documentation" />
  </a>
</p>

---

## Overview

`@tenra/adapter-types` contains the shared contracts used throughout the Tenra adapter ecosystem.

It defines the interfaces, execution contracts, context structures, adapter definitions, and runtime types that allow framework integrations to participate consistently in the Tenra runtime model.

Most applications will never import this package directly. Instead, it is consumed by adapter implementations and runtime infrastructure packages.

The purpose of the package is to ensure that every adapter operates against a common set of runtime expectations.

## Installation

This package is installed automatically by Tenra adapter packages and typically does not need to be added manually.

```bash
npm install @tenra/adapter-types
```

## Architectural Position

The package sits at the foundation of the adapter ecosystem.

```text
Adapter Types
      ↓
Adapter Runtime
      ↓
Framework Adapters
      ↓
Tenra Core
```

The contracts defined here provide a common language between all adapter implementations.

## What the Package Provides

The package contains the shared types required to build adapter integrations and runtime infrastructure.

These definitions may include:

* Adapter contracts
* Runtime context interfaces
* Execution lifecycle contracts
* Tenant resolution contracts
* Request metadata structures
* Transaction-related definitions

By centralizing these definitions, adapters remain consistent and easier to maintain across the ecosystem.

## Adapter Development

Framework adapters are built against the contracts exposed by this package.

A custom adapter can implement the required interfaces while still participating fully in the Tenra execution model.

```text
Custom Framework
        ↓
Adapter Contract
        ↓
Adapter Runtime
        ↓
Tenra Context
```

This allows new integrations to be added without modifying the core runtime architecture.

## Why a Separate Package?

Separating contracts from implementation provides several benefits.

Adapter packages can share a single source of truth for runtime definitions, reducing duplication and preventing contract drift across framework integrations.

It also allows adapter-runtime and framework-specific adapters to evolve independently while remaining compatible through stable shared interfaces.

## Who Should Use This Package?

Most developers should use one of the framework adapters directly:

* `@tenra/adapter-express`
* `@tenra/adapter-fastify`
* `@tenra/adapter-nestjs`
* `@tenra/adapter-graphql`
* `@tenra/adapter-lambda`

Direct usage of `@tenra/adapter-types` is generally intended for adapter authors, framework integration developers, and contributors extending the adapter ecosystem.

## Documentation

Complete documentation is available at:

https://tenra.dev

## Related Packages

* `@tenra/core`
* `@tenra/adapter-runtime`
* `@tenra/adapter-express`
* `@tenra/adapter-fastify`
* `@tenra/adapter-nestjs`
* `@tenra/adapter-graphql`
* `@tenra/adapter-lambda`

## License

MIT
