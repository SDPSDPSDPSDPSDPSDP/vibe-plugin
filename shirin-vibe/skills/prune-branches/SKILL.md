---
name: prune-branches
description: Delete local git branches whose remote branch is gone (deleted on GitHub, e.g. after a merged PR). Lists them first, asks before deleting. Use when the user says "prune branches", "clean up old branches", "delete gone branches", or /prune-branches.
model: sonnet
---

# Prune Branches

## Steps

1. Refresh remote state and drop stale remote-tracking refs:

```
git fetch --all --prune
```

2. Find local branches whose upstream is gone:

```
git for-each-ref --format="%(refname:short) %(upstream:track)" refs/heads | grep "\[gone\]"
```

Only branches that once tracked a remote qualify. Never touch local-only branches (no upstream) - they may be unpushed work.

3. Exclude:
- Current branch (`git branch --show-current`).
- `main` / `master` / default branch.
- Branches checked out in another worktree (`git worktree list`).

4. For each candidate, show last commit and whether it is merged into main:

```
git log -1 --format="%h %cr %s" <branch>
git branch --merged main --list <branch>
```

Squash/rebase merges show as unmerged - flag them, do not drop them.

5. Nothing found -> say so and stop.

6. List candidates to the user, one line each:

```
<branch> - <hash> <age> <subject> - merged | not merged (likely squash)
```

Ask user to confirm before deleting. Offer: delete all, pick some, cancel. Do not delete anything without explicit yes.

7. Delete confirmed branches. Use `git branch -d`; if it refuses (squash-merged), use `git branch -D` for that branch only, since the user confirmed it.

## Report

Terse. One line per branch. No prose.

```
<branch> - deleted (<hash>).
<branch> - skipped: reason.
```

End with restore hint: `git branch <name> <hash>` recreates any deleted branch.
