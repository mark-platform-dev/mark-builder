import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { chromium } from 'playwright'
import { repoRoot, resolveOrExit } from './resolve.js'
import { buildProject } from './build.js'

async function launch() {
  try {
    return await chromium.launch()
  } catch (e) {
    if (/Executable doesn't exist/i.test(e.message)) {
      console.error('\ncheck needs Chromium. Install it once with:\n')
      console.error('  pnpm exec playwright install chromium\n')
      process.exit(1)
    }
    throw e
  }
}

export async function checkProject(name) {
  const projectDir = resolveOrExit(name)
  const file = await buildProject(name)

  const browser = await launch()
  const page = await browser.newPage()
  const jsErrors = []
  const failedRequests = []
  page.on('pageerror', (e) => jsErrors.push(e.message))
  page.on('requestfailed', (r) => failedRequests.push(r.url()))

  try {
    // Opened the same way a recipient would open it: straight off disk.
    await page.goto(pathToFileURL(file).href, { waitUntil: 'load' })
    await page.waitForTimeout(300)

    // Queried from the live DOM, not the file text: the minified React bundle
    // contains href="-like strings that make a text search cry wolf.
    const externalRefs = await page.evaluate(() =>
      [...document.querySelectorAll('script[src], link[href], img[src]')]
        .map((el) => el.getAttribute('src') ?? el.getAttribute('href'))
        .filter((v) => v && !v.startsWith('data:'))
    )
    const rootLength = await page.evaluate(
      () => document.getElementById('root')?.innerHTML.trim().length ?? -1
    )

    const failures = []
    if (externalRefs.length) failures.push(`external refs: ${externalRefs.join(', ')}`)
    if (rootLength <= 0) failures.push('#root is empty — nothing rendered')
    if (jsErrors.length) failures.push(`JS errors: ${jsErrors.join(' | ')}`)
    if (failedRequests.length) failures.push(`failed requests: ${failedRequests.join(', ')}`)

    // Fourth check, opt-in per project. Only meaningful where the expected
    // strings are stated explicitly: in an arbitrary project a value may
    // legitimately not render (a filter option, an internal id, a
    // click-to-reveal field).
    const expectedPath = path.join(projectDir, 'expected.json')
    if (fs.existsSync(expectedPath)) {
      const expected = JSON.parse(fs.readFileSync(expectedPath, 'utf8'))
      const text = await page.evaluate(() => document.body.innerText)
      const missing = (expected.strings ?? []).filter((s) => !text.includes(s))
      if (missing.length) failures.push(`missing expected strings: ${missing.join(', ')}`)
    }

    return { file, failures }
  } finally {
    await browser.close()
  }
}

if (import.meta.main) {
  const name = process.argv[2]
  try {
    const { file, failures } = await checkProject(name)
    if (failures.length) {
      console.error(`\ncheck FAILED for ${name}:`)
      for (const f of failures) console.error(`  - ${f}`)
      process.exit(1)
    }
    console.log(`\ncheck OK — ${path.relative(repoRoot, file)}`)
  } catch (e) {
    // Matches build.js's CLI entry: a broken YAML file (or any other
    // buildProject failure) should print one clean line, not an
    // unhandled-rejection dump with internal vite/rolldown frames.
    console.error(e.message || e)
    process.exit(1)
  }
}
