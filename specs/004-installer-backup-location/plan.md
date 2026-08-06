# Plan: Installer Backup Location

## Approach

One-line-of-thinking change: the backup path is computed from the link path, so
route it through a single archive root instead of the sibling name.

- `backupRoot = join(claudeDir, ".pre-factory-backups")`.
- `nextBackupPath()` maps a link path to
  `backupRoot/<path relative to claudeDir>`, keeping the `agents/` and `skills/`
  split readable, then applies the existing numeric-suffix loop.
- `mkdirSync(dirname(backup))` before the rename, since the archive tree does
  not exist on a first run.

## Design Decisions (Simplicity justifications)

- **Dot-directory inside `~/.claude`, not a sibling of it.** Keeps everything
  the installer owns under one root that the user already knows about, while the
  leading dot keeps it out of both the skill and agent scanners.
- **Mirror the source layout inside the archive** (`agents/…`, `skills/…`)
  rather than flattening with a separator. Restoring a backup is then a plain
  `mv` back to the same relative path.
- **No migration of already-misplaced backups.** The defect existed for exactly
  one release and one machine, which was cleaned manually. Migration logic would
  add a scan-and-move path that can never be exercised again — the constitution
  requires a current reason for new abstractions.
- **Regression test asserts the *absence* of stray entries**, not just the
  presence of the archive: the defect was "a leftover file the runtime loads,"
  so the test has to check the scanned directory is clean.

## Steps

1. Feature memory (this folder).
2. Installer: archive root, path mapping, mkdir before rename, header comment
   naming the reason.
3. Test: update the existing backup-collision test to the archive path; add the
   scanned-folder-cleanliness regression test.
4. README note on where backups land.
5. Preflight; PR.

## Post-Merge Step (manual)

`git checkout main && git pull && pnpm run install:claude` — a no-op for links
already in place; the change only affects future backups.
