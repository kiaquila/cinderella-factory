#!/usr/bin/env node
import { readFileSync, appendFileSync } from "node:fs";

const token = process.env.GITHUB_TOKEN;
const repository = process.env.GITHUB_REPOSITORY;
const explicitPrNumber = process.env.AI_REVIEW_PR_NUMBER;
const explicitHeadSha = process.env.AI_REVIEW_HEAD_SHA;

if (!token || !repository) {
  console.error("GITHUB_TOKEN and GITHUB_REPOSITORY are required.");
  process.exit(1);
}

const [owner, repo] = repository.split("/");

function eventPayload() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) return null;
  try {
    return JSON.parse(readFileSync(eventPath, "utf8"));
  } catch {
    return null;
  }
}

async function request(path) {
  const response = await fetch(`https://api.github.com${path}`, {
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28"
    }
  });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`);
  }
  return response.json();
}

const event = eventPayload();
const prNumber = explicitPrNumber || event?.pull_request?.number || event?.issue?.number || null;
if (!prNumber) {
  console.error("Could not resolve pull request number.");
  process.exit(1);
}

const pull = await request(`/repos/${owner}/${repo}/pulls/${prNumber}`);
const expectedHeadSha = explicitHeadSha || event?.pull_request?.head?.sha;
if (expectedHeadSha && expectedHeadSha !== pull.head.sha) {
  console.warn(`AI Review requested head ${expectedHeadSha}, but PR #${prNumber} is now at ${pull.head.sha}; stale gate will be skipped.`);
}
const output = {
  pr_number: String(pull.number),
  head_sha: expectedHeadSha || pull.head.sha,
  base_ref: pull.base.ref,
  head_ref: pull.head.ref
};

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, Object.entries(output).map(([key, value]) => `${key}=${value}`).join("\n") + "\n");
} else {
  console.log(JSON.stringify(output, null, 2));
}
