# Spec: Installer Backup Location

## Goal

Stop the installer from leaving backups inside the directories Claude Code
scans, so installing the design toolkit never registers duplicate skills.

## Problem

`scripts/install-claude-assets.mjs` (shipped in PR #6) backed a pre-existing
asset up to `<linkPath>.pre-factory-backup`, i.e. beside the original. Claude
Code loads **every** `~/.claude/skills/*/SKILL.md` it finds, so after the first
real install the runtime listed five design skills plus three duplicates:
`design-system.pre-factory-backup`, `design-review.pre-factory-backup`, and
`design-handoff.pre-factory-backup` — each with the same description as its
canonical twin, competing for skill selection and wasting context.

Agent backups (`frontend.md.pre-factory-backup`) did not register, because the
agent loader requires the `.md` extension; the defect is real only for skills,
but the fix covers both paths for consistency.

## Scope

In scope:

- Back assets up to `~/.claude/.pre-factory-backups/<agents|skills>/<name>`
  (a dot-directory, outside every scanned path) instead of beside the original.
- Preserve the existing numeric-suffix behavior when a backup name is taken.
- Regression test asserting no `*pre-factory-backup*` entry survives in
  `skills/` or `agents/` after an install that had to back something up.
- Document the backup location in `README.md`.

Out of scope:

- Migrating backups that a previous installer run already left in place. The
  owner's machine was cleaned by hand (see Known Issues in `tasks.md`); adding
  migration logic for a one-run-old defect fails the constitution's simplicity
  rule.
- Any change to role contracts or skill content.

## Acceptance Criteria

1. After an install that backs up an existing skill directory, `~/.claude/skills`
   and `~/.claude/agents` contain no entry matching `*pre-factory-backup*`.
2. The backed-up content is readable at
   `~/.claude/.pre-factory-backups/skills/<id>/SKILL.md`.
3. An occupied backup path is preserved and the installer picks the first free
   numeric suffix (existing behavior, still covered).
4. `pnpm run preflight` passes.

## Negative Scenario

A pre-existing backup at the archive path — including a dangling symlink — must
never be overwritten or deleted; the installer selects `<name>.1`, `<name>.2`,
and so on.

## Verification Evidence

Recorded in `tasks.md`.
