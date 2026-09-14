import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {
  BASE_TOKENS,
  checkTheme,
  listPages,
  normalizeBase,
  resolveFile,
  serveDist,
  verifyDist,
} from '../template/scripts/verify.js'
import { tmpDir } from './helpers.js'

function write(root, files) {
  for (const [rel, content] of Object.entries(files)) {
    const file = path.join(root, rel)
    fs.mkdirSync(path.dirname(file), { recursive: true })
    fs.writeFileSync(file, content)
  }
}

const FULL_THEME = `:root {\n${BASE_TOKENS.map((t) => `  ${t}: x;`).join('\n')}\n}\n`

test('checkTheme: a missing theme.css fails and names the expected path', async () => {
  const root = tmpDir('theme')
  fs.mkdirSync(path.join(root, 'theme'))
  const { failures } = await checkTheme(root)
  assert.equal(failures.length, 1, failures.join('\n'))
  assert.match(failures[0], /theme\/theme\.css not found/)
  assert.ok(failures[0].includes(path.join(root, 'theme', 'theme.css')))
})

test('checkTheme: every local url() must point to an existing file inside theme/', async () => {
  const root = tmpDir('theme')
  write(root, {
    'theme/theme.css':
      FULL_THEME +
      `.a { background: url(./assets/logo.svg); }\n` +
      `.b { background: url("../secret.png"); }\n` +
      `.c { background: url(assets/missing.png?v=2); }\n` +
      `.d { background: url(data:image/png;base64,AA); }\n` +
      `.e { src: url(https://fonts.example/f.woff2); }\n`,
    'theme/assets/logo.svg': '<svg xmlns="http://www.w3.org/2000/svg"/>',
    'secret.png': '',
  })
  const { failures, warnings } = await checkTheme(root)
  assert.deepEqual(warnings, [])
  assert.equal(failures.length, 2, failures.join('\n'))
  assert.match(failures[0], /url\(\.\.\/secret\.png\) points outside theme\//)
  assert.match(failures[1], /url\(assets\/missing\.png\?v=2\) does not exist/)
})

test('checkTheme: undefined base tokens are a warning, not a failure', async () => {
  const root = tmpDir('theme')
  write(root, { 'theme/theme.css': ':root { --color-primary: #000; }\n' })
  const { failures, warnings } = await checkTheme(root)
  assert.deepEqual(failures, [])
  assert.equal(warnings.length, 1)
  assert.ok(warnings[0].includes('--color-background'))
  assert.ok(!/--color-primary[,;]/.test(warnings[0]), 'defined token must not be listed')
})

test('checkTheme: a complete theme passes without warnings', async () => {
  const root = tmpDir('theme')
  write(root, { 'theme/theme.css': FULL_THEME })
  assert.deepEqual(await checkTheme(root), { failures: [], warnings: [] })
})

test('normalizeBase always starts and ends with a slash', () => {
  assert.equal(normalizeBase(undefined), '/')
  assert.equal(normalizeBase('/'), '/')
  assert.equal(normalizeBase('/mark-builder'), '/mark-builder/')
  assert.equal(normalizeBase('docs/'), '/docs/')
})

test('resolveFile maps URL paths to files like a static host and never leaves dist/', async () => {
  const root = tmpDir('dist')
  const dist = path.join(root, 'dist')
  write(root, {
    'dist/index.html': '',
    'dist/about/index.html': '',
    'dist/plain.html': '',
    'dist/_astro/a.css': '',
    'outside.txt': '',
  })
  assert.equal(await resolveFile(dist, ''), path.join(dist, 'index.html'))
  assert.equal(await resolveFile(dist, 'about/'), path.join(dist, 'about', 'index.html'))
  assert.equal(await resolveFile(dist, 'about'), path.join(dist, 'about', 'index.html'))
  assert.equal(await resolveFile(dist, 'plain'), path.join(dist, 'plain.html'))
  assert.equal(await resolveFile(dist, 'plain.html'), path.join(dist, 'plain.html'))
  assert.equal(await resolveFile(dist, '_astro/a.css'), path.join(dist, '_astro', 'a.css'))
  assert.equal(await resolveFile(dist, 'nope/'), null)
  assert.equal(await resolveFile(dist, '../outside.txt'), null)
})

test('listPages turns HTML files into URLs under the base and skips dot-directories', async () => {
  const dist = tmpDir('dist')
  write(dist, {
    'index.html': '',
    'roadmap/index.html': '',
    'reports/q3/index.html': '',
    '404.html': '',
    '.prerender/chunks/x.html': '',
    '_astro/a.css': '',
  })
  assert.deepEqual(await listPages(dist, '/mark-builder/'), [
    { file: '404.html', url: '/mark-builder/404.html' },
    { file: 'index.html', url: '/mark-builder/' },
    { file: 'reports/q3/index.html', url: '/mark-builder/reports/q3/' },
    { file: 'roadmap/index.html', url: '/mark-builder/roadmap/' },
  ])
})

test('serveDist serves dist/ under the base with content types and 404s elsewhere', async () => {
  const dist = tmpDir('dist')
  write(dist, { 'index.html': '<p>root</p>', 'about/index.html': '<p>about</p>', '_astro/a.css': 'p{}' })
  const server = await serveDist(dist, '/docs/')
  try {
    const home = await fetch(`${server.origin}/docs/`)
    assert.equal(home.status, 200)
    assert.match(home.headers.get('content-type'), /^text\/html/)
    assert.equal(await home.text(), '<p>root</p>')
    const css = await fetch(`${server.origin}/docs/_astro/a.css`)
    assert.equal(css.headers.get('content-type'), 'text/css')
    assert.equal((await fetch(`${server.origin}/docs/about/`)).status, 200)
    assert.equal((await fetch(`${server.origin}/about/`)).status, 404)
    assert.equal((await fetch(`${server.origin}/docs/missing/`)).status, 404)
  } finally {
    await server.close()
  }
})

test('verifyDist reports each broken page; external requests are warnings only', async () => {
  const dist = tmpDir('neg')
  write(dist, {
    'index.html': '<!doctype html><body><p>root</p></body>',
    'dead-link/index.html':
      '<!doctype html><body><p>hello</p><a href="/nowhere/">x</a><a href="#top">a</a>' +
      '<a href="mailto:a@b.c">m</a><a href="/">home</a><a href="https://example.com/">ext</a></body>',
    'island/index.html':
      '<!doctype html><body><p>text</p><astro-island ssr client="load" component-url="/_astro/X.js"></astro-island></body>',
    'visible/index.html':
      '<!doctype html><body><p>text</p><astro-island ssr client="visible" component-url="/_astro/V.js"></astro-island></body>',
    'throws/index.html': '<!doctype html><body><p>text</p><script>throw new Error("boom")</script></body>',
    'empty/index.html': '<!doctype html><body></body>',
    'graphic/index.html': '<!doctype html><body><svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"></svg></body>',
    'external/index.html':
      '<!doctype html><head><link rel="stylesheet" href="https://example.com/x.css"></head>' +
      '<body><p>text</p><img src="https://example.com/i.png" alt=""></body>',
    'missing-asset/index.html': '<!doctype html><body><p>text</p><img src="/_astro/nope.png" alt=""></body>',
  })
  const result = await verifyDist({ dist, base: '/' })
  const byUrl = Object.fromEntries(result.pages.map((p) => [p.url, p]))
  assert.equal(result.ok, false)
  assert.deepEqual(byUrl['/'].failures, [])
  assert.deepEqual(byUrl['/dead-link/'].failures, ['dead link: /nowhere/'])
  assert.deepEqual(byUrl['/island/'].failures, ['island not hydrated: /_astro/X.js (client:load)'])
  assert.deepEqual(byUrl['/visible/'].failures, [])
  assert.match(byUrl['/throws/'].failures.join(' | '), /JS errors: boom/)
  assert.deepEqual(byUrl['/empty/'].failures, ['body has no rendered content'])
  assert.deepEqual(byUrl['/graphic/'].failures, [])
  assert.deepEqual(byUrl['/external/'].failures, [])
  assert.equal(byUrl['/external/'].warnings.length, 2, byUrl['/external/'].warnings.join('\n'))
  assert.match(byUrl['/external/'].warnings[0], /external request blocked: https:\/\/example\.com\//)
  assert.match(byUrl['/missing-asset/'].failures.join(' | '), /failed requests: .*\/_astro\/nope\.png \(404\)/)
  assert.equal(byUrl['/'].text.trim(), 'root')
})

test('verifyDist under a sub-path base resolves links against that base', async () => {
  const dist = tmpDir('base')
  write(dist, {
    'index.html': '<!doctype html><body><p>root</p><a href="/mark-builder/about/">ok</a><a href="/about/">bad</a></body>',
    'about/index.html': '<!doctype html><body><p>about</p></body>',
  })
  const result = await verifyDist({ dist, base: '/mark-builder' })
  const byUrl = Object.fromEntries(result.pages.map((p) => [p.url, p]))
  assert.deepEqual(byUrl['/mark-builder/'].failures, ['dead link: /about/'])
  assert.deepEqual(byUrl['/mark-builder/about/'].failures, [])
})

test('verifyDist on an empty folder is a failure, not a pass', async () => {
  const result = await verifyDist({ dist: tmpDir('none'), base: '/' })
  assert.equal(result.ok, false)
  assert.match(result.error, /no HTML pages/)
})
