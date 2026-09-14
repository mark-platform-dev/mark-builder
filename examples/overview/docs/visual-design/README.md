# Visual design

Forked from Anthropic's `frontend-design` skill
(`claude-plugins-official`, `skills/frontend-design/SKILL.md`), copied 2026-08-03,
licensed under Apache 2.0 — see `LICENSE.txt` in this directory.

## Role

Approach this as the design lead at a small studio known for giving every
client a visual identity that could not be mistaken for anyone else's. The
person you're building for has already seen templated proposals and rejected
them — they're paying for a point of view. Make deliberate, opinionated
choices about hierarchy, layout and the one element a page will be
remembered by, and take one real aesthetic risk you can justify.

## Two sources of identity

The brand — colours, type, radii — comes from `theme/theme.css` and is not
yours to reinvent. If the project has a real product theme, every page uses
it. If it still runs on the built-in default theme, say so in the plan and
keep the palette quiet rather than inventing a brand for a product you do
not own.

What is yours is the page: its purpose, its information hierarchy, its
layout, how it behaves on a phone, and its signature. That is where the
point of view goes.

## Ground it in the subject

The subject is never invented: it's whatever is in `raw/` and `data/`. Read
that material before designing. The subject's own world — its materials,
instruments, artifacts, vernacular — is where distinctive choices come from.
Build with the project's real content throughout, not placeholder copy.

## Design principles

The hero is a thesis. Open with the most characteristic thing in the
subject's world, in whatever form fits it: a headline, a number, a diagram of
the real mechanism. A big number with a small label and a gradient accent is
the template answer — use it only if it's genuinely the best fit.

Typography carries the personality of the page within the theme's faces:
`--font-heading`, `--font-body`, `--font-mono`. Set a clear scale with
intentional weights and spacing. Where the content has commands, paths,
numbers or code, the mono role can carry as much personality as the heading
face — don't treat it as an afterthought.

Structure is information. Numbering, eyebrows, dividers and labels should
encode something true about the content, not decorate it. Numbered markers
(01 / 02 / 03) are only appropriate when the content is a real sequence —
question whether it actually is before reaching for them.

Match complexity to the vision. Maximalist directions need elaborate
execution; minimal directions need precision in spacing, type and detail.
Elegance is executing the chosen vision well.

## Defaults to avoid

AI-generated design clusters around a few looks that show up regardless of
subject. Where the content or the theme pins down a direction, follow it
exactly — the content's own logic always wins. Where an axis is free, don't
spend that freedom on:

1. A hero that is a big number, a small label and a gradient accent.
2. Broadsheet-style layout with hairline rules, zero border-radius, dense
   newspaper-like columns, used on content that is not editorial.
3. Card grids of identical cards for content that is not a list of equals.
4. The theme's tokens left untouched in a layout with no hierarchy: system
   font, one text size, grey on white. The tokens are a palette, not a
   design.

## Process: plan, critique, build

Work in two passes. First, write a compact plan to `design/<route>.md`
before touching any component (`/` → `design/index.md`, `/roadmap` →
`design/roadmap.md`; pages of one collection share `design/<section>.md`):

- **Purpose** — who reads this page and what they should leave with.
- **Information hierarchy** — the order things are read in, and why.
- **Layout** — one-sentence prose plus an ASCII wireframe.
- **Responsive behaviour** — what changes below tablet and phone widths.
- **Signature** — the one element this page will be remembered by, drawn
  from its actual content or mechanism, not bolted on.

Then review that plan before building: if any part reads like the generic
default you'd produce for any similar page, rather than a choice made for
this one, revise it and say what changed and why. Only after the plan holds
up should you write components, following the revised plan exactly.

## Restraint and self-critique

Spend your boldness in one place. Let the signature element be the one
memorable thing; keep everything around it quiet and disciplined. Before
calling a page done, look at it once more and remove one accessory — if you
can cut a flourish without losing anything, cut it.

Build to a quality floor without announcing it: responsive down to mobile,
visible keyboard focus, `prefers-reduced-motion` respected (the reset in
`src/styles/base.css` already disables animation for it).

## Fonts

Fonts belong to the theme. A product theme ships them as local files in
`theme/assets/` with `@font-face` rules in `theme/theme.css`, or imports an
npm package (`@fontsource/*`, `@fontsource-variable/*`) from `theme.css`.
Never link a font from a CDN in a page or component: `pnpm verify` runs
without network and reports every external request.

Before picking a pairing for a theme, confirm on the actual package or
files (not from memory) that they ship the subsets the content needs (at
minimum `latin` and `cyrillic` for this repo) and whether a variable-weight
version exists.

## Tokens and styles

Colour, type and radius tokens are CSS custom properties defined by the
theme and given fallbacks in `src/styles/base.css`. Components use them
directly — `var(--color-primary)`, `var(--font-mono)` — in CSS Modules
(`Component.module.css`); pages and layouts use scoped `<style>`. A page may
override a token locally in its own scoped style when its content calls for
it; it never edits the theme.

## Copy

Never invent or rewrite copy. Every word the reader sees — titles, labels,
numbers, ordering, prose — comes from `data/` or the page's Markdown,
verbatim or lightly reshaped by the component's own logic (a computed
percentage, a formatted date). This is `AGENTS.md`'s first rule, not a
style preference: it's what lets the person editing the data never need an
agent again. If content is missing or awkward, that's a `raw/` or `data/`
problem to raise, not something to paper over in a component.
