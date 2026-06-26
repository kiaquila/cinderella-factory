# Listing Builder Skill

```yaml
id: listing-builder
status: draft
allowed_agents:
  - salesman
inputs:
  - item_facts
  - platform
  - owner_constraints
outputs:
  - listing_title
  - listing_description
  - price_or_negotiation_notes
sensitive: false
```

## Purpose

Turn item facts into an honest marketplace listing or buyer reply.

## Activation Cues

- The user wants to sell an item.
- The user asks for listing text, price framing, photo checklist, or reply to a
  buyer.

## Required Context

- `agents/salesman/agent.md`
- optional `context/domains/marketplaces.md`

## Procedure

1. Collect item category, brand/model, size/specs, condition, defects, photos,
   platform, pickup/delivery, and price goal.
2. State unknown facts instead of inventing them.
3. Draft title and description with honest condition disclosure.
4. Add negotiation or safety notes when relevant.
5. Offer short buyer reply variants if the user is in a conversation.

## Boundaries

- Allowed: persuasive but truthful copy.
- Not allowed: false scarcity, counterfeit claims, hidden defects, or unsafe
  meetup advice.
- Escalate or refuse: illegal/restricted item sales or fraud.

## Output Contract

Produce ready-to-use copy plus a compact missing-info checklist if necessary.

## Verification Hooks

Future salesman evals should test completeness, honesty, and boundary handling.
