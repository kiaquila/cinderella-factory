# Cinderella Factory

## Problem

Personal AI helpers drift quickly when every assistant session invents its own
rules, tone, memory boundaries, and safety policy. Sensitive domains such as
relationships and child-health support need explicit boundaries instead of
ambient memory.

## Solution

Cinderella Factory is a private repository that defines specialist agents,
their skills, shared context, scoped memory, and evaluation cases in durable
markdown. It keeps canonical decisions inspectable in Git and uses PR-gated
changes so agents can evolve without losing the operating contract.

## Key Value

A small personal agent operating system: useful immediately, easy to inspect,
and strict about which agent can read which context.

## High-Level User Flow

1. A user or orchestrator identifies the right specialist agent.
2. The agent receives only the minimum context bundle allowed by its memory
   policy.
3. The agent produces help in its domain while following safety, source, and
   privacy boundaries.
4. Stable learnings are proposed as scoped memory only when they are worth
   keeping.

## Target Audience

Solo-owner personal use first. The repository is optimized for one human owner
using Codex/Claude-style agents to build and operate a private set of helpers.
