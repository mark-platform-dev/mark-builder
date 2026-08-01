import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { projectsDir } from '../scripts/resolve.js'
import { checkProject } from '../scripts/check.js'

test('example passes every invariant', async () => {
  const { failures } = await checkProject('example')
  assert.deepEqual(failures, [])
})

test('a project that renders nothing fails the #root check', async () => {
  const name = '__check-empty'
  const dir = path.join(projectsDir, name)
  try {
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(
      path.join(dir, 'index.html'),
      '<!doctype html><html><body><div id="root"></div>' +
        '<script type="module" src="./main.jsx"></script></body></html>'
    )
    // Valid module, renders nothing into #root.
    fs.writeFileSync(path.join(dir, 'main.jsx'), 'console.log("no render")\n')

    const { failures } = await checkProject(name)
    assert.ok(
      failures.some((f) => f.includes('#root')),
      `expected a #root failure, got: ${JSON.stringify(failures)}`
    )
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
    fs.rmSync(path.join(projectsDir, '..', 'out', `${name}.html`), { force: true })
  }
})

test('an external reference fails the self-contained check', async () => {
  const name = '__check-external'
  const dir = path.join(projectsDir, name)
  try {
    fs.mkdirSync(dir, { recursive: true })
    const externalHtmlParts = [
      '<!doctype html>',
      '<html>',
      '<head>',
      '<link rel="stylesheet" href="https://cdn.example.com/x.css" />',
      '</head>',
      '<body><div id="root"></div>',
      '<script type="module" src="./main.jsx"></script>',
      '</body></html>',
    ]
    fs.writeFileSync(path.join(dir, 'index.html'), externalHtmlParts.join(''))
    fs.writeFileSync(
      path.join(dir, 'main.jsx'),
      'document.getElementById("root").textContent = "hi"\n'
    )

    const { failures } = await checkProject(name)
    assert.ok(
      failures.some((f) => f.includes('external')),
      `expected an external-ref failure, got: ${JSON.stringify(failures)}`
    )
  } finally {
    fs.rmSync(dir, { recursive: true, force: true })
    fs.rmSync(path.join(projectsDir, '..', 'out', `${name}.html`), { force: true })
  }
})
