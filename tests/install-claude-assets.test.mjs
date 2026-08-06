import test from "node:test";
import assert from "node:assert/strict";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readlinkSync,
  realpathSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";

const DESIGN_AGENTS = ["ui-ux-designer", "frontend"];
const DESIGN_SKILLS = [
  "design-system",
  "design-review",
  "design-handoff",
  "menu-design",
  "landing-page"
];

test("installer preserves an existing backup by selecting a numbered suffix", () => {
  const fixtureRoot = mkdtempSync(join(tmpdir(), "cinderella-installer-"));
  try {
    const scriptPath = join(fixtureRoot, "scripts", "install-claude-assets.mjs");
    mkdirSync(dirname(scriptPath), { recursive: true });
    copyFileSync(
      new URL("../scripts/install-claude-assets.mjs", import.meta.url),
      scriptPath
    );

    for (const id of DESIGN_AGENTS) {
      const target = join(fixtureRoot, "agents", id, "agent.md");
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, `${id}\n`);
    }
    for (const id of DESIGN_SKILLS) {
      const target = join(fixtureRoot, "skills", id, "SKILL.md");
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, `${id}\n`);
    }

    const claudeDir = join(fixtureRoot, "claude-config");
    const linkPath = join(claudeDir, "agents", "ui-ux-designer.md");
    mkdirSync(dirname(linkPath), { recursive: true });
    writeFileSync(linkPath, "replacement\n");
    writeFileSync(`${linkPath}.pre-factory-backup`, "original backup\n");

    const result = spawnSync(process.execPath, [scriptPath], {
      encoding: "utf8",
      env: { ...process.env, CLAUDE_CONFIG_DIR: claudeDir }
    });

    assert.equal(result.status, 0, result.stderr);
    assert.equal(
      readFileSync(`${linkPath}.pre-factory-backup`, "utf8"),
      "original backup\n"
    );
    assert.equal(
      readFileSync(`${linkPath}.pre-factory-backup.1`, "utf8"),
      "replacement\n"
    );
    assert.equal(
      readlinkSync(linkPath),
      realpathSync(join(fixtureRoot, "agents", "ui-ux-designer", "agent.md"))
    );
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
});

test("design skill descriptions use YAML-safe block scalars", () => {
  for (const id of DESIGN_SKILLS) {
    const contents = readFileSync(
      new URL(`../skills/${id}/SKILL.md`, import.meta.url),
      "utf8"
    );
    const frontmatter = contents.match(/^---\n([\s\S]*?)\n---\n/);
    assert.ok(frontmatter, `${id} must have YAML frontmatter`);
    assert.match(
      frontmatter[1],
      /^description: >-\n(?: {2}.+\n?)+/m,
      `${id} description must use a folded block scalar`
    );
    assert.match(frontmatter[1], /Triggers:/);
  }
});
