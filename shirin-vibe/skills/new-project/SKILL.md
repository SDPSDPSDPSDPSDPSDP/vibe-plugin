---
name: new-project
description: Scaffold a new project from Shirin's template repo - asks what is being built (personal or work, Next.js frontend, Python API, ML training), prunes the template to those modules, fills in names and config, runs the checks and lists the manual steps left. Use when the user says "new project", "start a project", "scaffold", "set up a skeleton", or /new-project.
---

# New Project

Workflow only. All scaffolding logic (modules, valid combinations, questions,
placeholders, checks, manual steps) lives in the template's `MODULES.md`, applied
by its `template/prune.sh`. Follow `MODULES.md` exactly. Never prune by hand,
never improvise a module, question or step it does not have.

Template: `https://github.com/SDPSDPSDPSDPSDPSDP/data-science-template.git` (private; git credentials from this machine).

## 1. Get the template

- Current directory has `MODULES.md` and `template/prune.sh`: user cloned it, work there.
- Otherwise ask for the project folder name and parent (default `C:\Users\sdepreeu\Code\`), then:

```
git clone --depth 1 <template-url> <folder>
rm -rf <folder>/.git && git -C <folder> init -b main
```

Read all of `MODULES.md` now. The script deletes it.

## 2. Ask

Ask the questions in `MODULES.md` section 5 with AskUserQuestion, round by round,
only what applies. Unsupported combination (section 2): say so and stop.

## 3. Prune

Run `template/prune.sh` with the chosen modules, per the usage at the top of
`MODULES.md`. Error: relay the message and stop.

## 4. Fill in

Apply `MODULES.md` section 6, plus the "If no" effects from the section 5 answers.

## 5. Verify

Run everything in `MODULES.md` section 7. Fix failures; do not hand over a red skeleton.

## 6. Report

Terse. What was kept, what was verified, then the manual steps from `MODULES.md`
section 8 that apply.
