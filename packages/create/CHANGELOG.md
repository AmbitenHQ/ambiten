# Changelog

All notable changes to this package will be documented in this file.

## [1.1.0] - 2025-12-13

### Added
- Include Figlet fonts in the distributed package so `npx @tenra/create` and
  tarball installs can render the Figlet banner reliably.
- Add `scripts/copy-figlet-fonts.js` and run it during `prepack` to ensure fonts
  are copied into `dist/fonts` before packing/publishing.
- Add `scripts/test-pack-install.js` to help validate that packed tarballs
  install cleanly via `npm` and `pnpm` and that the splash is present.

### Changed
- Display a concise fallback banner when Figlet fonts are not present (avoids
  noisy ENOENT output during `npx`/tarball installs).
# @tenra/create

## 1.0.4

### Patch Changes

- Updated dependencies
  - @tenra/logger@2.0.0

## 1.0.3

### Patch Changes

- Fix publishing issues: ensure binaries and inter-package dependency versions are published correctly (replace workspace:\* with real versions).
- Updated dependencies
  - @tenra/logger@1.1.3

## 1.0.2

### Patch Changes

- Fix publishing issues: ensure binaries and inter-package dependency versions are published correctly (replace workspace:\* with real versions).
- Updated dependencies
  - @tenra/logger@1.1.2

## 1.0.1

### Patch Changes

- Updated dependencies
  - @tenra/logger@1.1.1
