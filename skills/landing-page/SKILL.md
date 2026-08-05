---
name: landing-page
description: Design and build premium, high-converting landing pages — offer clarity and the one-goal/one-CTA rule, narrative block architecture (hero → problem → solution → proof → offer → objections → action), social proof that is real, premium visual language (restraint, whitespace, typography) without conversion loss, mobile-first above-the-fold, performance and accessibility budgets, honest persuasion with no dark patterns or fabricated proof. Use when creating or reviewing a landing page, promo page, or product one-pager. Triggers: landing, landing page, лендинг, продающая страница, hero section, conversion, CTA, promo page, одностраничник.
user-invocable: true
---

# Landing Page

```yaml
id: landing-page
status: active
runtime: claude-code-skill
allowed_agents:
  - ui-ux-designer
  - frontend
inputs:
  - verified offer, facts, and proof from the client
  - target audience and traffic context
  - brand identity and constraints
outputs:
  - block architecture and behavior spec
  - hero and CTA copy structure (draft, client-approved before final)
  - verification checklist results
sensitive: false
```

A landing page is a **single argument with a single call to action**. Premium is not
decoration on top of that argument — premium *is* restraint: fewer, better elements,
confident typography, real proof. Selling hard and looking expensive are not in
conflict; clutter and fakery are what kill both.

---

## 0. Source truth first (non-negotiable)

- Claims, numbers, testimonials, client logos, guarantees, prices, and deadlines
  come from the client and must be real. **Fabricated proof is forbidden** — no
  invented reviews, inflated counters, fake scarcity, or stock-photo "team".
- Draft copy is fine, but mark it `draft` and route it for client approval
  (`design-handoff` treats unapproved copy as a blocker for "final").

## 1. Before pixels: the offer

Answer these in writing before designing; if the client can't answer, that's the
first deliverable:

- **One goal.** What single action should a visitor take? One page = one primary CTA.
  Multiple audiences with different actions → multiple pages, not one crowded page.
- **The promise.** In one sentence: outcome + what makes this offer different.
  This sentence *is* the hero headline's job.
- **Audience temperature.** Cold traffic needs more context and proof before the
  offer; warm traffic needs the offer sooner and less persuasion theater.
- **The 5-second test target:** a first-time visitor should be able to say what is
  offered, for whom, and what to do next — within 5 seconds on the hero alone.

## 2. Block architecture — the narrative spine

A selling page is an argument in order. Default spine (cut blocks that have no
content; never pad):

| Block | Job |
|---|---|
| **Hero** | Promise + differentiator + primary CTA + one proof cue |
| **Problem / context** | Name the pain in the visitor's words (cold traffic mostly) |
| **Solution / product** | Show the actual product — real screenshots/photos, not abstractions |
| **Benefits** | Outcomes, not features; 3–5, each concrete |
| **Social proof** | Real testimonials/numbers/logos, specific beats generic |
| **How it works** | 3–4 steps that make the CTA feel low-risk |
| **Offer / pricing** | What exactly they get; price framing honest and clear |
| **Objections / FAQ** | The 4–6 questions that actually block the sale |
| **Risk reversal** | Guarantee / trial / cancellation terms — only real ones |
| **Final CTA** | Restate promise + CTA; footer with legal and contacts |

- Every viewport-height of scroll should keep a path to the primary action visible
  or one glance away.
- Order can flex per audience temperature; the *jobs* don't.

## 3. Hero rules

- Headline = the promise (outcome + differentiator), not the company name and not
  wordplay that needs the subhead to decode.
- Subhead carries the mechanism ("how"), CTA carries the action verb + outcome
  ("Get the menu audit", not "Submit").
- Primary CTA **above the fold on 360px-wide mobile** — the real fold, tested.
- One proof cue in the hero (rating, client count, known logo — real only).
- No carousels/sliders in the hero; they hide messages and tank LCP.

## 4. CTA discipline

- **One primary CTA**, visually dominant, repeated after proof-heavy blocks.
- Secondary action (if truly needed) is visually subordinate — link-styled, not a
  competing button.
- Button copy: verb + outcome, first person works ("Забронировать стол", "Get my
  quote"). Never "Learn more" as the primary.
- Forms: ask the minimum (each extra field costs conversions); label errors
  inline; success state designed, not an alert box.

## 5. Premium visual language

What makes a page read expensive is **restraint under a strong system**
(`design-system` skill provides the mechanics):

- Generous whitespace; sections breathe. Density is for dashboards, not landings.
- Large, confident typography: one display family + one text family, tight scale.
- One accent color doing all the CTA work; muted everything else.
- Imagery: few, large, high-quality, of the *actual* product/team/venue. No
  watermark-y stock, no AI-uncanny people, no icon soup (license-checked assets only).
- Motion subtle and purposeful (reveal on scroll ≤ 200–300ms, respects
  `prefers-reduced-motion`); never autoplaying video with sound.
- **Cheap tells to hunt in review** (`design-review` catches these): gradient soup,
  3+ fonts, equal-weight boxes everywhere, exclamation-mark copy, fake urgency
  timers, badge/award clutter, walls of centered text.

## 6. Copy structure

- Subheads alone must carry the argument — most visitors read only those. Test:
  read only headline + subheads; does the pitch survive?
- Specific beats adjectival: "ответим за 15 минут" beats "быстрый сервис";
  premium is *shown* (materials, process, names, numbers), never claimed with the
  word "premium".
- Body text in short blocks, 45–75 characters per line, real paragraphs — not
  centered multi-line slabs.
- The visitor's language, not the company's org chart ("your table on Friday",
  not "our booking infrastructure").

## 7. Mobile-first and performance

- Design 360px first; the desktop layout is the enhancement.
- Sticky mobile CTA bar is usually worth it — subtle, not a cookie-banner clone.
- Performance is a conversion feature: LCP ≤ 2.5s on mid-range mobile, images
  sized/compressed (AVIF/WebP), fonts self-hosted + `font-display: swap`,
  no third-party scripts without a confirmed purpose (repository rules apply:
  no analytics/trackers without license + consent decisions from the client).
- Tap targets ≥ 44px, thumb-reachable primary actions.

## 8. Accessibility and honesty

- WCAG AA contrast including text-over-image (add scrims; never white-on-photo
  and hope), full keyboard path to the CTA and through the form, focus visible,
  semantic landmarks/headings in order.
- No dark patterns: no pre-checked consents, no hidden costs revealed late, no
  fake countdowns, no confirm-shaming ("No, I hate saving money"). These damage
  premium brands *more* — trust is the product.

## 9. Working in the role loop

- `ui-ux-designer` owns the block architecture and visual system fit; `frontend`
  implements from a `design-handoff` spec (form states, error/success, loading —
  the canonical state list applies to landings too).
- Review the **live** page with `design-review`: 360px + desktop, real content,
  the longest headline the client might supply, slow-network load.
- Measurement (analytics events, A/B tests) only with tooling the client approved;
  change one variable at a time and let the data settle.

## Verification checklist

- [ ] 5-second test passes on the hero alone (offer, audience, action).
- [ ] Primary CTA above the fold at 360px and 1440px; repeated after proof blocks.
- [ ] Exactly one primary CTA style on the page; secondary is subordinate.
- [ ] Headline + subheads alone carry the argument.
- [ ] Every claim, number, testimonial, and logo traceable to client-provided proof.
- [ ] Form: error, success, and loading states designed and implemented.
- [ ] LCP ≤ 2.5s mobile; images optimized; no unapproved third-party scripts.
- [ ] Keyboard-only pass reaches and completes the primary action.
- [ ] Contrast AA everywhere, including text over imagery.
- [ ] No dark patterns; scarcity/urgency only if factually real.

## Do not
- Fabricate testimonials, numbers, logos, urgency, or awards.
- Give one page two competing goals or two primary CTAs.
- Open the hero with a carousel, an abstract stock photo, or the company name as headline.
- Bury the offer below the fold for warm traffic.
- Say "premium/luxury/best" instead of showing specifics.
- Add trackers, chat widgets, or pixels the client didn't approve.
