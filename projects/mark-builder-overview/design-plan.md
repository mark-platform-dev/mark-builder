# Design plan — mark-builder-overview

## Subject

The tool explaining its own mechanism: commands, folder layout, the actual
data → component → output pipeline, getting-started steps. Read by a
developer or an agent sizing up the tool for the first time — a technical
one-pager, not a landing page.

## Color

- `#1c2321` (ink) — text, headings
- `#f7f8f6` (paper) — background, cool and quiet rather than warm
- `#6b7573` (muted) — secondary text, meta
- `#dbe0dd` (line) — hairlines, borders
- `#2f6f5e` (accent) — one deep spruce, used only for the pipeline
  connectors and command prompts. A single cool accent, deliberately
  restricted: everything it touches is a mechanism, so it reads as
  structural rather than decorative.

## Type

- IBM Plex Sans Variable — prose: the tagline, descriptions, step text.
- IBM Plex Mono — everything else: section labels, commands, paths, folder
  entries, the pipeline itself. Mono is the dominant register here, not a
  supporting data voice — the subject of this page *is* code, commands, and
  file paths, so the utility face carries as much weight as the display face.

## Layout

Single column, `max-w-3xl` (wider than a prose column would be — command
lines and paths wrap badly in a narrow measure). Every section gets a small
mono uppercase label acting as a header, in place of a generic `<h2>` —
reads like a manifest or a source comment, which fits a tool explaining
itself.

```
mark-builder                          <- large sans title
Turn structured YAML/JSON into...     <- sans tagline
Each visualisation is a folder...     <- mono note

COMMANDS
pnpm new <project>        Scaffold new project
pnpm dev <project>        Dev server; ...
...

FOLDER LAYOUT
projects/<project>/
├─ raw/          source material (not committed)
...

DATA FLOW
[data/*.yaml] → [main.jsx] → [components/*.jsx] → [dev server / out/*.html]

GETTING STARTED
1. pnpm new q3-roadmap
2. ...
```

## Signature

The data-flow pipeline. Four nodes, connected by accent-colored arrows,
each a bordered mono chip with its note beneath — a literal diagram of
the mechanism described in the surrounding prose, not a generic "process
steps" graphic. It's the one place accent color does more than mark a
command prompt.

## Why this isn't the default

The un-designed version of this page is the generic default every
visualisation collapses into: `slate-900/600/500`, no color, a system-font
heading, prose-width column. Differentiating from that is most of the work
— a deep spruce accent reserved for the mechanism, mono as the primary
voice rather than a data voice, a column sized for command lines. The next
project should differentiate from *this* page just as hard: visual
character is per-project and never shared, so nothing here is a template
to copy with a swapped color.
