import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    hmr: true
  },
  build: {
    outDir: 'dist-dev',
    sourcemap: true
  }
})
