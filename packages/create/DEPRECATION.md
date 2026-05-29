# Deprecation / Migration notes (draft)

This file provides guidance for a planned deprecation notice for the `@tenra/create` package if/when the maintainers decide to deprecate it in favor of `@tenra/cli`.

- Purpose: `@tenra/create` is the interactive scaffolder containing project templates. `@tenra/cli` is a lightweight shim that prefers programmatic initialization (via `initTenra`) and delegates to `@tenra/create` for interactive templates.

- Recommendation: Do not deprecate `@tenra/create` immediately. Instead, phase migration by:
  1. Announcing `@tenra/cli` as the recommended tenra-first entry point for programmatic initialization and CI-friendly creation.
  2. Keeping `@tenra/create` as the interactive template engine and documenting the delegation path (`@tenra/cli scaffold` spawns `@tenra/create`).
  3. If deprecating in the future, provide a 3-month transition period and an npm deprecation notice that points users to `@tenra/cli` and documents how to continue using templates directly via `@tenra/create`.

- Example npm deprecate command (run from a maintainer machine with npm rights):

```bash
npm deprecate @tenra/create "The interactive scaffolder is being superseded by @tenra/cli (tenra-first). See https://github.com/NodEm9/tenra for migration instructions."
```

- Release note snippet (for changelog / PR description):

"Introduce `@tenra/cli` (tenra-first CLI shim). `@tenra/create` continues to provide interactive templates; run `@tenra/cli scaffold` to use those templates."

---
