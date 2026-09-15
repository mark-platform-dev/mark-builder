# mark-builder

A template for sites built from data: source material in `raw/`, an agent
turns it into `data/` and pages once, and from then on you edit the YAML
and the Markdown yourself. The result can be a single visualisation, a
dashboard, a landing page or a multi-page documentation site — an ordinary
Astro project that depends on Astro and React, not on mark-builder.

## Create a project

Requires Node 22.12+ and pnpm 11.

```bash
pnpm create astro@latest my-product --template mark-platform-dev/mark-builder/template --no-ai
cd my-product
pnpm install
pnpm exec playwright install chromium   # once; only `pnpm verify` needs it
pnpm dev
```

`--no-ai` matters: without it `create astro` replaces the template's
`AGENTS.md` with a generic one of its own. The generated project's
`README.md` describes daily work and `AGENTS.md` tells an agent how to work
in it. The overview site,
<https://mark-platform-dev.github.io/mark-builder/>, is such a project
describing the system.

## What a project looks like

```
my-product/
├─ raw/            source material (not committed)
├─ data/           YAML/JSON — yours to edit
├─ design/         one design plan per route
├─ theme/          theme.css (required), assets/, source.md
├─ src/            pages (.astro, .mdx), layouts, React components, styles
├─ scripts/        verify.js — build and check every page in a browser
└─ public/
```

Conventions, in one breath: pages import their data and pass it to
components; components are React, static by default and islands only where
something is interactive; the theme is a folder of plain CSS; every page
gets a design plan before it gets code; `pnpm verify` runs before anything
is called done.

## This repository

```
template/            the template — a complete Astro project
examples/overview/   a project made from it: demo site and smoke fixture
tests/               tests of the template, of verify, and end-to-end
```

```bash
pnpm install
pnpm --filter mark-builder-template exec playwright install chromium
pnpm test
```

See `AGENTS.md` for how to change the template.
