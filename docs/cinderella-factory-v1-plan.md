# Cinderella Factory v1 Plan

Status: proposed architecture for approval
Date: 2026-05-09

## Goal

Cinderella Factory is a private, personal factory of specialist agents. V1 should feel useful immediately: one repository, three first agents, a lightweight orchestrator, reusable skills, explicit memory boundaries, and a clear path for later RAG.

The guiding constraint: build a small operating system for personal agents, not a full agent platform.

## Architectural Inputs

- Oh My ClaudeCode pattern: separate agents, skills, commands/orchestration, and state/memory.
- Architectura pattern: use role-based review and keep canonical decisions in the repository; memory/retrieval can assist but must not become the source of truth.
- MemPalace pattern: local-first semantic memory with wings/rooms/drawers, agent diaries, MCP tools, ChromaDB backend, and optional knowledge graph.
- Prior relationship-agent session: Mila should use a hybrid knowledge design, with a compact core, a distilled doctrine from the relationship book, structured book knowledge, and user-specific preferences.

## Decisions

### D-001: Repository Model

Use one private repository: `cinderella-factory`.

Rationale:
- The agents share personal context, tone, values, boundaries, and memory policy.
- Separate repositories would duplicate context and drift quickly.
- Sensitive boundaries can be enforced through scoped folders and memory rules instead of repo fragmentation.

### D-002: V1 Scope

V1 includes exactly three specialist agents:

- `mila`: relationship support agent, focused on woman-man relationships; tone is warm, supportive, friend-like, but with clear anti-manipulation and safety boundaries.
- `flea-market-sales`: practical sales helper for marketplace/baraholka listings, pricing, negotiation messages, and listing cleanup.
- `pediatric-consultant`: educational pediatric triage/support agent, not a doctor, with strict red-flag and medical-safety rules.

V1 also includes:
- one orchestrator,
- agent and skill templates,
- a small skill registry,
- file-based scoped memory,
- evaluation cases.

Explicitly out of scope for V1:
- LangChain as the core runtime,
- autonomous multi-agent swarms,
- global auto-memory for all Codex context,
- web UI,
- vector database as a required dependency,
- fine-tuning,
- automatic medical diagnosis.

### D-003: Orchestrator Role

The orchestrator is a high-level agent, but its job is routing and context assembly, not domain advice.

It should:
- detect whether a user request fits one of the known agents,
- suggest the right agent when the conversation naturally shifts,
- assemble the minimum context bundle for that agent,
- explain why it is suggesting a route,
- ask before switching when confidence is medium or the topic is sensitive,
- refuse to silently cross memory boundaries.

It should not:
- impersonate all agents,
- answer pediatric or relationship requests without applying the relevant safety policy,
- retrieve from all memory by default,
- make hidden agent switches.

Suggested router output:

```json
{
  "agent": "mila",
  "confidence": 0.86,
  "activation": "suggested",
  "reason": "relationship/support context",
  "context_bundle": [
    "context/core/user-profile.md",
    "agents/mila/agent.md",
    "memory/agents/mila/summary.md"
  ],
  "safety_flags": [],
  "handoff_note": "Use supportive reflection and clarify the user's desired outcome."
}
```

Activation levels:
- `direct`: user explicitly asks for an agent or skill.
- `suggested`: orchestrator proposes an agent and waits for confirmation.
- `silent-context`: allowed only for low-risk formatting/help skills, not for medical or sensitive relationship content.

### D-004: Layer Model

Use the OMC-inspired layer split, but keep it markdown-first.

```text
cinderella-factory/
  AGENTS.md
  README.md

  orchestrator/
    agent.md
    router.md
    context-assembly.md
    activation-policy.md

  agents/
    mila/
      agent.md
      knowledge.md
      safety.md
      examples.md
    flea-market-sales/
      agent.md
      knowledge.md
      templates.md
      examples.md
    pediatric-consultant/
      agent.md
      safety.md
      red-flags.md
      examples.md

  skills/
    agent-routing/SKILL.md
    memory-curation/SKILL.md
    relationship-debrief/SKILL.md
    listing-builder/SKILL.md
    pediatric-triage/SKILL.md

  context/
    core/
      user-profile.md
      communication-style.md
      boundaries.md
    domains/
      relationships.md
      sales.md
      child-health.md

  knowledge/
    mila/
      book-doctrine.md
      chapter-summaries.md
      glossary.md
      practices.md
    pediatric/
      source-register.md
      common-scenarios.md
    sales/
      marketplace-patterns.md

  memory/
    shared/
      stable-preferences.md
    agents/
      mila/summary.md
      flea-market-sales/summary.md
      pediatric-consultant/summary.md
    sessions/
      README.md

  templates/
    agent-template.md
    skill-template.md
    memory-note-template.md

  evals/
    routing.jsonl
    mila.jsonl
    flea-market-sales.jsonl
    pediatric-consultant.jsonl
    privacy.jsonl
```

## Agent Contract

Each agent should have a single canonical `agent.md` with YAML frontmatter plus sections.

Required fields:

```yaml
id: mila
display_name: Мила
kind: specialist-agent
version: 0.1.0
status: draft
activation:
  direct_triggers: []
  suggested_triggers: []
memory:
  read_scopes: []
  write_scope: memory/agents/mila/
retrieval:
  allowed_sources: []
safety:
  policy_file: agents/mila/safety.md
output:
  default_language: ru
  style: warm-supportive
```

Required sections:
- Mission
- Persona
- What This Agent Does
- What This Agent Does Not Do
- Sources And Knowledge
- Memory Policy
- Safety Policy
- Response Shape
- Examples
- Evaluation Notes

Persona must never override policy. For example, Mila may be warm and friend-like, but cannot help with manipulation, stalking, coercion, or self-betrayal.

## Skill Contract

Skills are reusable procedures, not personalities.

Each skill lives in `skills/<skill-name>/SKILL.md` and should include:
- purpose,
- trigger conditions,
- inputs,
- workflow,
- output contract,
- safety considerations,
- which agents may use it.

Initial skills:

- `agent-routing`: classify request, propose agent, produce context bundle.
- `memory-curation`: decide what should be saved, where, and with what sensitivity.
- `relationship-debrief`: help Mila structure relationship situations.
- `listing-builder`: turn raw item details into a listing, price logic, and buyer replies.
- `pediatric-triage`: collect child age, weight when relevant, symptom timeline, red flags, and care-routing.

## Memory Policy

Canonical memory stays in repository files. Retrieval systems may index it, but cannot replace it.

Memory classes:

- `global`: stable preferences and communication style.
- `agent`: memories relevant only to one agent.
- `session`: temporary notes from a conversation.
- `source`: books, extracted session notes, medical source summaries, marketplace patterns.
- `sensitive`: relationship and pediatric details; never shared across agents without explicit reason.
- `blocked`: things that must not be saved.

Default rule: do not save personal facts automatically. A memory write should pass four questions:

1. Is this stable enough to be useful later?
2. Did the user explicitly or implicitly consent to saving it?
3. Which agent is allowed to read it?
4. Is it sensitive, medical, or about another person?

Cross-agent memory rules:
- Mila can read only `shared`, `context/core`, `context/domains/relationships`, `knowledge/mila`, and `memory/agents/mila`.
- Sales can read sales memory and shared style/preferences, but not relationship or pediatric session details.
- Pediatric consultant can read pediatric knowledge and explicitly provided child-health context, but not general relationship/sales memory.
- Shared memory should stay small and boring: stable preferences, preferred tone, language, formatting.

## MemPalace Decision

Recommendation: do not make MemPalace mandatory in V1. Design for it as an optional memory backend and run a small proof of concept after the markdown structure exists.

Why it is promising:
- local-first storage,
- semantic search over verbatim text,
- MCP server,
- agent diaries,
- wing/room/drawer taxonomy that maps well to `agent/source/session` scopes,
- knowledge graph support.

Why not central in V1:
- it adds operational weight before the corpus is large,
- global memory can pollute routing and leak sensitive context,
- canonical source-of-truth should remain inspectable repository files,
- a small curated markdown corpus is easier to debug.

Recommended setup later:
- one factory-scoped MemPalace, not one unbounded "all Codex forever" memory,
- wings such as `cinderella-factory`, `mila`, `sales`, `pediatric`,
- rooms such as `source`, `session-summary`, `user-preference`, `safety`,
- no auto-mining of all Codex sessions by default,
- opt-in mining of selected archived sessions, starting with the Mila relationship-agent session.

PoC acceptance criteria:
- can retrieve the prior Mila design note by semantic query,
- can retrieve a relevant book-doctrine chunk without unrelated personal memory,
- can scope search by agent wing/room,
- can export or inspect stored memory,
- can delete sensitive drawers,
- does not leak pediatric memory into Mila or sales retrieval.

## LangChain And RAG Decision

Do not use LangChain in V1.

V1 retrieval should be:
- curated markdown,
- explicit source registers,
- file search with metadata,
- optionally a tiny SQLite/FTS or MemPalace PoC later.

Use LangChain only if at least two of these become true:
- multiple retrievers need orchestration,
- agent-specific RAG chains become hard to maintain manually,
- query rewriting/reranking is needed and measured,
- there is a real corpus beyond what markdown plus simple search can handle,
- evaluations show retrieval quality is a bottleneck.

RAG maturity path:

1. Phase 1: curated markdown knowledge and manual context assembly.
2. Phase 1.5: simple local search/index over markdown.
3. Phase 2: MemPalace as optional scoped backend.
4. Phase 3: custom retrieval orchestration or LangChain only if warranted.

## Agent-Specific Plans

### Mila

Purpose: relationship support and reflection, mostly woman-man relationships, with a supportive friend/coach tone.

Source foundation:
- prior session about the relationship agent,
- book: "Женское достоинство. Сила притяжения мужчин",
- user's own preferences and agreements/disagreements with the book.

Knowledge design:
- `agents/mila/agent.md`: compact role, tone, boundaries, response shape.
- `knowledge/mila/book-doctrine.md`: distilled principles in the user's words.
- `knowledge/mila/chapter-summaries.md`: chapter-level notes.
- `knowledge/mila/glossary.md`: recurring terms and distinctions.
- `knowledge/mila/practices.md`: exercises, reflection questions, situation analysis.
- `context/domains/relationships.md`: user-specific preferences, recurring patterns, what advice style works.

Safety:
- no manipulation,
- no "how to make him do X",
- no stalking, coercion, humiliation, revenge,
- no advice that normalizes abuse,
- if violence/coercive control/self-harm appears, shift to safety and real-world support.

Response style:
- warm,
- direct but gentle,
- emotionally validating,
- asks clarifying questions when facts are missing,
- separates "what happened", "what you feel", "what you want", "what protects your dignity".

### Flea Market Sales Agent

Purpose: help sell items on marketplace/baraholka platforms.

Capabilities:
- turn raw item facts into listings,
- generate titles,
- suggest price bands,
- write short and long descriptions,
- prepare buyer reply templates,
- negotiate without sounding desperate or rude,
- identify missing listing details,
- advise on photo checklist and trust signals.

Safety and boundaries:
- no false claims,
- no hiding defects,
- no manipulative urgency if untrue,
- no unsafe meetup/payment advice,
- no personal data sharing.

Likely skills:
- `listing-builder`,
- `price-positioning`,
- `buyer-reply`.

### Pediatric Consultant

Purpose: educational pediatric guidance and triage support.

Hard boundary: this agent is not a doctor and must not diagnose.

Required intake:
- child's age,
- symptom timeline,
- temperature and measurement method when relevant,
- hydration/urination,
- breathing,
- alertness/behavior,
- medications already taken,
- relevant medical history,
- location/care access when urgent.

Response routing:
- emergency now,
- contact doctor/urgent care today,
- monitor with clear criteria,
- general education.

Safety:
- always surface red flags,
- no diagnosis certainty,
- no medication dosing without enough child-specific information and a reliable checked source,
- cite or name the source class when relying on medical knowledge,
- recommend professional care when symptoms are severe, unclear, worsening, or in young infants.

Knowledge source policy:
- curated medical source register with review dates,
- no casual memory-based medical facts,
- refresh/check sources for change-prone guidance.

## Evaluation Plan

Start with small JSONL or markdown eval cases before building automation.

Minimum V1 eval set:
- 20 routing cases across Mila, sales, pediatric, and "no agent".
- 10 ambiguous routing cases where orchestrator should ask before switching.
- 10 Mila safety cases around manipulation, self-betrayal, coercion, and abuse.
- 20 pediatric triage cases covering red flags and "ask for missing information".
- 10 sales cases covering honesty about defects, negotiation, and platform safety.
- 10 privacy cases proving one agent does not use another agent's memory.

Each eval case should define:
- input,
- expected agent,
- allowed context scopes,
- forbidden context scopes,
- expected safety behavior,
- notes on tone.

## Implementation Backlog

### Step 1: Initialize The Repository Skeleton

Create:
- `README.md`
- `AGENTS.md`
- `orchestrator/`
- `agents/`
- `skills/`
- `context/`
- `knowledge/`
- `memory/`
- `templates/`
- `evals/`

Acceptance:
- folder structure exists,
- `AGENTS.md` explains the factory rules,
- no runtime dependencies yet.

### Step 2: Create Templates

Create:
- `templates/agent-template.md`
- `templates/skill-template.md`
- `templates/memory-note-template.md`

Acceptance:
- templates include all required contract fields,
- new agents can be created consistently.

### Step 3: Create Orchestrator v1

Create:
- `orchestrator/agent.md`
- `orchestrator/router.md`
- `orchestrator/context-assembly.md`
- `orchestrator/activation-policy.md`

Acceptance:
- router can classify the three starter agents,
- router explains confidence and reason,
- router has examples of explicit, suggested, and no-route cases.

### Step 4: Create Starter Agent Specs

Create:
- `agents/mila/agent.md`
- `agents/mila/safety.md`
- `agents/flea-market-sales/agent.md`
- `agents/pediatric-consultant/agent.md`
- `agents/pediatric-consultant/safety.md`
- `agents/pediatric-consultant/red-flags.md`

Acceptance:
- each agent has mission, persona, boundaries, memory scopes, source policy, response shape, and examples.
- pediatric safety is stricter than general advice.

### Step 5: Create Initial Skills

Create:
- `skills/agent-routing/SKILL.md`
- `skills/memory-curation/SKILL.md`
- `skills/relationship-debrief/SKILL.md`
- `skills/listing-builder/SKILL.md`
- `skills/pediatric-triage/SKILL.md`

Acceptance:
- skills are procedures, not personas,
- every skill declares which agents may use it,
- pediatric triage skill has red-flag escalation.

### Step 6: Extract Mila Source Material

Use the prior Codex session and the book file/source material to create:
- `knowledge/mila/book-doctrine.md`
- `knowledge/mila/chapter-summaries.md`
- `knowledge/mila/glossary.md`
- `knowledge/mila/practices.md`
- `context/domains/relationships.md`

Acceptance:
- no full copyrighted book pasted into system prompt,
- doctrine is concise and operational,
- chapter summaries are source-grounded,
- user preferences are separated from book doctrine.

### Step 7: Add Memory Policy And Initial Memory Files

Create:
- `memory/README.md`
- `memory/shared/stable-preferences.md`
- `memory/agents/*/summary.md`
- `memory/sessions/README.md`

Acceptance:
- memory scopes are documented,
- sensitive memory does not cross agents by default,
- memory write rules are explicit.

### Step 8: Add Eval Pack

Create initial eval files:
- `evals/routing.jsonl`
- `evals/mila.jsonl`
- `evals/flea-market-sales.jsonl`
- `evals/pediatric-consultant.jsonl`
- `evals/privacy.jsonl`

Acceptance:
- at least 10 starter cases exist,
- future Codex sessions can expand them before runtime automation.

### Step 9: Optional MemPalace PoC

Only after Steps 1-8.

Tasks:
- install MemPalace in an isolated way,
- create factory-scoped palace path,
- mine selected repo files and the chosen prior Mila session,
- test scoped search,
- document whether it becomes the v2 memory backend.

Acceptance:
- search works by agent scope,
- export/delete path is clear,
- no global Codex auto-mining is enabled by default.

## Open Questions For User

1. Should Mila address the user as a close friend by default, or switch between friend/coach modes?
2. Should pediatric consultant know a stable child profile, or should it ask for age/context every time unless explicitly saved?
3. Which marketplace/baraholka platforms matter first?
4. Should memory writes require explicit "save this" at first, or can the memory-curation skill propose saves at the end of sessions?
5. Is the relationship book available as `fb2`, `epub`, or another format?

## Recommended First Implementation Session

Do not start with MemPalace or LangChain. Start by creating the repository skeleton, templates, orchestrator policy, and the three draft agent specs.

The first implementation session should produce a usable markdown-based factory that Codex can read and follow immediately. The second session should deepen Mila using the prior session and book-derived knowledge. The third session should add eval cases and decide whether a MemPalace PoC is worth running.

## References

- Oh My ClaudeCode: https://github.com/Yeachan-Heo/oh-my-claudecode
- MemPalace: https://github.com/MemPalace/mempalace
- Architectura: https://github.com/alexgoodman53/Architectura
