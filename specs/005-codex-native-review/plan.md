# Plan: Native Codex Review Compatibility

1. Reproduce the leading-receipt failure before changing implementation.
2. Centralize strict comment parsing and current-head evidence selection.
3. Keep blocking findings outside request freshness filtering; fetch unresolved
   review threads and check head again after collecting evidence.
4. Extend workflow and runtime wakeup routing for receipt/summary edits. Keep
   active gates polling; rerun only failed completed runs with new evidence.
5. Guard dispatched check publication against head races.
6. Run preflight, publish one PR, request native review as the owner, resolve
   findings, and verify safe bootstrap against the existing trusted gate.

## Decisions

Structured summaries can provide evidence only with the complete observed schema
and a full exact commit SHA. Their update timestamp matters because the native
bot edits a persistent comment. Native findings and unresolved threads dominate
all positive comment evidence. Privileged runs always use default-branch scripts.

For the resumed rollout, add a manual read-only mode to the existing workflow.
Only its active job is named AI Review. Owner and triggering-owner checks fail
inside the job, so unauthorized dispatch cannot create a skipped required gate.
The dispatch SHA must equal both the explicit full SHA and live same-repository
PR head. Use the reviewed parser with default-branch config and no stored Git
credentials, writes, publisher, or API-created checks. GitHub Actions reports the
actual gate exit status on its own commit. Normal automation remains unchanged.

The gate and requeue path share one async Codex blocking-evidence predicate.
Native review exposed divergence for late unresolved advisory threads; sharing
that predicate ensures both callers verify the same paginated thread state,
structured unresolved flags, and native severities.

Current blocking state invalidates successful runs regardless of review age.
Failed attempts retain timestamp deduplication to avoid endless recovery loops.
GitHub Actions does not support review-thread transition events and GraphQL has
no thread update timestamp; after all workflows complete, the required resolved
conversation rule remains the merge barrier for reopened threads.
