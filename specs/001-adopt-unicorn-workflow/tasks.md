# Tasks: Adopt Unicorn Hub Workflow

## Setup

- [x] T001 Confirm active feature folder and branch.
- [x] T002 Refresh GitHub state for `cinderella-factory` and `unicorn-hub`.

## Implementation

- [x] T003 Bootstrap Unicorn Hub workflow files into the repository.
- [x] T004 Adapt `.unicorn-hub/config.json` product paths for an agent factory.
- [x] T005 Seed durable project docs from the V1 plan.
- [x] T006 Add package scripts and CI syntax checks.
- [x] T007 Rename planned future agents to `salesman` and `pediatrician` in docs.

## Verification

- [x] T008 Run `pnpm install`.
- [x] T009 Run `pnpm run preflight`.
- [x] T010 Open PR and trigger Codex review.
- [x] T011 Record GitHub CI/CD outcome.

## Follow-Up: Marker Permissions And Pipeline Sync

- [x] T012 Grant `pull-requests: write` to trusted AI review workflows so
  Actions-authored PR marker comments can use the PR comment permission family,
  not only `issues: write`.
- [x] T013 Import missing event-driven Unicorn Hub AI Review rerun pipeline
  pieces without reverting Cinderella Factory's head-bound gate hardening.
- [x] T014 Add local verification for the imported rerun helpers and syntax
  checks.
- [ ] T015 Open follow-up PR and trigger Codex review.

### GitHub CI/CD Outcome

- PR #1 (`[codex] Adopt Unicorn Hub workflow`) merged into `main` on
  2026-05-10 at merge commit `f67d7b1b9f3184cbbbbd3259d21a5811a7c3ce52`.
- Required PR checks completed successfully on the merged head:
  `baseline-checks`, `guard`, and `AI Review`.
- The companion `osv-scan` check also completed successfully.
- Post-merge `main` checks completed successfully for `CI` and `OSV Scan`.
- Branch protection was applied to `main` with required contexts
  `baseline-checks`, `guard`, and `AI Review`.
- Repository Actions workflow permissions were set to read/write so
  gate workflows can publish checks and dispatch comment-triggered review
  validation.
- `AI Review` now accepts a trusted human `@codex review` comment on the
  current head as the request marker when Actions-authored marker comments are
  blocked by GitHub, and binds that fallback to the PR head update timestamp
  from the Actions webhook payload plus any later force-push event in the PR
  timeline.

## Process Memory

### Dead Ends

- The first PR `AI Review` run failed because default-branch trusted scripts do
  not exist until this bootstrap PR merges. Added a first-install fallback that
  mirrors `PR Guard`: use trusted default-branch scripts when present, otherwise
  use PR scripts only for bootstrap.
- The first workflow-dispatch `AI Review` run could not post marker comments
  with `GITHUB_TOKEN`. Added a bootstrap-only trusted-human-trigger path so the
  first PR can still validate a current-head `@codex review` comment.
- The first successful Codex native review used login
  `chatgpt-codex-connector`, while the upstream default trusted login expected
  `chatgpt-codex-connector[bot]`. Added the actual login to the repository
  config.
- Codex found two P1 issues in the review gate: `issue_comment` review
  requests did not start a new `AI Review` run, and trusted scripts read
  PR-controlled review config. Added the `issue_comment` trigger and made the
  trusted gate read config from `.gate-trusted`.
- Codex then found the same trust-boundary issue in `PR Guard`: trusted scripts
  evaluated PR diffs but loaded PR-controlled `productPaths`. Added
  `UNICORN_HUB_CONFIG_ROOT` support and pointed trusted guard steps at
  `.gate-trusted`.
- Codex found an `issue_comment` condition bug in `AI Review`: the trailing
  `github.event.pull_request.draft == false` could run on ordinary comments.
  Restricted that branch of the condition to `pull_request` events.
- Codex found that `issue_comment` AI Review runs are attached to default branch,
  not PR head. Removed `issue_comment` from `AI Review` and made
  `AI Command Policy` dispatch `AI Review` on the PR head after recording the
  trusted marker.
- Codex found that dispatched review runs did not preserve requested backend
  (`/gemini`, `@claude`, `@codex`). Added a `review_agent` workflow input and
  pass the selected backend from `AI Command Policy`.
- Codex found that comment-triggered dispatch could record a marker for fork PRs
  and then fail because the fork branch is not a base-repository ref. Added an
  explicit fork rejection before marker creation.
- Codex found that fork PRs could not pass through the pull-request-triggered
  Codex path because native reviews were only considered after a request marker.
  Native current-head Codex reviews now count without a marker; summary evidence
  still needs a trusted marker.
- Codex found that Gemini `CHANGES_REQUESTED` reviews could be treated as
  acceptable when the body omitted `critical`/`high`. Native review evaluation
  now fails on `CHANGES_REQUESTED` and blocking severities before passing.
- Codex found that comment-triggered dispatch used the PR branch as the
  workflow ref, letting PR-controlled workflow definitions run with workflow
  permissions. Dispatch now targets the trusted default branch and passes the PR
  head SHA as input; dispatched runs publish a PR-head `AI Review` check.
- Codex found that Gemini `COMMENTED` reviews with critical/high inline
  comments could pass when the top-level review body was clean. Native review
  evaluation now inspects trusted inline comments for blocking severities.
- Codex found that the review contract still required markers for all native
  Codex reviews even though markerless current-head reviews are accepted for
  pull-request-triggered paths. Updated the contract wording.
- Codex found that any older Claude `pass` could override a later
  `advisory`/`block` on the same head. The gate now evaluates the latest trusted
  Claude outcome for the head SHA.
- After branch protection was enabled, comment-triggered `AI Command Policy`
  and manual `AI Review` dispatch runs failed with `403 Resource not accessible
  by integration` when trying to create Actions-authored marker comments, even
  after repository workflow permissions were set to read/write. Enabled the
  trusted-human-trigger fallback for `AI Review` so current-head Codex summary
  comments can satisfy the gate after a trusted `@codex review` request.
- Codex found a P1 in the first human-trigger fallback: using only the commit
  committer date could reuse an older review request if a commit with an older
  committer timestamp was pushed after a Codex summary. The fallback now also
  requires the trusted human request to be newer than the latest PR head update
  event in the GitHub timeline.
- Codex found that GitHub `committed` timeline items are still commit-dated,
  not push-dated. The fallback now uses `github.event.pull_request.updated_at`
  from the Actions event and force-push timeline event timestamps rather than
  commit author or committer dates.
- Codex found that `workflow_dispatch` runs do not have a pull-request event
  payload, so the fallback would not have a real lower-bound timestamp. Added a
  `head_updated_at` workflow input, resolve-step output, and command-policy
  dispatch input.
- Codex found that `AI Command Policy` still aborted before dispatch when
  Actions-authored marker comments were blocked. Marker-comment creation is now
  best-effort; trusted dispatch still runs with `head_updated_at`.
- Codex found that `ai-command-policy.mjs` plumbed `pull.updated_at` from the
  Pulls API into the dispatch input, but that timestamp is fetched after the
  triggering `@codex review` comment, so it includes comment activity. Combined
  with strict `>`, the only valid fallback marker was always rejected and the
  AI Review gate could not pass through the comment-dispatch flow. Removed the
  tainted source and the dispatch input; the gate now derives the lower bound
  only from the trusted webhook `pull_request.updated_at` and force-push
  timeline events.
- GitHub kept returning `403 Resource not accessible by integration` for PR
  marker comments even when `GITHUB_TOKEN` had `issues: write`. The follow-up
  root-cause attempt grants `pull-requests: write` to the trusted comment and
  gate workflows so comments on pull requests can use the PR permission family.
- Unicorn Hub added an event-driven `AI Review Rerun` workflow after the
  bootstrap import. Imported the rerun workflow, helper, and focused tests
  without replacing Cinderella Factory's default-branch dispatch flow or the
  current-head review gate hardening added during PR #2.
- The first PR run of `AI Review Rerun` failed because the workflow checked out
  trusted default-branch scripts before the new rerun script existed on `main`.
  Mirrored the existing bootstrap pattern: prefer trusted default-branch rerun
  scripts, otherwise use the PR-local script only for first-install bootstrap.
- Codex found three P2 issues in the imported rerun path: workflow-level bot
  filters could bypass configured trusted-login overrides; issue-comment
  bootstrap could still try to run a missing default-branch script; and rerun
  selection could rerun an older failed check after a newer success. The rerun
  workflow now lets the trusted script enforce review-login policy, only uses
  PR-local fallback when a pull-request-review event exposes the PR head, and
  treats the latest successful current-head AI Review run as terminal.

### Decisions

- Use Unicorn Hub `main` after PR #8 merged, so the adopted AI Review gate is
  head-bound and marker-aware.
- Keep branch protection as a post-merge operation because required workflows
  must exist on `main` first.
- Use `pediatrician` as the agent id and `Педиатр` as the corrected Russian
  display name.
- Keep repository Actions workflow permissions at read/write because
  comment-triggered AI review validation needs `GITHUB_TOKEN` to publish checks
  and dispatch trusted workflows.
- Accept trusted human `@codex review` comments as Codex request markers when
  GitHub blocks Actions-authored marker comments, but bind them to the latest
  PR head update timestamp from the Actions webhook payload so stale summaries
  cannot satisfy a newer push.
- Treat Actions-authored marker comments as optional when GitHub rejects them;
  the trusted dispatch path is the durable signal in that environment.
- Use strict greater-than (not greater-or-equal) when comparing trusted human
  trigger timestamps against the PR head update lower bound to prevent
  same-second reuse of a pre-existing review request.
- Source the trusted-human-trigger lower bound only from server-assigned,
  comment-untainted signals: `github.event.pull_request.updated_at` from the
  webhook payload and `head_ref_force_pushed` timeline events. Reject the
  Pulls API `pull.updated_at` because GitHub bumps it on comment activity.
- Keep the bootstrap human-trigger fallback until a real follow-up PR proves
  that Actions-authored marker comments can be posted again with the narrowed
  workflow permission change.
- Use `AI Review Rerun` only to rerun failed, cancelled, timed-out, or
  action-required pull-request-triggered `AI Review` runs after trusted bot
  evidence appears. Comment-triggered trusted dispatch continues to publish its
  PR-head check through the existing workflow-dispatch path.
- Trusted `AI Review Rerun` scripts must read trusted default-branch config via
  `AI_REVIEW_CONFIG_ROOT`; PR-local config is allowed only in the bootstrap
  fallback before the script exists on `main`.
- Keep `AI Review Rerun` workflow filters broad and cheap; trust decisions
  belong in `scripts/ai-review-rerun.mjs` with the configured reviewer
  allowlists.

### Known Issues

- First bootstrap PR uses PR-local fallback scripts in PR Guard until the
  trusted gate scripts exist on `main`.
- First bootstrap PR also uses PR-local fallback scripts in AI Review until the
  trusted gate scripts exist on `main`.
- The bootstrap-only human trigger path must not be needed after this PR is
  merged because `AI Command Policy` will exist on `main` and can record
  marker-bound review requests normally.
- The Codex trusted login override should stay in `.unicorn-hub/config.json`
  unless GitHub starts reporting the app as `chatgpt-codex-connector[bot]`.
- Trusted default-branch gate scripts must use default-branch config for
  reviewer allowlists; bootstrap fallback is the only path allowed to use PR
  scripts and PR config.
- Trusted PR Guard scripts must also use default-branch config while evaluating
  PR workspace contents.
- `issue_comment` should only start AI Review for explicit review trigger
  commands on PRs; ordinary comments must not create required check noise.
- Comment-triggered review validation must create a PR-head check, so dispatch
  belongs in `AI Command Policy` rather than as a direct `issue_comment`
  trigger on `AI Review`.
- Review backend selection must travel with the trusted dispatch; do not infer
  every comment-triggered run from the repository default variable.
- Comment-triggered dispatch only supports branches in the base repository;
  fork PRs need pull-request-triggered review or a maintainer branch.
- Native Codex reviews are strong current-head evidence on their own. Request
  markers remain required for summary/comment evidence and for explicit reruns.
- Native review backends must respect GitHub review state; `CHANGES_REQUESTED`
  is always blocking even if text severity keywords are absent.
- Workflow dispatch must run trusted default-branch workflow definitions. PR
  identity travels through explicit inputs and a PR-head check run, not through
  the workflow ref.
- Native review state and inline comments are both part of the blocking signal;
  summary-only checks are not enough for Gemini-style reviews.
- The review contract must distinguish explicit rerun marker requirements from
  markerless pull-request-triggered native reviews.
- For comment-based review backends, later trusted outcomes supersede earlier
  ones for the same head SHA.
- The bootstrap human-trigger fallback only has a trusted lower bound when the
  AI Review run is `pull_request`-triggered (the webhook payload supplies
  `pull_request.updated_at`) or when a `head_ref_force_pushed` event exists on
  the PR head. The `workflow_dispatch + Actions marker 403 + conventional
  push` edge case has no server-assigned, comment-untainted timestamp source
  available via the GitHub REST or GraphQL surfaces, so the gate cannot
  synthesise a fallback marker in that narrow path. In that case the dispatch
  still runs and Codex native review evidence on the current head is the only
  source the gate accepts. Follow-up verification should confirm whether
  `pull-requests: write` resolves the marker-comment 403; if not, use a GitHub
  App token with PR comment scope so the bootstrap fallback shim is not
  exercised.
