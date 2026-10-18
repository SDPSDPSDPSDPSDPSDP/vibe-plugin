---
name: readability
description: Make the current branch's changed files easier to read - break up dense expressions, name complex conditions, remove repeated literals. No behavior changes. Use when the user says "readability", "make this readable", "readability audit", or /readability. Also run by branch-cleanup and codebase-cleanup.
---

# Readability

## Scope

If given a file list (e.g. by branch-cleanup), use it. User names files/folders -> `git ls-files <path>...`. Otherwise get changed files vs main:

```
git diff main...HEAD --name-only
```

## Steps

Find candidates with a grep pass first, then read each hit in context:

- Lines over ~100 chars (Python) / ~120 (TS), ignoring strings, descriptions, docstrings.
- Nested ternaries: `x if a else (y if b else z)`, `a ? b : c ? d : e`.
- Mixed `and`/`or` without parens.

Then fix what hurts a reader:

- **Dense expression** -> split into named intermediate variables. A boolean mask or condition gets a name that says what it means (`has_conf`, `is_finished`).
- **Nested ternary** -> plain `if`/`else`.
- **Same condition repeated across props/branches** (e.g. `isEmpty ? undefined : ...` on five props) -> compute once, spread one object or branch once.
- **Repeated literal list** (column names, keys, paths) in more than one file -> one named constant, imported where needed.
- **Hand-built strings with many interpolations** -> build from an array and `join`.
- **Repeated micro-logic** (pluralizing, className toggles) -> reuse the project helper, or add one small helper if none exists.
- **Redundant iteration** (`zip(df.index, df.iterrows())`) -> the direct form.
- **Long function mixing steps** -> extract steps into well-named functions, only when each step stands alone.

Do not:

- Change behavior. Defensive code that looks redundant (re-validation, sanitizing) may be load-bearing - grep its tests before removing.
- Add abstractions, classes, or config for readability's sake.
- Reformat what a formatter (Prettier, ruff format) already owns.
- Rename public APIs.

Scope is where to look first, not a limit. Fix issues found outside scope or pre-existing issues too. Only justified changes.

## After changes

Run the project's tests and typecheck (see project's own docs/AGENTS.md for exact commands).

## Report

Terse. One line per item. No prose.

```
file:line - changed: what. why.
file:line - skipped: what. why.
```
