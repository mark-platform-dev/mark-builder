import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'
import { parse as parseYaml } from 'yaml'
import { serveDist } from '../template/scripts/verify.js'
import { exec, flatten, stringLeaves, templateDir, tmpDir } from './helpers.js'

// Repeats what `create astro --template` does: copy the template folder,
// drop CHANGELOG.md, write the project name into package.json.
function createProject(name) {
  const dir = path.join(tmpDir('e2e'), name)
  fs.cpSync(templateDir, dir, {
    recursive: true,
    filter: (src) => !/(^|[\\/])(node_modules|dist|\.astro)([\\/]|$)/.test(src),
  })
  fs.rmSync(path.join(dir, 'CHANGELOG.md'), { force: true })
  const pkgFile = path.join(dir, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'))
  pkg.name = name
  fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + '\n')
  return dir
}

function write(root, files) {
  for (const [rel, content] of Object.entries(files)) {
    const file = path.join(root, rel)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, content)
  }
}

const ROADMAP_YAML = `meta:
  title: Roadmap
  description: What ships when
hero:
  eyebrow: Q4 plan
  title: Three releases before the year ends
  subtitle: Dates are targets, not promises.
steps:
  - id: alpha
    title: Alpha to five design partners
    text: Closed group, weekly calls, no SLA.
  - id: beta
    title: Beta behind a feature flag
    text: Opt-in from settings for every workspace.
  - id: ga
    title: General availability
    text: Flag removed, pricing page updated.
checklist:
  title: Launch checklist
  items:
    - id: docs
      text: Publish the release notes
    - id: status
      text: Update the status page
`

const ROADMAP_PAGE = `---
import BaseLayout from "../layouts/BaseLayout.astro"
import Hero from "../components/Hero.jsx"
import Steps from "../components/Steps.jsx"
import Checklist from "../components/Checklist.jsx"

import roadmap from "../../data/roadmap.yaml"
---

<BaseLayout meta={roadmap.meta}>
  <Hero d={roadmap.hero} />
  <Steps d={roadmap.steps} />
  <Checklist d={roadmap.checklist} client:only="react" />
</BaseLayout>
`

const ABOUT_MDX = `---
layout: ../layouts/BaseLayout.astro
meta:
  title: About
  description: Why this product exists
---
import Hero from "../components/Hero.jsx"
import roadmap from "../../data/roadmap.yaml"

# About this product

Written in **MDX**, with a component fed from YAML below.

<Hero d={roadmap.hero} />
`

const SITE_YAML = `name: E2E product
description: End-to-end fixture
lang: en
nav:
  - label: Start
    href: /
  - label: Roadmap
    href: /roadmap/
  - label: About
    href: /about/
`

const TEST_THEME = `:root {
  --color-background: #fffdf7;
  --color-surface: #f6f1e4;
  --color-foreground: #201a12;
  --color-muted: #7a6f5c;
  --color-border: #e3d9c3;
  --color-primary: #b3261e;
  --color-primary-contrast: #fffdf7;
  --font-body: Georgia, serif;
  --font-heading: Georgia, serif;
  --font-mono: Menlo, monospace;
  --radius-control: 2px;
  --radius-card: 2px;
}
.site-name::before {
  content: "";
  display: inline-block;
  width: 1em;
  height: 1em;
  margin-right: 0.4em;
  background: url(./assets/mark.svg) no-repeat center / contain;
}
`

const MARK_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="#b3261e"/></svg>'

function readAllCss(dist) {
  let css = ''
  for (const html of ['index.html', 'roadmap/index.html']) {
    const text = fs.readFileSync(path.join(dist, html), 'utf8')
    css += [...text.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n')
  }
  const astroDir = path.join(dist, '_astro')
  if (fs.existsSync(astroDir)) {
    for (const f of fs.readdirSync(astroDir)) if (f.endsWith('.css')) css += fs.readFileSync(path.join(astroDir, f), 'utf8')
  }
  return css
}

test('a project created from the template installs, extends, builds and verifies on its own', async (t) => {
  const dir = createProject('e2e-product')
  const pnpm = (args) => exec('pnpm', args, { cwd: dir })

  await t.test('installs its own dependencies without mark-builder', async () => {
    const install = await pnpm(['install', '--prefer-offline'])
    assert.equal(install.code, 0, install.out)
    assert.ok(fs.existsSync(path.join(dir, 'node_modules', 'astro')))
    const pkg = JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8'))
    const deps = { ...pkg.dependencies, ...pkg.devDependencies }
    assert.ok(!Object.keys(deps).some((d) => /mark-builder/.test(d)), 'no dependency on mark-builder')
    assert.ok(!fs.existsSync(path.join(dir, 'node_modules', 'mark-builder')))
    const gitignore = fs.readFileSync(path.join(dir, '.gitignore'), 'utf8')
    for (const rule of ['node_modules/', 'dist/', '.astro/', 'raw/*', '!raw/.gitkeep']) assert.ok(gitignore.includes(rule), rule)
    assert.ok(fs.existsSync(path.join(dir, 'raw', '.gitkeep')))
  })

  // Extend: a second .astro page with its own YAML, an .mdx page, nav links,
  // a replacement theme with a local asset.
  write(dir, {
    'data/roadmap.yaml': ROADMAP_YAML,
    'data/site.yaml': SITE_YAML,
    'src/pages/roadmap.astro': ROADMAP_PAGE,
    'src/pages/about.mdx': ABOUT_MDX,
    'theme/theme.css': TEST_THEME,
    'theme/assets/mark.svg': MARK_SVG,
  })
  fs.writeFileSync(path.join(dir, 'theme', 'source.md'), '# Test theme\n')

  await t.test('builds and verifies with the added pages', async () => {
    const build = await pnpm(['build'])
    assert.equal(build.code, 0, build.out)
    for (const f of ['index.html', 'roadmap/index.html', 'about/index.html']) {
      assert.ok(fs.existsSync(path.join(dir, 'dist', f)), `dist/${f}`)
    }
    const verify = await pnpm(['verify'])
    assert.equal(verify.code, 0, verify.out)
    assert.match(verify.out, /^ok {3}\/roadmap\/$/m)
    assert.match(verify.out, /^ok {3}\/about\/$/m)
    assert.match(verify.out, /verify OK — 3 pages/)
  })

  await t.test('data and prose reach the DOM', async () => {
    const roadmapHtml = flatten(fs.readFileSync(path.join(dir, 'dist', 'roadmap', 'index.html'), 'utf8'))
    // meta lands in <head>; ids, hrefs and lang never render; the checklist
    // is a client:only island, covered by the interaction test below.
    const skip = new Set(['meta', 'id', 'href', 'lang', 'description', 'checklist'])
    const expected = [
      ...stringLeaves(parseYaml(ROADMAP_YAML), [], skip),
      ...stringLeaves(parseYaml(SITE_YAML), [], skip),
    ]
    const missing = expected.filter((s) => !roadmapHtml.includes(flatten(s)))
    assert.deepEqual(missing, [], `missing from dist/roadmap/index.html: ${missing.join(' | ')}`)

    const aboutHtml = flatten(fs.readFileSync(path.join(dir, 'dist', 'about', 'index.html'), 'utf8'))
    assert.ok(aboutHtml.includes('about this product'), 'MDX prose')
    assert.ok(aboutHtml.includes(flatten('Three releases before the year ends')), 'component in MDX fed from YAML')
    assert.match(aboutHtml, /<title>about · e2e product<\/title>/)
  })

  await t.test('the replacement theme and its asset are applied', async () => {
    const css = readAllCss(path.join(dir, 'dist'))
    assert.match(css, /--color-primary:\s*#b3261e/)
    assert.ok(/mark\.[A-Za-z0-9_-]+\.svg|data:image\/svg\+xml/.test(css), 'theme asset referenced from built CSS')
  })

  await t.test('the island reacts to the user', async () => {
    const server = await serveDist(path.join(dir, 'dist'), '/')
    const browser = await chromium.launch()
    try {
      const page = await browser.newPage()
      await page.goto(`${server.origin}/roadmap/`, { waitUntil: 'networkidle' })
      const progress = page.getByTestId('progress')
      await progress.waitFor()
      assert.equal((await progress.textContent()).trim(), '0 / 2')
      await page.getByRole('checkbox').first().check()
      assert.equal((await progress.textContent()).trim(), '1 / 2')
    } finally {
      await browser.close()
      await server.close()
    }
  })

  await t.test('broken YAML fails the build naming file, line and column', async () => {
    const file = path.join(dir, 'data', 'roadmap.yaml')
    const good = fs.readFileSync(file, 'utf8')
    // Sequence item with no "-" indicator: invalid YAML, valid-looking text.
    fs.writeFileSync(file, 'meta:\n  title: Broken\nsteps:\n  - id: x\n   title: y\n')
    try {
      const build = await pnpm(['build'])
      assert.equal(build.code, 1)
      assert.match(build.out, /roadmap\.yaml/)
      assert.match(build.out, /line \d+/)
      assert.match(build.out, /column \d+/)
    } finally {
      fs.writeFileSync(file, good)
    }
  })

  await t.test('an island that throws on hydration fails verify', async () => {
    write(dir, {
      'src/components/Boom.jsx': 'export default function Boom() {\n  throw new Error("boom at hydration")\n}\n',
      'src/pages/boom.astro': '---\nimport BaseLayout from "../layouts/BaseLayout.astro"\nimport Boom from "../components/Boom.jsx"\n---\n<BaseLayout meta={{ title: "Boom" }}>\n  <p>text</p>\n  <Boom client:only="react" />\n</BaseLayout>\n',
    })
    try {
      const verify = await pnpm(['verify'])
      assert.equal(verify.code, 1)
      assert.match(verify.out, /^FAIL \/boom\/$/m)
      assert.match(verify.out, /island not hydrated|JS errors|console errors/)
    } finally {
      fs.rmSync(path.join(dir, 'src', 'components', 'Boom.jsx'))
      fs.rmSync(path.join(dir, 'src', 'pages', 'boom.astro'))
    }
  })

  await t.test('a link to a missing page fails verify', async () => {
    write(dir, {
      'src/pages/links.astro': '---\nimport BaseLayout from "../layouts/BaseLayout.astro"\n---\n<BaseLayout meta={{ title: "Links" }}>\n  <a href="/nowhere/">missing</a>\n</BaseLayout>\n',
    })
    try {
      const verify = await pnpm(['verify'])
      assert.equal(verify.code, 1)
      assert.match(verify.out, /^FAIL \/links\/$/m)
      assert.match(verify.out, /dead link: \/nowhere\//)
    } finally {
      fs.rmSync(path.join(dir, 'src', 'pages', 'links.astro'))
    }
  })

  await t.test('a theme without theme.css stops verify before the build', async () => {
    const file = path.join(dir, 'theme', 'theme.css')
    fs.renameSync(file, file + '.bak')
    const distStamp = fs.statSync(path.join(dir, 'dist', 'index.html')).mtimeMs
    try {
      const verify = await pnpm(['verify'])
      assert.equal(verify.code, 1)
      assert.match(verify.out, /theme\/theme\.css not found/)
      assert.equal(fs.statSync(path.join(dir, 'dist', 'index.html')).mtimeMs, distStamp, 'dist/ untouched')
    } finally {
      fs.renameSync(file + '.bak', file)
    }
  })
})
