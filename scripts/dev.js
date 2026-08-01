import path from 'node:path'
import { createServer } from 'vite'
import { repoRoot, resolveOrExit } from './resolve.js'

const name = process.argv[2]
const root = resolveOrExit(name)

const server = await createServer({
  root,
  configFile: path.join(repoRoot, 'vite.config.js'),
  base: './',
})
await server.listen()
console.log(`\n${name} → ${server.resolvedUrls.local[0]}`)
console.log(`Edit files in projects/${name}/data/ — the page reloads itself.\n`)
