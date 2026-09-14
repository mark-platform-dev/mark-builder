# Theme source

Built-in default theme of the mark-builder template: a quiet cool paper
background with one deep spruce accent and system font stacks. It is a
starting point, not a brand.

To use a product's theme, replace this folder with one that has the same
shape:

- `theme.css` — required. `@font-face` rules, CSS custom properties (at least
  the base tokens listed in `src/styles/base.css`), light/dark media queries
  and any global rules of the product.
- `assets/` — logos and local font files, referenced from `theme.css` with
  relative `url(...)`.
- `source.md` — where the theme came from (site or Figma link), extraction
  date, licence notes for fonts and logos.

`pnpm verify` checks the folder before building: `theme.css` must exist and
every `url(...)` in it must point to a file inside this folder.
