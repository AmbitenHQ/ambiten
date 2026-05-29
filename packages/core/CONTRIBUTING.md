# Contributing to Tenra

First off, thank you for taking the time to contribute! It is people like you who make Tenra a great tool for the community.

## Development Environment

Tenra is managed as a Monorepo using pnpm workspaces (or npm/yarn).

1. **Prerequisites:** Node.js >= 18 and a local MongoDB instance.

2. **Clone & Install:**

```bash
git clone https://github.com/NodEm9/tenra.git
cd tenra
npm install
```

3. **Build the Workspace:**

```bash
npm run build
```

## Contribution Areas

We are specifically looking for help in these areas:

- **Adapters:** Expanding support to frameworks like Hono, Elysia, or Koa.
- **Core Logic:** Optimizing the TenraContext and AsyncLocalStorage implementation.
- **Documentation:** Improving the VitePress guides and adding "Real-world" examples.
- **Integrations:** Enhancing Redis caching or GraphQL auto-generation.

## Pull Request Process

1. **Branching:** Create a descriptive branch name (e.g., feat/lambda-adapter or fix/context-leak).

2. **Commit Messages:** We follow Conventional Commits.

3. **feat:** for new features.

4. **fix:** for bug fixes.

5. **docs:** for documentation changes.

6. **Tests:** Ensure you add or update tests in the __tests__ or test directory of the relevant package.

7. **Validation:** Run npm run lint and npm test across the workspace before pushing.

8. **Review:** Once submitted, a maintainer will review your code. We aim to provide feedback within 48 hours.

## Code Standards

- **TypeScript:** All new code must be strictly typed. Avoid any unless absolutely necessary.

- **Context Awareness:** Ensure any new database-related features correctly utilize TenraContext.getStore().

- **Orthogonality:** Keep adapters separate from core logic. Core should never depend on a specific web framework.

## Reporting Issues

If you find a bug, please include:

1. The version of @tenra/core and the specific adapter you are using.

2. Your Node.js version.

3. A minimal, reproducible code snippet or a link to a repository.
