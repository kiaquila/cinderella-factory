#!/usr/bin/env node
// Symlinks design-team roles and skills into ~/.claude so Claude Code loads
// them globally while this repository stays the single source of truth.
// Idempotent. Existing real files/dirs are backed up, never deleted.
// Usage: node scripts/install-claude-assets.mjs [--dry-run]
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readlinkSync,
  renameSync,
  symlinkSync,
  unlinkSync
} from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const claudeDir = process.env.CLAUDE_CONFIG_DIR || join(homedir(), ".claude");
const dryRun = process.argv.includes("--dry-run");

const DESIGN_AGENTS = ["ui-ux-designer", "frontend"];
const DESIGN_SKILLS = [
  "design-system",
  "design-review",
  "design-handoff",
  "menu-design",
  "landing-page"
];

if (repoRoot.includes(join(".claude", "worktrees"))) {
  console.warn(
    "WARNING: running from a temporary worktree; symlinks would dangle after cleanup.\n" +
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
  let current = null;
  try {
    current = lstatSync(linkPath);
  } catch {
    current = null;
  }
  if (current?.isSymbolicLink()) {
    if (readlinkSync(linkPath) === target) {
      console.log(`ok      ${linkPath}`);
      continue;
    }
    console.log(`relink  ${linkPath} -> ${target}`);
    if (!dryRun) unlinkSync(linkPath);
  } else if (current) {
    const backup = `${linkPath}.pre-factory-backup`;
    console.log(`backup  ${linkPath} -> ${backup}`);
    if (!dryRun) renameSync(linkPath, backup);
    console.log(`link    ${linkPath} -> ${target}`);
  } else {
    console.log(`link    ${linkPath} -> ${target}`);
  }
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
