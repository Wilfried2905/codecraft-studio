import { Hono } from 'hono'
import { cors } from 'hono/cors'

const api = new Hono()

// Enable CORS
api.use('/api/*', cors())

// Health check
api.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ============================================================================
// TYPE 2 RECONSTRUCTION - VERSION PROPRE ET ROBUSTE
// ============================================================================

/**
 * PRINCIPE FONDAMENTAL :
 * 1. Détection Type 1 vs Type 2 AVANT d'appeler Claude
 * 2. System Prompt DIFFÉRENT selon le type
 * 3. Extraction MANUELLE ligne par ligne (PAS de JSON.parse)
 * 4. Structure de retour GARANTIE
 */

api.post('/api/generate', async (c) => {
  try {
    const { prompt, agent } = await c.req.json()
    
    if (!prompt) {
      return c.json({ error: 'Prompt is required' }, 400)
    }

    console.log('📥 Prompt reçu:', prompt.substring(0, 100))

    // ========================================================================
    // ÉTAPE 1 : DÉTECTION TYPE 1 vs TYPE 2
    // ========================================================================
    const promptLower = prompt.toLowerCase()
    const isType2 = (
      promptLower.includes('react') ||
      promptLower.includes('vite') ||
      promptLower.includes('vue') ||
      promptLower.includes('svelte') ||
      promptLower.includes('express') ||
      promptLower.includes('api') ||
      promptLower.includes('backend') ||
      promptLower.includes('serveur') ||
      promptLower.includes('node.js') ||
      promptLower.includes('typescript') ||
      promptLower.includes('full-stack') ||
      promptLower.includes('multi-fichier') ||
      (promptLower.includes('projet') && promptLower.includes('application'))
    )

    console.log('🎯 Type détecté:', isType2 ? 'TYPE 2 (Multi-fichiers)' : 'TYPE 1 (HTML simple)')

    // ========================================================================
    // ÉTAPE 2 : SYSTEM PROMPT ADAPTÉ
    // ========================================================================
    let systemPrompt = ''

    if (isType2) {
      // TYPE 2 : Prompt pour extraction manuelle fichier par fichier
      systemPrompt = `Tu es un expert développeur full-stack qui génère du code professionnel.

RÈGLES STRICTES POUR PROJETS MULTI-FICHIERS :

1. Format de sortie OBLIGATOIRE :
   - Commence par : PROJECT_NAME: nom-du-projet
   - Puis pour CHAQUE fichier :
     FILE: chemin/fichier.ext
     [contenu du fichier]
     END_FILE
   
2. Exemple de structure React + Vite :

PROJECT_NAME: react-todo-app

FILE: package.json
{
  "name": "react-todo-app",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.8"
  }
}
END_FILE

FILE: vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
END_FILE

FILE: index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React App</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
END_FILE

FILE: src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
END_FILE

FILE: src/App.jsx
import { useState } from 'react'

function App() {
  return (
    <div className="app">
      <h1>My App</h1>
    </div>
  )
}

export default App
END_FILE

FILE: src/index.css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, sans-serif;
}
END_FILE

3. IMPORTANT :
   - NE JAMAIS utiliser de JSON pour envelopper les fichiers
   - NE JAMAIS mettre de backticks (\`\`\`) autour du contenu
   - Utiliser UNIQUEMENT le format FILE: ... END_FILE
   - Inclure TOUS les fichiers nécessaires (package.json, config, etc.)
   
4. Standards de code :
   - Code production-ready (pas de TODO ni placeholder)
   - Gestion d'erreur complète
   - Comments en français
   - Tailwind CSS via CDN si besoin de styles
   - Composants React fonctionnels avec hooks`

    } else {
      // TYPE 1 : Prompt pour HTML simple
      systemPrompt = `Tu es un expert développeur frontend qui génère du code HTML/CSS/JavaScript professionnel.

RÈGLES STRICTES POUR HTML SIMPLE :

1. Génère UN SEUL fichier HTML complet et autonome
2. Structure :
   - DOCTYPE html valide
   - Tailwind CSS via CDN : <script src="https://cdn.tailwindcss.com"></script>
   - Font Awesome si besoin : <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
   - JavaScript moderne (ES6+) dans une balise <script>
   
3. Code production-ready :
   - Pas de TODO ni placeholder
   - Gestion d'erreur complète
   - LocalStorage pour persistance si besoin
   - Responsive mobile-first
   - Accessibilité (ARIA, labels, alt)
   
4. Retourne UNIQUEMENT le code HTML (pas de texte avant/après)
5. Pas de backticks (\`\`\`), juste le HTML pur`
    }

    // ========================================================================
    // ÉTAPE 3 : APPEL À CLAUDE
    // ========================================================================
    const apiKey = process.env.ANTHROPIC_API_KEY || c.env?.ANTHROPIC_API_KEY || ''

    if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
      console.error('❌ Anthropic API key not configured')
      return c.json({ error: 'API key not configured' }, 500)
    }

    console.log('🤖 Appel à Claude API...')

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
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Claude API error:', response.status, errorText)
      return c.json({ 
        error: 'Failed to generate code',
        details: errorText
      }, 500)
    }

    const data = await response.json()
    const fullResponse = data.content[0]?.text || ''

    console.log('✅ Réponse reçue, taille:', fullResponse.length, 'chars')
    console.log('📝 Début réponse:', fullResponse.substring(0, 200))

    // ========================================================================
    // ÉTAPE 4 : EXTRACTION ET PARSING
    // ========================================================================

    if (isType2) {
      // TYPE 2 : Extraction manuelle fichier par fichier
      console.log('🔧 Extraction Type 2 (multi-fichiers)...')

      const files: Array<{path: string, content: string}> = []
      let projectName = 'react-app'

      // Extraire le nom du projet
      const projectNameMatch = fullResponse.match(/PROJECT_NAME:\s*(.+)/i)
      if (projectNameMatch) {
        projectName = projectNameMatch[1].trim()
        console.log('📦 Nom projet:', projectName)
      }

      // Extraire les fichiers
      const fileRegex = /FILE:\s*(.+?)\n([\s\S]*?)(?=END_FILE|FILE:|$)/gi
      let match
      let fileCount = 0

      while ((match = fileRegex.exec(fullResponse)) !== null) {
        const path = match[1].trim()
        let content = match[2].trim()
        
        // Nettoyer le contenu (enlever END_FILE si présent)
        content = content.replace(/END_FILE\s*$/i, '').trim()
        
        files.push({ path, content })
        fileCount++
        console.log(`  📄 Fichier ${fileCount}: ${path} (${content.length} chars)`)
      }

      if (files.length === 0) {
        console.log('⚠️ Aucun fichier extrait, fallback vers Type 1')
        // Fallback: retourner le code brut comme HTML
        return c.json({
          success: true,
          projectType: 'single-file',
          code: fullResponse,
          message: '✅ Application générée avec succès !',
          agent: agent || 'Design',
          timestamp: new Date().toISOString(),
          usage: data.usage
        })
      }

      console.log(`✅ ${files.length} fichiers extraits avec succès`)

      // Trouver le fichier principal
      const mainFile = files.find(f => 
        f.path === 'index.html' || 
        f.path === 'src/main.jsx' ||
        f.path === 'src/App.jsx'
      )?.path || files[0].path

      return c.json({
        success: true,
        projectType: 'multi-files',
        projectName: projectName,
        files: files,
        mainFile: mainFile,
        setupInstructions: 'npm install && npm run dev',
        message: `📦 Projet "${projectName}" créé avec ${files.length} fichiers`,
        agent: agent || 'Full-Stack',
        timestamp: new Date().toISOString(),
        usage: data.usage
      })

    } else {
      // TYPE 1 : HTML simple
      console.log('🔧 Extraction Type 1 (HTML simple)...')

      // Nettoyer la réponse (enlever backticks si présents)
      let htmlCode = fullResponse.trim()
      
      // Supprimer ```html et ``` si présents
      if (htmlCode.startsWith('```')) {
        const lines = htmlCode.split('\n')
        lines.shift() // Enlever première ligne (```html)
        if (lines[lines.length - 1].trim() === '```') {
          lines.pop() // Enlever dernière ligne (```)
        }
        htmlCode = lines.join('\n').trim()
      }

      console.log('✅ HTML extrait, taille:', htmlCode.length, 'chars')

      return c.json({
        success: true,
        projectType: 'single-file',
        code: htmlCode,
        message: '✅ Application générée avec succès !',
        agent: agent || 'Design',
        timestamp: new Date().toISOString(),
        usage: data.usage
      })
    }

  } catch (error: any) {
    console.error('❌ Erreur génération:', error.message)
    return c.json({
      error: 'Failed to generate code',
      details: error.message
    }, 500)
  }
})

export default api
