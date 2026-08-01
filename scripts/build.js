import fs from 'node:fs/promises'
import path from 'node:path'
import { build } from 'vite'
import { repoRoot, resolveOrExit } from './resolve.js'

export async function buildProject(name) {
  const root = resolveOrExit(name)
  // basename of the validated, resolved directory — not the raw CLI arg.
  // A trailing slash or a `../projects/x`-shaped name still resolves to a
  // real project dir; building output paths from the raw string instead
  // would let a typo silently write outside out/ while still exiting 0.
  const slug = path.basename(root)
  const outDir = path.join(repoRoot, 'out')
  const staging = path.join(outDir, `__staging-${slug}`)

  try {
    await build({
      root,
      // Required: without this Vite looks for a config inside `root`,
      // loads no plugins, and parses YAML as JavaScript.
      configFile: path.join(repoRoot, 'vite.config.js'),
      // Required: the output is opened over file://, where absolute paths break.
      base: './',
      build: { outDir: staging, emptyOutDir: true },
    })
    const target = path.join(outDir, `${slug}.html`)
    await fs.rm(target, { force: true })
    await fs.rename(path.join(staging, 'index.html'), target)
    return target
  } finally {
    await fs.rm(staging, { recursive: true, force: true })
  }
}

if (import.meta.main) {
  try {
    const out = await buildProject(process.argv[2])
    console.log(`\nBuilt ${path.relative(repoRoot, out)}`)
  } catch (e) {
    console.error(e.message || e)
    process.exit(1)
  }
}
