export const trustedAssociations = new Set(["OWNER", "MEMBER", "COLLABORATOR"]);

export function isTrustedAssociation(value) {
  return trustedAssociations.has(String(value || "").toUpperCase());
}

export function extractClaudeOutcome(body) {
  const match = String(body || "").match(/^AI_REVIEW_OUTCOME:\s*(pass|advisory|block)\s*$/im);
  return match?.[1]?.toLowerCase() || null;
}

export function extractMarkerSha(body) {
  const match = String(body || "").match(/^AI_REVIEW_SHA:\s*([a-f0-9]{7,40})\s*$/im);
  return match?.[1] || null;
}

export function createAiReviewRequestMarkerBody({
  agent,
  headSha,
  requestId,
  sourceCommentId,
  sourceCommentCreatedAt,
  requestedAt
}) {
  const recordedAt = requestedAt || new Date().toISOString();
  return [
    `AI review request recorded for \`${String(headSha || "").slice(0, 10)}\`.`,
    "",
    "<!-- unicorn-hub:ai-review-request",
    `AI_REVIEW_REQUEST_ID: ${requestId}`,
    `AI_REVIEW_AGENT: ${String(agent || "").trim().toLowerCase()}`,
    `AI_REVIEW_SHA: ${headSha}`,
    `AI_REVIEW_SOURCE_COMMENT_ID: ${sourceCommentId}`,
    `AI_REVIEW_SOURCE_COMMENT_CREATED_AT: ${sourceCommentCreatedAt || recordedAt}`,
    `AI_REVIEW_REQUESTED_AT: ${recordedAt}`,
    "-->"
  ].join("\n");
}

export function extractAiReviewRequestMarker(body) {
  const text = String(body || "");
  if (!text.includes("unicorn-hub:ai-review-request")) return null;

  const field = (name) => text.match(new RegExp(`^${name}:\\s*(.+?)\\s*$`, "im"))?.[1]?.trim() || null;
  const requestId = field("AI_REVIEW_REQUEST_ID");
  const agent = field("AI_REVIEW_AGENT")?.toLowerCase();
  const sha = field("AI_REVIEW_SHA");
  const sourceCommentId = field("AI_REVIEW_SOURCE_COMMENT_ID");
  const sourceCommentCreatedAt = field("AI_REVIEW_SOURCE_COMMENT_CREATED_AT");
  const requestedAt = field("AI_REVIEW_REQUESTED_AT");

  if (!requestId || !agent || !sha || !sourceCommentId || !requestedAt) return null;
  if (!/^[a-f0-9]{7,40}$/i.test(sha)) return null;

  return {
    requestId,
    agent,
    sha,
    sourceCommentId,
    sourceCommentCreatedAt,
    requestedAt
  };
}

export function normalizeLogin(login) {
  return String(login || "").toLowerCase();
}

const defaultTrustedReviewLogins = {
  codex: ["chatgpt-codex-connector[bot]"],
  claude: ["claude[bot]"],
  gemini: ["gemini-code-assist[bot]"]
};

export function trustedReviewLoginsForAgent(agent, config = {}) {
  return new Set([
    ...(defaultTrustedReviewLogins[agent] || []),
    ...(config.trustedReviewLogins || []),
    ...(config.trustedReviewLoginsByAgent?.[agent] || [])
  ].map(normalizeLogin));
}

export function isTrustedReviewLogin(login, agent, config = {}) {
  return trustedReviewLoginsForAgent(agent, config).has(normalizeLogin(login));
}

export function isAiReviewRequestMarkerComment(comment, agent, headSha) {
  const login = normalizeLogin(comment?.user?.login);
  if (login !== "github-actions[bot]") return false;
  const marker = extractAiReviewRequestMarker(comment?.body);
  if (!marker) return false;
  return marker.agent === String(agent || "").toLowerCase() && marker.sha === headSha;
}

export function latestAiReviewRequestMarker(comments = [], agent, headSha) {
  return comments
    .map((comment) => {
      const marker = extractAiReviewRequestMarker(comment?.body);
      if (!marker) return null;
      return {
        ...marker,
        commentId: String(comment.id || ""),
        commentCreatedAt: comment.created_at || null,
        author: comment.user?.login || null
      };
    })
    .filter((marker) =>
      marker &&
      normalizeLogin(marker.author) === "github-actions[bot]" &&
      marker.agent === String(agent || "").toLowerCase() &&
      marker.sha === headSha
    )
    .sort((left, right) =>
      Date.parse(right.commentCreatedAt || right.requestedAt || "") -
      Date.parse(left.commentCreatedAt || left.requestedAt || "")
    )[0] || null;
}

export function containsBlockingSeverity(body, agent) {
  const text = String(body || "");
  if (agent === "codex") {
    return /\bP[0-2]\b/.test(text);
  }
  if (agent === "gemini") {
    return /\b(critical|high)\b/i.test(text);
  }
  return false;
}

export function extractCodexPriority(body) {
  const match = String(body || "").match(/\bP([0-3])\b/i);
  return match ? Number(match[1]) : null;
}

export function isCodexReviewSignal(body) {
  return /^(?:Codex Review:|<!-- codex-review-receipt:|<!-- codex-pull-request-review-summary)/i.test(String(body || "").trim());
}

export function codexCommentTimestamp(comment) {
  const structured = String(comment?.body || "").trim().startsWith("<!-- codex-pull-request-review-summary -->");
  return (structured ? comment?.updated_at || comment?.created_at : comment?.created_at) || "";
}

function withoutCodexAboutDetails(body) {
  // Only the trailing native help panel is outside the review verdict.
  return body.replace(/\s*<details>\s*<summary>[^\n]*About Codex in GitHub<\/summary>[\s\S]*?<\/details>\s*$/i, "").trim();
}

function exactKeys(value, keys) {
  return value && typeof value === "object" && !Array.isArray(value) &&
    Object.keys(value).sort().join(",") === [...keys].sort().join(",");
}

function structuredCodexResult(body, headSha) {
  const match = body.match(/^<!-- codex-pull-request-review-summary -->\s*<!-- codex-review-state:v1 (\{[^\n]*\}) -->\s*## Codex Review Summary(?:\n|$)/);
  if (!match || (body.match(/codex-pull-request-review-summary/gi) || []).length !== 1 ||
      (body.match(/codex-review-state:/gi) || []).length !== 1 || /codex-review-receipt:/i.test(body)) return null;
  const raw = match[1];
  // The closed schema has no escaped strings. Counting keys before JSON.parse
  // also rejects duplicate properties, which JSON.parse would silently replace.
  if (raw.includes("\\")) return null;
  const counts = { code_review: 1, security_review: 1, commit_sha: 2,
    has_any_findings: 2, has_unresolved_findings: 2, status: 2 };
  for (const [key, count] of Object.entries(counts)) {
    if ((raw.match(new RegExp(`"${key}"\\s*:`, "g")) || []).length !== count) return null;
  }
  let state;
  try { state = JSON.parse(raw); } catch { return null; }
  if (!exactKeys(state, ["code_review", "security_review"])) return null;
  for (const review of Object.values(state)) {
    if (!exactKeys(review, ["commit_sha", "has_any_findings", "has_unresolved_findings", "status"])) return null;
    if (review.commit_sha !== null && !/^[a-f0-9]{40}$/.test(review.commit_sha || "")) return null;
    if (![null, true, false].includes(review.has_any_findings) ||
        ![null, true, false].includes(review.has_unresolved_findings)) return null;
    if (![null, "pending", "queued", "in_progress", "running", "completed", "failed", "cancelled"].includes(review.status)) return null;
    if (review.has_any_findings === false && review.has_unresolved_findings === true) return null;
    if (review.status === null && Object.values(review).some((value) => value !== null)) return null;
    if (review.status !== null && typeof review.commit_sha !== "string") return null;
    if (review.status === "completed" && (typeof review.has_any_findings !== "boolean" ||
        typeof review.has_unresolved_findings !== "boolean")) return null;
  }
  // Either native review can report unresolved current-head findings. Check
  // both before selecting the code-review verdict or applying its freshness.
  if (Object.values(state).some((review) =>
    review.commit_sha === headSha && review.has_unresolved_findings === true
  )) return { sha: headSha, result: "fail" };
  const review = state.code_review;
  if (review.commit_sha !== headSha) return { sha: review.commit_sha, result: "pending" };
  if (review.status !== "completed") return { sha: headSha, result: "pending" };
  if (typeof review.has_any_findings !== "boolean" || typeof review.has_unresolved_findings !== "boolean") return null;
  const visible = withoutCodexAboutDetails(body.slice(match[0].length));
  const rows = visible.split("\n").filter((line) => line.includes("**Code Review**"));
  if (rows.length !== 1 || !/✅ \*\*Completed\*\*/.test(rows[0])) return null;
  const commit = rows[0].match(/`([a-f0-9]{7,40})`/g);
  if (commit?.length !== 1 || !headSha.startsWith(commit[0].slice(1, -1))) return null;
  if (/\b(?:P[0-2]|pending|failed|cancelled|in progress)\b/i.test(visible)) return null;
  // Resolved findings alone do not establish severity. A formal P3 review can
  // still pass once its threads are resolved; this summary cannot grant a pass.
  return { sha: headSha, result: review.has_any_findings ? "pending" : "pass" };
}

export function hasBlockingCodexStructuredSummary(comment, headSha, config = {}) {
  if (!isTrustedReviewLogin(comment?.user?.login, "codex", config)) return false;
  return structuredCodexResult(String(comment?.body || "").trim(), headSha)?.result === "fail";
}

export function classifyCodexSummaryComment(comment, headSha, requestMarker = null, config = {}) {
  if (!/^[a-f0-9]{40}$/.test(headSha || "") ||
      !isTrustedReviewLogin(comment?.user?.login, "codex", config)) return null;
  let body = String(comment?.body || "").trim();
  if (!isCodexReviewSignal(body)) return null;
  if (containsBlockingSeverity(body, "codex")) return "fail";
  if (!requestMarker || requestMarker.agent !== "codex" || requestMarker.sha !== headSha) return null;
  const requestedAt = Date.parse(requestMarker.sourceCommentCreatedAt || requestMarker.requestedAt || requestMarker.commentCreatedAt || "");
  const evidenceAt = Date.parse(codexCommentTimestamp(comment));
  if (!Number.isFinite(requestedAt) || !Number.isFinite(evidenceAt) || evidenceAt <= requestedAt) return null;

  if (body.startsWith("<!-- codex-pull-request-review-summary")) {
    const parsed = structuredCodexResult(body, headSha);
    if (parsed?.sha && parsed.sha !== headSha) return null;
    return parsed?.result || "pending";
  }
  if (body.startsWith("<!-- codex-review-receipt:")) {
    if (!body.startsWith("<!-- codex-review-receipt:v1 -->")) return "pending";
    body = body.slice("<!-- codex-review-receipt:v1 -->".length).trim();
  }
  if (/codex-(?:review-(?:receipt|state):|pull-request-review-summary)/i.test(body)) return "pending";
  body = withoutCodexAboutDetails(body);
  const match = body.match(/^Codex Review: Did(?:\s+not|\s*n['’]?t) find any major issues\.([^\n]*)(?:\n+\*\*Reviewed commit:\*\* `([a-f0-9]{10,40})`)?$/i);
  if (!match || /\b(?:P[0-3]|findings?|issues?|pending|failed|blocked|not|unresolved|commit|sha|reviewed)\b/i.test(match[1]) || match[1].includes("`")) return "pending";
  if (match[2] && !headSha.startsWith(match[2])) return null;
  // Receipt format always names the reviewed commit. Legacy format retains
  // timestamp + timeline binding when no commit was included by the backend.
  if (!match[2] && String(comment.body).trim().startsWith("<!--")) return "pending";
  return "pass";
}

export function isAcceptableCodexSummaryComment(comment, headSha, requestMarker = null, config = {}) {
  return classifyCodexSummaryComment(comment, headSha, requestMarker, config) === "pass";
}

export function latestCodexSummaryResult(comments, headSha, requestMarker, timeline = [], config = {}) {
  const triggerAt = requestMarker?.sourceCommentCreatedAt || requestMarker?.requestedAt || requestMarker?.commentCreatedAt;
  const candidates = comments.map((comment) => ({ comment,
    result: classifyCodexSummaryComment(comment, headSha, requestMarker, config) }))
    .filter(({ comment, result }) => result !== null &&
      !hasHeadUpdateBetweenTimestamps(timeline, triggerAt, codexCommentTimestamp(comment)))
    .sort((a, b) => Date.parse(codexCommentTimestamp(b.comment)) - Date.parse(codexCommentTimestamp(a.comment)));
  if (!candidates.length) return "pending";
  const latestTime = codexCommentTimestamp(candidates[0].comment);
  const latest = candidates.filter(({ comment }) => codexCommentTimestamp(comment) === latestTime);
  if (latest.some(({ result }) => result === "fail")) return "fail";
  return latest.every(({ result }) => result === "pass") ? "pass" : "pending";
}

export function hasHeadUpdateBetweenTimestamps(timeline = [], startCreatedAt, endCreatedAt) {
  const startTime = Date.parse(startCreatedAt || "");
  const endTime = Date.parse(endCreatedAt || "");
  if (!Number.isFinite(startTime) || !Number.isFinite(endTime) || startTime > endTime) return true;
  return timeline.some((event) => {
    if (event.event !== "committed" && event.event !== "head_ref_force_pushed") return false;
    const eventTime = Date.parse(event.created_at || event.committer?.date || "");
    return Number.isFinite(eventTime) && eventTime > startTime && eventTime <= endTime;
  });
}

export function classifyCodexNativeReview(review, reviewComments = [], headSha, config = {}) {
  if (!review) return null;
  if (!headSha || review.commit_id !== headSha) return null;
  const login = normalizeLogin(review.user?.login);
  if (!isTrustedReviewLogin(login, "codex", config)) return null;
  if (containsBlockingSeverity(review.body, "codex")) return "fail";

  if (review.state === "CHANGES_REQUESTED") return "fail";
  if (!["APPROVED", "COMMENTED"].includes(review.state)) return null;

  const commentsForReview = reviewComments.filter((comment) =>
    comment.pull_request_review_id === review.id &&
    isTrustedReviewLogin(comment.user?.login, "codex", config)
  );
  if (commentsForReview.length === 0) return "pass";

  const priorities = commentsForReview.map((comment) => extractCodexPriority(comment.body));
  if (priorities.some((priority) => priority === null)) return "fail";
  return Math.min(...priorities) <= 2 ? "fail" : "pass";
}

export function latestCodexNativeReviewResult(reviews = [], reviewComments = [], headSha, config = {}) {
  return reviews
    .map((review) => ({
      review,
      result: classifyCodexNativeReview(review, reviewComments, headSha, config)
    }))
    .filter((entry) => entry.result !== null)
    .sort((left, right) =>
      Date.parse(right.review.submitted_at || "") - Date.parse(left.review.submitted_at || "")
    )[0]?.result || null;
}

export function classifyNativeReview(review, reviewComments = [], agent, headSha, config = {}) {
  if (!review) return null;
  if (!headSha || review.commit_id !== headSha) return null;
  const login = normalizeLogin(review.user?.login);
  const body = review.body || "";

  if (!isTrustedReviewLogin(login, agent, config)) return null;
  if (containsBlockingSeverity(body, agent)) return "fail";
  const commentsForReview = reviewComments.filter((comment) =>
    comment.pull_request_review_id === review.id &&
    isTrustedReviewLogin(comment.user?.login, agent, config)
  );
  if (commentsForReview.some((comment) => containsBlockingSeverity(comment.body, agent))) return "fail";
  if (review.state === "CHANGES_REQUESTED") return "fail";
  if (review.state === "APPROVED") return "pass";
  if (agent === "gemini" && review.state === "COMMENTED") return "pass";

  return null;
}

export function latestNativeReviewResult(reviews = [], reviewComments = [], agent, headSha, config = {}) {
  return reviews
    .map((review) => ({
      review,
      result: classifyNativeReview(review, reviewComments, agent, headSha, config)
    }))
    .filter((entry) => entry.result !== null)
    .sort((left, right) =>
      Date.parse(right.review.submitted_at || "") - Date.parse(left.review.submitted_at || "")
    )[0]?.result || null;
}

export function isAcceptableNativeReview(review, agent, headSha, config = {}) {
  return classifyNativeReview(review, [], agent, headSha, config) === "pass";
}

export function isAcceptableClaudeComment(comment, headSha, config = {}) {
  const body = comment?.body || "";
  const login = normalizeLogin(comment?.user?.login);
  if (!isTrustedReviewLogin(login, "claude", config)) return false;
  if (extractMarkerSha(body) !== headSha) return false;
  return extractClaudeOutcome(body) === "pass";
}

export function latestClaudeOutcome(comments = [], headSha, config = {}) {
  return comments
    .map((comment) => {
      const body = comment?.body || "";
      const login = normalizeLogin(comment?.user?.login);
      const outcome = extractClaudeOutcome(body);
      if (!isTrustedReviewLogin(login, "claude", config)) return null;
      if (extractMarkerSha(body) !== headSha) return null;
      if (!outcome) return null;
      return {
        outcome,
        createdAt: comment.created_at || ""
      };
    })
    .filter(Boolean)
    .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))[0]?.outcome || null;
}

export async function hasUnresolvedReviewThreads({ request, owner, repo, prNumber }) {
  let cursor = null;
  do {
    const data = await request("/graphql", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({
        query: `query($owner:String!,$repo:String!,$number:Int!,$cursor:String) {
          repository(owner:$owner,name:$repo) { pullRequest(number:$number) {
            reviewThreads(first:100,after:$cursor) {
              nodes { isResolved } pageInfo { hasNextPage endCursor }
            }
          } }
        }`, variables: { owner, repo, number: Number(prNumber), cursor }
      })
    });
    const threads = data.data?.repository?.pullRequest?.reviewThreads;
    if (data.errors || !Array.isArray(threads?.nodes) || !threads.pageInfo) {
      throw new Error("Could not verify unresolved review threads.");
    }
    if (threads.nodes.some((thread) => thread.isResolved !== true)) return true;
    if (!threads.pageInfo.hasNextPage) return false;
    if (!threads.pageInfo.endCursor || threads.pageInfo.endCursor === cursor) throw new Error("Invalid review thread pagination.");
    cursor = threads.pageInfo.endCursor;
  } while (cursor);
  return false;
}

export async function hasBlockingCodexEvidence({ request, owner, repo, prNumber,
  comments = [], reviews = [], reviewComments = [], headSha, config = {} }) {
  if (await hasUnresolvedReviewThreads({ request, owner, repo, prNumber })) return true;
  return comments.some((comment) => hasBlockingCodexStructuredSummary(comment, headSha, config)) ||
    latestCodexNativeReviewResult(reviews, reviewComments, headSha, config) === "fail";
}
