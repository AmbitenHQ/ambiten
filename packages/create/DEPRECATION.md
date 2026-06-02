# Deprecation / Migration notes (draft)

This file provides guidance for a planned deprecation notice for the `@Ambiten/create` package if/when the maintainers decide to deprecate it in favor of `@Ambiten/cli`.

- Purpose: `@Ambiten/create` is the interactive scaffolder containing project templates. `@Ambiten/cli` is a lightweight shim that prefers programmatic initialization (via `initAmbiten`) and delegates to `@Ambiten/create` for interactive templates.

- Recommendation: Do not deprecate `@Ambiten/create` immediately. Instead, phase migration by:
  1. Announcing `@Ambiten/cli` as the recommended Ambiten-first entry point for programmatic initialization and CI-friendly creation.
  2. Keeping `@Ambiten/create` as the interactive template engine and documenting the delegation path (`@Ambiten/cli scaffold` spawns `@Ambiten/create`).
  3. If deprecating in the future, provide a 3-month transition period and an npm deprecation notice that points users to `@Ambiten/cli` and documents how to continue using templates directly via `@Ambiten/create`.

- Example npm deprecate command (run from a maintainer machine with npm rights):

```bash
npm deprecate @Ambiten/create "The interactive scaffolder is being superseded by @Ambiten/cli (Ambiten-first). See https://github.com/NodEm9/Ambiten for migration instructions."
```

- Release note snippet (for changelog / PR description):

"Introduce `@Ambiten/cli` (Ambiten-first CLI shim). `@Ambiten/create` continues to provide interactive templates; run `@Ambiten/cli scaffold` to use those templates."

---
