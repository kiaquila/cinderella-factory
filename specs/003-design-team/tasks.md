# Tasks: Design-Team Roles And Skills

## Setup

- [x] T001 Create worktree `feature/003-design-team` from `origin/main`.
- [x] T002 Create feature memory for this PR.

## Implementation

- [x] T003 Add `agents/ui-ux-designer/agent.md` and `agents/frontend/agent.md`
  (dual format: Claude frontmatter + factory contract block + inline safety).
- [x] T004 Migrate `design-system`, `design-review`, `design-handoff` skills and
  add factory contract blocks.
- [x] T005 Add `menu-design` skill (pure methodology, source-truth rule).
- [x] T006 Add `landing-page` skill (premium selling pages, honest-proof rule).
- [x] T007 Add `scripts/install-claude-assets.mjs` and `install:claude` script.
- [x] T008 Update `AGENTS.md`, `README.md`, `agents/README.md`,
  `skills/README.md`.

## Verification

- [x] T009 `node --check` on the installer; `--dry-run` behaves per spec
  (plan from main checkout, refusal from worktree).
- [x] T010 Frontmatter sanity check on all seven assets (`name`,
  `description` parse).
- [x] T011 `pnpm run preflight` green in the worktree.
- [ ] T012 Open PR; record review outcome.

## Verification Evidence

- Installer: `node --check` clean; `--dry-run` planned exactly 7 links with
  backups for the 5 pre-existing `~/.claude` paths and plain links for the 2
  new skills; non-dry run from the worktree refused with exit 1 as specified.
- Frontmatter: scripted parse of all seven assets returned OK (`name` +
  `description` present and well-formed).
- `pnpm run preflight` (2026-08-05): feature-memory gate passed via
  `specs/003-design-team/{spec,plan,tasks}.md`; script syntax checks clean;
  8/8 node tests pass.

## Process Memory

### Dead Ends

- None yet.

### Decisions

- Inline safety sections instead of per-role `safety.md` (see plan.md) so the
  contract survives being loaded standalone by the Claude Code runtime.
- Installer intentionally refuses non-dry runs from `.claude/worktrees/*` so
  `~/.claude` symlinks can never point into a temporary worktree.

### Known Issues

- `~/.claude` still holds the pre-migration originals until the post-merge
  `pnpm run install:claude` run; until then the two sources can drift — do not
  edit the `~/.claude` copies anymore.
