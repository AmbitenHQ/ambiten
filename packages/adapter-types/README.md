<div style="display: flex; align-items: center;">
<p >
  <img
    src="https://cdn.jsdelivr.net/gh/AmbitenHQ/ambiten@main/assets/ambiten-mark-192x192.png"
    width="56"
    alt="Ambiten"
  />  
</p> <h2> @ambiten/adapter-types</h2>
</div>

<p align="center">
  <strong>Shared adapter contracts for the Ambiten ecosystem.</strong>
</p>

<p align="center">
  Provides the TypeScript interfaces, runtime contracts, and adapter definitions used by the Ambiten adapter architecture.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@ambiten/adapter-types">
    <img src="https://img.shields.io/npm/v/@ambiten/adapter-types?style=flat-square" alt="npm version" />
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

`@ambiten/adapter-types` contains the shared contracts used throughout the Ambiten adapter ecosystem.

It defines the interfaces, execution contracts, context structures, adapter definitions, and runtime types that allow framework integrations to participate consistently in the Ambiten runtime model.

Most applications will never import this package directly. Instead, it is consumed by adapter implementations and runtime infrastructure packages.

The purpose of the package is to ensure that every adapter operates against a common set of runtime expectations.

## Installation

This package is installed automatically by Ambiten adapter packages and typically does not need to be added manually.

```bash
npm install @ambiten/adapter-types
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
Ambiten Core
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

A custom adapter can implement the required interfaces while still participating fully in the Ambiten execution model.

```text
Custom Framework
        ↓
Adapter Contract
        ↓
Adapter Runtime
        ↓
Ambiten Context
```

This allows new integrations to be added without modifying the core runtime architecture.

## Why a Separate Package?

Separating contracts from implementation provides several benefits.

Adapter packages can share a single source of truth for runtime definitions, reducing duplication and preventing contract drift across framework integrations.

It also allows adapter-runtime and framework-specific adapters to evolve independently while remaining compatible through stable shared interfaces.

## Who Should Use This Package?

Most developers should use one of the framework adapters directly:

* `@ambiten/adapter-express`
* `@ambiten/adapter-fastify`
* `@ambiten/adapter-nestjs`
* `@ambiten/adapter-graphql`
* `@ambiten/adapter-lambda`

Direct usage of `@ambiten/adapter-types` is generally intended for adapter authors, framework integration developers, and contributors extending the adapter ecosystem.

## Documentation

Complete documentation is available at:

https://ambiten.dev

## Related Packages

* `@ambiten/core`
* `@ambiten/adapter-runtime`
* `@ambiten/adapter-express`
* `@ambiten/adapter-fastify`
* `@ambiten/adapter-nestjs`
* `@ambiten/adapter-graphql`
* `@ambiten/adapter-lambda`

## License

MIT
