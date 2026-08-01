import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import yaml from 'unplugin-yaml/vite'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Shared by every project. The scripts always pass this file to Vite via an
// explicit `configFile`, because Vite would otherwise look for a config inside
// the project folder, find none, and load no plugins at all.
export default defineConfig({
  plugins: [react(), yaml(), tailwindcss(), viteSingleFile()],
  build: {
    // singlefile inlines JS/CSS; this pushes images into base64 too, so the
    // output has zero external references.
    assetsInlineLimit: Infinity,
  },
  server: {
    watch: {
      // virtiofs (Lima/Colima VMs, some Docker volumes) doesn't propagate
      // host-side writes as inotify events inside the guest, so chokidar's
      // default event-based watch never fires. Polling works everywhere.
      usePolling: true,
    },
  },
})
