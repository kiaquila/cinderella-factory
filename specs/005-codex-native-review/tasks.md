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

Local regression suite: 26 tests passed, including production gate, publisher,
and requeue entrypoints with deterministic HTTP fixtures. Initial sandbox runs
hit ENOSPC; the same checks succeeded with approved host execution. No unrelated
files were deleted. Regression tests include a negative structured verdict that
predates a fresh marker so a new request cannot hide it.

Project preflight passed: repository baseline, committed/worktree feature memory,
script syntax, and all 26 tests. `git diff --check` passed.

PR #8: https://github.com/kiaquila/cinderella-factory/pull/8.
Owner-authored exact-head native request for 625144f98ecdf9c2babdaaf4ea689efbb71f6d01:
https://github.com/kiaquila/cinderella-factory/pull/8#issuecomment-6203427490.
The CI run caught a test harness assumption: GitHub sets GITHUB_OUTPUT, so the
resolver correctly writes a file instead of stdout. The harness now supplies
and reads its own output file, isolating the parent Actions environment.
