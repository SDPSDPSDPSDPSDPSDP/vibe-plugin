# shirin-vibe

Claude Code plugin marketplace with Shirin's skills and hooks. Public on purpose:
it holds no project code and no internal infrastructure details. Projects are
scaffolded from the private template repo with `/new-project`.

## Install

Projects from the template enable it through `.claude/settings.json`. Elsewhere:

```
/plugin marketplace add SDPSDPSDPSDPSDPSDP/vibe-template
/plugin install shirin-vibe@shirin-vibe
```

## Contents

| | |
|---|---|
| `/new-project` | Scaffold a project from the template: ask, prune, fill in, verify |
| `/branch-cleanup`, `/codebase-cleanup` | Project rules, simplify, readability, comments, dedupe, file size |
| `/architecture-review`, `/db-audit` | Read-only reviews |
| `/prune-branches` | Delete local branches whose remote is gone |
| Stop hook | `tsc --noEmit` (TypeScript) / `ruff` + `mypy` (Python) on changed projects |
| UserPromptSubmit hook | Re-injects the caveman response style on every prompt |
