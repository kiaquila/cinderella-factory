import test from "node:test";
import assert from "node:assert/strict";
import { validateBootstrapContext } from "../scripts/ai-review-bootstrap.mjs";

const sha = "a".repeat(40);
const mergeSha = "b".repeat(40);
function fixture() {
  return {
    event: { action: "labeled", label: { name: "ai-review-parser-bootstrap" }, pull_request: { number: 8, head: { sha }, base: { sha: "c".repeat(40) } }, repository: { default_branch: "main" } },
    env: { GITHUB_EVENT_NAME: "pull_request", GITHUB_REPOSITORY_OWNER: "owner", GITHUB_REPOSITORY: "owner/repo", GITHUB_ACTOR: "owner", GITHUB_TRIGGERING_ACTOR: "owner", GITHUB_SHA: mergeSha, GITHUB_REF: "refs/pull/8/merge", GITHUB_WORKFLOW_REF: "owner/repo/.github/workflows/ai-review.yml@refs/pull/8/merge", AI_REVIEW_AGENT: "codex" },
    pull: { number: 8, state: "open", draft: false, merge_commit_sha: mergeSha, head: { sha, ref: "fix", repo: { full_name: "owner/repo" } }, base: { ref: "main", sha: "c".repeat(40), repo: { full_name: "owner/repo" } } }
  };
}

test("read-only bootstrap binds owner label, workflow merge commit, live PR head and default base", () => {
  assert.deepEqual(validateBootstrapContext(fixture()), { repository: "owner/repo", sha, prNumber: 8 });
});

test("bootstrap rejects unsafe label events, reruns, refs and PR state", () => {
  const changes = [
    f => { f.env.GITHUB_EVENT_NAME = "workflow_dispatch"; },
    f => { f.event.action = "synchronize"; },
    f => { f.event.label.name = "other"; },
    f => { f.env.GITHUB_ACTOR = "collaborator"; },
    f => { f.env.GITHUB_TRIGGERING_ACTOR = "collaborator"; },
    f => { delete f.env.GITHUB_TRIGGERING_ACTOR; },
    f => { f.env.GITHUB_WORKFLOW_REF = "owner/repo/.github/workflows/other.yml@refs/pull/8/merge"; },
    f => { f.event.pull_request.head.sha = "d".repeat(40); },
    f => { f.env.GITHUB_SHA = "a".repeat(7); },
    f => { f.event.pull_request.number = "8/../../issues"; },
    f => { f.env.AI_REVIEW_AGENT = "claude"; },
    f => { f.pull.head.sha = "b".repeat(40); },
    f => { f.pull.head.repo.full_name = "fork/repo"; },
    f => { f.pull.base.repo.full_name = "fork/repo"; },
    f => { f.pull.base.ref = "other"; },
    f => { f.pull.state = "closed"; },
    f => { f.pull.draft = true; },
    f => { f.pull.number = 9; },
    f => { f.env.GITHUB_REF = "refs/heads/fix"; f.env.GITHUB_WORKFLOW_REF = "owner/repo/.github/workflows/ai-review.yml@refs/heads/fix"; },
    f => { f.pull.merge_commit_sha = "d".repeat(40); },
    f => { f.pull.base.sha = "d".repeat(40); }
  ];
  for (const change of changes) {
    const input = fixture(); change(input);
    assert.throws(() => validateBootstrapContext(input), undefined, change.toString());
  }
});
