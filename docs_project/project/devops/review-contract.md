# Review Contract

Reviewers check the pull request against the active feature spec, not only
against the implementation diff. Acceptance criteria, negative scenarios, and
known issues are the source of truth for expected behavior.

## Codex

Native GitHub PR review. Blocking findings use `P0`, `P1`, or `P2`. Advisory findings use `P3`.

Codex evidence must be tied to the latest PR head. Native reviews must have
`commit_id` equal to the current head SHA. When a trusted
`AI_REVIEW_REQUEST_ID` marker exists for an explicit rerun, the native review
must be submitted after that marker. When no marker exists, such as the
pull-request-triggered path used by fork PRs, a trusted current-head native
Codex review is sufficient.

When Codex has no inline findings, a trusted top-level legacy `Codex Review:`
comment or `<!-- codex-review-receipt:v1 -->` receipt can satisfy the gate after
a trusted current-head request. The positive verdict must be explicit and
unambiguous. Receipts must name the reviewed commit (at least ten hex characters,
matching the current full SHA); legacy summaries without a commit retain the
request/timeline binding. Explicit stale commits never fall back to timestamps.
Only the optional trailing native About Codex details panel is ignored.

The persistent `codex-pull-request-review-summary` comment is also supported.
Its single `codex-review-state:v1` JSON marker must have exactly `code_review`
and `security_review`, each with `commit_sha`, `has_any_findings`,
`has_unresolved_findings`, and `status`. Duplicate/unknown fields, wrong types,
escaped property aliases, malformed markers, and contradictory visible code
review rows cannot pass. Code review must be completed on the exact full current
SHA with both finding flags explicitly false. Security state alone never proves
code review success. The server `updated_at` timestamp binds edited summaries
to the current request. Legacy comments and receipts always use `created_at`;
editing an immutable verdict never refreshes it. A structured comment created
before that request can become valid
only through a later update. The latest applicable result wins, with failures
dominating ties. A commit or force-push between the request and evidence rejects
that comment.

Request freshness never filters out current-head blocking native findings or
structured verdicts with unresolved findings, even when their visible text is
malformed or includes blocking severity. Resolved findings alone cannot
grant a structured pass, but allow an otherwise acceptable formal P3 review. All unresolved review threads keep the gate red,
including threads from earlier commits. Native reviews require an exact
`commit_id`, including when no request marker exists. Explicit unresolved
current-head findings in either structured code or security review block all
positive evidence, even before a fresh request or while a review is running.

## Claude

Top-level comment must start with:

```text
AI_REVIEW_AGENT: claude
AI_REVIEW_SHA: <head-sha>
AI_REVIEW_OUTCOME: pass|advisory|block
```

Only the latest trusted Claude outcome for the current head counts. `pass`
satisfies the gate; `advisory` and `block` keep it red.

## Gemini

Native GitHub PR review from the configured app. Critical or high-severity
findings in either the review body or inline comments block merge.
