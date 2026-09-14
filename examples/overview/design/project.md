# Design plan — /project

## Purpose

What a freshly created project contains, and what to do in the first
session. Read right after the overview by someone about to run the create
command.

## Information hierarchy

1. Folder layout: the tree with one line per folder.
2. First-session checklist: four things to do, tickable.

## Layout

Single column, 48rem. The tree is a mono block on the surface colour; the
checklist is a card with a primary-colour border — the same island the
template ships, so the example exercises hydration.

```
mark-builder                            Overview  Project
──────────────────────────────────────────────────────────
FOLDER LAYOUT
┌──────────────────────────────────────┐
│ my-product/                          │
│ ├─ raw/         source material ...  │
│ ├─ data/        YAML/JSON — yours    │
│ ...                                  │
└──────────────────────────────────────┘
An ordinary Astro repository. ...

╔══════════════════════════════════════╗
║ First session in a new project 0 / 4 ║
║ ☐ Put the source material into raw/  ║
║ ...                                  ║
╚══════════════════════════════════════╝
```

## Responsive behaviour

Tree entries wrap: name on one line, description below it, when the
column is narrower than the two fit side by side.

## Signature

The live `0 / 4` counter in the checklist corner, the only element on the
page that changes after load — proof, on the page about projects, that an
island works.
