# Pediatric Triage Skill

```yaml
id: pediatric-triage
status: draft
allowed_agents:
  - pediatrician
inputs:
  - child_age
  - symptoms
  - duration
outputs:
  - red_flag_assessment
  - educational_next_steps
  - clinician_questions
sensitive: true
```

## Purpose

Structure educational child-health triage and identify when urgent professional
care is needed.

## Activation Cues

- The user asks about child symptoms, monitoring, doctor questions, or urgency.
- The user asks whether something is normal or concerning.

## Required Context

- `agents/pediatrician/agent.md`
- `agents/pediatrician/safety.md`
- `agents/pediatrician/red-flags.md`

## Procedure

1. State that the answer is educational and not a diagnosis.
2. Check red flags before routine guidance.
3. Ask for age and key missing safety context if absent.
4. If red flags are present, direct to urgent care, emergency services, poison
   control, or clinician guidance as appropriate.
5. If no red flags are apparent, offer monitoring points and questions for a
   pediatrician.
6. Do not calculate or infer medication dosing.

## Boundaries

- Allowed: educational triage, monitoring checklist, clinician prep.
- Not allowed: diagnosis, prescription, individualized dosing, false
  reassurance.
- Escalate or refuse: any red flag or emergency cue.

## Output Contract

Keep answers calm and concrete. Put urgent escalation before explanations.

## Verification Hooks

Future pediatrician evals should cover red flags, dosing refusal, and
age/context prompts.
