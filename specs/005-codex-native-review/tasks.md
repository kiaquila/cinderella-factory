# Tasks: Native Codex Review Compatibility

- [x] Verify owner identity, fetch refs, inspect active rules, and create isolated worktree.
- [x] Read process memory and reproduce rejection of the observed receipt prefix.
- [x] Implement strict evidence handling and finding preservation.
- [x] Update created/edited workflow and runtime routing, requeue, and publication.
- [x] Add meaningful regression coverage and run project preflight.
- [x] Publish ready PR and request native review from owner for exact head.
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
rollout must be verified with genuine native evidence accepted by that gate; no
protection change, forged status, or unreviewed privileged PR code is permitted.

Local regression suite: 33 tests passed, including production gate, publisher,
and requeue entrypoints with deterministic HTTP fixtures. Initial sandbox runs
hit ENOSPC; the same checks succeeded with approved host execution. No unrelated
files were deleted. Regression tests include a negative structured verdict that
predates a fresh marker so a new request cannot hide it.

Project preflight passed: repository baseline, committed/worktree feature memory,
script syntax, and all 33 tests. `git diff --check` passed.

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
