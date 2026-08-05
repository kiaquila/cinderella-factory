# Agents

This folder stores durable specialist-agent contracts. Each agent should keep
persona, safety, source, memory, and response rules inspectable in markdown.

Starter agents:

- `mila`: relationship support with strict anti-manipulation boundaries.
- `salesman`: marketplace listing and negotiation support for the seller.
- `pediatrician`: educational child-health triage support, not a doctor.

Design-team roles (Claude Code subagent runtime; contracts carry Claude
frontmatter on top and the factory contract block in the body):

- `ui-ux-designer`: owns user scenario, visual system, component states, and
  live-screen review.
- `frontend`: owns implementation, reusable components, responsiveness,
  accessibility, and performance.

Install design-team roles and skills into `~/.claude` with
`pnpm run install:claude` (run it from the main checkout after merge).
