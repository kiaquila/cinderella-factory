---
name: menu-design
description: >-
  Design and lay out restaurant/cafe/bar menus that sell — category architecture
  and scanning, menu engineering (anchors, highlights, placement), price
  presentation without price-dumping, dish naming and descriptions, typography
  for dim light and small screens, dietary/allergen marks, multilingual layout,
  web/QR and print delivery. Pure methodology — dishes, prices, and claims always
  come from the client, never invented. Use when designing or reviewing any menu:
  a menu page on a website, a QR menu, a wine/bar list, or a print menu. Triggers:
  menu, restaurant menu, QR menu, wine list, drink list, верстка меню, меню
  ресторана, дизайн меню.
user-invocable: true
---

# Menu Design

```yaml
id: menu-design
status: active
runtime: claude-code-skill
allowed_agents:
  - ui-ux-designer
  - frontend
inputs:
  - verified menu content from the client (dishes, prices, marks)
  - brand identity and constraints
  - delivery targets (web page / QR / print)
outputs:
  - menu structure and layout specification
  - typography and price-presentation rules
  - verification checklist results
sensitive: false
```

A menu is simultaneously a **sales tool**, a **brand artifact**, and a **usability
surface read in the worst conditions** — dim light, small phone screens, a hungry
distracted reader. Design for all three at once. This skill covers method only;
the *content* of a menu is client data and follows the source-truth rule below.

---

## 0. Source truth first (non-negotiable)

- Every dish, price, description, allergen mark, and translation comes from the
  client or a verified source. **Never invent or "improve" business facts.**
- Missing content gets a visible placeholder (`TBD — awaiting client`) and an open
  question in the project's working docs — never a plausible-looking guess.
- Rewording a description for rhythm is design; adding provenance ("farm-raised",
  "house-made") that the client didn't state is fabrication. Propose, don't insert.

---

## 1. Category architecture and scanning

- **Order follows the visit**, not the kitchen: the sequence a guest actually decides
  in (e.g. starters → mains → desserts → drinks, or drinks-first for a bar). Ask how
  the business wants guests to flow; don't assume.
- **5–9 items per category** is the comfortable decision range. More → split the
  category or accept that mid-list items go unread. One overloaded "Mains" with 24
  rows is a wall, not a menu.
- **First and last positions in each category get the most attention** — place the
  items the business wants to sell there (see menu engineering below).
- Category names are navigation: short, concrete, guest-language (not kitchen
  jargon). A category the guest can't parse is a category they skip.
- Single-panel menus are scanned roughly center → top-right → down (the "golden
  triangle"); multi-page menus are read page by page, so per-category placement
  matters more than page position. Don't over-engineer this — position *within*
  a category is the reliable lever.

## 2. Menu engineering — what to emphasize

Classify items with the client (by margin × popularity) and design accordingly:

| Class | Margin / popularity | Design treatment |
|---|---|---|
| **Stars** | high / high | Prime positions (first/last in category), may get a highlight |
| **Puzzles** | high / low | Give visibility: position, description quality, a modest highlight |
| **Plowhorses** | low / high | Keep findable, don't spotlight |
| **Dogs** | low / low | Candidates to drop — flag to the client, don't decide for them |

- **At most one visual highlight per category** (box, tint, "chef's choice" mark).
  Highlight everything = highlight nothing, and it reads as pushy.
- **Anchoring:** a deliberately premium item placed first makes the rest of the
  category read as reasonable. Use only with real items the client actually sells.

## 3. Price presentation

- **No leader dots** and **no right-aligned price column.** A price column invites
  scanning by price ("price-dumping" the layout). Set the price after the
  description, same line or line below, with a modest weight.
- **Same price style everywhere** — one decision for the whole menu: currency symbol
  or none, decimals or none. Premium contexts usually drop the symbol and decimals
  (`14`, not `$14.00`) — confirm the client is comfortable with it.
- Never mix formats within a menu; nothing says "unconsidered" faster.
- Charm prices (9.99) read as discount positioning; clean numbers read premium.
  Match the brand — this is a client decision to surface, not to make silently.

## 4. Naming and descriptions

- Dish name carries recognition; the description sells. 1–2 lines max: key
  ingredients, preparation, one sensory or provenance cue **the client provided**.
- Concrete beats adjectival: "slow-roasted 8 hours" beats "delicious and tender".
- Cut menu-filler words ("served with a side of…" → "with…").
- Consistent grammar across the menu: same language for the same kind of fact,
  same capitalization scheme, same ingredient-list punctuation.
- Foreign dish names keep the original + a plain-language gloss if guests may not
  know it. Don't translate names the brand treats as proper nouns.

## 5. Typography and layout

- **Hierarchy in exactly this order:** category > dish name > description > price.
  If a squint-test reads prices first, the hierarchy is inverted.
- **Max 2 typefaces** (a display for categories/brand + a workhorse for items).
  Menus read in dim light and at arm's length: body ≥ the equivalent of 16px web /
  9–10pt print, generous line-height, no ultra-thin weights, no long all-caps runs.
- **Whitespace is the premium signal.** A cramped menu reads cheap regardless of
  paper or photography. If content doesn't fit, cut or split — don't shrink type.
- Photos: premium menus use **few or none**; if the client wants photos, only
  professional, consistent ones — and never stock photos of "similar" dishes
  (that's a business-fact lie in image form).
- Tokens and components come from the project's design system (`design-system`
  skill) — a menu page is product UI, not a special snowflake.

## 6. Marks, allergens, languages

- Dietary/allergen marks: one small, consistent icon or letter system with a
  **legend visible where the reader first needs it**. Marks come from the client;
  missing data is an open question, never a guess (this is a safety surface).
- Multilingual menus: identical structure per language; design for **text expansion**
  (RU/DE run ~20–30% longer than EN). Separate pages/views per language beat
  interleaved lines for anything longer than a food-truck card. Translations are
  verified content — machine output goes to the client for approval first.

## 7. Delivery targets

**Web / QR menu:**
- Semantic HTML — real headings and lists, **not a PDF and not an image**. It must
  be searchable, zoomable, translatable, and accessible.
- Mobile is the primary viewport (QR = phone by definition): single column,
  sticky or quickly reachable category navigation, tap targets ≥ 44px.
- Fast on cellular: minimal JS, optimized images, system or self-hosted fonts
  (license-checked per repository rules).
- Contrast ≥ WCAG AA — guests read menus in sunlight and in candlelight.
- Provide a print stylesheet if the same content serves as the print source.

**Print:**
- Real bleed/margins per the printer's spec; verify the longest dish name and
  description at final size before sign-off.
- Dim-light test: print a proof, read it in low light at arm's length.

## 8. Working in the role loop

- `ui-ux-designer` applies this skill for structure/typography decisions and runs
  `design-review` on the live result; `frontend` implements via `design-handoff`
  spec — states included (a web menu has loading/empty/error too: e.g. "category
  temporarily unavailable").
- Changes follow the **right-level rule** from `design-system`: one dish's layout
  fix is screen-level; "all prices look wrong" is component/token-level.

## Verification checklist

- [ ] Longest real dish name + longest description render without breaking layout.
- [ ] Price style identical across every category.
- [ ] Hierarchy squint-test: categories → dishes → descriptions → prices, in that order.
- [ ] One highlight max per category; anchors are real items.
- [ ] Allergen/dietary legend present and marks traceable to client data.
- [ ] Each language version complete — no mixed-language leftovers.
- [ ] Mobile smallest supported width and desktop both checked (web); dim-light proof read (print).
- [ ] Every fact traceable to client source; all placeholders surfaced as open questions.

## Do not
- Invent dishes, prices, ingredients, provenance, or allergen data.
- Use leader dots or a right-aligned price column.
- Highlight more than one item per category.
- Ship a menu as PDF-only or image-only on the web.
- Use stock photos of dishes the kitchen didn't cook.
- Shrink type to fit content that should be cut.
