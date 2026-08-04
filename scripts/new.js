import fs from 'node:fs'
import path from 'node:path'
import { listProjects, projectsDir } from './resolve.js'

const name = process.argv[2]

if (!name) {
  console.error('Usage: pnpm new <project>')
  process.exit(1)
}
if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) {
  console.error(`Invalid name "${name}". Use lowercase letters, digits and dashes.`)
  process.exit(1)
}
if (listProjects().includes(name)) {
  console.error(`Project "${name}" already exists.`)
  process.exit(1)
}

const dir = path.join(projectsDir, name)

const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${name}</title>
    <style type="text/css">
      @import "tailwindcss";
      @import "@fontsource-variable/ibm-plex-sans/wght.css";
      @import "@fontsource/ibm-plex-mono/latin-400.css";
      @import "@fontsource/ibm-plex-mono/cyrillic-400.css";
      @import "@fontsource/ibm-plex-mono/latin-600.css";
      @import "@fontsource/ibm-plex-mono/cyrillic-600.css";

      /* Starting point, not a dependency — see docs/visual-design/README.md
         before adding components. A project is free to redeclare any of
         these once its own design-plan.md says otherwise. */
      @theme {
        --font-sans: 'IBM Plex Sans Variable', ui-sans-serif, system-ui, sans-serif;
        --font-mono: 'IBM Plex Mono', ui-monospace, monospace;

        --color-ink: #211f1c;
        --color-paper: #fdfcfa;
        --color-muted: #75706a;
        --color-line: #e2ddd4;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./main.jsx"></script>
  </body>
</html>
`

const mainJsx = `import { createRoot } from 'react-dom/client'
import content from './data/content.yaml'
import Hello from './components/Hello.jsx'

// All data imports live here, so this file shows the whole picture at a glance.
createRoot(document.getElementById('root')).render(<Hello d={content} />)
`

const helloJsx = `export default function Hello({ d }) {
  return (
    <main className="mx-auto max-w-2xl bg-paper p-10 font-sans text-ink">
      <p className="font-mono text-xs tracking-widest text-muted uppercase">{d.eyebrow}</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{d.title}</h1>
      <p className="mt-3 text-muted">{d.subtitle}</p>
    </main>
  )
}
`

const contentYaml = `eyebrow: New project
title: ${name}
subtitle: Edit this file and the page reloads itself.
`

fs.mkdirSync(path.join(dir, 'raw'), { recursive: true })
fs.mkdirSync(path.join(dir, 'data'), { recursive: true })
fs.mkdirSync(path.join(dir, 'components'), { recursive: true })
fs.writeFileSync(path.join(dir, 'raw/.gitkeep'), '')
fs.writeFileSync(path.join(dir, 'data/content.yaml'), contentYaml)
fs.writeFileSync(path.join(dir, 'components/Hello.jsx'), helloJsx)
fs.writeFileSync(path.join(dir, 'main.jsx'), mainJsx)
fs.writeFileSync(path.join(dir, 'index.html'), indexHtml)

console.log(`Created projects/${name}

  1. Put source material in projects/${name}/raw/
  2. Ask an agent to build data/ and components/ from it
  3. pnpm dev ${name}`)
