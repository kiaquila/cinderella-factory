# Plan: Create Factory Skeleton

## Summary

Add the first durable markdown implementation of Cinderella Factory: product
folders, templates, orchestrator policy, starter agent contracts, initial
skills, and scoped memory placeholders.

## Technical Context

- runtime: no application runtime; Node.js 20 remains only for repository gates
- dependencies: no new package dependencies
- product paths: `README.md`, `orchestrator/`, `agents/`, `skills/`,
  `context/`, `knowledge/`, `memory/`, `templates/`, `evals/`, and this
  `specs/002-create-factory-skeleton/` folder
- data changes: markdown contracts and empty scoped-memory placeholders only

## Scope Boundaries

- in scope: markdown contracts, policies, examples, initial memory structure,
  and repository map updates
- out of scope: runtime agent runner, vector memory, full eval JSONL packs,
  extracted relationship-book knowledge, marketplace integration, and medical
  advice automation

## Constitution Check

- Spec-first: this PR adds `spec.md`, `plan.md`, and `tasks.md` before product
  files are completed.
- Testable boundaries: routing, safety, and memory boundaries are explicit
  markdown contracts that can become eval cases in the next slice.
- PR-only: changes are prepared on `codex/factory-skeleton-and-mila`.
- Simplicity: no runtime framework or storage backend is introduced.
- Deployability: `main` remains a markdown/process repository with no deploy
  target.

## Complexity Tracking

The new complexity is a set of durable contract files. It is justified because
future sessions need stable entry points and memory scopes before adding source
material, evals, or runtime automation. No abstraction beyond markdown folders
and templates is added.

## Verification

| Acceptance criterion | Evidence |
| --- | --- |
| AC-001 | `rg --files orchestrator agents skills context knowledge memory templates evals` |
| AC-002 | Manual review of `templates/{agent-template,skill-template,memory-note-template}.md` |
| AC-003 | Manual review of `orchestrator/{router,context-assembly,activation-policy}.md` |
| AC-004 | Manual review of `agents/mila/{agent,safety}.md` |
| AC-005 | Manual review of `agents/pediatrician/{agent,safety,red-flags}.md` and `skills/pediatric-triage/SKILL.md` |
| SC-001 | `pnpm run preflight` |
| SC-003 | PR check rollup and Codex review trigger after push |

Negative scenario evidence:

- Cross-agent memory leakage is addressed by `orchestrator/context-assembly.md`
  and `memory/README.md`.
- Medical diagnosis and dosing limits are addressed by
  `agents/pediatrician/safety.md`.
- Runtime/vector additions are absent from `git diff --stat origin/main...HEAD`.

## Risks

- The first Mila draft may feel too generic until prior-session and book
  knowledge are extracted. Mitigation: mark that enrichment as the next feature
  slice and keep placeholders source-separated.
- Markdown contracts can drift without evals. Mitigation: keep eval JSONL packs
  out of this PR but list them as the next verification slice.
- Memory placeholders may look writable by default. Mitigation: document that
  durable memory writes require explicit owner consent or a proposed-save step.
