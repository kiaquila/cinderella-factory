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

PRs are merge-ready only when all checks are green, blocking findings are
resolved, docs/specs are updated, and no conflicts remain. Trusted
review comments such as `@codex review` are validated by `AI Command Policy`,
which records the current PR head marker and dispatches `AI Review` on the PR
head branch with the requested review agent. Comment-triggered dispatch is
supported for branches in this repository; fork PRs must use the
pull-request-triggered AI Review path or be moved to a maintainer branch.

Branch protection should be applied after this workflow is merged to `main`:

```bash
node scripts/apply-branch-protection.mjs
```

Before merge, the author should also confirm the SENAR done gate:

- every acceptance criterion has evidence in the PR, plan, or linked checks
- the negative scenario is covered or explicitly waived
- process memory records dead ends, decisions, and known issues
- any remaining known issue is accepted by the human merge owner
