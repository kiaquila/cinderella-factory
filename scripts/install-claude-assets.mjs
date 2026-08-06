#!/usr/bin/env node
// Symlinks design-team roles and skills into ~/.claude so Claude Code loads
// them globally while this repository stays the single source of truth.
// Idempotent. Existing real files/dirs are backed up, never deleted.
// Backups go to ~/.claude/.pre-factory-backups/, never beside the original:
// Claude Code registers every ~/.claude/skills/*/SKILL.md it finds, so a backup
// kept in place would load as a duplicate skill.
// Usage: node scripts/install-claude-assets.mjs [--dry-run]
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readlinkSync,
  renameSync,
  symlinkSync
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const claudeDir = process.env.CLAUDE_CONFIG_DIR || join(homedir(), ".claude");
const backupRoot = join(claudeDir, ".pre-factory-backups");
const dryRun = process.argv.includes("--dry-run");

const DESIGN_AGENTS = ["ui-ux-designer", "frontend"];
const DESIGN_SKILLS = [
  "design-system",
  "design-review",
  "design-handoff",
  "menu-design",
  "landing-page"
];

function lstatOrNull(path) {
  try {
    return lstatSync(path);
  } catch (error) {
    if (error?.code === "ENOENT") return null;
    throw error;
  }
}

function gitMetadataPath(argument) {
  const output = execFileSync("git", ["rev-parse", argument], {
    cwd: repoRoot,
    encoding: "utf8"
  }).trim();
  return resolve(repoRoot, output);
}

function nextBackupPath(linkPath) {
  const backupBase = join(backupRoot, relative(claudeDir, linkPath));
  let backup = backupBase;
  let suffix = 1;
  while (lstatOrNull(backup)) {
    backup = `${backupBase}.${suffix}`;
    suffix += 1;
  }
  return backup;
}

const isLinkedWorktree =
  gitMetadataPath("--git-dir") !== gitMetadataPath("--git-common-dir");

if (isLinkedWorktree) {
  console.warn(
    "WARNING: running from a linked worktree; symlinks would dangle after cleanup.\n" +
      "Run from the main checkout after merge instead."
  );
  if (!dryRun) process.exit(1);
}

const links = [
  ...DESIGN_AGENTS.map((id) => ({
    linkPath: join(claudeDir, "agents", `${id}.md`),
    target: join(repoRoot, "agents", id, "agent.md")
  })),
  ...DESIGN_SKILLS.map((id) => ({
    linkPath: join(claudeDir, "skills", id),
    target: join(repoRoot, "skills", id)
  }))
];

let changed = 0;
for (const { linkPath, target } of links) {
  if (!existsSync(target)) {
    console.error(`SKIP (missing target): ${target}`);
    continue;
  }
  const current = lstatOrNull(linkPath);
  if (current?.isSymbolicLink()) {
    if (readlinkSync(linkPath) === target) {
      console.log(`ok      ${linkPath}`);
      continue;
    }
  }
  if (current) {
    const backup = nextBackupPath(linkPath);
    console.log(`backup  ${linkPath} -> ${backup}`);
    if (!dryRun) {
      mkdirSync(dirname(backup), { recursive: true });
      renameSync(linkPath, backup);
    }
  }
  console.log(`${current?.isSymbolicLink() ? "relink" : "link  "}  ${linkPath} -> ${target}`);
  if (!dryRun) {
    mkdirSync(dirname(linkPath), { recursive: true });
    symlinkSync(target, linkPath);
  }
  changed += 1;
}

console.log(
  `${dryRun ? "[dry-run] " : ""}${changed} link(s) ${dryRun ? "planned" : "ensured"}, ` +
    `${links.length - changed} already in place or skipped.`
);
