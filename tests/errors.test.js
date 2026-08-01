import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { projectsDir, repoRoot } from '../scripts/resolve.js'

const run = promisify(execFile)

const BROKEN_YAML_PROJECT = 'tmp-broken'

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
  const name = BROKEN_YAML_PROJECT
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
  // Scoped to the one staging dir this file's own failed build (above)
  // could have left — not a wildcard scan of shared out/, which other
  // test files build into concurrently and would otherwise false-positive.
  const ownStagingDir = path.join(repoRoot, 'out', `__staging-${BROKEN_YAML_PROJECT}`)
  assert.equal(fs.existsSync(ownStagingDir), false)
})
