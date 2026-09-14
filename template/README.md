# My product

A site built from data with [mark-builder](https://github.com/mark-platform-dev/mark-builder).
Source material goes into `raw/`, an agent turns it into `data/` and pages
once, and from then on you edit `data/` and the Markdown yourself.

## Install

Requires Node 22.12+ and pnpm.

```bash
pnpm install
pnpm exec playwright install chromium   # once; only `pnpm verify` needs it
```

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server with hot reload for data and code |
| `pnpm build` | Static site in `dist/` |
| `pnpm preview` | Serve `dist/` locally |
| `pnpm verify` | Build, then open every page in a headless browser and check it |

## Daily work

- **Text, numbers, order, SEO fields:** edit `data/*.yaml`. The page in your
  browser reloads itself. A YAML mistake shows the file, line and column in
  the overlay.
- **Prose:** edit the `.mdx` page under `src/pages/`.
- **A new page:** ask an agent (see `AGENTS.md`), or add
  `src/pages/<route>.astro` yourself: import the data it needs and pass it to
  components. Add the route to `nav` in `data/site.yaml`.
- **The theme:** replace the `theme/` folder with the product's theme.
  `theme/theme.css` is the only required file; `theme/source.md` explains
  the shape.
- **Before handing over:** `pnpm verify`.

## Publish

`pnpm build` writes a static site into `dist/`. Upload the whole folder to
any static host. If the site lives under a sub-path — a GitHub Pages project
site such as `https://you.github.io/my-product/` — set in `astro.config.mjs`:

```js
site: 'https://you.github.io',
base: '/my-product',
```

Links in the layout are built from that base automatically.

## Layout

```
raw/       source material (not committed)
data/      YAML/JSON — yours to edit
design/    one design plan per page
theme/     the product's theme
src/       pages, layouts, components, styles
scripts/   verify.js
public/    static files served as-is
dist/      build output (not committed)
```
