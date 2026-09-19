---
"@ambiten/adapter-fastify": patch
---

Fix Fastify execution-context propagation by running route handlers inside the Ambiten adapter runtime boundary.

Previously, the adapter entered and exited `runWithAdapterContext()` during an empty `preHandler` hook before application handlers executed. This could cause tenant, request, transaction, and other execution-scoped state to be unavailable to downstream application code.

Fastify route handlers now execute inside the Ambiten runtime boundary, preserving context throughout asynchronous service and model execution.