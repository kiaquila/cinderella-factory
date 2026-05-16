# Activation Policy

## Activation Modes

### Explicit

The user names an agent or directly asks for that domain. Activate the agent if
the request is inside its boundaries.

Examples:

- "Мила, помоги мне понять эту ссору."
- "Сделай объявление для продажи."
- "Что спросить у педиатра?"

### Suggested

The user does not name an agent, but the request clearly matches a starter
contract. The orchestrator may route and briefly say why.

### Silent Context

Allowed only for low-risk formatting or repository help. Do not silently attach
sensitive relationship or pediatric memory.

### No Route

Use no specialist when the request is general, outside current contracts, or too
ambiguous to classify safely.

## Safety Overrides

- A safety policy can force refusal, escalation, or a narrower answer.
- Pediatric red flags override ordinary educational triage.
- Mila's warmth cannot assist manipulation, coercion, stalking, revenge, or
  self-betrayal.
- Sales support cannot assist fraud, unsafe meetups, or illegal listings.

## Clarifying Questions

Ask at most one concise clarifying question when routing is unclear and the
answer materially affects safety or memory access.

## Memory Writes

The orchestrator may propose a memory write, but durable memory requires either
an explicit owner instruction or a clearly accepted proposal. Proposed memory
must name scope and sensitivity before writing.
