# AI PR Workflow

The active required-check list is `.unicorn-hub/config.json`
(`requiredChecks`):

- `baseline-checks`
- `guard`
- `AI Review`

Repository variables:

```text
AI_IMPLEMENTATION_AGENT=claude
AI_REVIEW_AGENT=codex
```

Repository Actions workflow permissions must allow read/write `GITHUB_TOKEN`
access so gate workflows can publish checks, dispatch trusted validation, and
write PR marker comments. `AI Command Policy` and `AI Review` request both
`issues: write` and `pull-requests: write` because GitHub can require either
permission family for comments on pull requests.

If GitHub still refuses Actions-authored marker comments with `403 Resource
not accessible by integration`, `AI Review` accepts a trusted human
`@codex review` comment on the current head as the request marker, but only
when that request is strictly newer than every server-assigned lower bound:
the `pull_request.updated_at` timestamp from the Actions webhook payload and
any `head_ref_force_pushed` timeline event. The gate does not consult the Pulls
API `updated_at` field because GitHub bumps it on comment activity, which
taints the comparison. Marker-comment creation is best-effort; the trusted
dispatch path still runs.

PRs are merge-ready only when all checks are green, blocking findings are
resolved, docs/specs are updated, and no conflicts remain. Trusted
review comments such as `@codex review` are validated by `AI Command Policy`,
which records the current PR head marker and dispatches the trusted default
branch `AI Review` workflow with the PR number, head SHA, and requested review
agent. Comment-triggered dispatch is supported for branches in this repository;
fork PRs must use the pull-request-triggered AI Review path or be moved to a
maintainer branch. Dispatched runs publish a PR-head `AI Review` check so branch
protection is satisfied without running PR-controlled workflow definitions.
Current-head native Codex reviews can satisfy the gate without a request marker;
summary-only evidence still requires a trusted marker.
For native review backends, `CHANGES_REQUESTED` and configured blocking
severities in either review summaries or inline comments keep the gate red.
When trusted bot review evidence arrives after a pull-request-triggered
`AI Review` run already failed or timed out, `AI Review Rerun` reruns the
current-head pull request run instead of requiring another human command.
Receipt and structured-summary comments wake the gate on both creation and edit.
Runtime routing verifies the selected trusted identity; a wakeup is never itself
positive review evidence. New evidence after a completed success also causes
reevaluation, so a previous pass cannot hide later findings. Active gates continue polling. Completion also checks for evidence arriving after the final poll. A successful
run is replayed whenever current blocking evidence exists, including an old
thread reopened without changing its review timestamp. Consumed positive evidence
does not cause that replay. Requeue is serialized per PR; a failed attempt started
strictly after the same evidence is not replayed. The router refreshes and rechecks the actual PR head
before rerunning. Dispatched check publication rechecks that same head; a moved
head cannot receive success from an old run.

GitHub Actions has no supported review-thread resolution/reopening trigger, and
the GraphQL review-thread object exposes no transition timestamp. A reopening
after every workflow has completed therefore relies on the separately required
resolved-conversation branch rule to block merge until the thread is resolved.
The next supported review/comment or workflow-completion event reevaluates
current thread state. Do not configure an unsupported workflow event or infer
thread transition time from an old review's submission timestamp.

Privileged gate/rerun scripts remain checked out from the default branch. When a
parser compatibility PR cannot satisfy that older parser, the owner can add the
`ai-review-parser-bootstrap` label after native review of the full current head,
including the workflow. The label event runs a read-only job in the existing
AI Review workflow. It has only contents, pull-request and issue read permissions,
stores no Git credentials, and runs the real proposed gate against policy
checked out from the default branch. It does not invoke the check publisher or
post comments. GitHub Actions reports the actual PR job result.

The bootstrap fails unless both label and rerun actors are the repository owner,
the label event's full head SHA equals the live open non-draft same-repository PR
head, and the workflow ref/merge SHA/base match the live PR context. Checks fail
inside the active required job rather than skipping it. Exactly one active job
is named AI Review; the inactive alternative has a different name. Normal
automation keeps using default-branch scripts and its existing permissions.

After obtaining genuine clean native review, verify the live full head, then add
the label (remove and re-add it if a fresh label event is needed):

```bash
gh pr edit <pr-number> --add-label ai-review-parser-bootstrap
```

Verify that the real PR run is green on that exact head, all required checks and
threads are satisfied, then observe 120 stable seconds and recheck before normal
merge. Keep protection and reviewer identities unchanged. Do not use a manual
workflow job as a substitute: GitHub excludes workflow_dispatch job checks from
PR required-check evaluation, even when their head SHA matches. See [GitHub's
required-check troubleshooting](https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/troubleshooting-required-status-checks).

Branch protection should be applied after this workflow is merged to `main`:

```bash
node scripts/apply-branch-protection.mjs
```

Before merge, the author should also confirm the SENAR done gate:

- every acceptance criterion has evidence in the PR, plan, or linked checks
- the negative scenario is covered or explicitly waived
- process memory records dead ends, decisions, and known issues
- any remaining known issue is accepted by the human merge owner
