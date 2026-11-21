---
name: sync-template-rules
description: Update the current repo's rule and docs markdown (AGENTS.md, CLAUDE.md, docs/**, module READMEs) and the tooling that enforces those hard rules (pre-commit hooks, ruff/mypy/pytest config, rule tests, ESLint/Stylelint/husky, Claude deny list, CI gates) to match the latest version in Shirin's data science template repo. Keeps project-specific additions. Use when the user says "sync template rules", "update rules from template", "is this repo up to date with the template", or /sync-template-rules. Also run by branch-cleanup and codebase-cleanup.
---

# Sync Template Rules

Projects are scaffolded from the template (`/new-project`), then the template keeps evolving. This skill pulls the template's newer rules into the current repo, plus the tooling that enforces them. A hard rule without its enforcer is only half synced.

Template: `https://github.com/SDPSDPSDPSDPSDPSDP/data-science-template.git` (private; git credentials from this machine).

## 1. Get the template

Local checkout first: find it via the `my-projects` MCP (`find_project` `data-science-template`, `local_dirs`), usually `~/Code/Common/Data Science Template`. Use its committed `HEAD`, never its uncommitted changes:

```
git -C <checkout> archive HEAD | tar -x -C <tmp>/template
```

No local checkout: shallow clone into a temp dir outside the repo (`git clone --depth 1 <template-url> <tmp>/template`). Delete the temp copy when done. Both fail: report and stop.

## 2. Pick files

Compare `git ls-files '*.md'` in the template against the repo, same relative path.

- Path exists in both: compare.
- Path only in template, under a folder the repo has (e.g. `docs/python/`, `api/`): candidate new file. Add it.
- Path only in template, folder missing in repo: module or track the project did not pick. Skip silently.
- Always skip: `template/`, `todo.md`, root `README.md`, `*.example/`. Template-only or project-specific.
- Web at root (section 4): template `docs/web/CODING-STANDARDS.md` pairs with repo `docs/CODING-STANDARDS.md` when `docs/web/` is missing.

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

## 4. Enforcers

Template hard rules name their enforcer (pre-commit hook id, test file, ruff ban, Stylelint rule, deny entry, CI step). For each hard rule the repo now has, check its enforcer exists in the repo and matches the template.

Modules the repo has (only these count):
Detect by what the repo holds, never by folder name: a module applies to whatever folder holds its code.
- `api` (Python): root `pyproject.toml` exists. Template `api/` maps to the repo's Python source dirs (`[tool.setuptools.packages]`, `[tool.hatch...] packages`, or top-level dirs with `.py` files). Use them wherever the template names `api` (`SOURCE_DIRS`, mypy `files`, `--cov`, ruff `per-file-ignores`). API-only rules (FastAPI, `get_settings()` / `tests/test_settings.py`, `os.getenv` ban pointing at settings) apply only when the repo has that layer; else skip and report.
- `ml`: `shared/` or a `train`/`ml` extra exists.
- `web`: `web/` exists, or Next.js app at repo root (root `package.json` depends on `next`). Web at root: every template `web/<path>` maps to repo `<path>`, in enforcer files, AGENTS.md paths (`web/src/...` -> `src/...`) and commands (no `cd web`, no `working-directory: web`). Never create a `web/` folder.
- `personal`: `.github/workflows/ci.yml` or `database/schema.sql`. `work`: `.gitlab-ci.yml`.

Enforcer files, per module:

| Module | Files |
|---|---|
| core | `.claude/settings.json` (`permissions.deny`), `.gitattributes` |
| `api` | `.pre-commit-config.yaml`, `pyproject.toml` (`[tool.ruff*]`, `[tool.mypy*]`, `[tool.pytest*]`, `[tool.coverage*]`, `[dependency-groups] dev`), `tests/test_text_chars.py`, `tests/test_file_size.py`, `tests/test_settings.py`, `tests/conftest.py` |
| `web` | `web/eslint.config.mjs`, `web/stylelint.config.mjs`, `web/.prettierignore`, `web/vitest.config.mts`, `web/src/fileSize.test.ts`, `web/.husky/pre-commit`, `web/package.json` (`scripts` lint/typecheck/test/format/prepare, `lint-staged`, `prettier`, lint/test `devDependencies`) |
| `personal` | `.github/workflows/ci.yml` (gate steps) |
| `work` | `pipeline/ci/python.yml`, `pipeline/ci/web.yml` (gate jobs) |

Template files hold module marker blocks (`# >>> module: <name>` ... `# <<< module: <name>`, `//` in JS/TS). Before comparing: drop blocks of modules the repo lacks, keep lines of modules it has, strip marker lines. Never copy markers into the repo.

Merge per file:
- Hook, lint rule, ban, deny entry, script, CI gate step in template, missing or older in repo -> add/update to template.
- Removed in template, still in repo, clearly template-origin -> remove.
- Project additions (extra hooks, bans, per-file-ignores, deny entries, CI steps, runtime deps) -> keep.
- Never touch `[project]` runtime dependencies, app code, or filled placeholders.
- Rule test file missing (`test_text_chars.py`, `test_file_size.py`, `fileSize.test.ts`, ...) -> copy from template. Repo test runner differs (e.g. `node --test` instead of Vitest) -> port the test to the repo's runner, keep the runner. `SOURCE_DIRS`-style lists: keep only dirs the repo has.
- Never relax a repo limit that is stricter than the template.

Then wire it up:
- Dev tools added: `uv lock` (api), `npm install` in `web/` or root (web). Edit JSON with a tool that writes UTF-8 without BOM.
- Git hook installed? With `web`: `git config --local core.hooksPath` ends in `.husky/_`; else `api`: `.git/hooks/pre-commit` exists. Missing -> run `npm install` in `web/` (husky `prepare`) or `uv run pre-commit install`.
- Husky newly installed: tell user next commit runs lint-staged, which hides unstaged changes during the run and keeps a backup in `git stash list` (`lint-staged automatic backup`). Uncommitted sync changes: tell user to commit them first.
- Run the checks AGENTS.md lists (`api`: `uv run ruff format .`, `uv run ruff check .`, `uv run mypy`, `uv run pytest`, `uv run pre-commit run --all-files`; `web`: `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm test`). Never `next build`.
- Autofix only (`ruff format`, `ruff check --fix`, `prettier --write`, `eslint --fix`, `stylelint --fix`). Remaining violations: list, do not hand-fix here (`project-rules` and later checks handle them). Never silence with `# noqa`, `eslint-disable`, `--no-verify`, or by loosening the new config.

## 5. Report

Terse. One line per item. No prose.

```
file - updated: what rule. from template.
file - added: new file from template.
file - skipped: what. why.
enforcer - added/updated: rule -> hook/test/ban/CI step. file.
hook - installed: pre-commit / husky.
violation - check: file:line count. rule.
```

Nothing differs: `Rules and enforcers up to date with template.`
