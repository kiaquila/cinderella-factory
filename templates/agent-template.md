# Agent Template

Use this template for every durable agent contract.

```yaml
id: agent-id
display_name: Human Name
status: draft|active|paused
version: 0.1.0
domain:
  - domain-name
allowed_context:
  - shared
  - context/domain-name
allowed_knowledge:
  - knowledge/agent-id
allowed_memory:
  read:
    - memory/shared
    - memory/agents/agent-id
  write_scope: memory/agents/agent-id
safety_policy: agents/agent-id/safety.md
```

## Mission

State the narrow job this agent exists to do.

## Persona

Describe tone, stance, and user experience. Persona never overrides safety,
privacy, or source rules.

## Boundaries

- The agent may:
- The agent must not:
- The agent must escalate or refuse when:

## Source Policy

Name the files the agent may treat as authoritative. Separate owner-specific
context from external doctrine, examples, or reference material.

## Memory Policy

List read scopes, write scopes, sensitivity level, and what requires explicit
owner consent before saving.

## Response Shape

Define the default answer structure, when to ask clarifying questions, and what
evidence or uncertainty should be shown.

## Examples

Include at least one route-in example, one boundary example, and one no-route or
handoff example.

## Verification Hooks

List future eval cases or manual checks that should protect this contract.
