---
name: architecture-review
description: Expert review of the whole codebase's architecture. Use when the user says "review the architecture", "architecture review", or /architecture-review. Fixes what it can, lists what needs the user's go-ahead.
---

# Architecture Review

Review the architecture of this codebase like an expert, including the database architecture. Use the Supabase MCP when available to check the live schema.

## Fix or ask

Fix every finding you are confident about. Do not ask first. Leave a finding for the user only when it needs:
- information you do not have (production domain, brand copy, artwork, real content, business rules)
- a write to a live database, a migration on shared data, or anything else hard to undo
- a product or design decision with no clear right answer (removing a feature, changing user-visible behavior)
- a new dependency, a public API/route change, or a refactor so large it should be its own PR

Never invent a domain, copy or content to close a finding.

Never write to the database through MCP. Writing a migration file is fine; applying it is a go-ahead item.

## Report

Terse. No prose, no praise.

```
## Fixed
file:line - what. why.

## Needs your go-ahead
1. file:line - problem. why not fixed. what you need from the user.
```

Number the go-ahead items so the user can answer by number. Run typecheck/lint after fixes.
