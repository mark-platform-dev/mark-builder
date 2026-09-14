# mark-builder overview

The [mark-builder](../../README.md) template describing itself: a project
created from `template/`, published at
<https://mark-platform-dev.github.io/mark-builder/>.

It doubles as the repository's smoke fixture. `pnpm test` at the root
verifies it in a headless browser and asserts that every value in `data/`
reached a page. Files that carry the conventions (`AGENTS.md`,
`docs/visual-design/`, `scripts/verify.js`, `src/styles/base.css` and a few
more) must stay identical to the template's; the sync test says which.

From the repository root:

```bash
pnpm --filter overview dev
pnpm --filter overview verify
```

Use `--filter`, not `--dir`: the example has its own `pnpm-workspace.yaml`
(generated projects need it), and `pnpm --dir` would treat it as a separate
workspace.
