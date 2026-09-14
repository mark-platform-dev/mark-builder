import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { verifyProject } from '../template/scripts/verify.js'
import { dataStrings, exampleDir, flatten } from './helpers.js'

// Values that never appear as page text: ids, hrefs, the html lang, the
// site description and page meta blocks, which only land in <head>.
const NOT_RENDERED = new Set(['id', 'href', 'lang', 'description', 'meta'])

test('the overview example verifies and every value from its data/ reaches a page', async () => {
  const result = await verifyProject(exampleDir)
  assert.equal(result.ok, true, JSON.stringify(result.pages.map((p) => [p.url, p.failures]), null, 2))
  assert.deepEqual(result.warnings, [])
  assert.deepEqual(
    result.pages.map((p) => p.url),
    ['/mark-builder/', '/mark-builder/project/']
  )

  const text = flatten(result.pages.map((p) => p.text).join('\n'))
  const expected = dataStrings(path.join(exampleDir, 'data'), NOT_RENDERED)
  assert.ok(expected.length > 30, `expected many strings, got ${expected.length}`)
  const missing = expected.filter((s) => !text.includes(flatten(s)))
  assert.deepEqual(missing, [], `data values missing from the rendered pages: ${missing.join(' | ')}`)
})
