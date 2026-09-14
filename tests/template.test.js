import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { exec, repoRoot, templateDir } from './helpers.js'

test('the template builds in place', async () => {
  const { code, out } = await exec('pnpm', ['--filter', 'mark-builder-template', 'build'], { cwd: repoRoot })
  assert.equal(code, 0, out)
  const html = fs.readFileSync(path.join(templateDir, 'dist', 'index.html'), 'utf8')
  assert.match(html, /<h1>mark-builder template<\/h1>/)
})
