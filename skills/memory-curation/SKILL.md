# Memory Curation Skill

```yaml
id: memory-curation
status: draft
allowed_agents:
  - orchestrator
  - mila
  - salesman
  - pediatrician
inputs:
  - candidate_learning
  - target_scope
outputs:
  - memory_proposal
  - write_or_no_write_decision
sensitive: true
```

## Purpose

Decide whether a conversation contains durable learning worth saving and, if so,
propose the narrowest safe memory scope.

## Activation Cues

- The owner says "save this", "remember", or accepts a proposed memory.
- A session reveals a stable preference or reusable boundary.
- A future agent would otherwise repeat avoidable questions.

## Required Context

- `memory/README.md`
- `templates/memory-note-template.md`
- selected agent memory policy

## Procedure

1. Separate stable facts/preferences from temporary mood or speculation.
2. Choose scope: `shared`, `agent`, or `session`.
3. Mark sensitivity.
4. Draft a memory proposal with exact file target.
5. Ask for explicit consent unless the owner already instructed a save.
6. Write only after consent and keep wording minimal.

## Boundaries

- Allowed: propose concise memory updates.
- Not allowed: silently save sensitive details, third-party private details, or
  inferred motives.
- Escalate or refuse: do not save unsafe instructions or manipulative goals as
  preferences.

## Output Contract

Memory proposals must include target path, sensitivity, summary, durable facts,
non-facts, and review/expiry guidance.

## Verification Hooks

Future privacy evals should test cross-agent leakage, overbroad saves, and
third-party detail handling.
