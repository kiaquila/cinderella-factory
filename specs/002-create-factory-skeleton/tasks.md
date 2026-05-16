# Tasks: Create Factory Skeleton

## Setup

- [x] T001 Refresh GitHub state and confirm `main` equals `origin/main`.
- [x] T002 Create branch `codex/factory-skeleton-and-mila`.
- [x] T003 Create complete feature memory for this PR.

## Implementation

- [x] T004 Update stale prior feature memory in a separate commit.
- [ ] T005 Add reusable templates for agents, skills, and memory notes.
- [ ] T006 Add orchestrator v1 contract, routing, context assembly, and
  activation policy.
- [ ] T007 Add starter agent contracts for `mila`, `salesman`, and
  `pediatrician`.
- [ ] T008 Add starter procedural skills.
- [ ] T009 Add scoped context, knowledge, memory, and eval entry points.
- [ ] T010 Update README repository map.

## Verification

- [ ] T011 Run skeleton file listing check.
- [ ] T012 Run `pnpm run preflight`.
- [ ] T013 Open one PR and trigger Codex review.
- [ ] T014 Record GitHub CI/CD outcome.

## Process Memory

### Dead Ends

- None yet.

### Decisions

- Keep this PR markdown-only. Runtime, RAG, MemPalace, and extracted Mila book
  knowledge remain out of scope.
- Include `salesman` and `pediatrician` draft contracts alongside Mila so the
  orchestrator can describe all three planned starter routes.
- Keep initial memory files as placeholders until the owner explicitly saves
  durable personal details.

### Known Issues

- Mila is usable as a draft contract after this PR, but not yet deepened with
  prior-session notes or relationship-book doctrine.
- Eval JSONL packs are not added in this PR; they should follow once the
  contracts settle enough to encode expected behavior.
