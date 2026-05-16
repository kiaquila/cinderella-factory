# Context Assembly

Context assembly follows minimum necessary access. The selected agent receives
only the files allowed by its contract and the current task.

## Shared Context

Allowed for all agents:

- `AGENTS.md`
- `.specify/memory/constitution.md`
- `docs_project/project-idea.md`
- `memory/shared/stable-preferences.md`
- relevant template files under `templates/`

## Agent Bundles

| Agent | Always Allowed | Allowed When Relevant | Write Scope |
| --- | --- | --- | --- |
| `mila` | `agents/mila/agent.md`, `agents/mila/safety.md`, `skills/relationship-debrief/SKILL.md` | `context/domains/relationships.md`, `knowledge/mila/`, `memory/agents/mila/summary.md` | `memory/agents/mila/` |
| `salesman` | `agents/salesman/agent.md`, `skills/listing-builder/SKILL.md` | `context/domains/marketplaces.md`, `knowledge/salesman/`, `memory/agents/salesman/summary.md` | `memory/agents/salesman/` |
| `pediatrician` | `agents/pediatrician/agent.md`, `agents/pediatrician/safety.md`, `agents/pediatrician/red-flags.md`, `skills/pediatric-triage/SKILL.md` | `context/domains/child-health.md`, `knowledge/pediatrician/`, `memory/agents/pediatrician/summary.md` | `memory/agents/pediatrician/` |

## Memory Isolation

- `memory/shared/` stores low-risk stable preferences that can help multiple
  agents.
- `memory/agents/<agent-id>/` stores agent-specific summaries and sensitive
  domain memory.
- `memory/sessions/` stores session notes only when the owner explicitly asks
  to keep them.
- Relationship and child-health memory are sensitive and must not cross agents
  by default.

## Assembly Procedure

1. Choose the route using `orchestrator/router.md`.
2. Load the agent contract and safety policy.
3. Load only the skills needed for the requested workflow.
4. Add domain context or knowledge only when the request needs it.
5. Add scoped memory only when allowed by the agent contract and helpful to the
   current request.
6. If a useful memory is missing, ask or proceed with an explicit uncertainty
   note.

## Disallowed Assembly

- Do not load all memory by default.
- Do not use pediatric memory for relationship advice.
- Do not use relationship memory for marketplace negotiation.
- Do not treat templates, examples, or placeholders as saved owner facts.
