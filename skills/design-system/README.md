# Design & Frontend Kit

A versioned, cross-project kit for building **consistent** UI. Cinderella Factory is
its canonical source; `pnpm run install:claude` exposes the role and skill contracts to
Claude Code through symlinks. The kit is distilled from Vanya's 3-layer model
(constitution / roles / skills), with one addition he didn't need: **it adapts to
whatever design system a project already has** (none / partial / complete /
inconsistent) instead of assuming there's no system yet.

## The layers (who answers what)

| Layer | Question it answers | Lives in |
|---|---|---|
| **Constitution** | "How do we work here? What can't break?" | each project's `CLAUDE.md` / `AGENTS.md` |
| **Roles** (agents) | "Who am I, what do I own, where are my boundaries?" | factory `agents/`; symlinked into `~/.claude/agents/` |
| **Skills** (playbooks) | "How do I do this type of task?" | factory `skills/`; symlinked into `~/.claude/skills/` |
| **Project design system** | "What does *this* product's system actually contain?" | each repo's `design-system.md` (from `templates/project-design-system.md`) |
| **Runtime agents** | the actual executors | Claude Code sessions that read role + skills |

Roles own responsibility; skills own process; a skill (like `design-system`) is shared by
**both** roles. This is deliberate — making everything a skill loses ownership (designer
drifts into backend, frontend rewrites product rules); making everything an agent loses
portability and composability.

## The shared loop (roles working toward one goal)

```
ui-ux-designer: design from the system  →  build from existing components  →
design-handoff: behavior spec + checklist  →  frontend: implement (a11y + responsive) →
design-review: review the LIVE screen  →  polish
```

The `design-system` skill's Step 0 (reconnaissance) runs first every time and decides
whether you're bootstrapping, filling gaps, strictly reusing, or reconciling drift.

## Repository-owned lifecycle and cross-project reuse

- The **skills** and **agents** are owned and reviewed in Cinderella Factory. After a
  change merges, run `pnpm run install:claude` from the primary checkout to create or
  refresh their `~/.claude` symlinks. Do not copy or edit the installed paths; change
  the factory contracts through a PR so there is one source of truth.
- Once installed, the symlinked roles and skills are available in **every** project;
  no per-project role or skill copy is needed.
- The **only per-project file** is `design-system.md` (copied from the template and
  filled in from the code). That's what makes the same portable skills behave correctly
  in a project with a full design system vs one with none.
  **Canonical location:** repo-root `design-system.md`. If a project already keeps durable
  docs elsewhere (e.g. `docs_project/`, `.specify/memory/`), put it there and record the
  path in that project's `CLAUDE.md`. The `design-system` skill searches a fixed order
  (root → `docs_project/**` → `docs/` → `.specify/memory/` → `.claude/`) and reuses the
  first hit instead of re-bootstrapping.

## Activate it in a project (wire the constitution layer)

The three skills auto-trigger on their description keywords, so they light up in any
project with no setup. The **roles** and the **collaboration rule**, though, need one
explicit line so a fresh project's default session knows to run the loop. Add this block
to the project's `CLAUDE.md` / `AGENTS.md` (this is the "constitution" layer — the kit
ships the wording so you don't have to):

```md
## UI & Design work
- For any UI/design task, run the two-role loop: `ui-ux-designer` (owns scenario, visual
  system, states, consistency, live review) ↔ `frontend` (owns implementation,
  reusable components, a11y, responsiveness, tech constraints).
- Start every UI task with the `design-system` skill's Step 0 (classify this project's
  system state) before designing or coding.
- This project's design system is declared in: `<path to design-system.md>`.
- Token changes are proposed by frontend, ratified by ui-ux-designer. Fix at the right
  level (screen / component / token). No off-scale spacing, no stray hex.
- Hand off with `design-handoff`; review the LIVE screen with `design-review` before done.
```

That one block turns the installed-but-dormant kit into the active workflow for that repo.

## Canonical files and installed links

- `agents/ui-ux-designer/agent.md` → `~/.claude/agents/ui-ux-designer.md`
- `agents/frontend/agent.md` → `~/.claude/agents/frontend.md`
- `skills/design-system/` → `~/.claude/skills/design-system/`
- `skills/design-handoff/` → `~/.claude/skills/design-handoff/`
- `skills/design-review/` → `~/.claude/skills/design-review/`
- `skills/menu-design/` → `~/.claude/skills/menu-design/`
- `skills/landing-page/` → `~/.claude/skills/landing-page/`
