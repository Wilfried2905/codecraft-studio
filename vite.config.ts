import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: './',
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: {
      host: '3000-ihdye4xvkepvg23f15bfe-5c13a017.sandbox.novita.ai',
      protocol: 'wss'
    },
    // Allow access from sandbox URLs
    allowedHosts: [
      '3000-ihdye4xvkepvg23f15bfe-5c13a017.sandbox.novita.ai',
      '.sandbox.novita.ai',
      'localhost'
    ],
    // Disable host check for development
    strictPort: false,
    // IMPORTANT: Proxy API requests to Hono backend
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
        configure: (proxy, options) => {
          // Fallback: if 8787 not running, return placeholder
          proxy.on('error', (err, req, res) => {
            console.warn('⚠️ API proxy error (backend not running):', err.message)
            if (res.writeHead) {
              res.writeHead(503, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({
                error: 'Backend not running',
                message: 'Start Hono backend with: wrangler pages dev dist --port 8787'
              }))
            }
          })
        }
      }
    }
  },
  build: {
    outDir: 'dist-client',
    sourcemap: false,  // Désactiver pour réduire l'usage mémoire
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'monaco': ['@monaco-editor/react'],
          'ui-vendor': ['lucide-react'],
          'utils': ['jszip', 'file-saver', 'marked']
        }
      }
    }
  }
})
