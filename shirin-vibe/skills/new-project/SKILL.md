---
name: new-project
description: Scaffold a new project from Shirin's template repo - asks what is being built (personal or work, Next.js frontend, Python API, ML training), prunes the template to those modules, fills in names and config, runs the checks and lists the manual steps left. Use when the user says "new project", "start a project", "scaffold", "set up a skeleton", or /new-project.
---

# New Project

The template repo holds every stack. Its `MODULES.md` defines the modules, valid
combinations and placeholders; its `template/prune.sh` applies the pruning. Never
prune by hand and never improvise a module the template does not have.

Template: `https://github.com/SDPSDPSDPSDPSDPSDP/data-science-template.git` (private; git credentials from this machine).

## 1. Get the template

- If the current directory already has `MODULES.md` and `template/prune.sh`, the user cloned it: work there.
- Otherwise ask for the project folder name and parent (default `C:\Users\sdepreeu\Code\`), then:

```
git clone --depth 1 <template-url> <folder>
rm -rf <folder>/.git && git -C <folder> init -b main
```

Read `MODULES.md` before asking anything. It wins over this skill when they disagree.

## 2. Ask

Use AskUserQuestion. Ask in rounds, only what applies.

**Round 1**
- Name: kebab-case service name (also the repo name). Plus a one-line description.
- Track: personal or work.

**Round 2** (only valid options for the chosen track, per `MODULES.md` section 2)
- personal: `web` is the only option today. Say so instead of asking.
- work: deployable `web` (Next.js) or `api` (FastAPI). If `api`: with `ml` training code? Private Artifactory packages (`work-artifactory`)?
- User wants web + api at work: explain one deployable per repo, offer to scaffold the second one after this.

**Round 3** (details)
- personal:
  - Supabase project: public (multi-user, row-level RLS `auth.uid() = user_id`) or private (single-user, RLS helper function)? Schema name?
  - Cloudflare R2 media storage + Worker? (If no: delete `worker/`, the R2 lines in `.env.example`, the R2 sections of `docs/personal/ARCHITECTURE.md`, and `npm uninstall @aws-sdk/client-s3 @aws-sdk/s3-request-presigner`.)
- work:
  - Harbor project (`REPOSITORY_NAMESPACE`): offer the team projects listed in `pipeline/docs/harbor.md`, or other.
  - Db2? If no: delete `database/` and the Db2 lines in `AGENTS.md` and `pipeline/README.md`.
  - App secrets (names only, never values): each becomes a `secret-<name>` block + `secretProperties` in `pipeline/helm/values.yaml` and a `--set-string` line in `pipeline/ci/deploy.yml`, per the comments there.
  - `work-artifactory`: Artifactory host from `pipeline/docs/artifactory.md` (production host unless the user says otherwise).

## 3. Prune

```
./template/prune.sh <personal|work> <web|api> [ml] [work-artifactory]
# with work-artifactory:
ARTIFACTORY_HOST=<host from pipeline/docs/artifactory.md> ./template/prune.sh work api work-artifactory
```

If it exits with an error, relay the message and stop. It deletes `MODULES.md` and itself, so read them first.

## 4. Fill in

- Name: work -> `./pipeline/rename-service.sh <name>`. Personal -> replace `my-service` and `My Service` in every tracked file (no script there).
- `README.md`: real description, drop placeholder text.
- work: `REPOSITORY_NAMESPACE` in `.gitlab-ci.yml`; secrets wired as asked.
- personal: `<project-ref>`, `<schema-name>`, `<region>` in `package.json` (`types` script), `docs/personal/DATABASE.md`, `.env.example`; `worker/wrangler.toml` (`<app-name>`, `<r2-bucket-name>`, `APP_ORIGIN`).
- personal + Supabase MCP available: create the schema in the chosen project (`apply_migration`), with the RLS pattern chosen. Otherwise list it as a manual step.

## 5. Verify

All must hold before reporting done. Fix failures; do not hand over a red skeleton.

- `grep -rn ">>> module\|<<< module\|my-service\|My Service\|my-harbor-project\|<artifactory-host>" . --exclude-dir=node_modules --exclude-dir=.venv --exclude-dir=.git` finds nothing (ignore lockfile hits before relocking).
- api: `uv lock`, `uv sync`, `uv run ruff check .`, `uv run ruff format --check .`, `uv run mypy api`, `uv run pytest`.
  With `work-artifactory`, `uv lock` needs `UV_INDEX_ARTIFACTORY_USERNAME/_PASSWORD`; without them, say so and point to the manual `Relock Dependencies` CI job.
- web: `npm install`, `npm run lint`, `npm run typecheck`, `npm run build` (personal: set dummy `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` for the build).

Then `git add -A && git commit -m "Scaffold <name> from template"`.

## 6. Report

Terse. What was kept, what was verified, then the manual steps, only those that apply:

- **work**
  - Create the project on the internal GitLab, push.
  - Walk `pipeline/README.md` > Checklist: DNS request in ServiceNow, Harbor access, `PRJ_*` CI/CD variables.
  - web: `NPM_REGISTRY` CI/CD variable (`pipeline/docs/artifactory.md`).
  - Secrets: create each as a masked CI/CD variable, set `PRJ_SECRET_ENABLED=true`.
- **personal**
  - Create the GitHub repo, push.
  - Create the Vercel project, add the env vars from `.env.example`, confirm function region `dub1` (Project Settings > Functions).
  - Deployment Retention Policy: canceled 1 day, errored 1 day, pre-production 1 week, production 30 days. Set via the Vercel MCP if available, else manual (Project Settings > Security).
  - R2: create the private bucket, CORS allowing the app origin; `npx wrangler deploy` in `worker/`.
