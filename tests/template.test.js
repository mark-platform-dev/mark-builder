import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { parse as parseYaml } from 'yaml'
import { verifyProject } from '../template/scripts/verify.js'
import { exec, flatten, repoRoot, templateDir } from './helpers.js'

function readDistCss(dist) {
  const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
  const inline = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n')
  const astroDir = path.join(dist, '_astro')
  const files = fs.existsSync(astroDir) ? fs.readdirSync(astroDir).filter((f) => f.endsWith('.css')) : []
  return inline + files.map((f) => fs.readFileSync(path.join(astroDir, f), 'utf8')).join('\n')
}

const home = parseYaml(fs.readFileSync(path.join(templateDir, 'data', 'home.yaml'), 'utf8'))
const site = parseYaml(fs.readFileSync(path.join(templateDir, 'data', 'site.yaml'), 'utf8'))

test('the template verifies in place and its start page comes from data/', async () => {
  const result = await verifyProject(templateDir)
  assert.equal(result.ok, true, JSON.stringify(result.pages.map((p) => [p.url, p.failures]), null, 2))
  assert.deepEqual(result.warnings, [])
  assert.deepEqual(result.pages.map((p) => p.url), ['/'])

  // Static parts and the hydrated island alike: this is the text after load.
  const text = flatten(result.pages[0].text)
  const expected = [
    site.name,
    home.hero.title,
    home.hero.subtitle,
    ...home.steps.map((s) => s.title),
    home.checklist.title,
    ...home.checklist.items.map((i) => i.text),
  ]
  const missing = expected.filter((s) => !text.includes(flatten(s)))
  assert.deepEqual(missing, [], `missing from the rendered page: ${missing.join(' | ')}`)

  // The island is client:only: an element in the HTML, rendered only in the browser.
  const dist = path.join(templateDir, 'dist')
  const html = flatten(fs.readFileSync(path.join(dist, 'index.html'), 'utf8'))
  assert.match(html, /<astro-island[^>]*client="only"/)
  assert.ok(!html.includes(flatten(home.checklist.items[0].text)), 'client:only island must not be server-rendered')

  // Theme tokens beat base.css fallbacks because they sit in a later layer.
  const css = readDistCss(dist)
  assert.match(css, /@layer base\b/)
  assert.match(css, /@layer theme\b/)
  assert.match(css, /--color-primary:\s*#2f6f5e/)
})

test('pnpm verify exits 0 and prints one line per page', async () => {
  const { code, out } = await exec('pnpm', ['--filter', 'mark-builder-template', 'verify'], { cwd: repoRoot })
  assert.equal(code, 0, out)
  assert.match(out, /^ok {3}\/$/m)
  assert.match(out, /verify OK — 1 pages/)
})
