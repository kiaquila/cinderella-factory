# Design System — <PROJECT NAME>

> The **per-project** source of truth for the `design-system`, `design-handoff`, and
> `design-review` skills and the `ui-ux-designer` / `frontend` roles. Code is
> canonical; this file *maps and declares* what's in code. Keep it in the repo, version
> it, review it in PRs. Update it whenever tokens or components change.
>
> **Location:** save as repo-root `design-system.md`. If this repo keeps durable docs
> elsewhere (e.g. `docs_project/`, `.specify/memory/`), put it there and record the path
> in `CLAUDE.md` so agents find the same file every time.

## System state
- **Maturity:** `none | partial | complete-and-consistent | complete-but-inconsistent`
- **Evidence / reasoning:** <why this classification — cite files>
- **Source of truth:** <code paths for tokens & components> · Figma/reference (input only): <link or none>
- **Last audited:** <date>

## Token map (where each lives in code)
| Token group | Location | Notes |
|---|---|---|
| Colors (bg, surface, text, text-secondary, border, accent, danger, success) | <file> | |
| Typography (heading, body, caption, button — family/size/weight/line-height) | <file> | flag any ultra-thin weights |
| Spacing scale | <file> | e.g. 4/8/12/16/24/32 |
| Radius scale | <file> | e.g. 8/12/16/full |
| Elevation (shadow/border) | <file> | |
| Icons (set + default size/stroke) | <file> | |
| State expression (hover/focus/active/disabled/error/loading) | <file> | |

## Component inventory
| Component | Exists? | States defined | Location | Notes |
|---|---|---|---|---|
| Button | | | | |
| Input | | | | |
| Select/Dropdown | | | | |
| Checkbox/Toggle | | | | |
| Modal/Dialog | | | | |
| Card | | | | |
| Badge/Tag | | | | |
| Tabs | | | | |
| Tooltip | | | | |
| Empty state | | | | |
| Error state | | | | |
| Navigation | | | | |

## Drift register (for `complete-but-inconsistent` — the reconciliation backlog)
| # | Inconsistency (with evidence) | Canonical decision | Fix level (screen/component/token) | Status |
|---|---|---|---|---|
| 1 | | | | |

## Conventions & guardrails
- No off-scale spacing, no stray hex — everything from tokens.
- Every component ships all states.
- Change at the right level (screen / component / token).
- New component/token needs a current reason.
- <project-specific rules>
