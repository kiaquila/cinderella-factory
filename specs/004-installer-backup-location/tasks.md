# Tasks: Installer Backup Location

## Setup

- [x] T001 Create worktree `feature/004-installer-backup-location` from `origin/main`.
- [x] T002 Create feature memory for this PR.

## Implementation

- [x] T003 Route backups through `~/.claude/.pre-factory-backups/` mirroring the
  `agents/` and `skills/` layout; create the archive directory before renaming.
- [x] T004 Document the reason in the script header (Claude Code loads every
  `skills/*/SKILL.md`, so an in-place backup becomes a duplicate skill).
- [x] T005 Update the backup-collision test to the archive path.
- [x] T006 Add regression test: no `*pre-factory-backup*` entry survives in
  `skills/` or `agents/`.
- [x] T007 Note the backup location in `README.md`.

## Verification

- [x] T008 `node --test tests/install-claude-assets.test.mjs` — 5/5 pass.
- [x] T009 `pnpm run preflight` green in the worktree.
- [x] T010 Open PR; Codex review on `8611b74d4b0ccb34097e1eb7eac099ffe8c37a16`
  found no major issues (2026-08-06).

## Verification Evidence

- Installer tests (2026-08-06): 5/5 pass, including the new
  "installer keeps backups out of the scanned skills and agents folders" case
  and the preserved dangling-symlink collision case.
- `pnpm run preflight` (2026-08-06): feature-memory gate passed via
  `specs/004-installer-backup-location/{spec,plan,tasks}.md`; script syntax
  checks clean; 13/13 tests pass.
- Codex review (2026-08-06) of `8611b74d4b0ccb34097e1eb7eac099ffe8c37a16`:
  no major issues found.

## Process Memory

### Dead Ends

- None.

### Decisions

- Archive mirrors the source layout (`.pre-factory-backups/skills/<id>`) so a
  restore is a plain `mv` back to the same relative path.
- No migration path for backups the previous installer already misplaced; the
  owner's machine was cleaned by hand and the defect shipped in one release
  only.

### Known Issues

- The owner's `~/.claude` was repaired manually on 2026-08-06: the three
  `*.pre-factory-backup` skill directories and two agent backups were moved to
  `~/.claude/.pre-factory-backups/`. Any other machine that ran the PR #6
  installer needs the same one-time move.
