# Frontend Docs

## Stack

No frontend exists in V1. The repository is markdown-first and intended to be
used directly by coding agents.

## Commands

```bash
pnpm run preflight
```

## Structure

If a UI is added later, document its source tree here before implementation.
The current user-facing surface is repository documentation, specs, and agent
files.

## State Management

No client state exists. Agent memory is represented by scoped files under the
future `memory/` tree.

## UI Rules

No UI design system exists yet. A future UI must preserve the same memory,
privacy, and source-of-truth rules defined in `.specify/memory/constitution.md`.
