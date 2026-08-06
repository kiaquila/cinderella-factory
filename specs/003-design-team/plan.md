# Plan: Design-Team Roles And Skills

## Approach

Adopt the three-layer contract model already used by this factory (constitution
→ role contracts → skills → runtime executors) for the owner's design work:

1. Migrate the existing `~/.claude` design roles and skills into `agents/` and
   `skills/` unchanged in substance.
2. Add the two missing task-type playbooks (`menu-design`, `landing-page`).
3. Bridge to the Claude Code runtime with symlinks instead of copies, so there
   is exactly one source of truth.

## Design Decisions (Simplicity justifications)

- **Dual-format contract files.** Claude Code requires YAML frontmatter
  (`name`, `description`) as the first bytes of an agent/skill file; the factory
  convention keeps its contract YAML in a fenced block in the body. Both coexist
  in one file, so no generator or duplicate files are needed.
- **`runtime: claude-code-subagent` / `claude-code-skill` field.** New contract
  field with a current reason: it distinguishes these assets from
  orchestrator-runtime agents (`mila` etc.) and tells the installer and future
  tooling what consumes them.
- **Inline safety sections instead of `safety.md` files.** Design roles carry
  content-integrity rules (no invented business facts, licensing, a11y). A
  separate `safety.md` referenced by repo-relative path would dangle when the
  role runs as a Claude Code subagent inside an arbitrary project; inline keeps
  the contract self-contained. Deviation from `templates/agent-template.md` is
  deliberate and recorded here.
- **Symlinks, not copies.** Copies drift; the whole point of the migration is a
  single reviewable source. Backup-then-link keeps the installer non-destructive;
  `lstat`-checked numeric backup suffixes preserve earlier backups, including
  dangling symlinks, when the canonical name is already occupied. Non-matching
  destination symlinks take the same backup path instead of being unlinked.
- **Git-metadata worktree detection.** The installer compares `--git-dir` with
  `--git-common-dir`, so linked worktrees are refused regardless of their folder
  naming convention.
- **No mila/salesman/pediatrician installation.** Different runtime; out of
  scope by contract.

## Steps

1. Feature memory (this folder).
2. Role contracts + task-type routing lines.
3. Skill migration + factory blocks; new `menu-design` and `landing-page`.
4. Installer script + `install:claude` npm script.
5. README/AGENTS.md updates.
6. Preflight + installer dry-run evidence; PR.

## Post-Merge Step (manual)

From the main checkout: `git checkout main && git pull && pnpm run
install:claude`. This replaces the real files in `~/.claude` with symlinks
(originals kept as `*.pre-factory-backup`).
