import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'
import yamlPlugin from 'unplugin-yaml/vite'

// unplugin-yaml's transform hook calls yaml's parse() uncaught: a syntax
// error surfaces as a bare YAMLParseError with `linePos` but no Vite/Rollup
// `.loc`, so Astro's build error formatter (which only reads `.loc.file`,
// never the plugin's own `id`) drops the file name entirely — `astro build`
// would print "line N, column M" but never say which file. Wrapping
// transform to report the same error through `this.error({ loc })` gives
// Rollup a proper location, so the CLI (and the dev overlay) both name it.
const yaml = yamlPlugin()
const yamlTransform = yaml.transform
yaml.transform = function (code, id) {
  try {
    return yamlTransform.call(this, code, id)
  } catch (e) {
    if (e && e.name === 'YAMLParseError' && Array.isArray(e.linePos)) {
      const [start] = e.linePos
      this.error({ message: e.message, id, loc: { file: id, line: start.line, column: start.col }, cause: e })
    }
    throw e
  }
}

export default defineConfig({
  // Static site is Astro's default; kept explicit because scripts/verify.js
  // relies on every route being an HTML file in dist/.
  output: 'static',
  integrations: [react(), mdx()],
  vite: {
    // `import data from '../data/x.yaml'` gives a plain object.
    plugins: [yaml],
    server: {
      watch: {
        // virtiofs (Lima/Colima VMs, some Docker volumes) doesn't propagate
        // host-side writes as inotify events inside the guest, so the default
        // event-based watch never fires. Polling works everywhere.
        usePolling: true,
      },
    },
  },
})
