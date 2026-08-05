# Skills

Skills are procedural workflows that agents may use. They are not personas and
do not override agent safety policies.

Starter skills:

- `agent-routing`
- `memory-curation`
- `relationship-debrief`
- `listing-builder`
- `pediatric-triage`

Design-team skills (Claude Code skill runtime, shared by `ui-ux-designer` and
`frontend`; installed into `~/.claude/skills` via `pnpm run install:claude`):

- `design-system`: foundation tokens, core components, right-level changes.
- `design-review`: reviewer rubric + live-screen verification.
- `design-handoff`: behavior spec and gated handoff checklist.
- `menu-design`: restaurant/cafe/bar menu structure, pricing presentation, typography.
- `landing-page`: premium selling landing pages — blocks, CTA discipline, honest proof.
