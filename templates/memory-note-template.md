# Memory Note Template

Use this template for durable memory proposals. Do not save sensitive personal
details unless the owner explicitly asks to save them or accepts a proposed
memory update.

```yaml
title: short-memory-title
scope: shared|agent|session
agent: agent-id-or-null
sensitivity: low|sensitive
source: conversation|document|manual
consent: explicit|proposed|none
created: yyyy-mm-dd
last_reviewed: yyyy-mm-dd
```

## Summary

One short paragraph describing the durable learning.

## Durable Facts

- Fact or preference that should persist.

## Non-Facts

- Guess, mood, temporary context, or unsupported inference that should not be
  treated as stable memory.

## Use Rules

- Which agents may read this memory.
- Which situations may use it.
- Which situations require asking again.

## Expiry Or Review

State when the memory should be revisited or deleted.

## Evidence

Name the source conversation, document, or owner instruction that justifies the
memory.
