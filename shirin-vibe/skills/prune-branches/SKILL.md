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

4. For each candidate, show last commit and its merged PR:

```
git log -1 --format="%h %cr %s" <branch>
gh pr list --state merged --head <branch> --json number --jq '.[0].number'
```

Do not use `git branch --merged main`: squash merges never put the branch's commits in main's history, so it reports every squash-merged branch as unmerged. If `gh` is unavailable, say so and label every candidate `unknown`.

5. Nothing found -> say so and stop.

6. List candidates to the user, one line each:

```
<branch> - <hash> <age> <subject> - merged (#<pr>) | no merged PR
```

Flag `no merged PR` branches separately: their remote was deleted without a merge, so they may hold unmerged work.

Ask user to confirm before deleting. Offer: delete all, pick some, cancel. Do not delete anything without explicit yes.

7. Delete confirmed branches with `git branch -D` (`-d` refuses squash-merged branches). Record each hash first for the report.

## Report

Terse. One line per branch. No prose.

```
<branch> - deleted (<hash>).
<branch> - skipped: reason.
```

End with restore hint: `git branch <name> <hash>` recreates any deleted branch.
