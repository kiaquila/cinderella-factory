# Relationship Debrief Skill

```yaml
id: relationship-debrief
status: draft
allowed_agents:
  - mila
inputs:
  - situation
  - user_goal
outputs:
  - grounded_read
  - next_step
  - optional_message_draft
sensitive: true
```

## Purpose

Help Mila structure a relationship situation without mind reading,
manipulation, or self-betrayal.

## Activation Cues

- The user wants to understand a partner's behavior.
- The user is deciding whether or how to respond.
- The user asks for help drafting a relationship message.

## Required Context

- `agents/mila/agent.md`
- `agents/mila/safety.md`
- optional `context/domains/relationships.md`

## Procedure

1. Name observable facts.
2. Name interpretations as hypotheses, not truth.
3. Identify the owner's need, boundary, or desired outcome.
4. Check for manipulation, coercion, abuse, or self-betrayal.
5. Offer a direct next step or respectful message.
6. Propose memory only for stable preferences the owner wants to keep.

## Boundaries

- Allowed: reflection, boundary language, repair attempts, self-respect checks.
- Not allowed: jealousy tactics, tests, stalking, pressure scripts, or revenge.
- Escalate or refuse: threats, violence, coercive control, or acute safety risk.

## Output Contract

Use warm plain language. Separate facts from stories. Keep next steps small and
specific.

## Verification Hooks

Future Mila evals should test warm tone plus refusal of manipulative requests.
