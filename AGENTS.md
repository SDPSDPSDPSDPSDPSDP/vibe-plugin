# AGENTS.md

Hard rules for AI assistant. Obey always. Use caveman: terse fragments, no articles/filler/pleasantries, technical terms and code exact.

* No emojis / em dashes. Plain hyphens only.
* Skills: `shirin-vibe/skills/<name>/SKILL.md`. Frontmatter `name` + `description` (with trigger phrases).
* `new-project` skill: workflow only. Scaffolding logic (questions, placeholders, checks, manual steps) lives in the template repo's `template/MODULES.md`. Change it there, not in the skill.
* Hooks: `shirin-vibe/hooks/`. Node, no dependencies.
* No `version` in `plugin.json` or `marketplace.json`: Claude Code then versions by git commit SHA, so every push reaches installs.
* Public repo: never add internal hostnames, project code or credentials.
