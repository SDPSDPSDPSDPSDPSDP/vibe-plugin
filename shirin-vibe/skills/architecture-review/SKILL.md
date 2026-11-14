---
name: architecture-review
description: Expert review of the codebase's architecture - whole codebase, or the files a branch touches and the feature it adds. Use when the user says "review the architecture", "architecture review", "review this branch's architecture", or /architecture-review. Fixes what it can, lists what needs the user's go-ahead. Also run by branch-cleanup and codebase-cleanup.
---

# Architecture Review

Review the architecture like an expert, including the database architecture. Use the Supabase MCP when available to check the live schema.

## Scope

- Given a file list from a branch (e.g. by branch-cleanup), or the user asks about this branch -> branch mode. Otherwise -> whole codebase.
- Branch mode: get the files with `git diff main...HEAD --name-only` if none were given. Read the full branch diff (`git diff main...HEAD`) to understand the feature, then read the code it touches and calls, not just the diff. Take a critical look at both the files and the feature:
  - Does the feature fit the existing architecture (layers, module boundaries, data flow, naming, where code lives), or does it invent a parallel way?
  - Does it duplicate a responsibility an existing module already owns?
  - Coupling: new dependencies between modules, leaky abstractions, domain logic in the wrong layer.
  - Schema, API and config changes: consistent with what exists, migration-safe.
  - Would the design still hold for the next obvious change, without speculative abstractions?
- Scope is where to look first, not a limit. Fix architecture problems the branch exposes in surrounding code too.

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
