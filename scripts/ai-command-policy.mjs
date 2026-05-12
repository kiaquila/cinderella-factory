#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { createAiReviewRequestMarkerBody, isTrustedAssociation } from "./ai-review-helpers.mjs";

const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const eventPath = process.env.GITHUB_EVENT_PATH;

if (!token || !repository || !eventPath) {
  console.error("GITHUB_TOKEN, GITHUB_REPOSITORY, and GITHUB_EVENT_PATH are required.");
  process.exit(1);
}

const [owner, repo] = repository.split("/");
const event = JSON.parse(readFileSync(eventPath, "utf8"));
const body = event.comment?.body || "";
const prNumber = event.issue?.number;
const authorAssociation = event.comment?.author_association;
const commentAuthorType = event.comment?.user?.type;
const commentAuthorLogin = String(event.comment?.user?.login || "").toLowerCase();

if (commentAuthorType === "Bot" || commentAuthorLogin === "github-actions[bot]") {
  console.log("AI command ignored: comment was posted by a bot.");
  process.exit(0);
}

function requestedReviewAgent(commandBody) {
  if (commandBody.includes("@codex review")) return "codex";
  if (commandBody.includes("@claude review once")) return "claude";
  if (commandBody.includes("/gemini review")) return "gemini";
  return null;
}

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

async function createComment(commentBody) {
  return request(`/repos/${owner}/${repo}/issues/${prNumber}/comments`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ body: commentBody })
  });
}

const reviewAgent = requestedReviewAgent(body);
const isReview = Boolean(reviewAgent);
const selected = (isReview
  ? reviewAgent
  : process.env.AI_IMPLEMENTATION_AGENT || "claude").trim().toLowerCase();
const allowed = isReview
  ? new Set(["codex", "claude", "gemini"])
  : new Set(["claude", "codex"]);

const lines = [];
if (!event.issue?.pull_request) {
  lines.push("AI command rejected: this command only runs on pull requests.");
}
if (!isTrustedAssociation(authorAssociation)) {
  lines.push("AI command rejected: only OWNER, MEMBER, and COLLABORATOR comments are trusted.");
}
if (!allowed.has(selected)) {
  lines.push(`AI command rejected: unsupported selected agent '${selected}'.`);
}

if (lines.length) {
  await createComment(lines.join("\n"));
  console.error(lines.join(" "));
  process.exit(1);
}

if (isReview) {
  const pull = await request(`/repos/${owner}/${repo}/pulls/${prNumber}`);
  const headSha = pull.head?.sha;
  const headRef = pull.head?.ref;
  const headRepository = pull.head?.repo?.full_name;
  const workflowRef = event.repository?.default_branch || pull.base?.repo?.default_branch || pull.base?.ref || "main";
  if (!headSha) {
    await createComment("AI review command rejected: could not resolve the current PR head SHA.");
    console.error(`AI review command rejected: missing head SHA for PR #${prNumber}.`);
    process.exit(1);
  }
  if (headRepository && headRepository !== repository) {
    await createComment("AI review command rejected: comment-triggered review dispatch is supported only for branches in this repository. Fork PRs must rely on pull-request-triggered AI Review or a maintainer branch.");
    console.error(`AI review command rejected: cannot dispatch workflow for fork head ${headRepository}:${headRef}.`);
    process.exit(1);
  }
  const sourceCommentId = String(event.comment.id);
  const requestedAt = event.comment.created_at || new Date().toISOString();
  const requestId = `${sourceCommentId}-${String(headSha).slice(0, 12)}`;

  try {
    await createComment(createAiReviewRequestMarkerBody({
      agent: selected,
      headSha,
      requestId,
      sourceCommentId,
      sourceCommentCreatedAt: event.comment.created_at,
      requestedAt
    }));
  } catch (error) {
    console.warn(`::warning::Could not create AI review request marker comment; continuing with trusted dispatch. ${error.message}`);
  }

  await request(`/repos/${owner}/${repo}/actions/workflows/ai-review.yml/dispatches`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      ref: workflowRef,
      inputs: {
        pr_number: String(prNumber),
        head_sha: headSha,
        review_agent: selected,
        trigger_mode: "skip"
      }
    })
  });
}

console.log(`Trusted AI ${isReview ? "review" : "implementation"} command for ${selected}.`);
