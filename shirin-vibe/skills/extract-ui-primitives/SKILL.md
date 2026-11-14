---
name: extract-ui-primitives
description: Extract every generic UI primitive (button, field, icon, error text, title, swatch, badge) out of feature components and pages into the project's UI primitives folder, one folder per primitive, even when used only once. Use when the user says "extract ui primitives", "extract components", "split out primitives", or /extract-ui-primitives. Also run by codebase-cleanup.
---

# Extract UI Primitives

Feature components and pages compose primitives; they do not style raw elements themselves. Every generic UI piece gets its own component, even if used once, so feature code reads as composition.

Skip this skill if the project has no UI code (React/JSX/TSX or similar).

## Scope

If given a file list (e.g. by codebase-cleanup), use it. User names files/folders -> `git ls-files <path>...`. Otherwise get changed files vs main:

```
git diff main...HEAD --name-only
```

Keep only UI files: components, pages, their style modules.

## Where primitives live

Read the project's docs/AGENTS.md first. Use the folder and naming convention it defines for dumb primitives (e.g. `src/components/ui/<kebab-name>/<PascalName>.tsx` plus `<PascalName>.module.css`). Use the existing primitives there as the style reference. No convention -> follow what existing primitives do; none exist -> `src/components/ui/<kebab-name>/`.

## Find candidates

Grep in scope for raw styled elements and inline markup in feature components and pages:

- `<button`, `<input`, `<select`, `<textarea`, `<label` with a `className`
- `<h1`-`<h6` and `<p` with a styling class (titles, error/status text, hints)
- inline `<svg` -> one component per icon
- small repeated visual units: chip, swatch, badge, tag, avatar, card, divider
- CSS module rules in feature styles that only style one of the above

Also check primitives that live in a feature folder but contain no domain logic (a generic number field inside a feature folder) -> move them to the primitives folder.

## Extract

For each candidate:

- **Generic only.** Props are generic (`label`, `value`, `color`, `onClick`, `children`, `variant`). Never import domain types, data models, or business logic. If it needs domain knowledge, leave it in the feature folder.
- **Move the styles with it.** Visual rules (padding, colors, typography, hover, focus) go to the primitive's style module. Feature styles keep only layout and positioning for that usage (`position`, `top`, grid placement), passed in via an optional `className`.
- **Variants over copies.** Two button styles -> one `Button` with a `variant` prop, not two components. Shared SVG attributes across icons -> one base `Icon` plus one small component per icon.
- **Same markup and styles in 2+ places** (titles, error text) -> one primitive, replace every copy, delete the duplicated CSS. If copies differed slightly, unify and report the visual difference.
- **Keep behavior.** Same element, same attributes, same handlers. Accessibility improvements are fine (`role="alert"` on error text, `aria-hidden` on decorative icons); report them.
- Remove placeholder files (`.gitkeep`) from folders that now hold files.

Do not extract:

- Layout containers specific to one page (`<main>` wrappers with unique flex/grid setup).
- Sub-parts whose styling depends on the parent's state (an icon badge that changes on the parent's hover) - they belong to the parent primitive.
- Domain views (a pattern canvas, an order table) - those stay feature components that compose primitives.

Scope is where to look first, not a limit. Fix issues found outside scope or pre-existing issues too. Only justified changes.

## After changes

Run the project's typecheck, lint and tests (see project's own docs/AGENTS.md for exact commands). List manual browser checks for every screen that changed (URL, action, expected result).

## Report

Terse. One line per item. No prose.

```
file:line - extracted: what, into where.
file:line - moved: what, from where to where. why.
file:line - skipped: what. why.
visual change: what. where.
```
