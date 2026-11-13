---
name: sync-template-rules
description: Update the current repo's rule and docs markdown (AGENTS.md, CLAUDE.md, docs/**, module READMEs) to match the latest version in Shirin's data science template repo. Keeps project-specific additions. Use when the user says "sync template rules", "update rules from template", "is this repo up to date with the template", or /sync-template-rules. Also run by codebase-cleanup.
---

# Sync Template Rules

Projects are scaffolded from the template (`/new-project`), then the template keeps evolving. This skill pulls the template's newer rules into the current repo.

Template: `https://github.com/SDPSDPSDPSDPSDPSDP/data-science-template.git` (private; git credentials from this machine).

## 1. Get the template

Shallow clone into a temp dir outside the repo. Delete it when done.

```
git clone --depth 1 <template-url> <tmp>/template
```

Clone fails: report and stop.

## 2. Pick files

Compare `git ls-files '*.md'` in the template against the repo, same relative path.

- Path exists in both: compare.
- Path only in template, under a folder the repo has (e.g. `docs/python/`, `api/`): candidate new file. Add it.
- Path only in template, folder missing in repo: module or track the project did not pick. Skip silently.
- Always skip: `template/`, `todo.md`, root `README.md`, `*.example/`. Template-only or project-specific.

Repo is the template itself (has `template/MODULES.md`): report that and stop.

## 3. Compare and update

Template is source of truth for generic rules. Repo is source of truth for project-specific content.

Per file pair:
- Rule/section in template, missing or outdated in repo -> update repo to template wording.
- Rule removed or reversed in template, still in repo -> remove/update in repo.
- Content only in repo that is project-specific (names, filled placeholders, extra rules, project notes) -> keep.
- Template placeholders (`my-service`, `<Display Name>` etc.): never copy over filled-in repo values.
- Unclear whether repo text is a project override or stale template text -> leave it, report as skipped.

Edit in place. Keep the repo file's structure where the template's matches; otherwise follow the template's structure.

## 4. Report

Terse. One line per item. No prose.

```
file - updated: what rule. from template.
file - added: new file from template.
file - skipped: what. why.
```

Nothing differs: `Rules up to date with template.`
