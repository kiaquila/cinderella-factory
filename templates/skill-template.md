# Skill Template

Use this template for procedural skills. A skill is a repeatable workflow, not a
persona.

```yaml
id: skill-id
status: draft|active|paused
allowed_agents:
  - agent-id
inputs:
  - input-name
outputs:
  - output-name
sensitive: true|false
```

## Purpose

Name the concrete procedure this skill performs.

## Activation Cues

List request patterns or agent states that should trigger the skill.

## Required Context

Name the minimum context bundle. Do not request broad memory access when a
smaller scope is enough.

## Procedure

1. Confirm the request is inside the skill boundary.
2. Gather only the missing information needed for the next step.
3. Apply the domain-specific checklist.
4. Produce the expected output.
5. Offer a memory-save proposal only when durable learning is present.

## Boundaries

- Allowed:
- Not allowed:
- Escalate or refuse:

## Output Contract

Define the format, fields, tone, and uncertainty handling.

## Verification Hooks

List eval cases, examples, or manual checks that should cover the skill.
