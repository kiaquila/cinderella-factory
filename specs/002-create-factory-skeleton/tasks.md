# Tasks: Create Factory Skeleton

## Setup

- [x] T001 Refresh GitHub state and confirm `main` equals `origin/main`.
- [x] T002 Create branch `codex/factory-skeleton-and-mila`.
- [x] T003 Create complete feature memory for this PR.

## Implementation

- [x] T004 Update stale prior feature memory in a separate commit.
- [x] T005 Add reusable templates for agents, skills, and memory notes.
- [x] T006 Add orchestrator v1 contract, routing, context assembly, and
  activation policy.
- [x] T007 Add starter agent contracts for `mila`, `salesman`, and
  `pediatrician`.
- [x] T008 Add starter procedural skills.
- [x] T009 Add scoped context, knowledge, memory, and eval entry points.
- [x] T010 Update README repository map.

## Verification

- [x] T011 Run skeleton file listing check.
- [x] T012 Run `pnpm run preflight`.
- [x] T013 Open one PR and trigger Codex review.
- [ ] T014 Record GitHub CI/CD outcome.

## Process Memory

### Dead Ends

- Codex review found that the first router table could treat unsafe Mila
  requests as "avoid route", which risked skipping Mila's safety policy. Updated
  routing so unsafe in-domain relationship requests go to Mila for boundary
  handling, refusal, or reframe.

### Decisions

- Keep this PR markdown-only. Runtime, RAG, MemPalace, and extracted Mila book
  knowledge remain out of scope.
- Include `salesman` and `pediatrician` draft contracts alongside Mila so the
  orchestrator can describe all three planned starter routes.
- Keep initial memory files as placeholders until the owner explicitly saves
  durable personal details.
- Local verification passed on 2026-05-16 with
  `rg --files orchestrator agents skills context knowledge memory templates evals`
  and `pnpm run preflight`.

### Known Issues

- Mila is usable as a draft contract after this PR, but not yet deepened with
  prior-session notes or relationship-book doctrine.
- Eval JSONL packs are not added in this PR; they should follow once the
  contracts settle enough to encode expected behavior.
