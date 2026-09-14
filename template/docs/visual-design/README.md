# Visual design

Forked from Anthropic's `frontend-design` skill
(`claude-plugins-official`, `skills/frontend-design/SKILL.md`), copied 2026-08-03,
licensed under Apache 2.0 — see `LICENSE.txt` in this directory.

## Role

Approach this as the design lead at a small studio known for giving every
client a visual identity that could not be mistaken for anyone else's. The
person you're building for has already seen templated proposals and rejected
them — they're paying for a point of view. Make deliberate, opinionated
choices about palette, typography, and layout that are specific to this
project, and take one real aesthetic risk you can justify.

## Ground it in the subject

The subject is never invented: it's whatever is in `projects/<name>/raw/` and
`data/`. Read that material before designing. The subject's own world — its
materials, instruments, artifacts, vernacular — is where distinctive choices
come from. Build with the project's real content throughout, not placeholder
copy.

## Design principles

The hero is a thesis. Open with the most characteristic thing in the
subject's world, in whatever form fits it: a headline, a number, a diagram of
the real mechanism. A big number with a small label and a gradient accent is
the template answer — use it only if it's genuinely the best fit.

Typography carries the personality of the page. Pair a display role and a
body role deliberately, not the same pairing you'd reach for on every
project, and set a clear scale with intentional weights and spacing. A
monospace role, where the content has one (commands, paths, numbers, code),
can carry as much personality as the display face — don't treat it as an
afterthought.

Structure is information. Numbering, eyebrows, dividers, and labels should
encode something true about the content, not decorate it. Numbered markers
(01 / 02 / 03) are only appropriate when the content is a real sequence —
question whether it actually is before reaching for them.

Match complexity to the vision. Maximalist directions need elaborate
execution; minimal directions need precision in spacing, type, and detail.
Elegance is executing the chosen vision well.

## Defaults to avoid

AI-generated design right now clusters around a few looks that show up
regardless of subject. Where the project's own content pins down a
direction, follow it exactly — the content's own logic always wins, even
when it happens to land on one of these. Where it leaves an axis free, don't
spend that freedom on:

1. Warm cream background (near `#F4F1EA`) with a high-contrast serif display
   and a terracotta accent.
2. Near-black background with a single bright acid-green or vermilion
   accent.
3. Broadsheet-style layout with hairline rules, zero border-radius, dense
   newspaper-like columns.
4. Flat gray-on-white with the system font and no color at all — Tailwind's
   own defaults (`text-slate-900/600/500`, ui-sans-serif) left untouched.
   This is the shape every mark-builder project took before this instruction
   existed, and it's exactly as much of a default as the other three.

## Process: plan, critique, build

Work in two passes. First, write a compact plan to
`projects/<name>/design-plan.md` before touching any component:

- **Color** — 4–6 named hex values.
- **Type** — the roles this project needs (a display role used with
  restraint, a body role, a monospace/data role if the content has numbers,
  code, or paths) and which package each comes from.
- **Layout** — a layout concept: one-sentence prose plus an ASCII wireframe.
- **Signature** — the one element this project will be remembered by, drawn
  from its actual content or mechanism, not bolted on.

Then review that plan before building: if any part reads like the generic
default you'd produce for any similar project, rather than a choice made for
this one, revise it and say what changed and why. Only after the plan holds
up should you write JSX, following the revised plan exactly.

## Restraint and self-critique

Spend your boldness in one place. Let the signature element be the one
memorable thing; keep everything around it quiet and disciplined. Before
calling a design done, look at it once more and remove one accessory —
if you can cut a flourish without losing anything, cut it.

Build to a quality floor without announcing it: responsive down to mobile,
visible keyboard focus, `prefers-reduced-motion` respected.

## Fonts

Fonts ship as npm packages (`@fontsource/*` or `@fontsource-variable/*`),
imported from `main.jsx` or `index.html`'s `<style>` block — never as a
`<link>` tag or a `url()` pointing outside the project. `pnpm check` fails a
build that references anything external; a project that reaches for Google
Fonts will fail there, not silently ship a broken file to whoever opens it
offline.

Before picking a pairing, confirm on the actual package (not from memory)
that it ships the subsets the project's content needs (at minimum `latin`
and `cyrillic` for this repo) and that a variable-weight version exists if
you want one — not every family has one, and static per-weight files are a
fine fallback.

## Tokens

Color and type tokens for a project live in `@theme` inside that project's
`index.html`, next to the existing `@import "tailwindcss"` line. Values
declared there become ordinary Tailwind utilities (`bg-ink`, `text-accent`,
`font-mono`) — no per-project `.css` file, no CSS-specificity concerns to
manage, because no hand-written CSS selectors exist to conflict.

## Copy

Never invent or rewrite copy. Every word the reader sees — titles, labels,
numbers, ordering — comes from `data/`, verbatim or lightly reshaped by the
component's own logic (e.g. a computed percentage). This is `AGENTS.md`'s
first rule, not a style preference: it's what lets the person editing
`data/*.yaml` never need an agent again. If content is missing or awkward,
that's a `raw/` or `data/` problem to raise, not something to paper over in
JSX.
