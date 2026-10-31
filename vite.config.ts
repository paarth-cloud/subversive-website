import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

/** Points the canonical, Open Graph and JSON-LD URLs in index.html at VITE_SITE_URL when it is set. */
function siteUrl(url: string | undefined): Plugin {
  return {
    name: 'site-url',
    transformIndexHtml: (html) => (url ? html.replaceAll('https://aisubversive.com', url.replace(/\/+$/, '')) : html),
  }
}

// Three.js and the scene code are pulled in through a dynamic import in
// BrainCanvas, so they land in their own chunk and never block first paint.
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), siteUrl(loadEnv(mode, process.cwd(), 'VITE_').VITE_SITE_URL)],
  build: {
    target: 'es2022',
    assetsInlineLimit: 2048,
    chunkSizeWarningLimit: 900,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  preview: {
    port: 4173,
    strictPort: true,
  },
}))
