import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import { renderer } from './renderer'

type Bindings = {
  ANTHROPIC_API_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Serve static files
app.use('/static/*', serveStatic({ root: './' }))
app.use('/favicon.ico', serveStatic({ path: './favicon.ico' }))

// Use renderer for HTML pages
app.get('*', renderer)

export default app
