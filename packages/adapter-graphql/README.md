<div style="display: flex; align-items: center;">
<p>
  <img
    src="https://raw.githubusercontent.com/AmbitenHQ/ambiten/main/assets/ambiten-mark-192x192.png"
    width="56"
    alt="Ambiten"
  />
</p>
<h2>@ambiten/adapter-graphql</h2>
</div>

<p align="center">
  <strong>GraphQL execution integration for the Ambiten runtime.</strong>
</p>

<p align="center">
  Preserve tenant identity, request metadata, runtime state, and execution continuity across GraphQL resolvers, services, models, subscriptions, and streaming operations.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@ambiten/adapter-graphql">
    <img src="https://img.shields.io/npm/v/@ambiten/adapter-graphql?style=flat-square" alt="npm version" />
  </a>
  <a href="https://github.com/AmbitenHQ/ambiten/stargazers">
    <img src="https://img.shields.io/github/stars/AmbitenHQ/ambiten?style=flat-square&color=1E88E5" alt="GitHub stars" />
  </a>
</p>

---

## Overview

`@ambiten/adapter-graphql` connects GraphQL execution to the Ambiten runtime.

The adapter establishes an Ambiten execution boundary around the actual GraphQL operation so runtime context remains active while resolvers, nested asynchronous calls, application services, and models execute.

This allows tenant identity, request metadata, logging, instrumentation, and other execution-scoped state to move through the application without being passed manually through every resolver.

The package currently provides integrations for:

- Apollo Server
- GraphQL Yoga

The GraphQL server may change.

The Ambiten execution model does not.

---

## Installation

Install the GraphQL adapter:

```bash
npm install @ambiten/adapter-graphql
```

Most applications will also use the Ambiten core runtime:

```bash
npm install @ambiten/core @ambiten/adapter-graphql
```

Install the GraphQL server separately according to your application.

## Apollo Server

```bash
npm install @apollo/server graphql
```

## GraphQL Yoga

```bash
npm install graphql-yoga graphql
```

`@ambiten/adapter-graphql` does not require Ambiten applications to adopt a particular GraphQL server internally.

### Apollo Server

Use `createApolloAdapter()` to establish the Ambiten runtime around Apollo GraphQL execution.

```ts
import {
  ApolloServer
} from "@apollo/server";

import {
  startStandaloneServer
} from "@apollo/server/standalone";

import {
  createApolloAdapter
} from "@ambiten/adapter-graphql";

import {
  MultiTenantManager
} from "@ambiten/core";

const server =
  new ApolloServer({
    typeDefs,
    resolvers
  });

const adapter =
  createApolloAdapter();

adapter.install(
  server,
  {
    tenancy: {
      header:
        "x-tenant-id",

      validate:
        async (
          tenantId
        ) => {
          const tenant =
            await MultiTenantManager
              .resolveTenant(
                tenantId
              );

          if (!tenant) {
            throw new Error(
              `Tenant with ID "${tenantId}" not found.`
            );
          }

          return true;
        }
    }
  }
);

await startStandaloneServer(
  server,
  {
    listen: {
      port: 4000
    }
  }
);
```

The application does not need to interact with adapter-runtime internals.

The execution flow becomes:

```text
HTTP Request
      ↓
Apollo Server
      ↓
createApolloAdapter()
      ↓
Ambiten Adapter Runtime
      ↓
Tenant Resolution
      ↓
AmbitenContext
      ↓
Resolvers
      ↓
Services
      ↓
AmbitenModel
      ↓
MongoDB
```

The Ambiten context remains active until GraphQL execution completes.

### GraphQL Yoga

Use `createYogaAdapter()` as a Yoga plugin.

```ts
import {
  createSchema,
  createYoga
} from "graphql-yoga";

import {
  createYogaAdapter
} from "@ambiten/adapter-graphql";

import {
  MultiTenantManager
} from "@ambiten/core";

const yoga =
  createYoga({
    schema:
      createSchema({
        typeDefs,
        resolvers
      }),

    plugins: [
      createYogaAdapter({
        tenancy: {
          header:
            "x-tenant-id",

          validate:
            async (
              tenantId
            ) => {
              const tenant =
                await MultiTenantManager
                  .resolveTenant(
                    tenantId
                  );

              if (!tenant) {
                throw new Error(
                  `Tenant with ID "${tenantId}" not found.`
                );
              }

              return true;
            }
        }
      })
    ]
  });
```

Yoga queries, mutations, subscriptions, and supported streaming execution enter the same Ambiten runtime model.

## Runtime Flow

Regardless of the GraphQL server, the execution architecture remains consistent:

```text
GraphQL Request
        ↓
Apollo Server / GraphQL Yoga
        ↓
Ambiten GraphQL Adapter
        ↓
Adapter Runtime
        ↓
Tenant Resolution
        ↓
AmbitenContext
        ↓
Resolver
        ↓
Application Service
        ↓
AmbitenModel
        ↓
Effective ModelContext
        ↓
Tenant Infrastructure
        ↓
MongoDB
```

The adapter owns the framework execution boundary.

Application code remains focused on GraphQL and business logic.

## Resolver Execution

Resolvers do not need to manually forward tenant identity or request metadata through application layers.

```ts
export const resolvers = {
  Query: {
    users:
      async () => {
        return UserModel.find(
          {}
        );
      }
  },

  Mutation: {
    createUser:
      async (
        _parent,
        args
      ) => {
        return UserModel.create(
          args.input
        );
      }
  }
};
```

Conceptually:

```text
Resolver
   ↓
Service
   ↓
Nested async work
   ↓
AmbitenModel
   ↓
MongoDB
```

The active Ambiten execution context remains available throughout the chain.

## Multi-Tenancy

Tenant identity can be resolved at the GraphQL ingress boundary.

```ts
createApolloAdapter()
  .install(
    server,
    {
      tenancy: {
        header:
          "x-tenant-id",

        validate:
          async (
            tenantId
          ) => {
            const tenant =
              await MultiTenantManager
                .resolveTenant(
                  tenantId
                );

            return Boolean(
              tenant
            );
          }
      }
    }
  );
```

or with Yoga:

```ts
createYogaAdapter({
  tenancy: {
    header:
      "x-tenant-id",

    validate:
      async (
        tenantId
      ) => {
        const tenant =
          await MultiTenantManager
            .resolveTenant(
              tenantId
            );

        return Boolean(
          tenant
        );
      }
  }
});
```

Once resolved, the tenant identity becomes part of the active Ambiten execution.

Models and services can then participate in tenant-aware infrastructure resolution without manually receiving the tenant ID through resolver arguments.

Tenant resolution does not replace authentication or authorization.

Applications remain responsible for deciding whether a caller is permitted to act for a resolved tenant.

## Application Context

Ambiten does not replace the normal GraphQL context object.

Application-specific values such as:

- authenticated users
- DataLoaders
- API clients
- feature flags
- domain services

can continue to use the framework's normal GraphQL context.

Ambiten separately maintains execution-scoped runtime state such as:

```text
tenantId
requestId
dbName
collectionName
debug
logger metadata
runtime metadata
```

Conceptually:

```text
GraphQL Context
→ application data
→ authenticated user
→ loaders
→ services

AmbitenContext
→ execution identity
→ tenant identity
→ request metadata
→ infrastructure state
```

The two contexts can coexist.

## Concurrent Execution

Ambiten uses execution-scoped context propagation so concurrent GraphQL operations remain isolated.

```text
Operation A
tenant-a
request-a
        ↓
resolver chain
        ↓
tenant-a remains active


Operation B
tenant-b
request-b
        ↓
resolver chain
        ↓
tenant-b remains active
```

One operation does not need to manually protect itself from another operation's runtime state.

## Subscriptions and Streaming

The GraphQL adapter supports runtime continuity for subscription and streaming execution.

A subscription may outlive the initial GraphQL execution call, so Ambiten restores the already-resolved execution snapshot when the asynchronous iterator continues.

Conceptually:

```text
GraphQL Subscription
        ↓
Tenant resolved once
        ↓
Execution snapshot
        ↓
Async iterator
        ↓
next()
        ↓
Ambiten execution restored
        ↓
resolver / service / model work
```

This preserves execution identity without treating each emitted payload as a new ingress request.

## Transactions

Automatic GraphQL-operation-wide transactions are intentionally not supported through:

```ts
enableTransactions: true
```

GraphQL may complete an operation successfully at the transport level while still reporting resolver failures in the GraphQL result.

For that reason, transaction ownership should remain aligned with the business workflow rather than the entire GraphQL operation.

Use an explicit transaction boundary inside the mutation or application service that requires atomicity.

```text
Mutation Resolver
        ↓
Application Service
        ↓
Explicit Transaction Boundary
        ↓
Model A
        ↓
Model B
        ↓
Commit / Rollback
```

This keeps transaction semantics aligned with the actual unit of work.

## Framework-Neutral Design

`@ambiten/adapter-graphql` intentionally keeps its runtime integration independent from GraphQL framework type hierarchies.

Internally, framework-specific requests are normalized into Ambiten's adapter request contract:

```text
Apollo ─────┐
            │
Yoga ───────┤
            ↓
AmbitenRequestLike
            ↓
Adapter Runtime
            ↓
AmbitenContext
```

This reduces coupling between Ambiten and framework release cycles while preserving a stable execution model.

Applications remain free to choose and upgrade their GraphQL server independently.

## Legacy Context Factories

Earlier versions exposed:

```ts
createApolloContextFactory()
createYogaContextFactory()
```

These APIs may remain available for compatibility, but they are not the recommended integration path for new applications.

Creating a GraphQL context object is not the same as keeping the Ambiten runtime active while resolvers execute.

For new applications, use:

```ts
createApolloAdapter()
```

or:

```ts
createYogaAdapter()
```

These APIs establish the runtime around actual GraphQL execution.

## Execution Boundary

The central rule is simple:

```text
GraphQL context creation
≠
GraphQL execution
```

Ambiten therefore establishes its runtime around:

```text
GraphQL Operation
        ↓
Resolvers
        ↓
Services
        ↓
Models
```

rather than only around the earlier context-construction lifecycle.

This ensures execution state remains available where application work actually happens.

## Documentation

Complete documentation is available at:

https://docs.ambiten.dev

### Related Packages

- @ambiten/core
- @ambiten/adapter-runtime
- @ambiten/adapter-types
- @ambiten/logger
- @ambiten/create

## License

MIT
