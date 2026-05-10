# ADR-001: Adopt Unicorn Hub Workflow

## Status

Accepted

## Context

Cinderella Factory will be edited mostly by coding agents. Without a durable
workflow, agent changes can drift from product intent, skip safety boundaries,
or land without evidence that the requested behavior still holds.

Unicorn Hub provides a portable process layer for spec-first, PR-only,
review-gated work. The useful parts for this repository are the docs system,
feature memory, local preflight, PR Guard, AI Review, and branch-protection
scripts.

## Decision

Adopt Unicorn Hub's workflow as the repository control plane, adapted for a
markdown-first personal agent factory.

The active product paths are agent contracts, orchestrator rules, skills,
memory, knowledge, evals, docs, scripts, and GitHub workflows rather than an
application `src/` tree.

## Consequences

- Product changes must include a complete `specs/<feature-id>/` folder.
- PRs are expected to pass `baseline-checks`, `guard`, and `AI Review`.
- The human owner remains the final merge authority.
- Branch protection should be applied after the workflow files are merged to
  `main`.
- Future agent implementation work starts from the seeded docs and feature
  memory instead of ad hoc prompt notes.
