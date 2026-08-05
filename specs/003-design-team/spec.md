# Spec: Design-Team Roles And Skills

## Goal

Host the owner's design-team roles and skills as versioned, PR-reviewable
contracts in this factory, so they stop living only as unversioned files in
`~/.claude` and become the single source of truth usable across all projects
(and, in principle, other runtimes).

## Scope

In scope:

- Role contracts `agents/ui-ux-designer/agent.md` and `agents/frontend/agent.md`
  migrated from `~/.claude/agents`, in a dual format: Claude Code frontmatter on
  top, factory contract block in the body, safety rules inline.
- Skills `design-system`, `design-review`, `design-handoff` migrated from
  `~/.claude/skills` with a factory contract block added.
- New skill `menu-design`: restaurant/cafe/bar menu design methodology (pure
  methodology, no client business facts).
- New skill `landing-page`: premium selling landing-page methodology.
- Both roles updated to route menu tasks to `menu-design` and landing tasks to
  `landing-page`.
- `scripts/install-claude-assets.mjs` + `pnpm run install:claude`: idempotent
  symlinking of these assets into `~/.claude` with backup of pre-existing files.
- README / AGENTS.md map updates.

Out of scope:

- Installing or symlinking the personal starter agents (`mila`, `salesman`,
  `pediatrician`) into `~/.claude` — they target the factory orchestrator, not
  the Claude Code subagent runtime.
- Editing files under `~/.claude` in this PR (installation is a post-merge step).
- Business content for any client project (menus, prices, copy).
- Runtime/orchestrator code.

## User Stories

### User Story 1

As the owner, I want my design roles and skills versioned in the factory, so
that changes go through PRs and review instead of silent edits in `~/.claude`.

### User Story 2

As the owner, I want dedicated playbooks for restaurant menus and selling
landing pages, so that the existing `ui-ux-designer` + `frontend` pair acts as
those specialists in any project.

### User Story 3

As the owner, I want a one-command installer, so that a new machine (or a fresh
`~/.claude`) gets the whole design toolkit via symlinks that stay in sync with
the repo.

## Acceptance Criteria

1. All seven asset paths exist in the repo with valid Claude frontmatter
   (`name`, `description`) and a factory contract block.
2. `menu-design` and `landing-page` contain methodology only — no invented
   business facts, and both enforce the source-truth rule explicitly.
3. `node scripts/install-claude-assets.mjs --dry-run` prints a correct plan and
   exits 0 from a main checkout; it refuses a non-dry run from a temporary
   worktree.
4. `pnpm run preflight` passes in the worktree.

## Negative Scenario

The installer must never delete or silently overwrite a user's existing
`~/.claude` files: a real file/dir at a link path is renamed to
`<name>.pre-factory-backup` first; running twice is a no-op (`ok` lines only).

## Verification Evidence

Recorded in `tasks.md` process memory after execution.
