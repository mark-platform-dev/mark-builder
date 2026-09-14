# Design plan — /

## Purpose

The tool explaining its own mechanism to a developer or an agent sizing it
up for the first time. A technical one-pager, not a landing page: led by the
path a person actually walks, with commands as reference underneath.

## Information hierarchy

1. Hero: name, what it does in one breath, and the one fact that matters
   for hand-over (a project depends on Astro, not on mark-builder).
2. Data flow: three stage cards, YOU → AGENT → YOU, each with a number, the
   actor, and the command that starts it; between them the artefact handed
   on; at the end the result.
3. Commands: a plain table.

## Layout

Single column, 48rem, set by `BaseLayout`. Every section is headed by a
small mono uppercase label rather than a generic heading, so the page reads
like a manifest.

```
mark-builder                            Overview  Project
──────────────────────────────────────────────────────────
mark-builder                          <- large title
Turn source material into a site ...  <- tagline
A project is an ordinary Astro ...    <- mono note

DATA FLOW
┌────────────────────────────────┐
│ 01                        YOU  │
│ Create the project and ...     │
│ $ pnpm create astro@latest ... │
└────────────────────────────────┘
   │ raw/
╔════════════════════════════════╗   <- accent border: the one agent step
║ 02                      AGENT  ║
║ Turn it into data and pages    ║
╚════════════════════════════════╝
   │ data/*.yaml + src/pages + ...
┌────────────────────────────────┐
│ 03                        YOU  │
│ Edit the data, watch it update │
│ $ pnpm dev                     │
└────────────────────────────────┘
   │ $ pnpm verify
dist/                                 <- bare, no card
A static multi-page site, ...

COMMANDS
pnpm dev        Dev server; ...
pnpm build      Static multi-page site in dist/
...
```

## Responsive behaviour

Cards lose horizontal padding below 640px; the rail indent shrinks with
them. Long commands wrap anywhere.

## Signature

The actor column running down the stage cards: YOU → AGENT → YOU. Only the
agent's card gets the accent border and tint. The emphasis is load-bearing:
it shows the agent is needed exactly once, in the middle, and the reader
owns both ends. The flow ends on a bare mono `dist/` rather than a fourth
card, so the path visibly terminates in an artefact.
