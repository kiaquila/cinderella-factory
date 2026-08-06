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
- Codex review (2026-08-06, `31b3ff4`) found two P1 regressions: YAML-unsafe
  skill descriptions and destructive reuse of an existing installer backup.
  Both now have dedicated regression coverage.
- `pnpm run preflight` (2026-08-06): feature-memory and syntax gates passed;
  10/10 node tests pass, including YAML-safe frontmatter and backup-collision
  regressions.
- Codex follow-up review (2026-08-06, `9b373ca`) found one P2 edge case:
  `existsSync` misses dangling symlinks in backup slots. Backup selection now
  uses `lstat`, and the collision test covers both regular files and dangling
  symlinks.

## Process Memory

### Dead Ends

- None yet.

### Decisions

- Inline safety sections instead of per-role `safety.md` (see plan.md) so the
  contract survives being loaded standalone by the Claude Code runtime.
- Installer intentionally refuses non-dry runs from `.claude/worktrees/*` so
  `~/.claude` symlinks can never point into a temporary worktree.
- Skill descriptions use folded YAML block scalars so trigger phrases may safely
  contain `: ` without breaking Claude frontmatter parsing.
- If the canonical `.pre-factory-backup` already exists, the installer uses
  `lstat` to select the first truly unoccupied numeric suffix (`.1`, `.2`, ...)
  instead of overwriting a file, directory, or dangling symlink.

### Known Issues

- `~/.claude` still holds the pre-migration originals until the post-merge
  `pnpm run install:claude` run; until then the two sources can drift — do not
  edit the `~/.claude` copies anymore.
