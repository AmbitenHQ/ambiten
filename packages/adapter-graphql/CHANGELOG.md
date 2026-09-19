# @ambiten/adapter-graphql

## 2.0.0

### Major Changes

- 694fc85: Preserve Ambiten execution context throughout Apollo Server and GraphQL Yoga execution.

### Minor Changes

- 06fc7b0: Add execution-scoped Apollo Server and GraphQL Yoga adapters.

  GraphQL operations now execute inside the Ambiten adapter runtime boundary instead of creating a short-lived runtime only while the GraphQL context object is constructed.

  The new `createApolloAdapter()` wraps Apollo-compatible HTTP GraphQL execution so tenant identity, request metadata, instrumentation state, and other Ambiten execution context remain active throughout asynchronous resolver and model execution.

  The new `createYogaAdapter()` integrates with Yoga-compatible execution and subscription hooks so queries, mutations, subscriptions, and streaming execution retain the correct Ambiten runtime boundary.

  The adapter now uses framework-neutral structural contracts instead of importing Apollo Server, GraphQL Yoga, or GraphQL framework types directly. This reduces framework coupling and avoids forcing application framework versions into the Ambiten dependency graph.

  Streaming and subscription continuations restore the already-resolved runtime snapshot without repeating ingress tenant resolution.

  Automatic GraphQL-wide transactions are rejected because GraphQL can report resolver failures through execution results without rejecting the execution promise. Use explicit transaction boundaries inside mutation workflows or application services instead.

  `createApolloContextFactory()` and `createYogaContextFactory()` remain available for compatibility but are deprecated because GraphQL context construction alone does not preserve the Ambiten runtime throughout resolver execution.
