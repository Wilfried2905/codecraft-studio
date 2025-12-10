import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  ANTHROPIC_API_KEY: string
}

// Helper function to extract text from different file types
async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type
  const fileName = file.name.toLowerCase()

  try {
    // Text files
    if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      return await file.text()
    }

    // Word documents (.docx) - Use mammoth (works in Workers)
    if (fileName.endsWith('.docx') || fileType.includes('wordprocessingml')) {
      try {
        const mammoth = await import('mammoth')
        const arrayBuffer = await file.arrayBuffer()
        const result = await mammoth.extractRawText({ arrayBuffer })
        return `# Contenu du fichier Word : ${file.name}\n\n${result.value}\n\n---\nExtrait avec succès (${(file.size / 1024).toFixed(2)} KB)`
      } catch (error) {
        console.error('Mammoth error:', error)
        return `[Word Document: ${file.name}]\n\nErreur lors de l'extraction. Taille: ${(file.size / 1024).toFixed(2)} KB\n\nNote: Le fichier a été reçu mais l'extraction a échoué.`
      }
    }

    // Old Word (.doc) - Not fully supported in Workers
    if (fileName.endsWith('.doc') || fileType.includes('msword')) {
      return `[Word Document .doc: ${file.name}]\n\nNote: Les fichiers .doc (ancien format) ne sont pas entièrement supportés. Veuillez convertir en .docx ou fournir le contenu en texte.\nTaille: ${(file.size / 1024).toFixed(2)} KB`
    }

    // Excel files (.xlsx, .xls) - Use xlsx (works in Workers)
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || 
        fileType.includes('spreadsheetml') || fileType.includes('ms-excel')) {
      try {
        const XLSX = await import('xlsx')
        const arrayBuffer = await file.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })
        
        let extractedText = `# Contenu du fichier Excel : ${file.name}\n\n`
        
        workbook.SheetNames.forEach((sheetName, index) => {
          const sheet = workbook.Sheets[sheetName]
          const csvData = XLSX.utils.sheet_to_csv(sheet)
          extractedText += `## Feuille ${index + 1}: ${sheetName}\n\n\`\`\`csv\n${csvData}\n\`\`\`\n\n`
        })
        
        extractedText += `---\nExtrait avec succès (${(file.size / 1024).toFixed(2)} KB, ${workbook.SheetNames.length} feuille(s))`
        return extractedText
      } catch (error) {
        console.error('XLSX error:', error)
        return `[Excel Spreadsheet: ${file.name}]\n\nErreur lors de l'extraction. Taille: ${(file.size / 1024).toFixed(2)} KB`
      }
    }

    // PDF files - Use pdf-parse (may have limitations in Workers)
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      try {
        const pdfParse = await import('pdf-parse')
        const arrayBuffer = await file.arrayBuffer()
        const data = await pdfParse(Buffer.from(arrayBuffer))
        return `# Contenu du fichier PDF : ${file.name}\n\n${data.text}\n\n---\nExtrait avec succès (${(file.size / 1024).toFixed(2)} KB, ${data.numpages} page(s))`
      } catch (error) {
        console.error('PDF parse error:', error)
        return `[PDF File: ${file.name}]\n\nNote: Extraction PDF limitée dans cet environnement. Taille: ${(file.size / 1024).toFixed(2)} KB\n\nErreur: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }

    // PowerPoint files (.pptx, .ppt) - Limited support
    if (fileName.endsWith('.pptx') || fileName.endsWith('.ppt') || 
        fileType.includes('presentationml') || fileType.includes('ms-powerpoint')) {
      // PowerPoint parsing is complex and not well-supported in Workers
      // For now, we return a helpful message
      return `[PowerPoint Presentation: ${file.name}]\n\n⚠️ Extraction PowerPoint limitée.\n\nPour une meilleure analyse:\n1. Exportez votre présentation en PDF\n2. Ou copiez le contenu en format texte\n\nTaille: ${(file.size / 1024).toFixed(2)} KB`
    }

    // Fallback for unknown types
    return `[File: ${file.name}]\n\nType: ${fileType || 'unknown'}\nTaille: ${(file.size / 1024).toFixed(2)} KB\n\n⚠️ Type de fichier non supporté pour l'extraction automatique.\n\nFormats supportés:\n- Texte (.txt)\n- Word (.docx)\n- Excel (.xlsx, .xls)\n- PDF (limité)\n\nVeuillez fournir le contenu dans un format supporté.`

  } catch (error) {
    console.error('Error extracting text from file:', error)
    return `[Erreur: ${file.name}]\n\n❌ Une erreur est survenue lors de l'extraction du contenu.\n\nDétails: ${error instanceof Error ? error.message : 'Erreur inconnue'}\n\nVeuillez réessayer ou fournir le contenu dans un autre format.`
  }
}

const api = new Hono<{ Bindings: Bindings }>()

// Enable CORS for frontend
api.use('/*', cors())

// Health check endpoint
api.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Generate code with Anthropic Claude
api.post('/generate', async (c) => {
  try {
    const { prompt, agent, template, style } = await c.req.json()

    // Validate required fields
    if (!prompt) {
      return c.json({ error: 'Prompt is required' }, 400)
    }

    // Get API key from environment
    const apiKey = c.env?.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY

    if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
      console.warn('⚠️  Anthropic API key not configured, returning placeholder')
      
      // Return placeholder HTML for testing
      const placeholderHTML = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CodeCraft Studio - Placeholder</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen flex items-center justify-center p-8">
    <div class="max-w-2xl w-full bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-8 shadow-2xl">
        <div class="text-center">
            <div class="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-teal-400 to-purple-500 rounded-full flex items-center justify-center">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
            </div>
            <h1 class="text-4xl font-bold text-white mb-4">
                🎨 CodeCraft Studio
            </h1>
            <p class="text-xl text-purple-200 mb-6">
                Généré par l'agent <strong>${agent || 'Design'}</strong>
            </p>
            <div class="bg-black/30 rounded-lg p-4 mb-6">
                <p class="text-sm text-gray-300 font-mono">
                    Prompt: "${prompt}"
                </p>
            </div>
            <div class="space-y-3 text-left">
                <div class="flex items-start gap-3">
                    <div class="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p class="text-gray-200">
                        <strong>Template:</strong> ${template || 'Custom'}
                    </p>
                </div>
                <div class="flex items-start gap-3">
                    <div class="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                    </div>
                    <p class="text-gray-200">
                        <strong>Style:</strong> ${style || 'Default'}
                    </p>
                </div>
            </div>
            <div class="mt-8 p-4 bg-amber-500/20 border border-amber-500/50 rounded-lg">
                <p class="text-amber-200 text-sm">
                    ⚠️ <strong>Mode Placeholder:</strong> Configurez votre clé API Anthropic dans <code class="bg-black/30 px-2 py-0.5 rounded">.dev.vars</code> pour activer la génération IA réelle.
                </p>
            </div>
        </div>
    </div>
</body>
</html>`

      return c.json({
        success: true,
        code: placeholderHTML,
        agent: agent || 'Design',
        timestamp: new Date().toISOString(),
        placeholder: true
      })
    }

    // Build system prompt based on agent
    const agentPrompts: Record<string, string> = {
      design: `Tu es un expert UI/UX designer. Tu crées des interfaces modernes, élégantes et accessibles.
Focus sur l'esthétique, l'expérience utilisateur et les animations fluides.
Utilise Tailwind CSS pour le styling. Code propre et semantic HTML.`,
      
      code: `Tu es un développeur expert. Tu écris du code propre, performant et maintenable.
Focus sur les bonnes pratiques, l'optimisation et la structure du code.
Utilise les dernières fonctionnalités modernes (ES6+, Tailwind CSS).`,
      
      test: `Tu es un expert en tests et debugging. Tu valides le code et suggères des améliorations.
Focus sur la robustesse, la gestion des erreurs et les edge cases.
Ajoute des validations et des messages d'erreur clairs.`,
      
      doc: `Tu es un expert en documentation technique. Tu expliques clairement et de manière pédagogique.
Focus sur la clarté, les exemples et les commentaires utiles.
Ajoute des commentaires explicatifs dans le code.`,
      
      variations: `Tu es un créatif qui génère des variations de design.
Focus sur l'originalité tout en gardant la cohérence avec le brief.
Propose des styles différents (minimal, moderne, professionnel).`
    }

    const systemPrompt = agentPrompts[agent?.toLowerCase()] || agentPrompts.design

    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        temperature: 0.7,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: `${prompt}

${template ? `Template de base: ${template}` : ''}
${style ? `Style demandé: ${style}` : ''}

Génère un fichier HTML complet, autonome et fonctionnel.
Utilise Tailwind CSS via CDN pour le styling.
Le code doit être prêt à être copié/collé et fonctionner immédiatement.
Retourne UNIQUEMENT le code HTML, sans explications.`
          }
        ]
      })
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Anthropic API error:', error)
      return c.json({ 
        error: 'Failed to generate code',
        details: error 
      }, response.status)
    }

    const data = await response.json()
    const generatedCode = data.content[0].text

    return c.json({
      success: true,
      code: generatedCode,
      agent: agent || 'Design',
      timestamp: new Date().toISOString(),
      usage: data.usage
    })

  } catch (error: any) {
    console.error('Generation error:', error)
    return c.json({ 
      error: 'Internal server error',
      message: error.message 
    }, 500)
  }
})

// Generate variations (3 different styles)
api.post('/variations', async (c) => {
  try {
    const { code, prompt } = await c.req.json()

    if (!code) {
      return c.json({ error: 'Code is required' }, 400)
    }

    const apiKey = c.env?.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY

    if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
      // Return placeholder variations
      const styles = ['Minimal', 'Modern/Bold', 'Professional']
      const variations = styles.map((style, index) => ({
        style,
        code: code.replace(
          '<title>',
          `<title>Variation ${index + 1} - ${style} - `
        ).replace(
          '<body',
          `<body data-variation="${style}"`
        )
      }))

      return c.json({
        success: true,
        variations,
        placeholder: true
      })
    }

    // Generate 3 variations in parallel
    const styles = [
      { name: 'Minimal', description: 'Design épuré, minimaliste, beaucoup d\'espace blanc' },
      { name: 'Modern/Bold', description: 'Design moderne, couleurs vives, typographie audacieuse' },
      { name: 'Professional', description: 'Design corporate, sobre, élégant' }
    ]

    const variationPromises = styles.map(async (style) => {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          temperature: 0.8,
          messages: [
            {
              role: 'user',
              content: `Voici un code HTML:

${code}

Crée une variation avec le style suivant: ${style.name} - ${style.description}

Garde la même structure et fonctionnalités, mais change complètement l'apparence visuelle.
Utilise Tailwind CSS via CDN.
Retourne UNIQUEMENT le code HTML complet, sans explications.`
            }
          ]
        })
      })

      const data = await response.json()
      return {
        style: style.name,
        code: data.content[0].text
      }
    })

    const variations = await Promise.all(variationPromises)

    return c.json({
      success: true,
      variations
    })

  } catch (error: any) {
    console.error('Variations error:', error)
    return c.json({ 
      error: 'Failed to generate variations',
      message: error.message 
    }, 500)
  }
})

// Parse uploaded files (Word, Excel, PowerPoint, PDF)
api.post('/parse-file', async (c) => {
  try {
    // Get uploaded file from form data
    const formData = await c.req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return c.json({ error: 'No file provided' }, 400)
    }

    // Validate file size (max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return c.json({ error: 'File too large (max 10MB)' }, 400)
    }

    // Extract text content from file
    const content = await extractTextFromFile(file)

    return c.json({
      success: true,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      content,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('File parsing error:', error)
    return c.json({ 
      error: 'Failed to parse file',
      message: error.message 
    }, 500)
  }
})

export default api
