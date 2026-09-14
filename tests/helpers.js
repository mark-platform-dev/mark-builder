import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { parse as parseYaml } from 'yaml'

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const templateDir = path.join(repoRoot, 'template')
export const exampleDir = path.join(repoRoot, 'examples', 'overview')

// Astro otherwise tries to write telemetry config under ~/.config, which
// sandboxes and CI runners may forbid. Set for this process (in-process
// build()) and for every child process spawned through exec().
process.env.ASTRO_TELEMETRY_DISABLED = '1'
export const env = { ...process.env, ASTRO_TELEMETRY_DISABLED: '1', FORCE_COLOR: '0' }

const run = promisify(execFile)

// Runs a command and never throws: callers assert on the exit code and output.
export async function exec(cmd, args, opts = {}) {
  try {
    const { stdout, stderr } = await run(cmd, args, { env, maxBuffer: 64 * 1024 * 1024, ...opts })
    return { code: 0, out: stdout + stderr }
  } catch (e) {
    return { code: e.code ?? 1, out: (e.stdout ?? '') + (e.stderr ?? '') }
  }
}

// Every string leaf in a data structure, at any depth, skipping the keys in
// `skipKeys` (ids, hrefs, meta blocks — values that legitimately never
// appear as page text).
export function stringLeaves(node, out = [], skipKeys = new Set()) {
  if (typeof node === 'string') out.push(node)
  else if (Array.isArray(node)) for (const v of node) stringLeaves(v, out, skipKeys)
  else if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) if (!skipKeys.has(k)) stringLeaves(v, out, skipKeys)
  }
  return out
}

// All string leaves of every YAML/JSON file directly inside `dir`.
export function dataStrings(dir, skipKeys = new Set()) {
  return fs
    .readdirSync(dir)
    .filter((f) => /\.(ya?ml|json)$/.test(f))
    .flatMap((f) => stringLeaves(parseYaml(fs.readFileSync(path.join(dir, f), 'utf8')), [], skipKeys))
}

// Whitespace and case normalised: YAML folded scalars join lines with a
// space while the browser wraps where it likes, and CSS text-transform
// changes the case innerText reports.
export const flatten = (s) => s.replace(/\s+/g, ' ').toLowerCase()

export function tmpDir(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), `mark-builder-${prefix}-`))
}
