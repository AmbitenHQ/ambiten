# @ambiten/adapter-types

## 1.0.2

### Patch Changes

- d96aaf8: Extend bootstrap configuration with external modules and declarative schema
  defaults, and improve package compatibility.

  ### Configuration and schema defaults

  - Support external tenant configuration through
    `multiTenant.tenantConfigResolverModule`, including module paths and named
    exports.
  - Propagate the configured tenant resolver through bootstrap initialization
    so externally discovered tenants can be resolved at runtime.
  - Support external schema and model modules through the `schema` and `model`
    configuration properties while retaining inline configuration.
  - Support declarative `$runtime` defaults for dates, UUIDs, and supported
    AmbitenContext values.
  - Validate runtime-default descriptors and supported context keys.
  - Resolve defaults per document and avoid sharing mutable object or array
    defaults between documents.

  ### Bootstrap and scaffolding

  - Restore automatic creation of the bootstrap log directory and log file
    during logger initialization.
  - Update interactive scaffold summaries to handle the revised model
    configuration structure.
  - Generate applications with `@ambiten/core` set to `latest`, allowing the
    initial dependency installation to resolve the release published under
    that registry tag.

  ### Package compatibility and build reliability

  - Correct emitted ESM module references to include the file extensions
    required by Node.js.
  - Fix package-boundary compatibility between core, adapter types, adapter
    runtime, and the Express adapter for ESM and CommonJS consumers.
  - Preserve request-context propagation across the tested core and adapter
    package boundaries.
  - Resolve browser bundle build failures involving Node.js module imports.
  - Improve Windows compatibility when invoking pnpm from build and
    integration-test scripts.
