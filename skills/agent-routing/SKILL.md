# Agent Routing Skill

```yaml
id: agent-routing
status: draft
allowed_agents:
  - orchestrator
inputs:
  - user_request
  - available_agent_contracts
outputs:
  - selected_route
  - confidence
  - reason
sensitive: false
```

## Purpose

Classify a user request into `mila`, `salesman`, `pediatrician`, or no
specialist route.

## Activation Cues

- The user asks for help that may belong to a starter agent.
- The user names a starter agent.
- Sensitive context access depends on selecting the correct route.

## Required Context

- `orchestrator/router.md`
- relevant agent contract only after a likely route is found

## Procedure

1. Identify explicit agent names.
2. Scan for strong domain cues.
3. Check safety or red-flag cues before ordinary routing.
4. Assign `high`, `medium`, `low`, or `none` confidence.
5. Return route, confidence, and reason.
6. Ask one clarifying question if route ambiguity affects safety or memory.

## Boundaries

- Allowed: classify and explain route.
- Not allowed: load sensitive memory to make a route guess.
- Escalate or refuse: use the selected agent safety policy when the request is
  unsafe but inside a domain.

## Output Contract

```yaml
route: mila|salesman|pediatrician|none
confidence: high|medium|low|none
reason: short human-readable reason
context_bundle: minimal allowed files
```

## Verification Hooks

Future `evals/routing.jsonl` should cover explicit, suggested, ambiguous,
unsafe, and no-route cases.
