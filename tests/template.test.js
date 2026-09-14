import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { parse as parseYaml } from 'yaml'
import { exec, flatten, repoRoot, templateDir } from './helpers.js'

function readDistCss(dist) {
  const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
  const inline = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n')
  const astroDir = path.join(dist, '_astro')
  const files = fs.existsSync(astroDir) ? fs.readdirSync(astroDir).filter((f) => f.endsWith('.css')) : []
  return inline + files.map((f) => fs.readFileSync(path.join(astroDir, f), 'utf8')).join('\n')
}

test('the template builds in place and its start page comes from data/', async () => {
  const { code, out } = await exec('pnpm', ['--filter', 'mark-builder-template', 'build'], { cwd: repoRoot })
  assert.equal(code, 0, out)

  const dist = path.join(templateDir, 'dist')
  const html = flatten(fs.readFileSync(path.join(dist, 'index.html'), 'utf8'))
  const home = parseYaml(fs.readFileSync(path.join(templateDir, 'data', 'home.yaml'), 'utf8'))
  const site = parseYaml(fs.readFileSync(path.join(templateDir, 'data', 'site.yaml'), 'utf8'))

  // Static parts are rendered at build time, so their strings are in the HTML.
  for (const s of [home.hero.title, home.hero.subtitle, ...home.steps.map((x) => x.title), site.name]) {
    assert.ok(html.includes(flatten(s)), `missing in dist/index.html: ${s}`)
  }
  // The checklist is a client:only island: present as an element, not rendered yet.
  assert.match(html, /<astro-island[^>]*client="only"/)
  assert.ok(!html.includes(flatten(home.checklist.items[0].text)), 'client:only island must not be server-rendered')

  // Theme tokens beat base.css fallbacks because they sit in a later layer.
  const css = readDistCss(dist)
  assert.match(css, /@layer base\b/)
  assert.match(css, /@layer theme\b/)
  assert.match(css, /--color-primary:\s*#2f6f5e/)
})
