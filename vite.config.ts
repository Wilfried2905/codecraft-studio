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
    strictPort: false
  },
  build: {
    outDir: 'dist-client',
    sourcemap: true
  }
})
