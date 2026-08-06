# Design plan — mark-builder-overview

## Subject

The tool explaining its own mechanism, led by the path a person actually
walks: raw material in, an agent once in the middle, then their own data
edits out. Commands and folder layout follow as reference. Read by a
developer or an agent sizing up the tool for the first time — a technical
one-pager, not a landing page.

## Color

- `#1c2321` (ink) — text, headings
- `#f7f8f6` (paper) — background, cool and quiet rather than warm
- `#6b7573` (muted) — secondary text, meta
- `#dbe0dd` (line) — hairlines, borders
- `#2f6f5e` (accent) — one deep spruce, used only for stage numbers, the
  handoff rules between stages, command prompts, and the single card that
  belongs to the agent. A single cool accent, deliberately restricted:
  everything it touches is a mechanism, so it reads as structural rather
  than decorative.

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

DATA FLOW
┌─────────────────────────────────┐
│ 01                        YOU   │
│ Gather source material          │
│ Jira exports, screenshots, ...  │
│ $ pnpm new q3-roadmap           │
└─────────────────────────────────┘
   │ raw/
╔═════════════════════════════════╗   <- accent border: the one agent step
║ 02                      AGENT   ║
║ Turn it into structured files   ║
╚═════════════════════════════════╝
   │ data/*.yaml + components/*.jsx
┌─────────────────────────────────┐
│ 03                        YOU   │
│ Edit the data, watch it update  │
│ $ pnpm dev q3-roadmap           │
└─────────────────────────────────┘
   │ $ pnpm build q3-roadmap
out/q3-roadmap.html                   <- bare, no card
One file, no external references...

COMMANDS
pnpm new <project>        Scaffold new project
pnpm dev <project>        Dev server; ...
...

FOLDER LAYOUT
projects/<project>/
├─ raw/          source material (not committed)
...
```

## Signature

The data-flow cards, and specifically the actor column running down them:
YOU → AGENT → YOU. Three stage cards, each carrying a number, who does the
work, and the command that starts it; between them an accent rule labelled
with the artefact being handed on (`raw/`, then `data/*.yaml +
components/*.jsx`). Only the agent's card gets an accent border and tint —
the emphasis is load-bearing, not decorative: it shows the agent is needed
exactly once, in the middle, and the reader owns both ends. The flow ends
on a bare mono filename rather than a fourth card, so the path visibly
terminates in an artefact instead of another box.

This replaces the earlier file-level pipeline (`data/` → `main.jsx` →
`components/` → output), which described the repo's internals rather than
anything the reader does, and it absorbs the separate "Getting started"
list — the steps now live on the cards they belong to instead of being
restated underneath.

## Why this isn't the default

The un-designed version of this page is the generic default every
visualisation collapses into: `slate-900/600/500`, no color, a system-font
heading, prose-width column. Differentiating from that is most of the work
— a deep spruce accent reserved for the mechanism, mono as the primary
voice rather than a data voice, a column sized for command lines. The next
project should differentiate from *this* page just as hard: visual
character is per-project and never shared, so nothing here is a template
to copy with a swapped color.
