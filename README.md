# Cinderella Factory

Cinderella Factory is a private, markdown-first factory for personal specialist
agents. V1 is intentionally small: one orchestrator, reusable skills, scoped
memory, evaluation cases, and three starter agents planned as `mila`,
`salesman`, and `pediatrician`.

## Development Workflow

This repository uses a portable multi-agent development workflow:

- durable project docs in `docs_project/`
- feature memory in `specs/<feature-id>/`
- SENAR-style verification evidence and process memory
- agent onboarding in `AGENTS.md`
- Claude-specific guidance in `CLAUDE.md`
- local preflight before push
- GitHub CI, PR Guard, and AI Review gates

## Repository Map

- `docs/cinderella-factory-v1-plan.md` captures the original V1 architecture.
- `docs_project/` stores durable project context for agents and humans.
- `specs/<feature-id>/` stores one feature's spec, plan, and task memory.
- `.specify/` stores repository-wide process rules and templates.
- `scripts/` contains local and CI gate helpers adapted from Unicorn Hub.

Future product folders will include `orchestrator/`, `agents/`, `skills/`,
`context/`, `knowledge/`, `memory/`, `templates/`, and `evals/`.

## First Setup After Bootstrap

Project docs are seeded from the V1 plan. If the direction changes, refresh
`docs_project/` before product work:

```text
Read CREATE-DOCS.md and ai-docs-guide.md.
Interview me in small batches and write durable project docs under docs_project/.
When docs are sufficient, create the first specs/<feature-id>/spec.md, plan.md,
and tasks.md. Do not implement product code yet.
```

If project docs already exist, use the same protocol to review and refresh them.

## Local Commands

```bash
pnpm run preflight
pnpm run worktree:new -- --slug 001-example
pnpm run pr:publish
```

## Required PR Checks

The active list is `.unicorn-hub/config.json` (`requiredChecks`):

- `baseline-checks`
- `guard`
- `AI Review`

Branch protection should be applied only after these workflows are present on
`main`.
