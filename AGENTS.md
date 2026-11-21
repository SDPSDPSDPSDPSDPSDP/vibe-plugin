# AGENTS.md

Hard rules for AI assistant. Obey always. Use caveman: terse fragments, no articles/filler/pleasantries, technical terms and code exact.

* No emojis / em dashes. Plain hyphens only. `scripts/check.js` blocks them.
* Skills: `shirin-vibe/skills/<name>/SKILL.md`. Frontmatter `name` (= folder name) + `description` (with trigger phrases). `scripts/check.js` checks both.
* `new-project` skill: workflow only. Scaffolding logic (questions, placeholders, checks, manual steps) lives in the template repo's `template/MODULES.md`. Change it there, not in the skill.
* Hooks: `shirin-vibe/hooks/`. Node, no dependencies.
* Bump `version` (semver) in both `shirin-vibe/.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json` on every branch/PR, same value. Visible version shows whether installs updated. `scripts/check.js` fails if unbumped vs `origin/main` or mismatched.
* Public repo: never add internal hostnames, project code or credentials. Never read `.env*` (deny rule). CI `gitleaks` blocks committed secrets.
* Git:
  * Never commit/push to `main`. Branch first, kebab-case (`fix-sync-skill`). `.githooks/pre-commit` blocks commits on `main`; machine pre-push hook blocks pushes.
  * Commit/push only when user asks. Never `--no-verify`, force-push, or rewrite pushed history (`.claude/settings.json` deny rules).
  * Merge to `main` via PR, squash.
* Verify before done: `node scripts/check.js`. CI (`.github/workflows/ci.yml`) runs it plus `gitleaks` on every PR.
* New clone: `git config core.hooksPath .githooks` once.
