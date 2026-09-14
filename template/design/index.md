# Design plan — /

## Purpose

The page a person sees right after creating the project. It has to show,
with the project's own data, what the three layers are and what to do first.
It is meant to be replaced by the real start page.

## Information hierarchy

1. Hero: what this project is (from `home.hero`).
2. The three steps of the pipeline, in order (from `home.steps`).
3. A first-session checklist the reader can tick (from `home.checklist`).

## Layout

Single column, `48rem` wide, set by `BaseLayout`. Hero with a bottom rule;
numbered step cards on the surface colour; the checklist as one card with a
primary-colour border, the only element that uses the accent as a border.

```
My product                              Start
────────────────────────────────────────────
NEW PROJECT
Raw material in, a site out
Everything on this page comes from ...

01  Drop source material into raw/
02  Let an agent turn it into data/
03  Build pages from the data

╔══════════════════════════════════════════╗
║ First session                      0 / 3 ║
║ ☐ Replace theme/ ...                     ║
╚══════════════════════════════════════════╝
```

## Responsive behaviour

Step cards drop the number column below `480px`; nothing else changes.

## Signature

The counter in the checklist corner, `0 / 3`, set in the mono face and the
primary colour: the one live element on an otherwise static page, and the
first thing that proves an island works.
