#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

function bootstrapInputs(event, env) {
  const owner = env.GITHUB_REPOSITORY_OWNER;
  const repository = env.GITHUB_REPOSITORY;
  const sha = env.GITHUB_SHA;
  if (env.GITHUB_EVENT_NAME !== "workflow_dispatch" ||
      ![true, "true"].includes(event.inputs?.read_only_bootstrap)) {
    throw new Error("Read-only bootstrap requires an explicit manual dispatch.");
  }
  if (!owner || env.GITHUB_ACTOR !== owner || env.GITHUB_TRIGGERING_ACTOR !== owner) {
    throw new Error("Only the repository owner may dispatch or rerun bootstrap.");
  }
  if (!repository?.startsWith(`${owner}/`) ||
      env.GITHUB_WORKFLOW_REF !== `${repository}/.github/workflows/ai-review.yml@${env.GITHUB_REF}`) {
    throw new Error("Bootstrap must use this repository's AI Review workflow.");
  }
  if (!/^[a-f0-9]{40}$/.test(sha || "") || event.inputs?.head_sha !== sha) {
    throw new Error("The explicit full head SHA must equal the workflow commit.");
  }
  if (!/^[1-9]\d*$/.test(String(event.inputs?.pr_number || ""))) {
    throw new Error("A pull request number is required.");
  }
  if ((env.AI_REVIEW_AGENT || "codex").trim().toLowerCase() !== "codex") {
    throw new Error("Read-only bootstrap requires the configured native Codex reviewer.");
  }
  return { repository, sha, prNumber: Number(event.inputs.pr_number) };
}

export function validateBootstrapContext({ event, env, pull }) {
  const context = bootstrapInputs(event, env);
  if (pull.number !== context.prNumber || pull.state !== "open" || pull.draft !== false ||
      pull.head?.sha !== context.sha || pull.head?.repo?.full_name !== context.repository ||
      pull.base?.repo?.full_name !== context.repository ||
      pull.base?.ref !== event.repository?.default_branch ||
      env.GITHUB_REF !== `refs/heads/${pull.head?.ref}`) {
    throw new Error("Bootstrap must target the open, ready, same-repository PR head and default base.");
  }
  return context;
}

async function main() {
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
  const context = bootstrapInputs(event, process.env);
  if (!process.env.GITHUB_TOKEN) throw new Error("GITHUB_TOKEN is required.");
  const response = await fetch(`https://api.github.com/repos/${context.repository}/pulls/${context.prNumber}`, {
    headers: {
      authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28"
    }
  });
  if (!response.ok) throw new Error(`Could not verify bootstrap PR: ${response.status}.`);
  validateBootstrapContext({ event, env: process.env, pull: await response.json() });
  console.log(`Read-only bootstrap context verified for PR #${context.prNumber} at ${context.sha}.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try { await main(); } catch (error) {
    console.error(`AI Review bootstrap rejected: ${error.message}`);
    process.exit(1);
  }
}
