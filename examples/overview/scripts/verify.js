// scripts/verify.js — build the site and check every page in a headless
// browser. `pnpm verify` runs it; README.md lists what is checked.
//
// Every piece is exported so mark-builder's own tests can exercise it on
// hand-written dist/ folders, without a build and (for these functions)
// without a browser.
import fs from 'node:fs/promises'
import http from 'node:http'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { chromium } from 'playwright'

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

async function launchBrowser() {
  try {
    return await chromium.launch()
  } catch (e) {
    if (/Executable doesn't exist/i.test(e.message)) {
      throw new Error('verify needs Chromium. Install it once with:\n\n  pnpm exec playwright install chromium\n')
    }
    throw e
  }
}

const SKIP_LINK = /^(#|mailto:|tel:|javascript:|data:)/i
const HYDRATED_DIRECTIVES = new Set(['load', 'idle', 'only'])

// Opens one page and collects everything that can go wrong with it. The
// page is judged after `load` plus network idle, so idle-hydrated islands
// have had their chance.
export async function checkPage(browser, { origin, base, dist }, pageInfo) {
  const page = await browser.newPage()
  const failures = []
  const warnings = []
  const pageErrors = []
  const consoleErrors = []
  const failedRequests = []
  const sameOrigin = (url) => new URL(url).origin === origin

  // No network: external resources are blocked and reported, so the result
  // is the same with and without internet access.
  await page.route('**/*', (route) => {
    const url = route.request().url()
    if (sameOrigin(url)) return route.continue()
    warnings.push(`external request blocked: ${url}`)
    return route.abort()
  })
  page.on('pageerror', (e) => pageErrors.push(e.message))
  page.on('console', (m) => {
    if (m.type() !== 'error') return
    // Chromium logs a "Failed to load resource" console error for every
    // blocked external request; that is already a warning above.
    const location = m.location()?.url ?? ''
    if (/^Failed to load resource/.test(m.text()) && location && !sameOrigin(location)) return
    consoleErrors.push(m.text())
  })
  page.on('requestfailed', (r) => {
    if (sameOrigin(r.url())) failedRequests.push(`${r.url()} (${r.failure()?.errorText ?? 'failed'})`)
  })
  page.on('response', (r) => {
    if (sameOrigin(r.url()) && r.status() >= 400) failedRequests.push(`${r.url()} (${r.status()})`)
  })

  try {
    await page.goto(origin + pageInfo.url, { waitUntil: 'load' })
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(200)

    const dom = await page.evaluate(() => ({
      elements: document.body.children.length,
      textLength: document.body.innerText.trim().length,
      graphics: document.body.querySelector('svg, canvas, img') !== null,
      islands: [...document.querySelectorAll('astro-island')].map((island) => ({
        client: island.getAttribute('client'),
        ssr: island.hasAttribute('ssr'),
        children: island.children.length,
        url: island.getAttribute('component-url'),
      })),
      links: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')),
      text: document.body.innerText,
    }))

    if (dom.elements === 0 || (dom.textLength === 0 && !dom.graphics)) failures.push('body has no rendered content')
    if (pageErrors.length) failures.push(`JS errors: ${pageErrors.join(' | ')}`)
    if (consoleErrors.length) failures.push(`console errors: ${consoleErrors.join(' | ')}`)
    if (failedRequests.length) failures.push(`failed requests: ${failedRequests.join(', ')}`)

    // Astro removes `ssr` only after a successful hydration. visible/media
    // islands hydrate on conditions this check does not create.
    for (const island of dom.islands) {
      if (!HYDRATED_DIRECTIVES.has(island.client)) continue
      if (island.ssr || island.children === 0) {
        failures.push(`island not hydrated: ${island.url ?? '(unknown)'} (client:${island.client})`)
      }
    }

    for (const href of dom.links) {
      if (SKIP_LINK.test(href)) continue
      const target = new URL(href, origin + pageInfo.url)
      if (target.origin !== origin) continue
      const inside = target.pathname.startsWith(base)
      if (!inside || !(await resolveFile(dist, target.pathname.slice(base.length)))) {
        failures.push(`dead link: ${href}`)
      }
    }

    return { ...pageInfo, failures, warnings, text: dom.text }
  } finally {
    await page.close()
  }
}

// Serves dist/ and checks every page in it.
export async function verifyDist({ dist, base = '/' }) {
  base = normalizeBase(base)
  dist = path.resolve(dist)
  const pages = await listPages(dist, base).catch(() => [])
  if (pages.length === 0) return { ok: false, pages: [], error: `no HTML pages in ${dist}` }
  const server = await serveDist(dist, base)
  try {
    const browser = await launchBrowser()
    try {
      const results = []
      for (const pageInfo of pages) results.push(await checkPage(browser, { origin: server.origin, base, dist }, pageInfo))
      return { ok: results.every((r) => r.failures.length === 0), pages: results }
    } finally {
      await browser.close()
    }
  } finally {
    await server.close()
  }
}

// The whole thing for a project root: theme, build, every page.
export async function verifyProject(root) {
  root = path.resolve(root)
  const theme = await checkTheme(root)
  if (theme.failures.length) {
    return { ok: false, stage: 'theme', failures: theme.failures, warnings: theme.warnings, pages: [] }
  }

  const { build } = await import('astro')
  await build({ root, logLevel: 'warn' })

  // Imported only after the build. Loading the integrations in-process
  // before build() gives React a second jsx runtime and MDX pages fail to
  // render with "dispatcher.getOwner is not a function".
  const { default: config } = await import(pathToFileURL(path.join(root, 'astro.config.mjs')).href)
  const dist = path.resolve(root, config.outDir ?? './dist')
  const result = await verifyDist({ dist, base: config.base ?? '/' })
  return { ...result, stage: 'pages', warnings: theme.warnings }
}

export function report(result, log = console.log) {
  for (const warning of result.warnings ?? []) log(`! ${warning}`)
  if (result.stage === 'theme') {
    log('\nverify FAILED before the build:')
    for (const failure of result.failures) log(`  - ${failure}`)
    return
  }
  if (result.error) {
    log(`\nverify FAILED: ${result.error}`)
    return
  }
  for (const page of result.pages) {
    log(`${page.failures.length ? 'FAIL' : 'ok  '} ${page.url}`)
    for (const failure of page.failures) log(`      - ${failure}`)
    for (const warning of page.warnings) log(`      ! ${warning}`)
  }
  const failed = result.pages.filter((p) => p.failures.length).length
  log(failed ? `\nverify FAILED — ${failed} of ${result.pages.length} pages` : `\nverify OK — ${result.pages.length} pages`)
}

// CLI entry: `node scripts/verify.js` from the project root.
const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (invokedDirectly) {
  try {
    const result = await verifyProject(process.cwd())
    report(result)
    process.exit(result.ok ? 0 : 1)
  } catch (e) {
    // A build error (broken YAML, a component throwing on the server) lands
    // here. Astro has already printed its own diagnostic; add one clean
    // line and a non-zero exit, no framework stack dump.
    console.error(`\n${e.message ?? e}`)
    process.exit(1)
  }
}
