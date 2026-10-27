---
name: codebase-cleanup
description: Clean up the entire codebase - enforce project rules, simplify, readability, strip stale comments, dedupe, audit file size across all tracked source files, then run deslop audit, architecture review and DB audit, then prune gone local branches. Scope defaults to the whole codebase, or a folder/path the user names. Use when the user says "clean the codebase", "codebase cleanup", "clean everything", "run codebase cleanup on <folder>", or /codebase-cleanup.
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

**Steps 1-6 strictly sequential. Never run them in parallel.** One check at a time. Wait for it to finish fully before starting the next - each check edits files the next one reads. If your tool supports subagents, delegate each skill to one, but spawn only one subagent at a time and wait for its result (never background it, never launch two in the same turn).

**Steps 7-9 run in parallel** once steps 1-6 are all done. They are read-only audits, so they cannot conflict. Launch all three subagents in the same turn and wait for all of them before step 10.

1. `project-rules`
2. `simplify-code`
3. `readability`
4. `clean-comments` - run on Sonnet (subagent with `model: sonnet`)
5. `detect-duplication` - look for duplication across all files in scope, not just within one file
6. `review-file-size`
7. `deslop` - report only, no fixes.
8. `architecture-review` - report only, no fixes. Runs on the cleaned-up code.
9. `db-audit` - report only, no fixes.
10. `prune-branches` - repo-wide, ignores file scope. Runs last because it waits for user confirmation before deleting.

Steps 7-9 cover the whole codebase by default. If the user named a scope, tell them to limit the review to those paths.

## After changes

1. Run typecheck/lint for the project (see project's own docs/AGENTS.md for exact commands).
2. Report what changed and what was skipped.

## Report

Terse. One line per item, grouped by file. No prose, no praise.

```
file:line - changed: what. why.
file:line - skipped: what. why.
```

Then append the `deslop` audit and manual browser checklist, and the `architecture-review`, `db-audit` and `prune-branches` reports as-is, each under its own heading.
