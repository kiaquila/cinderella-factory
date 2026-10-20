# Tasks: Native Codex Review Compatibility

- [x] Verify owner identity, fetch refs, inspect active rules, and create isolated worktree.
- [x] Read process memory and reproduce rejection of the observed receipt prefix.
- [x] Implement strict evidence handling and finding preservation.
- [x] Update created/edited workflow and runtime routing, requeue, and publication.
- [x] Add meaningful regression coverage and run project preflight.
- [x] Publish ready PR and request native review from owner for exact head.
- [x] Reject candidate-code bootstrap; retain default-branch validation for rollout.
- [ ] Resolve findings and verify required checks, threads, and conflicts.
- [ ] Observe 120 stable seconds, merge normally, and verify GitHub merge SHA.

## Evidence

Initial origin/main: 417daf887927eb88accaded88dcb3196361e6e97.
GitHub identity: kiaquila. Active ruleset 17692893 requires baseline-checks,
guard, AI Review, current base, and resolved threads; there are no bypass actors.

## Dead Ends

Context7 documentation lookup returned monthly quota exceeded. Current GitHub
behavior is verified through API responses and official documentation instead.

## Known Issues

The existing default-branch gate rejects receipt-prefixed comments. Safe initial
rollout must use genuine native evidence and an actual gate execution; no
protection change, forged status, or unreviewed privileged PR code is permitted.

Resumed on 2026-10-20: origin/main is unchanged at 417daf887927eb88accaded88dcb3196361e6e97.
The exact-head native review of ed53a38cdce2b4584387a19eb52379e9e714d681
completed without findings, but the trusted dispatched run timed out as expected.
The owner requested a safe rollout through normal merge. Both candidate-code
bootstrap routes below were abandoned. Rollout still requires authentic evidence
accepted by the default-branch gate, fresh native review, all required checks,
and 120 stable seconds.

Local regression suite: 35 tests passed, including production gate, publisher,
and requeue entrypoints with deterministic HTTP fixtures. Initial sandbox runs
hit ENOSPC; the same checks succeeded with approved host execution. No unrelated
files were deleted. Regression tests include a negative structured verdict that
predates a fresh marker so a new request cannot hide it.

Project preflight passed: repository baseline, committed/worktree feature memory,
script syntax, and all 35 tests. `git diff --check` passed.

PR #8: https://github.com/kiaquila/cinderella-factory/pull/8.
Owner-authored exact-head native request for 625144f98ecdf9c2babdaaf4ea689efbb71f6d01:
https://github.com/kiaquila/cinderella-factory/pull/8#issuecomment-6203427490.
The CI run caught a test harness assumption: GitHub sets GITHUB_OUTPUT, so the
resolver correctly writes a file instead of stdout. The harness now supplies
and reads its own output file, isolating the parent Actions environment.

Boundary review preserved formal advisory P3 acceptance after thread resolution:
structured resolved findings provide no positive evidence themselves, but do not
invent a blocking severity. New evidence after a successful run is reevaluated;
evidence already consumed by that success does not cause redundant reruns.

Native review 5540653867 on 98f29e00726e5b7b27b05f4bf291c377326acf63
reported P1 (visible severity hid an older structured unresolved flag) and P2
(edits refreshed legacy comments). Both were reproduced as failing production
entrypoint regressions before fixing them. Unresolved structured state now wins
before visible-text checks, and only persistent structured summaries use update
time. Legacy/receipt evidence retains immutable creation time. The closed schema
also rejects completed secondary review state with missing commit or verdict.

Native review 5540708384 on 0a578e28702b9bf1eb1419bceccaf1528053a06c
reported P1 for blocking evidence arriving between the final poll and successful
workflow completion. Regression tests reproduced selector and production-router
failures. Successful completions now inspect current blocking native/structured
evidence against attempt start time, while consumed positives remain deduplicated.
A later attempt started strictly after the evidence is never replayed again,
including when the initial timestamps have only second precision.

Native review 5540764230 on 9bf05457ba3ca64ccd5f4c769e775a5e19782632
reported P1 for late unresolved P3 threads omitted from success recovery. The
production-router regression failed before the fix. Gate and recovery now share
the entire Codex blocking predicate, including paginated GraphQL thread checks.
Regression coverage also verifies resolved P3 does not replay an already consumed
success and unavailable thread state fails closed.

Native review on bef154689a8375d75dc1f964edb447ff6ec9552a reported P2 for
reopened old threads being hidden by review-submission timestamp deduplication.
The production-router regression failed before the fix. Current blocking state
now always invalidates success; failed attempts still deduplicate consumed
evidence. GitHub schema introspection confirms PullRequestReviewThread has no
updatedAt and no resolved/unresolved timeline event types. Official Actions
trigger documentation has no pull_request_review_thread event. Post-completion
reopening is therefore guarded by the existing required resolved-thread rule,
with reevaluation on the next supported workflow/review/comment event.

Rollout dead end: the natively reviewed read-only workflow_dispatch job passed
on 2c753f4d54156d3783fd6b0ab32c3246ea5448e2 (run 39424194419); its log
confirms only read permissions and the genuine gate pass. GitHub excludes such
manual job checks from PR ruleset evaluation, so that result did not unlock the
PR. Official required-check troubleshooting confirms the restriction.

The subsequent label-triggered candidate gate received native P1 findings on
7a1f2f3f62da59d24d157f285b70feb464adb7c4: candidate code controlled identity,
severity, thread and owner validation; its merge/base context was checked only
before polling. This route was never activated. Remove both bootstrap routes,
their helper and tests, and restore the unchanged trusted workflow. This removes
both unsafe execution and the incomplete context guard. A read-only token alone
does not make candidate code a trusted decision maker for required checks.

Next rollout attempt: obtain a genuine clean native verdict on the final head,
then ask the native bot to re-publish that existing verdict in the legacy format
the trusted gate understands. No owner-authored substitute, invented finding,
API-forged check, policy change, or code execution from the PR is acceptable.
If the native backend cannot re-publish authentic evidence, the rollout remains
blocked rather than weakening protection.

Native review 5585324160 on 0c1274b97e267db6a5e970b4811648a8c4ffc1b6
found P1: a clean code-review section hid current-head unresolved security-review
state. The regression reproduced pass instead of fail before the fix. Both
structured review sections now contribute unresolved blockers before selecting
the code verdict, including while either review is running or code review names
an older commit. Production gate and recovery tests verify that a later receipt,
fresh request or formal approval cannot hide those findings; stale security
state alone does not block a clean current-head code verdict.
