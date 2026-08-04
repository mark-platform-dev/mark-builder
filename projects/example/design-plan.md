# Design plan — example (Platform Roadmap)

## Subject

A quarterly roadmap report: three initiatives, their status and completion,
a short team line, a summary count. Read by the team that owns it and by
stakeholders it's sent or projected to — a report, not a product page.

## Color

- `#262220` (ink) — text, headings
- `#fbf9f6` (paper) — background
- `#8a8178` (muted) — secondary text, meta
- `#e7e0d6` (line) — hairlines, rules
- `#9c7a24` (accent) — the one warm ochre, used only for progress fill and
  the summary numerals. Reads as "in motion / attention," without building
  a full status-color system (done/at-risk/blocked stay text, per the
  project's own words — that's out of scope here).

## Type

- Display/body: IBM Plex Sans Variable — one family, weight does the work
  (semibold for headings, regular for body).
- Data: IBM Plex Mono — quarter tags, status words, percentages, the
  summary count. This report's real content is mostly numbers and short
  tags; giving them their own voice separates "what it is" from "how far
  along," without a second display face competing with the headline.

## Layout

Single column, `max-w-2xl`, generous vertical rhythm (a report meant to be
read start to finish, not scanned as a grid).

```
Team                                    <- mono eyebrow
Platform Roadmap                        <- large sans heading
What we are building this quarter...    <- muted subtitle
Team: Ann, Bo, Cyd

Search rewrite                    Q3 · in progress
──────────●───────────────────────────────  40%
Billing migration                 Q3 · done
───────────────────────────────────────●  100%
Mobile offline mode                Q4 · planned
●───────────────────────────────────────  0%

Summary of 3 initiatives
  1            1            1
Shipped      In flight    Planned
```

## Signature

The progress meter. Not a filled bar-in-a-track — a single hairline the
full width of the row, with the completed portion drawn solid in the accent
color up to a tick mark, and the percentage set in mono at the point the
tick lands. It reads like a ruler, which is what "percent done" actually
is: a mark on a line, not a colored rectangle.

## Why this isn't the default

The obvious version of this page is a slate-gray progress bar in a gray
track (what it was before this instruction existed) or the AI-cliché
version — cream background, serif display, terracotta accent, a hero with
a big number and a gradient. Neither is here: one warm ochre instead of
terracotta, sans instead of serif, and the "big number" pattern is spent
only on the summary counts — three real counted categories, not an
invented KPI.
