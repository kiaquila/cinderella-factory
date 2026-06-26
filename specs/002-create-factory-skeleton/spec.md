# Spec: Create Factory Skeleton

## Goal

Create the first usable markdown-first Cinderella Factory structure so future
sessions can route to starter agents and evolve their contracts through PRs.

## Scope

In scope:

- Repository skeleton folders for orchestrator, agents, skills, context,
  knowledge, memory, templates, and evals.
- Reusable templates for agent contracts, skill procedures, and memory notes.
- Orchestrator v1 docs for agent role, routing, context assembly, and activation
  policy.
- Starter contracts for `mila`, `salesman`, and `pediatrician`, including
  safety boundaries where needed.
- Initial procedural skills for routing, memory curation, relationship
  debriefs, listing building, and pediatric triage.
- Initial memory policy files and agent summary placeholders.
- README map updates for the now-present product folders.

Out of scope:

- Extracting Mila's prior-session source material or relationship-book doctrine.
- Adding runtime execution, LangChain, RAG, MemPalace, or deployment code.
- Adding full JSONL eval packs.
- Implementing medical diagnosis, marketplace automation, or relationship
  decision automation.

## User Stories

### User Story 1

As the repository owner, I want the starter agent contracts to exist as durable
markdown, so that I can inspect and revise their mission, tone, and boundaries
before any runtime exists.

### User Story 2

As an orchestrating agent, I want explicit routing and context assembly rules,
so that I can choose `mila`, `salesman`, `pediatrician`, or no agent without
leaking sensitive memory across domains.

### User Story 3

As a future implementation agent, I want templates and scoped memory rules, so
that adding or deepening an agent follows one consistent shape.

## Acceptance Criteria

1. Given the repository is read by a future agent, when it looks for factory
   product folders, then `orchestrator/`, `agents/`, `skills/`, `context/`,
   `knowledge/`, `memory/`, `templates/`, and `evals/` exist with durable
   markdown entry points.
2. Given a future agent needs to create an agent, skill, or memory note, when it
   opens `templates/`, then each template names required contract fields,
   boundaries, sources, and verification hooks.
3. Given a request matches a starter domain, when the orchestrator docs are
   followed, then routing explains the chosen agent, confidence, reason, and
   allowed context bundle.
4. Given a request asks Mila for manipulative, coercive, stalking, or
   self-betraying tactics, when the Mila contract and safety policy are read,
   then the request is rejected or reframed toward autonomy and safety.
5. Given a pediatric request includes red-flag symptoms, when the pediatric
   contract and triage skill are read, then the response escalates to urgent
   professional care instead of offering routine advice.

## Negative Scenarios

1. Given a sensitive relationship memory exists under Mila's scope, when
   `salesman` or `pediatrician` is activated, then the context policy does not
   allow that memory to be assembled by default.
2. Given a user asks for a medical diagnosis or dosing instruction, when
   `pediatrician` responds, then it must stay educational and point to a
   clinician or urgent care path as appropriate.
3. Given a user asks for runtime automation or MemPalace, when this PR is
   reviewed, then those additions are absent from the diff.

## Requirements

- FR-001: The PR must include complete feature memory for this work.
- FR-002: The repository must include durable markdown entry points for all
  planned V1 product folders.
- FR-003: Starter agent contracts must define mission, persona, boundaries,
  memory scopes, source policy, response shape, and examples.
- FR-004: Safety policies must state that persona never overrides boundaries.
- FR-005: Skills must be procedural and declare which agents may use them.
- FR-006: Memory files must separate shared preferences, agent summaries, and
  session notes.

## Success Criteria

- SC-001: `pnpm run preflight` passes locally.
- SC-002: `rg --files orchestrator agents skills context knowledge memory templates evals`
  shows the expected skeleton and starter files.
- SC-003: GitHub PR checks run for the opened PR and Codex review is requested.

## Assumptions

- Cinderella Factory remains markdown-first in this PR.
- `mila` is a draft relationship-support agent after this PR, not yet enriched
  with book-derived knowledge.
- The owner remains the final authority for agent behavior and merge decisions.
