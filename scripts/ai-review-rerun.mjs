#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import {
  extractClaudeOutcome,
  hasBlockingCodexEvidence,
  latestNativeReviewResult,
  latestClaudeOutcome,
  isCodexReviewSignal,
  codexCommentTimestamp,
  isTrustedReviewLogin
} from "./ai-review-helpers.mjs";
import { readConfig } from "./shared.mjs";

const rerunnableConclusions = new Set(["failure", "cancelled", "timed_out", "action_required"]);
const recoverableConclusions = new Set([...rerunnableConclusions, "success"]);
const activeStatuses = new Set(["queued", "in_progress", "waiting", "requested", "pending"]);

function normalizeAgent(agent) {
  return String(agent || "codex").trim().toLowerCase() || "codex";
}

export function shouldRouteAiReviewRerunEvent(event, selectedAgent = "codex", config = {}) {
  const agent = normalizeAgent(selectedAgent);

  if (event?.review) {
    if (!["codex", "gemini"].includes(agent)) return false;
    const reviewSha = event.review.commit_id;
    const headSha = event.pull_request?.head?.sha;
    if (reviewSha && headSha && reviewSha !== headSha) return false;
    return isTrustedReviewLogin(event.review.user?.login, agent, config);
  }

  if (!event?.issue?.pull_request || !event?.comment) return false;
  const body = String(event.comment.body || "");
  const login = event.comment.user?.login;

  if (agent === "codex") {
    return isCodexReviewSignal(body) && isTrustedReviewLogin(login, "codex", config);
  }

  if (agent === "claude") {
    return Boolean(extractClaudeOutcome(body)) && isTrustedReviewLogin(login, "claude", config);
  }

  return false;
}

export function selectAiReviewRun(runs = [], headSha, evidenceAt, blockingEvidence = false) {
  const matchingRuns = runs
    .filter((run) => run.event === "pull_request" && run.head_sha === headSha)
    .sort((left, right) => Date.parse(right.created_at || "") - Date.parse(left.created_at || ""));

  const activeRun = matchingRuns.find((run) => activeStatuses.has(run.status));
  if (activeRun) {
    return { action: "already_running", run: activeRun };
  }

  const latestCompletedRun = matchingRuns.find((run) => run.status === "completed");
  if (latestCompletedRun?.conclusion === "success") {
    const completedAt = latestCompletedRun.updated_at || latestCompletedRun.run_started_at || latestCompletedRun.created_at;
    const startedAt = latestCompletedRun.run_started_at || latestCompletedRun.created_at;
    const lateBlocking = blockingEvidence && Date.parse(evidenceAt || "") >= Date.parse(startedAt || "");
    const action = lateBlocking || Date.parse(evidenceAt || "") > Date.parse(completedAt || "") ? "rerun" : "already_success";
    return { action, run: latestCompletedRun };
  }
  if (latestCompletedRun && rerunnableConclusions.has(latestCompletedRun.conclusion)) {
    return { action: "rerun", run: latestCompletedRun };
  }

  return { action: "not_found", run: null };
}

async function defaultRequest(token, repository, path, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${text}`);
  }
  return text ? JSON.parse(text) : null;
}

const PAGINATION_MAX_PAGES = 50;

async function listPaginated(request, token, repository, path) {
  const items = [];
  const separator = path.includes("?") ? "&" : "?";
  for (let page = 1; page <= PAGINATION_MAX_PAGES; page += 1) {
    const data = await request(token, repository, `${path}${separator}per_page=100&page=${page}`);
    const rawBatch = data?.workflow_runs ?? data;
    const batch = Array.isArray(rawBatch) ? rawBatch : [];
    items.push(...batch);
    if (batch.length < 100) return items;
  }
  return items;
}

export async function rerunAiReviewForPrHead({
  token,
  repository,
  headSha,
  request = defaultRequest,
  prNumber,
  evidenceAt,
  blockingEvidence = false
}) {
  if (!token || !repository || !headSha) {
    throw new Error("token, repository, and headSha are required to rerun AI Review.");
  }

  const [owner, repo] = repository.split("/");
  const runs = await listPaginated(
    request,
    token,
    repository,
    `/repos/${owner}/${repo}/actions/workflows/ai-review.yml/runs?event=pull_request&head_sha=${encodeURIComponent(headSha)}`
  );
  const selected = selectAiReviewRun(runs, headSha, evidenceAt, blockingEvidence);

  if (prNumber) {
    const pull = await request(token, repository, `/repos/${owner}/${repo}/pulls/${prNumber}`);
    if (pull.head?.sha !== headSha) return { action: "stale", run: null, message: "PR head changed; rerun skipped." };
  }
  if (selected.action === "rerun" && evidenceAt &&
      Date.parse(selected.run.run_started_at || selected.run.created_at || "") > Date.parse(evidenceAt)) {
    return { action: "already_evaluated", run: selected.run, message: "This evidence already had a gate attempt; rerun skipped." };
  }
  if (selected.action === "rerun") {
    await request(
      token,
      repository,
      `/repos/${owner}/${repo}/actions/runs/${selected.run.id}/rerun`,
      { method: "POST" }
    );
    return {
      ...selected,
      message: `Requested AI Review rerun for ${headSha} from run ${selected.run.id}.`
    };
  }

  const runId = selected.run?.id ? ` run ${selected.run.id}` : "";
  const messages = {
    already_running: `AI Review is already running for ${headSha}${runId}.`,
    already_success: `AI Review already passed for ${headSha}${runId}.`,
    not_found: `No completed AI Review pull_request run found for ${headSha}.`
  };

  return {
    ...selected,
    message: messages[selected.action]
  };
}

export async function resolvePullContext({ token, repository, event, request = defaultRequest }) {
  const prNumber = event?.pull_request?.number || (event?.issue?.pull_request && event.issue.number);
  if (!prNumber) throw new Error("Could not resolve pull request from event.");

  const [owner, repo] = repository.split("/");
  const pull = await request(token, repository, `/repos/${owner}/${repo}/pulls/${prNumber}`);
  return {
    prNumber: pull.number,
    headSha: pull.head?.sha
  };
}

async function hasBlockingEvidence({ token, repository, prNumber, headSha, selectedAgent, config, comments, reviews }) {
  comments ||= await listPaginated(defaultRequest, token, repository, `/repos/${repository}/issues/${prNumber}/comments`);
  if (selectedAgent === "claude") {
    const outcome = latestClaudeOutcome(comments, headSha, config);
    return outcome === "block" || outcome === "advisory";
  }
  reviews ||= await listPaginated(defaultRequest, token, repository, `/repos/${repository}/pulls/${prNumber}/reviews`);
  const reviewComments = await listPaginated(defaultRequest, token, repository, `/repos/${repository}/pulls/${prNumber}/comments`);
  if (selectedAgent === "codex") {
    const [owner, repo] = repository.split("/");
    return hasBlockingCodexEvidence({
      request: (path, options) => defaultRequest(token, repository, path, options),
      owner, repo, prNumber, comments, reviews, reviewComments, headSha, config
    });
  }
  return latestNativeReviewResult(reviews, reviewComments, selectedAgent, headSha, config) === "fail";
}

async function main() {
  const token = process.env.GITHUB_TOKEN;
  const repository = process.env.GITHUB_REPOSITORY;
  const eventPath = process.env.GITHUB_EVENT_PATH;
  const selectedAgent = normalizeAgent(process.env.AI_REVIEW_AGENT);
  const config = readConfig(process.env.AI_REVIEW_CONFIG_ROOT || process.env.UNICORN_HUB_CONFIG_ROOT || undefined);

  if (!token || !repository || !eventPath) {
    console.error("GITHUB_TOKEN, GITHUB_REPOSITORY, and GITHUB_EVENT_PATH are required.");
    process.exit(1);
  }

  const event = JSON.parse(readFileSync(eventPath, "utf8"));
  let context;
  let evidenceAt;
  let comments;
  let reviews;
  if (event.workflow_run) {
    const run = event.workflow_run;
    const number = run.pull_requests?.[0]?.number;
    if (run.event !== "pull_request" || run.path !== ".github/workflows/ai-review.yml" ||
        !recoverableConclusions.has(run.conclusion) || !number) return;
    const pull = await defaultRequest(token, repository, `/repos/${repository}/pulls/${number}`);
    if (pull.state !== "open" || pull.head?.sha !== run.head_sha) return;
    context = { prNumber: number, headSha: pull.head.sha };
    // Recover evidence that arrived while a gate was active but after its last
    // poll. An attempt started after that evidence is never requeued again.
    comments = await listPaginated(defaultRequest, token, repository, `/repos/${repository}/issues/${number}/comments`);
    reviews = await listPaginated(defaultRequest, token, repository, `/repos/${repository}/pulls/${number}/reviews`);
    const times = [
      ...comments.filter((comment) => shouldRouteAiReviewRerunEvent({ issue: { pull_request: {} }, comment }, selectedAgent, config)).map(codexCommentTimestamp),
      ...reviews.filter((review) => shouldRouteAiReviewRerunEvent({ review, pull_request: pull }, selectedAgent, config)).map((review) => review.submitted_at)
    ].filter((value) => Number.isFinite(Date.parse(value)));
    evidenceAt = times.sort((a, b) => Date.parse(b) - Date.parse(a))[0];
    if (!evidenceAt) return;
  } else {
    if (!shouldRouteAiReviewRerunEvent(event, selectedAgent, config)) {
      console.log("AI Review rerun skipped: event is not trusted review evidence for the selected agent.");
      return;
    }
    context = await resolvePullContext({ token, repository, event });
    if (event.review?.commit_id && event.review.commit_id !== context.headSha) return;
    evidenceAt = event.review?.submitted_at || codexCommentTimestamp(event.comment);
  }
  const blockingEvidence = await hasBlockingEvidence({
    token, repository, ...context, selectedAgent, config, comments, reviews
  });
  const result = await rerunAiReviewForPrHead({
    token, repository, headSha: context.headSha, prNumber: context.prNumber, evidenceAt, blockingEvidence
  });
  console.log(result.message);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await main();
  } catch (error) {
    console.error(`AI Review rerun failed: ${error.message}`);
    process.exit(1);
  }
}
