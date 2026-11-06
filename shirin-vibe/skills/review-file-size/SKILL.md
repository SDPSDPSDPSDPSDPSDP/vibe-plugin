---
name: review-file-size
description: Split the current branch's changed files over 200 LOC, then review files over 100 LOC (ideal around 100) along real responsibility boundaries. Use when the user says "review file size" or /review-file-size. Also run by branch-cleanup.
---

# Review File Size

## Scope

If given a file list (e.g. by branch-cleanup), use it. Otherwise get changed files vs main:

```
git diff main...HEAD --name-only
```

## Steps

Ideal: code files around 100 LOC. 200 LOC is the hard ceiling, not the target. Two passes, always both.

Get file sizes from ESLint (`max-lines`, `max-depth`, `complexity` rules in the project config), not by counting:

```
npx eslint --format compact <files in scope>
```

No ESLint in project -> use `wc -l`.

### Pass 1: large offenders (over 200 LOC)

Every file over 200 LOC must be split, no exceptions for "it's still readable". The number decides WHETHER to split; responsibilities decide WHERE. Cut along real boundaries (separate concerns, sub-components, helpers, types) - never mid-function or into arbitrary part1/part2 files. Aim the resulting files at around 100 LOC, not just under 200.

### Pass 2: toward 100 LOC

Always run, after pass 1. Check every file in scope over 100 LOC, including files created in pass 1. Here splits are a judgment call: split where a real responsibility boundary exists and the parts read better alone. Cohesive file (one component, one module doing one job) stays as is, even at 180 LOC. Never split just to hit the number, but do not stop at "under 200" either.

Only exceptions: generated code, data/constant tables, test fixtures. Report them as kept.

Scope is where to look first, not a limit. Fix issues found outside scope or pre-existing issues too.

## Report

Terse. One line per file. No prose.

```
file - split into: new files. why.
file - kept at N LOC. exception: generated/data/fixture.
file - kept at N LOC (100 LOC pass). why: cohesive, no clean boundary.
```
