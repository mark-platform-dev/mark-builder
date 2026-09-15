# Working in this project

This project was created from the mark-builder template. It turns source
material into a site in three layers:

- `raw/` — source material: exports, screenshots, transcripts. Read it, never
  rewrite it, never commit it.
- `data/` — YAML/JSON the owner edits. Frequent changes happen here.
- `src/` — pages, layouts and components that render the data. Structural
  changes happen here.

## Division of labour

**The owner, repeatedly:** `data/*.yaml` and Markdown/MDX prose. The dev
server reloads the page; no agent is needed for a data or copy edit.

**You, per page or feature:** the first extraction from `raw/` into `data/`,
components in `src/components/`, pages in `src/pages/`, the plan in
`design/`.

**Anyone:** everything else. This is an ordinary Astro project; nothing in it
is off limits.

## Before you write a page

1. Read `docs/visual-design/README.md`.
2. Write `design/<route>.md`: `/` → `design/index.md`, `/roadmap` →
   `design/roadmap.md`, `/reports/q3` → `design/reports/q3.md`. Pages of one
   content collection share one plan (`design/docs.md` for `/docs/*`).
3. Only then write components and the page.

The theme already sets colours and type. The plan describes purpose,
information hierarchy, layout, responsive behaviour and the page's one
signature element — not the brand.

## Creating a theme

`theme/` is a portable folder with one required file, `theme.css`. The
template ships a quiet default; a project about a product replaces the
folder with that product's theme. The owner asks for it and you extract it
from the product — never invent a brand. If there is no product to draw
from, keep the default and say so in the design plans.

1. **Gather the source into `raw/`:** the product's site (URL or
   screenshots), a Figma link or export, a brand guide, logo and font files.
2. **Write `theme/theme.css`.** Define at least the base tokens in `:root`,
   with values measured from the source, not from memory:

   ```css
   :root {
     --color-background: #fff;
     --color-surface: #f4f4f2;
     --color-foreground: #1a1a1a;
     --color-muted: #6b6b66;
     --color-border: #d9d9d4;
     --color-primary: #1f4e79;
     --color-primary-contrast: #fff;
     --font-body: 'Brand Sans', system-ui, sans-serif;
     --font-heading: var(--font-body);
     --font-mono: 'Brand Mono', ui-monospace, monospace;
     --radius-control: 4px;
     --radius-card: 8px;
   }
   ```

   Add a `@media (prefers-color-scheme: dark)` block if the product has a
   dark mode, any further custom properties the product needs (components
   use them with `var(...)`), and the product's global rules if it has
   them. Component and page styles still win over the theme: it sits in a
   CSS layer, they are unlayered.
3. **Fonts are local.** Put font files in `theme/assets/` with `@font-face`
   rules in `theme.css`, or import an npm package (`@fontsource/*`,
   `@fontsource-variable/*`) from `theme.css`. Never link a font from a
   CDN: `pnpm verify` runs without network and reports every external
   request. Confirm on the actual files or package that they ship the
   subsets the content needs (`latin`, `cyrillic`, …).
4. **Logos and images** go into `theme/assets/`, referenced from
   `theme.css` with relative `url(./assets/...)`. Every `url()` must
   resolve to a file inside `theme/`.
5. **Write `theme/source.md`:** where the theme came from (URL, Figma
   link), the extraction date, what was measured and what was
   approximated, and licence notes for fonts and logos.
6. **Run `pnpm verify`.** Before building it checks the folder: a missing
   `theme.css` or a `url()` outside `theme/` fails; base tokens the theme
   leaves undefined are listed as a warning (`src/styles/base.css`
   fallbacks apply).

A theme is site-wide. A page may override a token locally in its own scoped
style when its content calls for it; it never edits `theme/`. The theme
carries the identity, the design plans describe the composition.

## Conventions

**1. Pages are composition roots.** A page in `src/pages/` imports every data
file its route needs and passes the pieces to components as props.
Components and layouts never import project data, with two exceptions:
`src/layouts/BaseLayout.astro` imports `data/site.yaml`, and an island that
owns a large dataset (hundreds of kilobytes and up) may import that file
itself instead of receiving it through props.

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro"
import Hero from "../components/Hero.jsx"
import Metrics from "../components/Metrics.jsx"

import home from "../../data/home.yaml"
---

<BaseLayout meta={home.meta}>
  <Hero d={home.hero} />
  <Metrics d={home.metrics} client:only="react" />
</BaseLayout>
```

**2. No data in components.** Titles, numbers, dates, ordering, SEO fields —
all of it lives in `data/`. A hardcoded string drags the owner out of YAML
and into code.

**3. React is the only component language.** `src/components/` holds `.jsx`
files only; `.astro` files exist only in `src/pages/` and `src/layouts/`. A
React component without a client directive renders to HTML at build time and
ships no JavaScript — use that for headings, lists, tables, cards and SVG
diagrams built from data.

**4. Interactivity is an island, and one interactive region is one island.**
Add `client:only="react"` on the page for anything with state, browser APIs
or a charting library. A dashboard with filters and charts is one component;
its shared state lives inside it. Two islands cannot share state — merge
them. Use `client:load` or `client:visible` only when the initial markup must
be in the HTML; then the component must render identically on server and
client (no `window` at render time, no random or time-dependent output).
Island props must be serialisable: objects, arrays, primitives, `Date`; no
functions.

**5. Data is immutable.** Filters, tabs and tooltips keep UI state in the
component and show a derived view. They never rewrite imported data.

**6. Styles: CSS Modules in components, scoped `<style>` in pages and
layouts, tokens from the theme.** Use `var(--color-primary)` and the other
tokens listed in `src/styles/base.css`. No Tailwind in this template.
Component styles always beat theme rules: they are unlayered.

**7. Prose lives in Markdown.** Long text is an `.mdx` page in `src/pages/`
with `layout: ../layouts/BaseLayout.astro` and a `meta:` block in its
frontmatter, not a YAML string. An MDX page is a composition root too: import
data and components at the top and use them in the text.

**8. Links are base-aware.** Data files keep root-relative hrefs (`/about/`);
`BaseLayout` prepends `import.meta.env.BASE_URL`. Do the same in any
component that builds internal links, so the site works under a sub-path.

**9. No `ErrorBoundary`.** An error must crash visibly in the dev overlay and
fail `pnpm verify`, not leave a half-working page.

## Adding a documentation section

When the site needs a set of docs pages with a sidebar, use a content
collection rather than a hand-kept list of pages:

1. Put `.md`/`.mdx` files under `src/content/docs/`, each with `title` and
   `order` in its frontmatter.
2. Create `src/content.config.js`:

   ```js
   import { defineCollection } from 'astro:content'
   import { glob } from 'astro/loaders'

   export const collections = {
     docs: defineCollection({
       loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/docs' }),
     }),
   }
   ```

3. Create `src/pages/docs/[...slug].astro`: `getStaticPaths()` returns one
   path per entry of `getCollection('docs')`, the page renders the entry with
   `render(entry)` inside `BaseLayout`, and the sidebar is the collection
   sorted by `order`.
4. Write `design/docs.md` first, as for any page.

For a full documentation site with search, add Starlight with
`pnpm astro add starlight`. It owns `src/content/docs/` and its own layout;
the project's other pages keep working next to it.

## Layout

```
raw/             source material — read it, never rewrite it, never commit it
data/            YAML/JSON — the owner's
design/          one plan per route
theme/           theme.css (required), assets/, source.md
src/pages/       routes: .astro and .mdx — composition roots
src/layouts/     BaseLayout.astro
src/components/  React components: static by default, islands by directive
src/styles/      base.css (reset, fallback tokens), global.css (layers)
scripts/         verify.js
public/          static files served as-is
```

## Verify your work

```bash
pnpm verify
```

It checks `theme/`, builds the site, serves `dist/` and opens every page in
headless Chromium: rendered content, no JS or console errors, no failed
requests, every `client:load|idle|only` island hydrated, every internal link
resolving. External requests are blocked and reported as warnings. Run it
before saying a page works — `pnpm build` alone exits 0 on a blank page.

Whether a page *looks* right is the owner's call, not something to assert in
a test.

## Don't

- Add a data schema (Zod or similar). With arbitrary data shapes it only
  duplicates what the component already says.
- Build a component library or a catalogue of visualisation types. Each
  visualisation is built for its data.
- Put `.astro` components in `src/components/`.
- Rename `verify` to `check`: `astro check` is Astro's own command.
- Commit anything from `raw/`.
