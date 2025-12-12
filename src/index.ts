/**
 * Hono Server Entry Point - Backend API
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import api from './routes/api'

const app = new Hono()

// Enable CORS globally
app.use('/*', cors())

// Mount API routes
app.route('/api', api)

// Health check
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    message: 'CodeCraft Studio API',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  })
})

// 404 handler
app.notFound((c) => {
  return c.json({
    error: 'Not found',
    path: c.req.path
  }, 404)
})

export default app
