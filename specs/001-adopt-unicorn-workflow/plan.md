# Plan: Adopt Unicorn Hub Workflow

## Summary

Bootstrap the portable Unicorn Hub workflow, adapt it for a markdown-first
agent repository, seed durable docs from the V1 plan, and publish the change as
a review-gated PR.

## Technical Context

- runtime: Node.js 20 for repository process scripts
- dependencies: pnpm workspace with no runtime dependencies
- product paths: agent contracts, orchestrator rules, skills, context,
  knowledge, memory, evals, docs, scripts, and workflows
- data changes: none

## Scope Boundaries

In scope:

- Process docs and durable project docs.
- `.specify/`, `.unicorn-hub/`, `specs/`, `scripts/`, and `.github/` files.
- Existing V1 plan updates for `salesman` and `pediatrician`.

Out of scope:

- Implementing actual agent files.
- Enabling branch protection before workflow files exist on `main`.
- Adding a web UI, RAG backend, or runtime orchestration framework.

## Constitution Check

- Spec-first: this PR includes a complete feature-memory folder.
- Testable boundaries: process scripts are validated by local preflight and CI.
- PR-only: changes are prepared on `codex/adopt-unicorn-workflow`.
- Simplicity: no runtime framework is added; Node scripts are limited to gates
  and repository helpers.
- Deployability: `main` remains a repository control plane with no production
  deploy target.

## Complexity Tracking

The new complexity is a process layer: pnpm metadata, Node scripts, workflow
files, and feature-memory templates. It solves a current need because
Cinderella Factory is about to accumulate agent safety, memory, and knowledge
contracts that should not be changed ad hoc.

The simpler alternative, a single planning document, is already insufficient
for PR-gated multi-agent work because it cannot enforce feature memory or
current-head review evidence.

## Verification

| Acceptance criterion | Evidence |
| --- | --- |
| AC-001 | `pnpm run preflight`; PR Guard on GitHub |
| AC-002 | `pnpm run preflight` |
| AC-003 | GitHub Actions check rollup after PR opens |
| AC-004 | `ai-command-policy` and `ai-review` workflow files plus Codex review trigger |
| AC-005 | `rg "salesman|pediatrician" docs README.md AGENTS.md docs_project` shows future-facing docs use the new ids |

Negative scenario evidence:

- Missing feature memory is covered by `scripts/check-feature-memory.mjs` and
  `.github/workflows/pr-guard.yml`.
- Stale review evidence is covered by the head-bound AI Review scripts from the
  current Unicorn Hub `main`.
- Future-facing agent names are checked with `rg` before commit.

## Risks

- First-install PR Guard falls back to PR-supplied scripts because trusted
  scripts do not exist on `main` yet. Mitigation: keep this as the one bootstrap
  PR, then rely on default-branch trusted scripts afterward.
- `AI Review` requires a trusted human/native trigger to satisfy the gate.
  Mitigation: trigger `@codex review` after opening the PR.
- Branch protection cannot be applied until workflows are merged. Mitigation:
  document the post-merge command in durable docs.
