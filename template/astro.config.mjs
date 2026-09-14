import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import mdx from '@astrojs/mdx'
import yaml from 'unplugin-yaml/vite'

export default defineConfig({
  // Static site is Astro's default; kept explicit because scripts/verify.js
  // relies on every route being an HTML file in dist/.
  output: 'static',
  integrations: [react(), mdx()],
  vite: {
    // `import data from '../data/x.yaml'` gives a plain object.
    plugins: [yaml()],
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
