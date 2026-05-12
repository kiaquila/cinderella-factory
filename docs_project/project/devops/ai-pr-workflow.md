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
access so gate workflows can publish checks and dispatch trusted validation.
If GitHub refuses Actions-authored marker comments with `403 Resource not
accessible by integration`, `AI Review` accepts a trusted human `@codex review`
comment on the current head as the request marker, but only when that request
is strictly newer than every server-assigned lower bound: the
`pull_request.updated_at` timestamp from the Actions webhook payload and any
`head_ref_force_pushed` timeline event. The gate does not consult the Pulls
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

Branch protection should be applied after this workflow is merged to `main`:

```bash
node scripts/apply-branch-protection.mjs
```

Before merge, the author should also confirm the SENAR done gate:

- every acceptance criterion has evidence in the PR, plan, or linked checks
- the negative scenario is covered or explicitly waived
- process memory records dead ends, decisions, and known issues
- any remaining known issue is accepted by the human merge owner
