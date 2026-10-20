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
parser compatibility PR cannot satisfy that older parser, the owner can use the
existing AI Review workflow's explicit `read_only_bootstrap` dispatch mode after
native review of the full current head, including the workflow. This job has only
contents, pull-request and issue read permissions, stores no Git credentials, and
runs the real proposed gate against policy checked out from the default branch.
It does not invoke the check publisher or post comments. GitHub Actions reports
the actual job result against the workflow commit; no check is created via API.

The bootstrap fails unless both dispatch and rerun actors are the repository
owner, its explicit full SHA equals the workflow SHA and live open non-draft
same-repository PR head, and its ref/base match that PR/default branch. Checks
fail inside the active required job rather than skipping it. Exactly one active
job is named AI Review; the inactive alternative has a different name. Normal
automation keeps using trusted default-branch scripts and its existing permissions.

After obtaining genuine clean native review, dispatch the reviewed branch with
its full head SHA (a moved branch fails validation):

```bash
gh workflow run ai-review.yml --ref <reviewed-branch> \
  -f pr_number=<pr-number> -f head_sha=<full-reviewed-head-sha> \
  -f read_only_bootstrap=true
```

Verify that the real run is green on that exact SHA, all required checks and
threads are satisfied, then observe 120 stable seconds and recheck before normal
merge. Keep protection and reviewer identities unchanged. Read-only permissions
and manual dispatch are documented in [GitHub workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax).

Branch protection should be applied after this workflow is merged to `main`:

```bash
node scripts/apply-branch-protection.mjs
```

Before merge, the author should also confirm the SENAR done gate:

- every acceptance criterion has evidence in the PR, plan, or linked checks
- the negative scenario is covered or explicitly waived
- process memory records dead ends, decisions, and known issues
- any remaining known issue is accepted by the human merge owner
