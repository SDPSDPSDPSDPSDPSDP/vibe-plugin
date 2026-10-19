# AGENTS.md

Hard rules for AI assistant. Obey always. Use caveman: terse fragments, no articles/filler/pleasantries, technical terms and code exact.

* No emojis / em dashes. Plain hyphens only.
* Skills: `shirin-vibe/skills/<name>/SKILL.md`. Frontmatter `name` + `description` (with trigger phrases).
* `new-project` skill: workflow only. Scaffolding logic (questions, placeholders, checks, manual steps) lives in the template repo's `template/MODULES.md`. Change it there, not in the skill.
* Hooks: `shirin-vibe/hooks/`. Node, no dependencies.
* Bump `version` in `shirin-vibe/.claude-plugin/plugin.json` on every change, or installs will not update.
* Public repo: never add internal hostnames, project code or credentials.
