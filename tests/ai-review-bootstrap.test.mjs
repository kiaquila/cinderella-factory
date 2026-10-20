import test from "node:test";
import assert from "node:assert/strict";
import { validateBootstrapContext } from "../scripts/ai-review-bootstrap.mjs";

const sha = "a".repeat(40);
function fixture() {
  return {
    event: { inputs: { read_only_bootstrap: "true", head_sha: sha, pr_number: "8" }, repository: { default_branch: "main" } },
    env: { GITHUB_EVENT_NAME: "workflow_dispatch", GITHUB_REPOSITORY_OWNER: "owner", GITHUB_REPOSITORY: "owner/repo", GITHUB_ACTOR: "owner", GITHUB_TRIGGERING_ACTOR: "owner", GITHUB_SHA: sha, GITHUB_REF: "refs/heads/fix", GITHUB_WORKFLOW_REF: "owner/repo/.github/workflows/ai-review.yml@refs/heads/fix", AI_REVIEW_AGENT: "codex" },
    pull: { number: 8, state: "open", draft: false, head: { sha, ref: "fix", repo: { full_name: "owner/repo" } }, base: { ref: "main", repo: { full_name: "owner/repo" } } }
  };
}

test("read-only bootstrap binds owner dispatch, workflow commit, live PR head and default base", () => {
  assert.deepEqual(validateBootstrapContext(fixture()), { repository: "owner/repo", sha, prNumber: 8 });
  const input = fixture(); input.event.inputs.read_only_bootstrap = true;
  assert.doesNotThrow(() => validateBootstrapContext(input));
});

test("bootstrap rejects unsafe dispatches, reruns, refs and PR state", () => {
  const changes = [
    f => { f.env.GITHUB_EVENT_NAME = "pull_request"; },
    f => { f.event.inputs.read_only_bootstrap = "false"; },
    f => { f.env.GITHUB_ACTOR = "collaborator"; },
    f => { f.env.GITHUB_TRIGGERING_ACTOR = "collaborator"; },
    f => { delete f.env.GITHUB_TRIGGERING_ACTOR; },
    f => { f.env.GITHUB_WORKFLOW_REF = "owner/repo/.github/workflows/other.yml@refs/heads/fix"; },
    f => { f.event.inputs.head_sha = "b".repeat(40); },
    f => { f.env.GITHUB_SHA = "a".repeat(7); f.event.inputs.head_sha = f.env.GITHUB_SHA; },
    f => { f.event.inputs.pr_number = "8/../../issues"; },
    f => { f.env.AI_REVIEW_AGENT = "claude"; },
    f => { f.pull.head.sha = "b".repeat(40); },
    f => { f.pull.head.repo.full_name = "fork/repo"; },
    f => { f.pull.base.repo.full_name = "fork/repo"; },
    f => { f.pull.base.ref = "other"; },
    f => { f.pull.state = "closed"; },
    f => { f.pull.draft = true; },
    f => { f.pull.number = 9; },
    f => { f.env.GITHUB_REF = "refs/tags/fix"; f.env.GITHUB_WORKFLOW_REF = "owner/repo/.github/workflows/ai-review.yml@refs/tags/fix"; }
  ];
  for (const change of changes) {
    const input = fixture(); change(input);
    assert.throws(() => validateBootstrapContext(input), undefined, change.toString());
  }
});
