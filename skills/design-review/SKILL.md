---
name: design-review
description: Critique a UI as a design reviewer (not a generator) — catch AI-generated blandness, weak visual hierarchy, low contrast/readability, missing interaction states, unclear first-run, and over-nested cards; then verify on the live screen (desktop + mobile, real data, hover/focus, empty/error). Use to review a screen or the whole app's UI/UX, before shipping, or when something "looks off / looks AI-generated". Triggers: design review, UI review, UX review, critique this UI, looks AI-generated, visual QA, review the screen, is this good design.
user-invocable: true
---

# Design Review

```yaml
id: design-review
status: active
runtime: claude-code-skill
allowed_agents:
  - ui-ux-designer
inputs:
  - the screen or live implementation under review
  - product context, target user, intended style
outputs:
  - prioritized findings with fix level (screen / component / token)
sensitive: false
```

Use the model as a **design reviewer**, not only a generator. Generators produce
plausible-but-average UI; a reviewer finds what makes it read as unconsidered and says
how to fix it. Run this after design and again on the **live** implementation.

Give the reviewer context first: the product, the target user, the intended style, and
1–2 reference links. Then apply the rubric.

---

## Rubric — what to inspect and how to fix it

**1. Consistency (visual language).**
Same element must look the same everywhere. Flag mismatches — e.g. a square Log‑in
button on one screen and a rounded one on another; two greys that should be one token.
Fix at the right level (component or token, per `design-system`), not per screen.

**2. "Looks AI-generated" smell.**
Tells: a wall of similar cards, generic iconography, evenly-weighted composition with no
focal point, decorative filler. AI compensates for *weak visual accents* by adding more
cards. Fix by building **hierarchy with typography, spacing, size, and contrast** instead
of nesting more containers. One clear focal point per screen.

**3. Contrast & readability.**
Working UI must be read fast. Flag grey-text-on-grey-background, ultra-thin fonts in
dense areas, and text over busy background images (e.g. a photo behind the dashboard —
remove or heavily de-emphasize it). Check real contrast ratios, not vibes. Corner cases:
the hardest-to-read spot (often small text in a header/corner) sets the bar.

**4. Visual hierarchy over containers.**
Count the nesting. Card-inside-card-inside-card — especially *empty* cards — reads as a
pile of rectangles, not structure. Reduce containers; let type scale and spacing carry
the grouping.

**5. Interaction states / affordance.**
Every actionable element needs visible `hover / focus / active`. Flag things that *are*
interactive but *look* static — e.g. Tabs (Items / Outfits / Missing) rendered as plain
text. Affordance is not optional.

**6. First-run clarity / onboarding.**
After sign-in, is the *next step* obvious? Landing on a populated dashboard with no
guidance leaves the user unsure what's expected. Require empty states, hints, or an
onboarding path that names the first action.

**7. Composition & density.**
Too many equal-weight boxes = noise. Prefer fewer, more intentional groupings. Remove
empty/placeholder containers that add structure-cost with no content-value.

---

## Live-screen verification (not just the mock)

A mock can look good while the live screen does not — this is normal. After
implementation, review the running product in the browser and check each:

- [ ] **Desktop** and **mobile** (real viewport, not scaled).
- [ ] **Hover / focus / active** actually fire and are visible.
- [ ] **Long text** — does it truncate/wrap gracefully?
- [ ] **Real data** — many items, few items, long names.
- [ ] **Empty states** — lists with nothing yet.
- [ ] **Error / loading** states render.
- [ ] **Contrast** holds in the real theme (light/dark if applicable).

Loop: `design → frontend → review → polish`. Reviewing the live screen is part of the
`ui-ux-designer`'s ownership, not an afterthought.

---

## Output format

Return findings as a prioritized list. For each: **what** (with the exact screen/element),
**why it reads as off**, **the fix**, and **the level** to fix it at (screen / component /
token). Lead with the highest-impact issues — usually hierarchy, contrast, and
consistency before cosmetics.
