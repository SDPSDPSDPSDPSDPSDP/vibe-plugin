---
name: deslop
description: Audit the app for every "vibe coded" / AI slop tell (default domains, missing metadata, generic 404/loading/empty/error states, broken SEO, console noise, responsive gaps, design drift, dead buttons), report only, no fixes. Use when the user says "deslop", "remove the AI slop", "make it not look vibe coded", "polish audit", or /deslop. Also run by codebase-cleanup.
---

# Deslop

Find every detail that makes someone think "AI slop" within five seconds. Report only, no fixes. The user decides what to fix after reading the report.

## Scope

If given a file list (e.g. by codebase-cleanup), use it. Otherwise use the whole app: `git ls-files`. If the user gives a live URL, check it too (fetch pages, headers, `robots.txt`, `sitemap.xml`, OG tags).

Browser-only checks (real screen sizes, console output at runtime, clicking through flows, social preview rendering) cannot be automated here. List them as manual checks for the user at the end.

## Checks

Check every item. Do not stop at the first hit per category. Read the code; do not assume a framework default covers it.

### Domain and identity
- Default or preview domain still in use: `*.vercel.app`, `*.netlify.app`, `*.pages.dev`, `*.workers.dev`, `localhost`, preview URLs in `metadataBase`, canonical URLs, OG URLs, sitemap, `robots.txt`, emails, README, env examples.
- Every page/route has its own `<title>` and meta description. No duplicates, no "Create Next App", no template or placeholder text, no title identical to the site name on every page.
- Favicon and app icons are custom, not the framework default. Apple touch icon present.
- Open Graph and Twitter card per page: title, description, image (1200x630), `og:url`. OG image exists at the referenced path.
- Canonical URL per page, pointing at the production domain.
- `manifest`/`site.webmanifest` name and theme color match the brand (if present).

### Boring pages
- Custom 404 page (`not-found`), on-brand, with a way back. Not the framework default.
- Custom error page/boundary (`error`, `global-error`) with a human message and a retry or way out.
- Loading states for every async view (`loading`, skeletons, button pending state). No blank screens, no layout jump when data arrives.
- Empty states for every list, table, search and dashboard: says what is missing and what to do next. Not a blank area or "No data".
- Error messages are specific and actionable. No raw `error.message`, stack traces, "Something went wrong", "An error occurred", or `[object Object]` shown to users.
- Form validation messages are inline and human.

### Structure and SEO
- Exactly one `h1` per page. Heading levels do not skip (`h2` to `h4`). Headings are not used only for styling.
- Every `img`/`Image` has meaningful `alt`. Decorative images use `alt=""`. No `alt="image"`, `alt="logo"` placeholders, or filenames.
- `sitemap` lists real public routes on the production domain, no dev or auth-only routes. `robots` is present and does not block production.
- `lang` attribute set on `<html>`.
- Semantic landmarks: `header`, `nav`, `main`, `footer`. Links are `<a>`/`Link`, actions are `<button>`. No clickable `div`.
- Placeholder content left over: lorem ipsum, "Your Company", "John Doe", example.com, fake testimonials, stock copy like "Unlock the power of", "Seamlessly", "Elevate your", "Revolutionize".

### Technical hygiene
- Leftover `console.log`/`console.debug`/`debugger` in client code. Server logs that the project rules require stay.
- Known runtime console errors: hydration mismatches (date/random in render), missing `key` props, unhandled promise rejections, 404s on referenced assets.
- Exposed dev files: `.env*` committed, source maps public in production, `/api/test`, debug routes, seed/admin pages without auth, `todo.md` or notes served from `public/`.
- Unused dependencies and dead files. Large deps imported for small use (whole icon packs, moment, lodash). Client components that could be server components. Heavy imports not code-split.
- Run the project build analyzer only if no dev server is running (see project rules); otherwise report bundle risks from imports.

### Responsiveness
- Layouts at 320px, 375px, 768px, 1024px, 1440px and very wide (2560px). Fixed widths/heights that overflow. Horizontal scroll on mobile.
- Long text: long names, long words, long URLs, translated strings. Missing `overflow-wrap`, `min-width: 0` in flex/grid children, truncation without a tooltip.
- Empty data, one item, and very many items.
- Tap targets at least 44px on touch. Hover-only interactions with no touch alternative.
- Viewport meta present. No `100vh` bugs on mobile (prefer `dvh`).

### Consistency
- Spacing, font sizes, font families, font weights, colors, border radii, shadows: all from design tokens. Flag raw values and near-duplicate tokens.
- Buttons: one set of variants, used the same way everywhere. Same for inputs, cards, modals, badges.
- Icons: one icon set, one stroke width, consistent sizes. No mixed emoji and icons.
- Same component reimplemented in several places with small differences.
- Copy tone, capitalization (Title Case vs sentence case) and date/number formats consistent across pages.

### Interactivity
- Every button and link does something. Flag `href="#"`, empty `onClick`, `onClick={() => {}}`, TODO handlers, links to routes that do not exist, nav items for unbuilt pages.
- Forms that look like they submit but go nowhere. Toggles, filters, search boxes, sort controls with no effect.
- Disabled-looking controls that are enabled, and the reverse.
- Focus states visible on every interactive element. Keyboard navigation works for menus, modals and dropdowns. Escape closes modals.
- External links open correctly and use `rel="noopener noreferrer"` with `target="_blank"`.

## Report

Report only. Do not edit any file. The user picks what to fix.

Terse. Group by category, ranked by how fast a visitor would notice it. Number every finding so the user can pick by number. No prose, no praise.

```
## <category>
1. file:line - problem. fix.
```

Mark findings that need information you do not have (production domain, brand copy, OG image artwork, real content) with `needs: <what>`. Never suggest inventing a domain or fake content.

Then list manual browser checks the user must do.
