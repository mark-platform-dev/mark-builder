// scripts/verify.js — build the site and check every page in a headless
// browser. `pnpm verify` runs it; README.md lists what is checked.
//
// Every piece is exported so mark-builder's own tests can exercise it on
// hand-written dist/ folders, without a build and (for these functions)
// without a browser.
import fs from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'

export const BASE_TOKENS = [
  '--color-background',
  '--color-surface',
  '--color-foreground',
  '--color-muted',
  '--color-border',
  '--color-primary',
  '--color-primary-contrast',
  '--font-body',
  '--font-heading',
  '--font-mono',
  '--radius-control',
  '--radius-card',
]

// Static checks of theme/ before anything is built: the required file
// exists, every local url() resolves inside the folder, and base tokens the
// theme leaves undefined are reported (base.css fallbacks cover them).
export async function checkTheme(root) {
  const failures = []
  const warnings = []
  const themeDir = path.join(root, 'theme')
  const file = path.join(themeDir, 'theme.css')
  const css = await fs.readFile(file, 'utf8').catch(() => null)
  if (css === null) {
    return { failures: [`theme/theme.css not found (expected ${file})`], warnings }
  }
  for (const m of css.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)) {
    const ref = m[2].trim()
    if (/^(data:|https?:|\/\/|#)/i.test(ref)) continue
    const target = path.resolve(themeDir, ref.split(/[?#]/)[0])
    if (!target.startsWith(themeDir + path.sep)) {
      failures.push(`theme/theme.css: url(${ref}) points outside theme/`)
    } else if (!(await fs.stat(target).catch(() => null))?.isFile()) {
      failures.push(`theme/theme.css: url(${ref}) does not exist (${target})`)
    }
  }
  const missing = BASE_TOKENS.filter((token) => !new RegExp(`${token}\\s*:`).test(css))
  if (missing.length) {
    warnings.push(`theme/theme.css does not define ${missing.join(', ')}; base.css fallbacks apply`)
  }
  return { failures, warnings }
}

export function normalizeBase(base) {
  let b = base ?? '/'
  if (!b.startsWith('/')) b = '/' + b
  if (!b.endsWith('/')) b += '/'
  return b
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
}

// Maps a URL path below the base (no leading slash) to a file in dist/ the
// way a static host would: "about/" → about/index.html, "about" → about.html
// or about/index.html, "x.css" → x.css. Returns null when nothing matches;
// the normalised path can never escape dist/.
export async function resolveFile(dist, rel) {
  const clean = path.posix.normalize('/' + rel).slice(1)
  const candidates =
    clean === '' || rel.endsWith('/')
      ? [path.join(dist, clean, 'index.html')]
      : [path.join(dist, clean), path.join(dist, clean + '.html'), path.join(dist, clean, 'index.html')]
  for (const candidate of candidates) {
    if (candidate !== dist && !candidate.startsWith(dist + path.sep)) continue
    const stat = await fs.stat(candidate).catch(() => null)
    if (stat?.isFile()) return candidate
  }
  return null
}

// Every HTML file in dist/ as { file, url }. index.html maps to its
// directory URL, anything else keeps its file name (404.html → /404.html).
// Dot-directories (Astro's .prerender scratch space) are skipped.
export async function listPages(dist, base) {
  const pages = []
  async function walk(dir, rel) {
    for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue
      const relPath = rel ? `${rel}/${entry.name}` : entry.name
      if (entry.isDirectory()) await walk(path.join(dir, entry.name), relPath)
      else if (entry.name.endsWith('.html')) {
        pages.push({ file: relPath, url: base + relPath.replace(/(^|\/)index\.html$/, '$1') })
      }
    }
  }
  await walk(dist, '')
  return pages.sort((a, b) => a.file.localeCompare(b.file))
}

// A minimal static server for dist/, mounted under the base. Own server
// rather than `astro preview` so hand-written dist/ fixtures can be served
// without an Astro project around them.
export async function serveDist(dist, base) {
  const server = http.createServer(async (req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname)
    const file = pathname.startsWith(base) ? await resolveFile(dist, pathname.slice(base.length)) : null
    if (!file) {
      res.writeHead(404, { 'content-type': 'text/plain' })
      res.end('not found')
      return
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' })
    res.end(await fs.readFile(file))
  })
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  return {
    origin: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((resolve) => server.close(resolve)),
  }
}
