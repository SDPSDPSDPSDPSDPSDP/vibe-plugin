---
name: codebase-cleanup
description: Clean up the entire codebase - sync rules from the template, enforce project rules, simplify, readability, strip stale comments, dedupe, audit file size across all tracked source files, then run deslop, architecture review, DB, security and performance audits, then agent-ready (researches agentic coding best practice online) (each fixes what it can), then prune gone local branches. Scope defaults to the whole codebase, or a folder/path the user names. Use when the user says "clean the codebase", "codebase cleanup", "clean everything", "run codebase cleanup on <folder>", or /codebase-cleanup.
---

# Codebase Cleanup

Clean the codebase. Orchestrator - same checks as branch-cleanup plus `clean-comments`, but scope is every tracked source file (or the paths the user names), not just the branch diff.

## Scope

Scope comes from the user. Always follow what they ask for:
- User names folders/paths (e.g. "run codebase cleanup on src/components") -> scope is only those paths: `git ls-files <path>...`
- No scope given -> entire codebase: `git ls-files`

Scope is where to look first, not a limit. Fix issues found outside scope or pre-existing issues too.

Drop non-source files: lockfiles, generated code, build output, vendored deps, binaries, images, fonts, migrations. Pass the remaining list to each check.

## Checks

Run each skill in order, passing it the in-scope file list. Apply only justified changes - skip a check if nothing in scope qualifies.

**All steps strictly sequential. Never run them in parallel.** One check at a time. Wait for it to finish fully before starting the next - each check edits files the next one reads. If your tool supports subagents, delegate each skill to one, but spawn only one subagent at a time and wait for its result (never background it, never launch two in the same turn).

Each check fixes what it is confident about and returns a numbered "needs your go-ahead" list instead of stopping to ask. Collect those lists. Do not ask the user anything until the final report (except `prune-branches`).

**Models:** every check subagent (steps 1-13) uses `model: sonnet`, except `architecture-review` and the security audit, which use `model: opus` - they reason across the whole codebase and run rarely.

1. `sync-template-rules` - repo-wide, ignores file scope. Runs first so later checks enforce the latest rules.
2. `project-rules`
3. `simplify-code`
4. `readability`
5. `clean-comments`
6. `detect-duplication` - look for duplication across all files in scope, not just within one file
7. `review-file-size`
8. `deslop`
9. `architecture-review` - runs on the cleaned-up code.
10. `db-audit`
11. Security audit - no skill. Subagent prompt: "Do a complete security audit of this codebase like an expert. Follow the Fix or ask rules in the `db-audit` skill."
12. Performance audit - no skill. Subagent prompt: "Do a complete performance audit of this codebase like an expert. Follow the Fix or ask rules in the `db-audit` skill."
13. `agent-ready` - repo-wide, ignores file scope. Last check, so it sees the final code and rules.
14. `prune-branches` - repo-wide, ignores file scope. Runs last because it waits for user confirmation before deleting.

Steps 8-13 cover the whole codebase by default. If the user named a scope, tell them to limit the work to those paths.

## After changes

1. Run typecheck/lint for the project (see project's own docs/AGENTS.md for exact commands).
2. Report what changed and what was skipped.

## Report

Terse. No prose, no praise.

```
## Changed
file:line - what. why.

## Needs your go-ahead
1. file:line - problem. why not done. what you need from the user.
```

Put the `sync-template-rules` report first. Then one `Changed` section grouped by check. Then the deslop manual browser checklist and the `prune-branches` result.

End with one merged `Needs your go-ahead` list from all checks, numbered across the whole run so the user can answer by number. Drop duplicates. This list is the last thing in the reply.
