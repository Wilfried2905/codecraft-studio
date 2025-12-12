import { Hono } from 'hono'
import { cors } from 'hono/cors'

const api = new Hono()
api.use('/*', cors())

// Health check
api.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ============================================================================
// GÉNÉRATION DE CODE - TYPE 1 (HTML) vs TYPE 2 (Multi-fichiers)
// ============================================================================

api.post('/generate', async (c) => {
  try {
    const { prompt } = await c.req.json()
    
    if (!prompt) {
      return c.json({ error: 'Prompt requis' }, 400)
    }

    console.log('📥 Prompt:', prompt.substring(0, 80))

    // ========================================================================
    // ÉTAPE 1 : DÉTECTION TYPE
    // ========================================================================
    const lower = prompt.toLowerCase()
    const isType2 = (
      lower.includes('react') || lower.includes('vite') ||
      lower.includes('vue') || lower.includes('svelte') ||
      lower.includes('express') || lower.includes('api') ||
      lower.includes('backend') || lower.includes('node.js')
    )

    console.log('🎯 Type:', isType2 ? 'TYPE 2 (multi-fichiers)' : 'TYPE 1 (HTML)')

    // ========================================================================
    // ÉTAPE 2 : SYSTEM PROMPT
    // ========================================================================
    let systemPrompt = ''

    if (isType2) {
      systemPrompt = `Tu génères du code professionnel. Format obligatoire :

PROJECT_NAME: nom-du-projet

FILE: package.json
{
  "name": "mon-app",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite"
  },
  "dependencies": {
    "react": "^18.2.0"
  }
}
END_FILE

FILE: src/App.jsx
function App() {
  return <h1>Hello</h1>
}
export default App
END_FILE

Règles:
- Un fichier = FILE: chemin + contenu + END_FILE
- Pas de JSON global, pas de backticks
- Code production-ready (pas de TODO)
- Tous fichiers nécessaires (package.json, vite.config.js, etc.)`

    } else {
      systemPrompt = `Tu génères UN SEUL fichier HTML complet.

Règles:
- DOCTYPE html valide
- Tailwind CSS: <script src="https://cdn.tailwindcss.com"></script>
- JavaScript ES6+ dans <script>
- Responsive, accessible
- LocalStorage si persistance
- Retourne UNIQUEMENT le HTML (pas de texte avant/après, pas de backticks)`
    }

    // ========================================================================
    // ÉTAPE 3 : APPEL CLAUDE
    // ========================================================================
    const apiKey = process.env.ANTHROPIC_API_KEY || ''
    
    if (!apiKey) {
      return c.json({ error: 'API key manquante' }, 500)
    }

    console.log('🤖 Appel Claude...')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8192,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('❌ Claude error:', response.status, err)
      return c.json({ error: 'Claude API error', details: err }, 500)
    }

    const data = await response.json()
    const text = data.content[0]?.text || ''

    console.log('✅ Réponse:', text.length, 'chars')

    // ========================================================================
    // ÉTAPE 4 : EXTRACTION
    // ========================================================================

    if (isType2) {
      console.log('🔧 Extraction Type 2...')

      // Extraire nom projet
      let projectName = 'react-app'
      const nameMatch = text.match(/PROJECT_NAME:\s*(.+)/i)
      if (nameMatch) projectName = nameMatch[1].trim()

      // Extraire fichiers
      const files: Array<{path: string, content: string}> = []
      const regex = /FILE:\s*(.+?)\n([\s\S]*?)(?=END_FILE|FILE:|$)/gi
      let match

      while ((match = regex.exec(text)) !== null) {
        const path = match[1].trim()
        const content = match[2].replace(/END_FILE\s*$/i, '').trim()
        files.push({ path, content })
        console.log(`  📄 ${path} (${content.length} chars)`)
      }

      if (files.length === 0) {
        console.log('⚠️ Aucun fichier, fallback Type 1')
        return c.json({
          success: true,
          projectType: 'single-file',
          code: text,
          message: '✅ Application générée'
        })
      }

      console.log(`✅ ${files.length} fichiers extraits`)

      return c.json({
        success: true,
        projectType: 'multi-files',
        projectName,
        files,
        mainFile: files[0].path,
        setupInstructions: 'npm install && npm run dev',
        message: `📦 Projet "${projectName}" avec ${files.length} fichiers`
      })

    } else {
      console.log('🔧 Extraction Type 1...')

      // Nettoyer HTML
      let html = text.trim()
      if (html.startsWith('```')) {
        const lines = html.split('\n')
        lines.shift()
        if (lines[lines.length - 1].trim() === '```') lines.pop()
        html = lines.join('\n').trim()
      }

      console.log('✅ HTML:', html.length, 'chars')

      return c.json({
        success: true,
        projectType: 'single-file',
        code: html,
        message: '✅ Application générée'
      })
    }

  } catch (error: any) {
    console.error('❌ Erreur:', error.message)
    return c.json({ error: error.message }, 500)
  }
})

export default api
