# Working in this repo

mark-builder turns YAML/JSON into a single self-contained HTML visualisation.
Each visualisation is a folder under `projects/`. Data shape and layout are
different every time — do not try to generalise them.

## Division of labour

**You, once per project:** `data/*` (the first extraction from `raw/`),
`components/*.jsx`, `main.jsx`.

**The user, repeatedly:** `data/*` only. The dev server is running and the
browser refreshes itself, so they should never need you for a data edit.

Everything that follows exists to keep that true.

## Before you write a component

Read `docs/visual-design/README.md`. Do not write a single component until
you've written `projects/<name>/design-plan.md` as that instruction
describes — palette, type, layout, signature. Visualisations built without
that step default to black text on white, which is exactly the problem this
instruction exists to prevent.

## Conventions

**1. No data in components.** Every changeable thing — titles, dates, names,
numbers, ordering — belongs in `data/`. JSX only renders. A hardcoded string
drags the user out of YAML and into code.

**2. All data imports go in `main.jsx`; components take props.** The mapping
from file to visualisation is arbitrary and cannot be guessed from filenames,
so `main.jsx` is the one place the whole picture is visible.

```jsx
import tasks from './data/tasks.yaml'
import team from './data/team.yaml'

<Timeline d={tasks} />                    // one source
<Workload tasks={tasks} team={team} />    // two sources, one view
<TaskTable d={tasks} />                   // same source, different view
```

**3. Data is immutable.** Filters, tabs, and tooltips keep state in the
component and show a subset. They never rewrite the imported data. Whatever the
user clicks, `data/` is the source of truth and `pnpm build` reproduces exactly
what is on screen.

**4. Tailwind utility classes in JSX.** No per-project CSS file. Tailwind is
pulled in by the `<style>@import "tailwindcss";</style>` line in `index.html`.
Project-specific color and type tokens go in a `@theme` block in that same
`<style>` tag — see `docs/visual-design/README.md`.

**5. No `ErrorBoundary`.** A component error should crash the page visibly in
dev. This is deliberate: data edits happen with the dev server running, where
the error shows up immediately in the overlay, and `pnpm build` runs on data
that has settled. Isolating sections would add code for no gain.

## Layout

```
projects/<project>/
├─ raw/          source material, gitignored — read it, never rewrite it
├─ data/         YAML/JSON — the user's
├─ components/   JSX — yours
├─ main.jsx      every data import
└─ index.html    entry point
```

## Verify your work

```bash
pnpm check <project>   # builds, then renders in a headless browser
pnpm test              # the framework's own tests
```

`pnpm check` catches what fails silently: external references in the output, an
empty `#root`, JS errors, failed requests. Run it before saying a project
works — a build that produces a blank page still exits 0.

`projects/mark-builder-overview/` doubles as `pnpm test`'s smoke fixture.
The test walks its `data/` and asserts every value reached the rendered
page, so editing that data needs no matching test change — but a component
that stops rendering one of its props will fail the suite.

Whether the visualisation *looks* right is the user's call, not something to
assert in a test.

## Don't

- Add a data schema (Zod or similar) — with arbitrary data shapes it just
  duplicates what the component already says.
- Build a shared component library or a catalogue of visualisation types — the
  requirement is that each one is different.
- Add per-project Vite configs. There is one `vite.config.js`; every script
  passes it explicitly via `configFile`, and it must stay that way or YAML gets
  parsed as JavaScript.
- Commit anything from `raw/`.
