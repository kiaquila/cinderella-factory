# Spec: Adopt Unicorn Hub Workflow

## Goal

Install a Unicorn Hub-inspired process layer so Cinderella Factory work becomes
spec-first, PR-only, and review-gated before agent implementation begins.

## Scope

In scope:

- Repository onboarding docs and durable project docs.
- Feature-memory templates and this feature folder.
- Local Node/pnpm process tooling.
- GitHub CI, PR Guard, AI Command Policy, AI Review, OSV, Dependabot, and PR
  template files.
- Configuration of product paths for a markdown-first agent repository.
- Rename the planned future sales and child-health agents to `salesman` and
  `pediatrician`.

Out of scope:

- Implementing `mila`, `salesman`, or `pediatrician`.
- Adding MemPalace, RAG, LangChain, or runtime agent execution.
- Applying branch protection before the workflows are merged to `main`.

## User Stories

### User Story 1

As the repository owner, I want every future agent change to start from a spec,
so that agent behavior, memory boundaries, and safety rules stay reviewable.

### User Story 2

As an implementation agent, I want explicit read order, product paths, and
preflight commands, so that I can make changes without guessing repository
policy.

## Acceptance Criteria

1. Given a future PR changes configured product paths, when PR Guard runs, then
   it requires a complete `spec.md`, `plan.md`, and `tasks.md` in one feature
   folder.
2. Given local work is ready to push, when `pnpm run preflight` runs, then it
   validates baseline files, feature memory, and script syntax.
3. Given a PR is opened, when GitHub Actions run, then `baseline-checks`,
   `guard`, `AI Review`, and `osv-scan` are available.
4. Given a trusted human asks for Codex review, when the AI-review gate polls,
   then acceptable Codex evidence must be tied to the current PR head.
5. Given repository docs mention planned future agents, when read by an agent,
   then the future agent ids are `mila`, `salesman`, and `pediatrician`.

## Negative Scenarios

1. Given product paths change without feature memory, when PR Guard runs, then
   the PR fails instead of silently passing.
2. Given stale AI review evidence exists for an older commit, when `AI Review`
   runs for a newer head, then the gate does not accept stale evidence.
3. Given future-facing docs still use the old sales or child-health agent ids,
   when checked, then the PR is not ready.

## Requirements

- FR-001: The repository must include Unicorn Hub-derived docs, scripts,
  workflows, and templates adapted to Cinderella Factory.
- FR-002: `.unicorn-hub/config.json` must define product paths that match this
  repository's agent-factory surface.
- FR-003: The PR must seed durable docs from the existing V1 plan instead of
  leaving generic placeholders.
- FR-004: The PR must keep branch protection as a post-merge operation.

## Success Criteria

- SC-001: `pnpm run preflight` passes locally.
- SC-002: GitHub PR checks run on the opened PR.
- SC-003: Codex review is triggered from the PR.

## Assumptions

- `claude` remains the default implementation agent and `codex` remains the
  default review agent.
- `pediatrician` uses the corrected Russian display name `Педиатр`.
