---
name: branch-cleanup
description: Clean up the current branch's changed files before merge - enforce project rules, simplify, readability, dedupe, audit file size, then review the architecture of the touched files and the feature they add. Use when the user says "clean this branch", "branch cleanup", or /branch-cleanup.
---

# Branch Cleanup

Clean this branch before merge. Orchestrator - runs the checks below against changed files.

## Scope

Get changed files vs main:

```
git diff main...HEAD --name-only
```

Scope is where to look first, not a limit. Fix issues found outside scope or pre-existing issues too.

## Checks

Run each skill in order, passing it the in-scope file list. Apply only justified changes - skip a check if nothing in scope qualifies.

**Strictly sequential. Never run checks in parallel.** One check at a time. Wait for it to finish fully before starting the next - each check edits files the next one reads. If your tool supports subagents, delegate each skill to one with `model: sonnet` (`architecture-review` uses `model: opus`) - keeps each check's file-reading out of your own context - but spawn only one subagent at a time and wait for its result (never background it, never launch two in the same turn).

1. `project-rules`
2. `simplify-code`
3. `readability`
4. `detect-duplication`
5. `review-file-size`
6. `architecture-review` - branch mode, runs on the cleaned-up code. Fixes what it is confident about, returns a numbered "needs your go-ahead" list. Do not ask the user until the final report.

## After changes

1. Bump semver for this branch's changes. Find version file(s) (`package.json`, `pyproject.toml`, `.claude-plugin/plugin.json`, etc.). Pick bump from full branch diff vs main: major - breaking change (removed/renamed public API, CLI flag, config key, skill); minor - new feature, backward compatible; patch - fix, refactor, docs, cleanup only. Compare to main's version (`git show main:<file>`) - bump once per branch, not per run. If branch already bumped enough, leave it; if bumped too little, raise it. Keep all version files and lockfiles in sync. Skip if project has no version.
2. Run typecheck/lint for the project (see project's own docs/AGENTS.md for exact commands).
3. Report what changed and what was skipped, including version bump (`old -> new`, why).

## Report

Terse. One line per item, grouped by file. No prose, no praise.

```
file:line - changed: what. why.
file:line - skipped: what. why.

## Needs your go-ahead
1. file:line - problem. why not done. what you need from the user.
```

End with the `architecture-review` go-ahead list, numbered so the user can answer by number. Omit the section if empty.
