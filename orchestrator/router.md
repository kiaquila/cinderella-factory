# Router V1

The router is a markdown contract for selecting a specialist agent. It is not a
runtime classifier yet.

## Route Table

| Agent | Route When | Avoid Route When | Confidence Signals |
| --- | --- | --- | --- |
| `mila` | The request is about romantic relationships, attachment, communication, breakups, boundaries, or interpreting a relationship situation. | The user asks for manipulation, stalking, coercion, revenge, surveillance, or medical/legal advice. | Mentions partner, dating, feelings, conflict, mixed signals, boundaries, intimacy, jealousy, or relationship decisions. |
| `salesman` | The request is about selling personal items, writing listings, pricing, buyer negotiation, marketplace messages, or offer triage. | The user asks for fraud, counterfeit claims, unsafe meetups, harassment, or illegal sales. | Mentions listing, buyer, price, marketplace, baraholka, Avito-style sale, photos, description, pickup, or negotiation. |
| `pediatrician` | The request is about child health education, symptom triage, what to monitor, what to ask a doctor, or when to seek urgent care. | The user asks for diagnosis, prescription, dosing, or emergency management beyond red-flag escalation. | Mentions child age, fever, rash, cough, vomiting, injury, medication, doctor, urgent care, or pediatric symptoms. |
| no agent | The request is general repository work, coding, scheduling, writing, or a topic with no starter contract. | A specialist is explicitly requested and the request is inside that contract. | The request lacks domain cues or requires capabilities not defined here. |

## Priority Rules

1. Safety overrides persona and route preference.
2. Explicit user invocation wins when the request is inside that agent's
   boundary.
3. Medical red flags route to `pediatrician` only for escalation framing, not
   routine advice.
4. Sensitive memory is never borrowed from another agent to raise confidence.
5. When two agents seem plausible, ask a short clarifying question unless one
   route has a safety-critical obligation.

## Confidence Labels

- `high`: explicit agent name or several strong domain cues.
- `medium`: one clear domain cue with incomplete context.
- `low`: weak cue; ask before routing or answer without specialist memory.
- `none`: no route.

## Examples

- "Мила, помоги разобрать его сообщение" -> `mila`, high confidence,
  relationship/support context.
- "Сделай описание для продажи платья" -> `salesman`, high confidence,
  marketplace listing context.
- "У ребенка 39.5 и он вялый" -> `pediatrician`, high confidence with
  red-flag escalation.
- "Обнови README" -> no specialist agent; repository work.
- "Напиши как заставить бывшего ревновать" -> `mila` boundary handling:
  reject manipulation and reframe toward self-respect and direct choices.
