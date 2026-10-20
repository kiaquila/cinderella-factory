#!/usr/bin/env node
import {
  createAiReviewRequestMarkerBody,
  latestCodexSummaryResult,
  hasBlockingCodexEvidence,
  isTrustedAssociation,
  latestAiReviewRequestMarker,
  latestClaudeOutcome,
  latestCodexNativeReviewResult,
  latestNativeReviewResult
} from "./ai-review-helpers.mjs";
import { readConfig } from "./shared.mjs";

const configRoot = process.env.AI_REVIEW_CONFIG_ROOT || undefined;
const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const prNumber = process.env.AI_REVIEW_PR_NUMBER;
const headSha = process.env.AI_REVIEW_HEAD_SHA;
const selectedAgent = (process.env.AI_REVIEW_AGENT || "codex").trim().toLowerCase();
const triggerMode = (process.env.AI_REVIEW_TRIGGER_MODE || "skip").trim().toLowerCase();
const maxWaitMs = Number(process.env.AI_REVIEW_WAIT_MS || 900000);
const initialPollMs = Number(process.env.AI_REVIEW_POLL_MS || 15000);
const maxPollMs = Number(process.env.AI_REVIEW_MAX_POLL_MS || 120000);
const debounceMs = Number(process.env.AI_REVIEW_DEBOUNCE_MS || 0);
const bootstrapHumanTrigger = process.env.AI_REVIEW_BOOTSTRAP_HUMAN_TRIGGER === "1";
const readOnly = process.env.AI_REVIEW_READ_ONLY === "1";
const headUpdatedAt = process.env.AI_REVIEW_HEAD_UPDATED_AT || "";
const config = readConfig(configRoot);

if (!token || !repository || !prNumber || !headSha) {
  console.error("GITHUB_TOKEN, GITHUB_REPOSITORY, AI_REVIEW_PR_NUMBER, and AI_REVIEW_HEAD_SHA are required.");
  process.exit(1);
}

if (!new Set(["codex", "claude", "gemini"]).has(selectedAgent)) {
  console.error(`Unsupported AI_REVIEW_AGENT value: ${selectedAgent}`);
  process.exit(1);
}

if (!new Set(["skip", "comment"]).has(triggerMode)) {
  console.error(`Unsupported AI_REVIEW_TRIGGER_MODE value: ${triggerMode}`);
  process.exit(1);
}

if (readOnly && triggerMode !== "skip") {
  console.error("Read-only AI Review cannot post a review trigger.");
  process.exit(1);
}

const [owner, repo] = repository.split("/");

async function request(path, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      ...(options.headers || {})
    }
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

async function listPaginated(path) {
  const items = [];
  const separator = path.includes("?") ? "&" : "?";
  for (let page = 1; ; page += 1) {
    const batch = await request(`${path}${separator}per_page=100&page=${page}`);
    items.push(...batch);
    if (batch.length < 100) return items;
  }
}

async function createComment(body) {
  return request(`/repos/${owner}/${repo}/issues/${prNumber}/comments`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ body })
  });
}

async function fetchPull() {
  return request(`/repos/${owner}/${repo}/pulls/${prNumber}`);
}

async function currentHeadMatches() {
  const pull = await fetchPull();
  return pull.head?.sha === headSha;
}

async function waitForQuietHead() {
  if (!Number.isFinite(debounceMs) || debounceMs <= 0) return true;
  await new Promise((resolve) => setTimeout(resolve, debounceMs));
  return currentHeadMatches();
}

async function maybePostTriggerComment() {
  if (triggerMode !== "comment") return;
  const triggers = {
    codex: "@codex review",
    claude: "@claude review once",
    gemini: "/gemini review"
  };
  const triggerComment = await createComment([
    triggers[selectedAgent],
    "",
    "_Administrative trigger posted by the AI Review workflow. Prefer a trusted human-authored trigger if the native backend ignores bot comments._"
  ].join("\n"));
  const requestedAt = triggerComment?.created_at || new Date().toISOString();
  await createComment(createAiReviewRequestMarkerBody({
    agent: selectedAgent,
    headSha,
    requestId: `workflow-${triggerComment?.id || Date.now()}-${headSha.slice(0, 12)}`,
    sourceCommentId: String(triggerComment?.id || ""),
    sourceCommentCreatedAt: triggerComment?.created_at,
    requestedAt
  }));
}

function isTrustedHumanReviewTrigger(comment) {
  if (!isTrustedAssociation(comment?.author_association)) return false;
  if (comment?.user?.type === "Bot") return false;
  const body = String(comment?.body || "");
  if (selectedAgent === "codex") return body.includes("@codex review");
  if (selectedAgent === "claude") return body.includes("@claude review once");
  if (selectedAgent === "gemini") return body.includes("/gemini review");
  return false;
}

function latestHeadRefForcePushTime(timeline = []) {
  const times = timeline
    .filter((event) => event.event === "head_ref_force_pushed")
    .map((event) => Date.parse(event.created_at || ""))
    .filter(Number.isFinite);
  return times.length ? Math.max(...times) : NaN;
}

function latestBootstrapHumanTrigger(comments = [], pullRequestHeadUpdatedAt, timeline = []) {
  const lowerBounds = [
    Date.parse(pullRequestHeadUpdatedAt || ""),
    latestHeadRefForcePushTime(timeline)
  ].filter(Number.isFinite);
  if (lowerBounds.length === 0) return null;
  const requiredAfter = Math.max(...lowerBounds);
  return comments
    .filter((comment) => {
      if (!isTrustedHumanReviewTrigger(comment)) return false;
      const createdAt = Date.parse(comment.created_at || "");
      return Number.isFinite(createdAt) && createdAt > requiredAfter;
    })
    .sort((left, right) => Date.parse(right.created_at || "") - Date.parse(left.created_at || ""))[0] || null;
}

function isAfterRequest(value, requestMarker) {
  const valueTime = Date.parse(value || "");
  const requestedAt = Date.parse(
    requestMarker?.sourceCommentCreatedAt ||
    requestMarker?.requestedAt ||
    requestMarker?.commentCreatedAt ||
    ""
  );
  return Number.isFinite(valueTime) && Number.isFinite(requestedAt) && valueTime >= requestedAt;
}

async function collectEvidence() {
  if (!await currentHeadMatches()) return "stale";

  if (selectedAgent === "claude") {
    const comments = await listPaginated(`/repos/${owner}/${repo}/issues/${prNumber}/comments`);
    const latestOutcome = latestClaudeOutcome(comments, headSha, config);
    if (latestOutcome === "pass") return "pass";
    if (latestOutcome) return "fail";
    return "pending";
  }

  const reviews = await listPaginated(`/repos/${owner}/${repo}/pulls/${prNumber}/reviews`);
  if (selectedAgent === "codex") {
    const comments = await listPaginated(`/repos/${owner}/${repo}/issues/${prNumber}/comments`);
    let requestMarker = latestAiReviewRequestMarker(comments, selectedAgent, headSha);
    let timeline = null;
    if (!requestMarker && bootstrapHumanTrigger) {
      timeline = await listPaginated(`/repos/${owner}/${repo}/issues/${prNumber}/timeline`);
      const trigger = latestBootstrapHumanTrigger(comments, headUpdatedAt, timeline);
      if (trigger) {
        requestMarker = {
          agent: selectedAgent,
          sha: headSha,
          sourceCommentId: String(trigger.id || ""),
          sourceCommentCreatedAt: trigger.created_at,
          requestedAt: trigger.created_at,
          commentCreatedAt: trigger.created_at,
          author: trigger.user?.login || null
        };
      }
    }

    const reviewComments = await listPaginated(`/repos/${owner}/${repo}/pulls/${prNumber}/comments`);
    // Findings and unresolved threads survive a new request marker.
    if (await hasBlockingCodexEvidence({ request, owner, repo, prNumber,
      comments, reviews, reviewComments, headSha, config })) return "fail";
    const reviewCandidates = requestMarker
      ? reviews.filter((review) => isAfterRequest(review.submitted_at, requestMarker))
      : reviews;
    const nativeResult = latestCodexNativeReviewResult(reviewCandidates, reviewComments, headSha, config);
    if (!requestMarker) return nativeResult || "pending";
    timeline ||= await listPaginated(`/repos/${owner}/${repo}/issues/${prNumber}/timeline`);
    const summaryResult = latestCodexSummaryResult(comments, headSha, requestMarker, timeline, config);
    if (summaryResult === "fail") return "fail";
    return nativeResult === "pass" || summaryResult === "pass" ? "pass" : "pending";
  }

  const reviewComments = await listPaginated(`/repos/${owner}/${repo}/pulls/${prNumber}/comments`);
  const latestNativeResult = latestNativeReviewResult(reviews, reviewComments, selectedAgent, headSha, config);
  if (latestNativeResult === "pass") return "pass";
  if (latestNativeResult === "fail") return "fail";

  return "pending";
}

async function fetchEvidence() {
  const result = await collectEvidence();
  return await currentHeadMatches() ? result : "stale";
}

await maybePostTriggerComment();

if (!await waitForQuietHead()) {
  console.log(`AI Review gate skipped stale run for ${headSha}; PR head changed during debounce.`);
  process.exit(1);
}

const started = Date.now();
let outcome = "pending";
let lastError = null;
let consecutiveErrors = 0;
const maxConsecutiveErrors = 5;
let pollMs = initialPollMs;

while (Date.now() - started <= maxWaitMs) {
  try {
    outcome = await fetchEvidence();
    consecutiveErrors = 0;
    if (outcome !== "pending") break;
  } catch (error) {
    lastError = error;
    consecutiveErrors += 1;
    if (consecutiveErrors >= maxConsecutiveErrors) {
      console.error(`AI Review gate aborting after ${maxConsecutiveErrors} consecutive API errors. Last: ${error.message}`);
      break;
    }
  }
  const elapsed = Date.now() - started;
  const remaining = maxWaitMs - elapsed;
  if (remaining <= 0) break;
  await new Promise((resolve) => setTimeout(resolve, Math.min(pollMs, remaining)));
  pollMs = Math.min(pollMs * 2, maxPollMs);
}

if (outcome === "stale") {
  console.log(`AI Review gate rejected stale run for ${headSha}; PR head moved.`);
  process.exit(1);
}

if (outcome === "pass") {
  console.log(`AI Review gate passed for ${selectedAgent} on ${headSha}.`);
  process.exit(0);
}

const detail = lastError ? ` Last API error: ${lastError.message}` : "";
const reviewHint = selectedAgent === "claude"
  ? `Claude outcome for this head: ${outcome === "fail" ? "block or advisory" : "none"}. Only AI_REVIEW_OUTCOME: pass satisfies the gate.`
  : selectedAgent === "codex"
    ? "Codex must provide current-head review evidence after a trusted AI review request marker."
    : `${selectedAgent} must provide an acceptable native review for the current head SHA.`;

const failureComment = [
  "AI Review gate failed.",
  "",
  `- agent: ${selectedAgent}`,
  `- head SHA: ${headSha}`,
  `- expected: ${reviewHint}`,
  detail ? `- detail: ${detail}` : ""
].filter(Boolean).join("\n");

if (!readOnly) {
  try {
    await createComment(failureComment);
  } catch (error) {
    console.warn(`Could not post AI Review gate failure comment: ${error.message}`);
  }
}

console.error(`AI Review gate failed for ${selectedAgent} on ${headSha}.${detail}`);
process.exit(1);
