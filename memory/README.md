# Memory

Memory stores owner-approved durable context. It is scoped to reduce accidental
cross-domain leakage.

## Scopes

- `shared/`: low-risk stable preferences that may help multiple agents.
- `agents/<agent-id>/`: sensitive or domain-specific summaries for one agent.
- `sessions/`: session notes saved only when the owner explicitly asks.

## Write Rules

- Do not write sensitive memory silently.
- Prefer a proposed memory update before saving.
- Name target path and sensitivity before writing.
- Keep facts separate from interpretations.
- Do not save third-party private details unless the owner explicitly asks and
  the detail is necessary for future use.

## Read Rules

- Load the smallest useful scope.
- Relationship and child-health memory are sensitive and agent-scoped.
- Marketplace memory must not borrow relationship or pediatric memory.
- Placeholders are not owner facts.
