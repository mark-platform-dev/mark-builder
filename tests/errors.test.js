import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { projectsDir, repoRoot } from '../scripts/resolve.js'

const run = promisify(execFile)

async function cli(script, args) {
  try {
    const { stdout, stderr } = await run('node', [path.join(repoRoot, 'scripts', script), ...args], {
      cwd: repoRoot,
    })
    return { code: 0, out: stdout + stderr }
  } catch (e) {
    return { code: e.code ?? 1, out: (e.stdout ?? '') + (e.stderr ?? '') }
  }
}

test('unknown project exits 1 and lists what is available', async () => {
  const { code, out } = await cli('build.js', ['definitely-not-a-project'])
  assert.equal(code, 1)
  assert.match(out, /No project "definitely-not-a-project"/)
  assert.match(out, /Available:/)
  assert.match(out, /example/)
})

test('broken YAML exits 1 naming the file and the line', async () => {
  const name = 'tmp-broken'
  const dir = path.join(projectsDir, name)
  fs.rmSync(dir, { recursive: true, force: true })
  try {
    const created = await cli('new.js', [name])
    assert.equal(created.code, 0, created.out)

    // Sequence item with no "-" indicator: invalid YAML, valid-looking text.
    fs.writeFileSync(
      path.join(dir, 'data/content.yaml'),
      'title: Broken\nitems:\n  - name: x\n   subtitle: y\n'
    )

    const { code, out } = await cli('build.js', [name])
    assert.equal(code, 1)
    assert.match(out, /content\.yaml/)
    assert.match(out, /line \d+/)
    assert.match(out, /column \d+/)
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
    fs.rmSync(path.join(repoRoot, 'out', `${name}.html`), { force: true })
  }
})

test('a failed build leaves no staging directory behind', async () => {
  const outDir = path.join(repoRoot, 'out')
  // out/ may not exist at all under a fresh checkout or after `rm -rf out` —
  // that's vacuously "no leftovers", not a failure, so guard the read.
  const leftovers = fs.existsSync(outDir)
    ? fs
        .readdirSync(outDir, { withFileTypes: true })
        .filter((e) => e.isDirectory() && e.name.startsWith('__staging'))
    : []
  assert.deepEqual(leftovers, [])
})
