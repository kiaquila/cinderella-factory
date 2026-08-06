import test from "node:test";
import assert from "node:assert/strict";
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
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
const ROLE_SKILLS = {
  "ui-ux-designer": [
    "design-system",
    "design-handoff",
    "design-review",
    "menu-design",
    "landing-page"
  ],
  frontend: [
    "design-system",
    "design-handoff",
    "menu-design",
    "landing-page"
  ]
};

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
    const backupRoot = join(claudeDir, ".pre-factory-backups");
    const linkPath = join(claudeDir, "agents", "ui-ux-designer.md");
    const foreignLinkPath = join(claudeDir, "agents", "frontend.md");
    const backupBase = join(backupRoot, "agents", "ui-ux-designer.md");
    mkdirSync(dirname(linkPath), { recursive: true });
    mkdirSync(dirname(backupBase), { recursive: true });
    writeFileSync(linkPath, "replacement\n");
    writeFileSync(backupBase, "original backup\n");
    symlinkSync("missing-target", `${backupBase}.1`);
    symlinkSync("foreign-missing-target", foreignLinkPath);

    const result = spawnSync(process.execPath, [scriptPath], {
      encoding: "utf8",
      env: { ...process.env, CLAUDE_CONFIG_DIR: claudeDir }
    });

    assert.equal(result.status, 0, result.stderr);
    assert.equal(readFileSync(backupBase, "utf8"), "original backup\n");
    assert.equal(readlinkSync(`${backupBase}.1`), "missing-target");
    assert.equal(readFileSync(`${backupBase}.2`, "utf8"), "replacement\n");
    assert.equal(
      readlinkSync(linkPath),
      realpathSync(join(fixtureRoot, "agents", "ui-ux-designer", "agent.md"))
    );
    assert.equal(
      readlinkSync(join(backupRoot, "agents", "frontend.md")),
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

test("installer keeps backups out of the scanned skills and agents folders", () => {
  const fixtureRoot = mkdtempSync(join(tmpdir(), "cinderella-scan-"));
  try {
    const scriptPath = createFixture(fixtureRoot);

    const claudeDir = join(fixtureRoot, "claude-config");
    const skillPath = join(claudeDir, "skills", "design-system");
    mkdirSync(skillPath, { recursive: true });
    writeFileSync(join(skillPath, "SKILL.md"), "pre-existing skill\n");

    const result = spawnSync(process.execPath, [scriptPath], {
      encoding: "utf8",
      env: { ...process.env, CLAUDE_CONFIG_DIR: claudeDir }
    });
    assert.equal(result.status, 0, result.stderr);

    for (const scanned of ["skills", "agents"]) {
      const stray = readdirSync(join(claudeDir, scanned)).filter((entry) =>
        entry.includes("pre-factory-backup")
      );
      assert.deepEqual(
        stray,
        [],
        `${scanned}/ must not retain backups Claude Code would load`
      );
    }

    assert.equal(
      readFileSync(
        join(claudeDir, ".pre-factory-backups", "skills", "design-system", "SKILL.md"),
        "utf8"
      ),
      "pre-existing skill\n"
    );
    assert.equal(
      readlinkSync(skillPath),
      realpathSync(join(fixtureRoot, "skills", "design-system"))
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

test("design roles preload their required Claude Code skills", () => {
  for (const [id, expectedSkills] of Object.entries(ROLE_SKILLS)) {
    const contents = readFileSync(
      new URL(`../agents/${id}/agent.md`, import.meta.url),
      "utf8"
    );
    const frontmatter = contents.match(/^---\n([\s\S]*?)\n---\n/);
    assert.ok(frontmatter, `${id} must have YAML frontmatter`);
    const skillsBlock = frontmatter[1].match(/^skills:\n((?:  - .+\n?)+)/m);
    assert.ok(skillsBlock, `${id} must declare preloaded skills`);
    const actualSkills = skillsBlock[1]
      .trim()
      .split("\n")
      .map((line) => line.replace(/^\s*-\s+/, ""));
    assert.deepEqual(actualSkills, expectedSkills);
  }
});
