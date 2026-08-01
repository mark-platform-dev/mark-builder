import fs from 'node:fs/promises'
import path from 'node:path'
import { build } from 'vite'
import { repoRoot, resolveOrExit } from './resolve.js'

export async function buildProject(name) {
  const root = resolveOrExit(name)
  const outDir = path.join(repoRoot, 'out')
  const staging = path.join(outDir, `__staging-${name}`)

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
    const target = path.join(outDir, `${name}.html`)
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
