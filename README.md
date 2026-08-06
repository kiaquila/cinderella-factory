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
- `orchestrator/` stores routing, activation, and context assembly rules.
- `agents/` stores specialist agent contracts and safety policies.
- `skills/` stores procedural workflows agents can use.
- `context/` stores owner-specific context with domain scopes.
- `knowledge/` stores non-memory domain doctrine and reference distillations.
- `memory/` stores shared, agent-scoped, and session-scoped memory.
- `templates/` stores reusable contract templates.
- `evals/` stores planned eval packs for routing, safety, and privacy.
- `scripts/` contains local and CI gate helpers adapted from Unicorn Hub.

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
pnpm run install:claude   # symlink design-team roles/skills into ~/.claude
```

`install:claude` never deletes anything it finds: an existing file, directory,
or foreign symlink at a link path is moved to
`~/.claude/.pre-factory-backups/<agents|skills>/<name>` first. Backups live in
that dot-directory rather than beside the original because Claude Code loads
every `~/.claude/skills/*/SKILL.md`, and an in-place backup would register as a
duplicate skill.

## Required PR Checks

The active list is `.unicorn-hub/config.json` (`requiredChecks`):

- `baseline-checks`
- `guard`
- `AI Review`

Branch protection should be applied only after these workflows are present on
`main`.
