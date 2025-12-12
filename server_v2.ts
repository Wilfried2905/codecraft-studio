import { serve } from '@hono/node-server'
import api from './src/routes/api_clean'

const port = 8788 // Port différent pour tester en parallèle

console.log('🚀 Starting API V2 test server on port', port)

serve({
  fetch: api.fetch,
  port
})

console.log('✅ API V2 server running on http://localhost:' + port)
console.log('📡 API endpoints available at http://localhost:' + port + '/api/*')
