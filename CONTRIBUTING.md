# Contributing to Ambiten

Thank you for your interest in contributing to Ambiten.

Ambiten is a framework-agnostic runtime for multi-tenant MongoDB systems. Whether you're improving documentation, fixing bugs, expanding adapter support, or helping evolve the runtime architecture, your contributions are welcome.

## Development Environment

Ambiten is maintained as a pnpm workspace monorepo.

### Prerequisites

* Node.js 20+
* pnpm 10+
* MongoDB (required only for packages and tests that interact with a database)

### Clone and Install

```bash
git clone https://github.com/AmbitenHQ/ambiten.git
cd ambiten
pnpm install
```

### Build the Workspace

```bash
pnpm build
```

### Run Tests

```bash
pnpm test
```

### Run Linting

```bash
pnpm lint
```

## Areas for Contribution

We welcome contributions across the ecosystem, including:

* Adapter development for additional frameworks and runtimes
* Runtime and context propagation improvements
* Documentation and real-world examples
* Redis, GraphQL, and observability integrations
* Testing, benchmarking, and performance improvements

## Pull Request Process

### Create a Branch

Use a descriptive branch name:

```text
feat/lambda-adapter
fix/context-leak
docs/runtime-guide
```

### Follow Conventional Commits

Examples:

```text
feat: add lambda adapter support
fix: resolve context propagation issue
docs: improve transaction documentation
refactor: simplify runtime initialization
```

### Add Tests

When introducing new functionality or fixing defects, add or update the relevant test suite.

### Validate Before Submitting

Run the following before opening a pull request:

```bash
pnpm lint
pnpm test
pnpm build
```

### Open the Pull Request

Provide a clear description of the problem being solved, the approach taken, and any relevant implementation details.

## Code Standards

### Type Safety

New code should be fully typed. Avoid `any` unless there is a clear and justified reason.

### Context Awareness

Features interacting with runtime execution should integrate correctly with the Ambiten context lifecycle and execution model.

### Separation of Concerns

Adapters should remain independent of core runtime logic. Core packages should not depend on framework-specific implementations.

## Reporting Issues

When reporting a bug, please include:

* Package name and version
* Node.js version
* Relevant runtime or adapter information
* Steps to reproduce the issue
* A minimal reproducible example whenever possible

## Questions and Discussions

For questions, ideas, or architecture discussions, please open a GitHub Discussion or Issue in the repository.

We appreciate every contribution that helps make Ambiten more reliable, maintainable, and useful for the community.
