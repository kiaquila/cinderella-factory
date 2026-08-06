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
  symlinkSync,
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

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", ...options });
  assert.equal(result.status, 0, result.stderr);
  return result;
}

function createFixture(root) {
  const scriptPath = join(root, "scripts", "install-claude-assets.mjs");
  mkdirSync(dirname(scriptPath), { recursive: true });
  copyFileSync(
    new URL("../scripts/install-claude-assets.mjs", import.meta.url),
    scriptPath
  );

  for (const id of DESIGN_AGENTS) {
    const target = join(root, "agents", id, "agent.md");
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, `${id}\n`);
  }
  for (const id of DESIGN_SKILLS) {
    const target = join(root, "skills", id, "SKILL.md");
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, `${id}\n`);
  }

  run("git", ["init"], { cwd: root });
  return scriptPath;
}

test("installer preserves occupied backup paths, including dangling symlinks", () => {
  const fixtureRoot = mkdtempSync(join(tmpdir(), "cinderella-installer-"));
  try {
    const scriptPath = createFixture(fixtureRoot);

    const claudeDir = join(fixtureRoot, "claude-config");
    const linkPath = join(claudeDir, "agents", "ui-ux-designer.md");
    const foreignLinkPath = join(claudeDir, "agents", "frontend.md");
    mkdirSync(dirname(linkPath), { recursive: true });
    writeFileSync(linkPath, "replacement\n");
    writeFileSync(`${linkPath}.pre-factory-backup`, "original backup\n");
    symlinkSync(
      "missing-target",
      `${linkPath}.pre-factory-backup.1`
    );
    symlinkSync("foreign-missing-target", foreignLinkPath);

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
      readlinkSync(`${linkPath}.pre-factory-backup.1`),
      "missing-target"
    );
    assert.equal(
      readFileSync(`${linkPath}.pre-factory-backup.2`, "utf8"),
      "replacement\n"
    );
    assert.equal(
      readlinkSync(linkPath),
      realpathSync(join(fixtureRoot, "agents", "ui-ux-designer", "agent.md"))
    );
    assert.equal(
      readlinkSync(`${foreignLinkPath}.pre-factory-backup`),
      "foreign-missing-target"
    );
    assert.equal(
      readlinkSync(foreignLinkPath),
      realpathSync(join(fixtureRoot, "agents", "frontend", "agent.md"))
    );
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
});

test("installer refuses non-dry runs from an arbitrary linked worktree", () => {
  const fixtureBase = mkdtempSync(join(tmpdir(), "cinderella-worktree-"));
  try {
    const primaryRoot = join(fixtureBase, "primary");
    const worktreeRoot = join(fixtureBase, "feature-checkout");
    mkdirSync(primaryRoot, { recursive: true });
    createFixture(primaryRoot);
    run("git", ["add", "."], { cwd: primaryRoot });
    run(
      "git",
      [
        "-c",
        "user.name=Installer Test",
        "-c",
        "user.email=installer-test@example.com",
        "commit",
        "-m",
        "fixture"
      ],
      { cwd: primaryRoot }
    );
    run("git", ["worktree", "add", "--detach", worktreeRoot, "HEAD"], {
      cwd: primaryRoot
    });

    const result = spawnSync(
      process.execPath,
      [join(worktreeRoot, "scripts", "install-claude-assets.mjs")],
      {
        encoding: "utf8",
        env: {
          ...process.env,
          CLAUDE_CONFIG_DIR: join(fixtureBase, "claude-config")
        }
      }
    );

    assert.equal(result.status, 1);
    assert.match(result.stderr, /running from a linked worktree/);
  } finally {
    rmSync(fixtureBase, { recursive: true, force: true });
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
