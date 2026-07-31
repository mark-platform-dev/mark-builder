import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
export const projectsDir = path.join(repoRoot, 'projects')

export function listProjects() {
  if (!fs.existsSync(projectsDir)) return []
  return fs
    .readdirSync(projectsDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()
}

function withList(message) {
  return `${message}\nAvailable: ${listProjects().join(', ') || '(none)'}`
}

export function resolveProject(name) {
  if (!name) throw new Error(withList('Project name required.'))
  const dir = path.join(projectsDir, name)
  // path.dirname check rejects traversal like "../scripts" and nested paths.
  if (path.dirname(dir) !== projectsDir || !fs.existsSync(dir)) {
    throw new Error(withList(`No project "${name}".`))
  }
  return dir
}

export function resolveOrExit(name) {
  try {
    return resolveProject(name)
  } catch (e) {
    console.error(e.message)
    process.exit(1)
  }
}
