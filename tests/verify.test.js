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
