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
