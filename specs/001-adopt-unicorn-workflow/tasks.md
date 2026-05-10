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
- [ ] T011 Record GitHub CI/CD outcome.

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

### Decisions

- Use Unicorn Hub `main` after PR #8 merged, so the adopted AI Review gate is
  head-bound and marker-aware.
- Keep branch protection as a post-merge operation because required workflows
  must exist on `main` first.
- Use `pediatrician` as the agent id and `Педиатр` as the corrected Russian
  display name.

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
