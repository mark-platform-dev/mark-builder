# mark-builder

Turn structured YAML/JSON into a self-contained HTML visualisation — a roadmap,
a concept page, a deck. Edit a data file and the page in your browser updates
itself. When it looks right, build it into a single `.html` file you can send to
anyone.

Each visualisation is a folder in `projects/`. Its shape is up to you: the
system does not impose a data schema or a layout.

## Install

Requires Node 24.2+ and pnpm.

```bash
pnpm install
pnpm exec playwright install chromium   # only needed for `pnpm check`
```

## Commands

| Command | What it does |
|---|---|
| `pnpm new <project>` | Scaffold `raw/`, `data/`, `components/`, `main.jsx`, `index.html` |
| `pnpm dev <project>` | Dev server; any edit under the project reloads the page |
| `pnpm build <project>` | Write `out/<project>.html` — one file, no external references |
| `pnpm check <project>` | Build, then render the file in a headless browser and verify it works |

## How you'll use it

1. `pnpm new q3-roadmap`
2. Drop source material — Jira exports, screenshots, transcripts — into
   `projects/q3-roadmap/raw/`
3. Ask an agent to turn it into `data/` and `components/` (see `AGENTS.md`)
4. `pnpm dev q3-roadmap`, then edit `data/*.yaml` yourself and watch it update
5. `pnpm build q3-roadmap` and send `out/q3-roadmap.html`

## Layout

```
projects/<project>/
├─ raw/          source material (not committed)
├─ data/         YAML/JSON — yours to edit
├─ components/   JSX — written once, usually by an agent
├─ main.jsx      every data import, in one place
└─ index.html    entry point
out/<project>.html
```

`projects/mark-builder-overview/` is a working reference — this tool
explaining itself, with five data sources. It also doubles as the test
suite's smoke-test fixture: `pnpm test` builds it, renders it, and checks
that every value in its `data/` reached the page. Run `pnpm new` for your
own project rather than editing it.

## Notes

- YAML and JSON can be mixed freely; both import as plain objects.
- A YAML syntax error shows the file, line, and column — as an overlay in
  `dev`, and as a non-zero exit in `build`.
- Images are inlined as base64, so the output never depends on the network.
- `raw/` is gitignored: exports can be large and often contain internal
  information.
