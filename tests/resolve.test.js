import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { listProjects, projectsDir, resolveProject } from '../scripts/resolve.js'

const fixture = path.join(projectsDir, '__resolve-fixture')
fs.mkdirSync(fixture, { recursive: true })

test('listProjects includes a real project directory', () => {
  assert.ok(listProjects().includes('__resolve-fixture'))
})

test('resolveProject returns the absolute directory', () => {
  assert.equal(resolveProject('__resolve-fixture'), fixture)
})

test('unknown project throws, naming the project and listing what exists', () => {
  assert.throws(() => resolveProject('nope'), (e) => {
    assert.match(e.message, /No project "nope"/)
    assert.match(e.message, /__resolve-fixture/)
    return true
  })
})

test('missing name throws asking for one', () => {
  assert.throws(() => resolveProject(undefined), /Project name required/)
})

test('path traversal is refused', () => {
  assert.throws(() => resolveProject('../scripts'), /No project/)
})

test.after(() => fs.rmSync(fixture, { recursive: true, force: true }))
