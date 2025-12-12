/**
 * Development Server - Hono Backend API
 * Runs on port 8787 in development
 */

import { serve } from '@hono/node-server'
import { config } from 'dotenv'
import app from './src/index'

// Load .env variables
config()

const port = 8787

console.log(`🚀 Starting Hono backend server on port ${port}...`)

serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`✅ Backend API server is running on http://localhost:${info.port}`)
  console.log(`📡 API endpoints available at http://localhost:${info.port}/api/*`)
})
