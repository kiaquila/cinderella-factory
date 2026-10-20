# Spec: Native Codex Review Compatibility

## Goal

Accept authentic current-head Codex receipts and completed structured summaries
without weakening native review, finding, identity, or default-branch trust rules.

## Scope

Update the evidence classifier, gate, created/edited event routing, rerun path,
and dispatched check publisher. Preserve legacy summaries and formal reviews.
Repository protection and reviewer identities stay unchanged.
Initial rollout may use an owner-label-triggered, read-only PR job in the existing AI
Review workflow. It must run the real gate on the reviewed PR head and use
default-branch policy; it cannot publish a synthetic check or write to GitHub.

## Acceptance Criteria

1. Legacy and receipt no-findings comments pass only for the trusted reviewer and
   current head, with unambiguous verdict, commit, and request binding.
2. Structured summaries require an exact schema, full current commit SHA,
   completed code review, and explicit false finding flags. Edited summaries use
   their server update time. Incomplete, malformed, contradictory, or negative
   results cannot provide success.
3. A new request never hides blocking native findings or unresolved review
   threads. Current-head formal reviews and advisory P3 behavior are preserved.
4. Both workflow filtering and runtime routing admit created/edited native
   signals. Late evidence requeues completed failures; active gates converge
   without repeated requests or rerun loops.
5. Head movement during evaluation or publication cannot publish success for a
   newer head. Only trusted default-branch code validates privileged evidence.
   Read-only bootstrap must fail for a non-owner, rerun by a non-owner, wrong
   workflow/ref/merge/head, fork, closed/draft PR, or changed base; its actual job
   result must be bound to the exact PR commit by GitHub Actions.
6. Regression tests and project preflight pass. A ready PR receives a human
   account native review request for its full head, actual review, green gates,
   resolved threads, and a verified 120-second stable window before normal merge.

## Negative Scenario

A stale receipt, forged author, duplicate or malformed marker, contradictory
verdict, pending summary, new push, or unresolved finding must not unlock merge.

## Verification Evidence

Recorded in tasks.md and linked PR checks/review.
