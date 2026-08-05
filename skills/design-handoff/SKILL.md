---
name: design-handoff
description: Turn a design decision into a behavior specification and a per-screen handoff checklist so frontend implements it without guessing. Covers interaction (hover/click), empty/error/loading states, responsive/mobile, long-text and no-data edge cases, editable vs read-only, destructive actions and confirmations. Use at the design→frontend boundary, before implementing a screen, or when reviewing whether a screen is ready to build. Triggers: handoff, spec, behavior spec, ready for dev, implementation checklist, edge cases, states matrix.
user-invocable: true
---

# Design Handoff

```yaml
id: design-handoff
status: active
runtime: claude-code-skill
allowed_agents:
  - ui-ux-designer
  - frontend
inputs:
  - a designed screen/component ready to hand to implementation
outputs:
  - behavior specification + gated handoff checklist
sensitive: false
```

A mockup is not a spec. When frontend has to *guess* behavior, it improvises, and
consistency starts to spread apart. This skill is the **contract** between the
`ui-ux-designer` and the `frontend`: what must be answered before a screen is
built, and the checklist that gates it.

Use it in both directions:
- **ui-ux-designer** produces the behavior spec + runs the checklist before handing off.
- **frontend** refuses to "fill in the blanks" — if the spec is missing an
  answer, ask, don't invent.

---

## 1. Behavior specification (answer all of these per screen/component)

A good spec answers the questions a static mock cannot:

- **Interaction:** what happens on `hover`, `focus`, `click/press`? Which elements are interactive (and *look* interactive)?
- **States:** what are the `empty`, `error`, and `loading` states? What is the *first-run / onboarding* state?
- **Responsive:** what does `mobile` look like — layout, order, touch targets? What collapses or reflows?
- **Long text:** truncate, wrap, or grow? Where are the limits?
- **No data:** what shows when a list/section has nothing yet (empty state with a next-step, not a blank box)?
- **Edit vs read-only:** which parts are editable, which are display-only?
- **Destructive actions:** which actions are destructive, and where is confirmation required?
- **Data shape:** what real data looks like (long names, many/few items) — spec against realistic content, not lorem.

If any answer is "the developer will figure it out," the spec is not ready.

---

## 2. Per-screen handoff checklist (gate before "ready for dev")

Before a screen leaves design, confirm:

- [ ] **Existing components used** — no re-drawn one-offs; new pieces explicitly named as new.
- [ ] **Colors** all from the palette/tokens (no stray hex).
- [ ] **Spacing** all from the scale.
- [ ] **Typography** all from defined styles.
- [ ] **All states shown** — the full **canonical state list** from the `design-system` skill (interaction: hover/focus/active/disabled · content: default/loading/empty/error · viewport: mobile). Not a subset.
- [ ] **Mobile** layout specified (not "same but smaller").
- [ ] **Edge cases** described — long text, no data, error, first-run.
- [ ] **Copy** is final or clearly marked `draft`.
- [ ] **New components** named and flagged for adding back into the system.
- [ ] **Right level** noted for each change (screen / component / token — see `design-system`).

A screen that fails any box goes back to design, not forward to build.

---

## 3. Handoff prompt template (for tasking an agent or teammate)

```
HANDOFF: <screen/component name>
System state: <none | partial | complete-consistent | complete-inconsistent>  (from design-system Step 0)
Reused components: <list>            New components proposed: <list + why>
Tokens used: <color/type/spacing/radius refs>   New tokens needed: <list + why>
States (canonical list from design-system): interaction hover/focus/active/disabled · content default/loading/empty/error · viewport mobile  → <describe each>
Responsive: desktop <…>  mobile <…>
Edge cases: long text <…>  no data <…>  error <…>  first-run <…>
Editable: <…>   Read-only: <…>   Destructive (needs confirm): <…>
Change level per edit: <screen | component | token>
Open questions for frontend: <…>
```

Hand this to `frontend`. After implementation, the `ui-ux-designer` reviews the
**live** screen with the `design-review` skill — Figma-looks-good is not the finish line.
