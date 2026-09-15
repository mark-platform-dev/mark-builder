import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { exampleDir, templateDir } from './helpers.js'

// The example is a project made from the template. These files carry the
// conventions and tooling; they may only change in the template, and the
// example must follow. Everything else (data, pages, components, config)
// belongs to the example.
const SYNCED = [
  'AGENTS.md',
  'docs/visual-design/README.md',
  'docs/visual-design/LICENSE.txt',
  'scripts/verify.js',
  'src/styles/base.css',
  'src/env.d.ts',
  'tsconfig.json',
  'pnpm-workspace.yaml',
  '.gitignore',
  'src/components/Checklist.jsx',
  'src/components/Checklist.module.css',
  'src/layouts/BaseLayout.astro',
  'src/styles/global.css',
]

for (const rel of SYNCED) {
  test(`${rel} is identical in template/ and examples/overview/`, () => {
    const a = fs.readFileSync(path.join(templateDir, rel))
    const b = fs.readFileSync(path.join(exampleDir, rel))
    assert.ok(a.equals(b), `examples/overview/${rel} differs from template/${rel} — copy it over`)
  })
}
