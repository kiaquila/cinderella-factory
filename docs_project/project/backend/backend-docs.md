# Backend Docs

## Stack

No backend service exists in V1. The active runtime is Node.js 20 for repository
process tooling copied and adapted from Unicorn Hub.

## Commands

```bash
pnpm install
pnpm run preflight
pnpm run check:repo
```

## Environment Variables

No application environment variables are required yet. Repository variables used
by GitHub workflows are documented in `project/devops/ai-pr-workflow.md`.

## API Or Handler Structure

Future runtime code should keep external services behind explicit boundaries.
For now, the main implementation surfaces are markdown contracts under
`agents/`, `orchestrator/`, `skills/`, `context/`, `knowledge/`, and `memory/`.

## Deploy

No deploy target exists for V1. The release mechanism is PR-gated changes to
`main`.
