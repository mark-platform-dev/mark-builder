# Working on mark-builder

This repository is a template, not a tool. `template/` is copied verbatim
into every new project by `create astro --template`; nothing in it may
reference this monorepo. `examples/overview/` is a project made from the
template. `tests/` prove the template works on its own.

## Rules

- **Run package scripts with `--filter`.** `pnpm --filter mark-builder-template dev`,
  `pnpm --filter overview verify`. Never `pnpm --dir` or `pnpm -C`: each
  package carries its own `pnpm-workspace.yaml` (generated projects need it
  for pnpm 11's `allowBuilds`), and `--dir` would treat the package as a
  separate workspace and leave a stray lockfile and `node_modules` behind.
- **Change conventions in the template, then copy to the example.**
  `tests/sync.test.js` lists the files that must stay identical
  (`AGENTS.md`, `docs/visual-design/`, `scripts/verify.js`,
  `src/styles/base.css`, `Checklist.*`, config files). Data, pages and the
  other components belong to the example alone.
- **The template must be a working project at every commit.**
  `tests/template.test.js` builds and verifies it in place; the end-to-end
  test creates a project from it in a temp folder, installs, extends and
  verifies it. Both are part of `pnpm test`.
- **Never import `astro.config.mjs` before `build()` in the same process.**
  The React and MDX integrations loaded early give React two jsx runtimes
  and MDX pages fail to render. `verify.js` reads the config after the build.
- **Set `ASTRO_TELEMETRY_DISABLED=1`** in any script or test that runs Astro
  (`tests/helpers.js` does it for the test processes).
- **Pin exact versions** in `template/package.json`; generated projects have
  no lockfile.

## Tests

```bash
pnpm test                                                          # everything
node --test --test-name-pattern="checkTheme" tests/verify.test.js  # a group in one file
```

The pattern flag must come *before* the file argument: `node --test`
matches flags positionally, so `pnpm test -- --test-name-pattern=...`
(which appends the flag after the `tests/**/*.test.js` glob) is silently
ignored and runs the whole suite.

- `template.test.js` — template builds and verifies; start page comes from data.
- `verify.test.js` — verify's functions on hand-written `dist/` fixtures,
  including the negative cases (dead link, unhydrated island, JS error,
  empty body, blocked external request).
- `e2e.test.js` — project created from the template in a temp dir: install,
  extend with pages/YAML/MDX/theme, build, verify, interact with the island,
  then the negative scenarios. Slow (minutes); needs a warm pnpm store or
  network.
- `sync.test.js` — files that must match between template and example.
- `overview.test.js` — example verifies; every data value reaches a page.

## Layout

```
template/          the template (see its own AGENTS.md for project rules)
examples/overview/ demo site, published to GitHub Pages under /mark-builder/
tests/             node:test suites
docs/superpowers/  specs and plans
.github/workflows/ tests on PRs; deploy and create-astro smoke on main
```

## Don't

- Add a runtime package that generated projects depend on. Copying is the
  contract for now; if that changes, it is a new spec.
- Put anything monorepo-specific into `template/`.
- Add Tailwind, Starlight or a data schema to the template.
