import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { en } from './src/locales/en'
import { id } from './src/locales/id'
import { fileURLToPath, URL } from 'node:url'

// Generate HTML metadata and manifest from the same editable content source.
function portfolioMetadata(): Plugin {
  const site = en.site
  const manifest = JSON.stringify({
    name: site.portfolioName,
    short_name: site.name,
    description: site.manifestDescription,
    start_url: '/en',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      { src: site.icon192, sizes: '192x192', type: 'image/png' },
      { src: site.icon512, sizes: '512x512', type: 'image/png' },
    ],
  }, null, 2)
  return {
    name: 'portfolio-content',
    transformIndexHtml: {
      order: 'pre' as const,
      handler(html: string, context) {
        const localized = context.originalUrl?.startsWith('/id') ? id.site : site
        return html.replace(/%portfolio\.(\w+)%/g, (_, key: string) => {
          const value = localized[key as keyof typeof site]
          if (typeof value !== 'string') throw new Error(`Unknown portfolio metadata: ${key}`)
          return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        })
      },
    },
    configureServer(server: import('vite').ViteDevServer) {
      server.middlewares.use('/manifest.json', (_request, response) => {
        response.setHeader('Content-Type', 'application/manifest+json')
        response.end(manifest)
      })
    },
    generateBundle(this: import('rollup').PluginContext) {
      this.emitFile({ type: 'asset', fileName: 'manifest.json', source: manifest })
    },
  }
}

export default defineConfig({
  plugins: [vue(), portfolioMetadata()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
