# Agent-ready baseline (Nov 2026)

## Instruction files
- Root `AGENTS.md` is source of truth. `CLAUDE.md` = `@AGENTS.md` (import, not symlink).
- Under 200 lines. Cut anything the agent can learn from the code, and generic advice.
- Must have: exact commands (install, dev, typecheck, lint, test, single test), definition of done, where new code goes, patterns not to copy, do-not-modify paths, ask-first actions.
- Imperative, concrete. No ALL-CAPS emphasis. No stale paths/commands. No contradictions across rule files.
- Path-specific rules in `.claude/rules/*.md` with `paths:`. Monorepo: nested `AGENTS.md`. Long docs linked, not inlined.

## Verification
- One script per check, same names locally and in CI. Ideally one `check` script.
- Fast. Works on clean clone. Tests run without network/secrets.
- Strict types (TS `strict`, mypy/pyright), linter, formatter.

## Guardrails
- Hard rules as hooks or `permissions.deny`, not prose.
- `.claude/settings.json`: allow safe checks, deny `.env`/secrets reads and destructive commands.
- Hooks: format on edit, protect generated/lock files, typecheck on `Stop`. Cross-platform scripts.

## Setup
- `.env.example` complete. Pinned runtime versions. No interactive prompts in scripts.

## Code
- Clear domain names, no abbreviations, few duplicate filenames (`index.ts`, `utils.ts`).
- Small files. No dead code. One way to do each thing.
- Comments say why, not what.
