---
name: design-system
description: >-
  Establish, extend, and keep consistent a product's design system — foundation
  tokens (color, type, spacing, radius, shadow, icons), the core component set
  with all states, and the "change at the right level" discipline. Adapts to the
  project's real starting point (no system / partial / complete-and-consistent /
  complete-but-inconsistent). Use whenever building or changing UI, adding a
  component, touching tokens, or auditing visual consistency. Shared by the
  ui-ux-designer and frontend roles. Triggers: design system, design tokens,
  component library, visual consistency, foundation, spacing/color/radius scale,
  "make the UI consistent".
user-invocable: true
---

# Design System

```yaml
id: design-system
status: active
runtime: claude-code-skill
allowed_agents:
  - ui-ux-designer
  - frontend
inputs:
  - target project repository (code + design-system.md if present)
outputs:
  - system state classification with evidence
  - foundation/component/token plan at the right level
sensitive: false
```

The reusable method for growing a **consistent** product UI. Both the `ui-ux-designer`
and `frontend` roles read this skill; it is the shared source of truth for
*how the system is built and changed*. It does **not** own aesthetics for a specific
product — that lives in each project's `design-system.md` (see the template in
`templates/project-design-system.md`).

> Core principle (Vanya's rule): every screen decision is really the question
> **"which piece of the system am I creating or reusing right now?"** — never
> "how do I draw this one screen." The system grows *out of* the product, not beside it.

---

## Step 0 — Reconnaissance FIRST (never skip)

Do not assume the project has no design system, and do not assume it has a good one.
Before proposing anything, **classify the current state** by reading the code and the
project's `design-system.md` if present. Look for tokens (CSS vars / `tailwind.config` /
theme files), a components directory, and repeated ad‑hoc class strings.

Classify into exactly one state, then branch:

| State | What you find | Your job |
|---|---|---|
| **none** | No tokens, no shared components, styling inline/scattered | Bootstrap the **minimal** foundation (below) + 5–10 core components. Do not build a big system. |
| **partial** | Some tokens or a few components, gaps elsewhere | Fill gaps only. Reuse what exists; do not re-invent what's already there. |
| **complete-and-consistent** | Coherent tokens + component set, reused consistently | **Strict reuse.** New work composes existing pieces. Additions go through the "right level" rule below. |
| **complete-but-inconsistent** | Tokens/components exist but drift is visible (e.g. square button one place, rounded another; one-off colors; gray-on-gray) | **Audit + reconcile.** Produce a drift register, pick the canonical value per token/component, and a normalization plan routed to the correct level. Do not silently pick a side per screen. |

Write the state and the evidence into the project's **`design-system.md`** (see location
rule below). If that file does not exist yet, create it from
`templates/project-design-system.md` as the first act.

**Canonical location of `design-system.md`** (so every agent finds the same file):
default is **repo root `design-system.md`**. If the project already keeps durable docs
elsewhere, put it there instead and record the path in `CLAUDE.md`/`AGENTS.md`. On entry,
search in this order and use the first hit; do **not** re-bootstrap if one exists:
`./design-system.md` → `docs_project/**/design-system.md` → `docs/design-system.md` →
`.specify/memory/design-system.md` → `.claude/design-system.md`.

### Reconciling a `complete-but-inconsistent` system (safe-apply discipline)

Normalizing a drifted token is the **largest-blast-radius edit in the kit** — it changes
every screen that relied on the old value, sometimes deliberately. Do not just "pick the
canonical value" and mass-replace. Sequence it:

1. **Order the drift register by blast radius** — token-level fixes last, screen-level first.
2. For each token normalization: change the token → **verify affected screens live** with
   the `design-review` skill (desktop + mobile, real data) → only then remove the local
   overrides that were compensating for the drift.
3. **Migrate screen-level overrides last**, once the canonical token is confirmed.
4. Note a **rollback** for each token change (old value + where it was used) so a
   regression is one revert, not an archaeology dig.
5. Ratify each canonical choice with the `ui-ux-designer` (owner of the visual system) before
   applying — see the token boundary below.

**Source of truth is the code, not Figma.** Tokens and components in the repo are
canonical. A Figma/reference link is an input, never the arbiter (Vanya works this way:
code is the source, design tooling only exports from it).

---

## The minimal foundation (only what the product needs now)

When bootstrapping (state *none*) or filling gaps (*partial*), define just these — as
tokens (CSS variables / Tailwind theme), never as scattered literals:

- **Color:** `background`, `surface`, `text`, `text-secondary`, `border`, `accent`, `danger`, `success` (add `warning` only if used).
- **Typography:** `heading`, `body`, `caption`, `button` — family, size, weight, line-height. Guard against ultra‑thin weights in working UI (fine for marketing, unreadable in dense product screens).
- **Spacing scale:** e.g. `4 / 8 / 12 / 16 / 24 / 32`. No arbitrary pixel values off the scale.
- **Radius scale:** e.g. `8 / 12 / 16 / full`. Pick one per component type and keep it.
- **Elevation:** a small, named shadow/border set.
- **Icons:** one icon set, one default size/stroke.
- **State tokens:** how `hover / focus / active / disabled / error / loading` are expressed (opacity, ring, tint) so every component states are derived, not hand-tuned.

This is "rules of the game," not a 200‑page system. It should fit on one screen.

---

## The core component set

Do the most frequent elements once, properly, before anything bespoke:

`Button · Input · Select/Dropdown · Checkbox/Toggle · Modal/Dialog · Card · Badge/Tag · Tabs · Tooltip · Empty state · Error state · Navigation`

**Every component must define ALL STATES**, not just the pretty default. This is the
**canonical state list** — every other file in the kit references it rather than
re-listing a subset. It spans three distinct axes; don't conflate them:

- **Interaction states:** `hover · focus · active/pressed · disabled`
- **Content states:** `default · loading · empty · error`
- **Viewport:** `mobile` (and desktop)

A component without its states is not done — missing states are the #1 source of
"looks designed in Figma, feels broken live." When any file says "all states," it means
exactly this list.

Building a new screen = **compose from this set**. If a needed piece is missing,
propose a new component or a *variant of an existing one* — do not draw a fresh one-off.
After it ships, add it back to the set so it's reusable next time.

---

## The "change at the right level" rule

Before **every** visual edit, ask which level it belongs to and act only there:

1. **Screen level** — "smaller padding *only here*." Local override, touch one screen.
2. **Component level** — "*all* cards of this type are too big." Change the component; every instance updates.
3. **Token level** — "spacing feels bloated *across the whole product*." Change the token/scale.

Fixing a component problem at the screen level (or vice‑versa) is how a system drifts:
you patch one place and the rest silently become the odd ones out. State the level
explicitly in your change description.

**Token-change ownership (the boundary that prevents silent drift).** Tokens *are* the
visual system, which the `ui-ux-designer` owns. So **token-level** changes work like this:
`frontend` may **propose** a token or component change and surface it (with the
reason and blast radius) — but the edit is **ratified by `ui-ux-designer`** before it lands.
Frontend never silently renormalizes tokens to make code cleaner; that would rewrite the
visual system its owner is accountable for. Screen- and component-level fixes don't need
ratification unless they change shared components.

---

## Growth discipline

- Start with foundation → 5–10 core components → each new screen **reuses or improves** the system.
- Do **not** attempt a perfect design system up front. It grows from real screens.
- Budget a recurring pass to **delete duplicates** (two buttons that should be one, colors that should be a token). The `ui-ux-designer` owns the outcome of this pass (it changes the visual system); `frontend` executes the code changes. Token merges are ratified, per the boundary above.
- New abstraction/component needs a *current* reason — one-off logic stays one-off (matches the repo's simplicity rule).

---

## How the two roles collaborate (the shared loop)

The `ui-ux-designer` and `frontend` are **not** adversaries deciding "who's right";
they jointly maintain one system. The loop, for any screen or component:

```
design (from system)  →  build from existing components  →  handoff spec  →
implement (a11y + responsive + tech constraints)  →  live review on real screen  →  polish
```

- **ui-ux-designer owns:** user scenario, visual system, component anatomy & states, consistency, and reviewing the *live* screen (not just a mock).
- **frontend owns:** implementation, reusable component code, responsiveness, accessibility, performance, and surfacing technical constraints back to design.
- The **handoff** between them is a contract, not a picture — see the `design-handoff` skill.
- Both use **this** skill for the system, and `design-review` to critique the result.

When a project already has a design system, the loop still runs — you spend Step 0 on
reconciliation instead of bootstrapping, and you lean harder on the "right level" rule.
