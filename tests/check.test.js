import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { parse as parseYaml } from 'yaml'
import { projectsDir } from '../scripts/resolve.js'
import { checkProject } from '../scripts/check.js'

const FIXTURE = 'mark-builder-overview'

// Every string leaf in a data file, at any depth. Derived from the data
// itself so editing data/ can't put this test out of date — the thing an
// expected-strings file next to the project could never manage.
function stringLeaves(node, out = []) {
  if (typeof node === 'string') out.push(node)
  else if (Array.isArray(node)) for (const v of node) stringLeaves(v, out)
  else if (node && typeof node === 'object') for (const v of Object.values(node)) stringLeaves(v, out)
  return out
}

function fixtureStrings() {
  const dataDir = path.join(projectsDir, FIXTURE, 'data')
  return fs
    .readdirSync(dataDir)
    .filter((f) => /\.(ya?ml|json)$/.test(f))
    .flatMap((f) => stringLeaves(parseYaml(fs.readFileSync(path.join(dataDir, f), 'utf8'))))
}

test(`${FIXTURE} passes every invariant`, async () => {
  const { failures } = await checkProject(FIXTURE)
  assert.deepEqual(failures, [])
})

// The smoke test that matters: it proves the whole pipeline is intact —
// YAML parsed, imported via main.jsx, rendered as props, inlined into one
// file that opens off disk. The invariants above only prove the page isn't
// broken; a component rendering headings and borders around missing data
// passes them all.
test(`${FIXTURE} renders every value from its data/`, async () => {
  const { text } = await checkProject(FIXTURE)
  const expected = fixtureStrings()

  // Guards against the walker silently returning nothing (a renamed data
  // dir, a parser change) and the assertion below passing vacuously.
  assert.ok(expected.length > 20, `expected many strings, got ${expected.length}`)

  // Normalised on whitespace and case. Whitespace: YAML folded scalars (>-)
  // join lines with a space, while the rendered text wraps at the browser's
  // own points. Case: section labels are styled `uppercase`, and innerText
  // applies text-transform, so `Commands` arrives as `COMMANDS`. Both are
  // presentation choices — the question here is whether the value reached
  // the page at all, not what it looks like once it did.
  const flatten = (s) => s.replace(/\s+/g, ' ').toLowerCase()
  const flat = flatten(text)
  const missing = expected.filter((s) => !flat.includes(flatten(s)))
  assert.deepEqual(missing, [], `data values missing from the rendered page: ${missing.join(' | ')}`)
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
