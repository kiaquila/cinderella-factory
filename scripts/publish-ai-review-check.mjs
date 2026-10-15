#!/usr/bin/env node

const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const headSha = process.env.AI_REVIEW_HEAD_SHA;
const status = process.env.AI_REVIEW_CHECK_STATUS || "completed";
const conclusion = process.env.AI_REVIEW_CHECK_CONCLUSION;
const title = process.env.AI_REVIEW_CHECK_OUTPUT_TITLE || "AI Review";
const summary = process.env.AI_REVIEW_CHECK_OUTPUT_SUMMARY || "";

if (!token || !repository || !headSha) {
  console.error("GITHUB_TOKEN, GITHUB_REPOSITORY, and AI_REVIEW_HEAD_SHA are required.");
  process.exit(1);
}

if (!new Set(["queued", "in_progress", "completed"]).has(status)) {
  console.error(`Unsupported AI_REVIEW_CHECK_STATUS value: ${status}`);
  process.exit(1);
}

if (status === "completed" && !new Set(["success", "failure", "neutral", "cancelled", "skipped", "timed_out", "action_required"]).has(conclusion)) {
  console.error(`Unsupported AI_REVIEW_CHECK_CONCLUSION value: ${conclusion}`);
  process.exit(1);
}

const [owner, repo] = repository.split("/");
const detailsUrl = process.env.GITHUB_RUN_ID
  ? `${process.env.GITHUB_SERVER_URL || "https://github.com"}/${repository}/actions/runs/${process.env.GITHUB_RUN_ID}`
  : undefined;

// A dispatched workflow runs on the default branch, so bind its synthetic
// check to the explicitly validated PR head and recheck immediately before POST.
const prNumber = process.env.AI_REVIEW_PR_NUMBER;
if (!prNumber) throw new Error("AI_REVIEW_PR_NUMBER is required to publish a head-bound check.");
const pullResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`, {
  headers: { authorization: `Bearer ${token}`, accept: "application/vnd.github+json" }
});
if (!pullResponse.ok) throw new Error(`Cannot verify PR head: ${pullResponse.status}`);
const pull = await pullResponse.json();
if (pull.head?.sha !== headSha) {
  console.log(`Refusing to publish stale AI Review check for ${headSha}.`);
  process.exit(0);
}

const payload = {
  name: "AI Review",
  head_sha: headSha,
  status,
  started_at: new Date().toISOString(),
  details_url: detailsUrl
};

if (status === "completed") {
  payload.conclusion = conclusion;
  payload.completed_at = new Date().toISOString();
  payload.output = {
    title,
    summary
  };
}

const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/check-runs`, {
  method: "POST",
  headers: {
    authorization: `Bearer ${token}`,
    accept: "application/vnd.github+json",
    "content-type": "application/json",
    "x-github-api-version": "2022-11-28"
  },
  body: JSON.stringify(payload)
});

if (!response.ok) {
  throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`);
}

console.log(`Published ${status} AI Review check for ${headSha}.`);
