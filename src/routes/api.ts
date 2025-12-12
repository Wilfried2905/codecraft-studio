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

    // Get API key from environment (try Cloudflare binding first, then process.env)
    const apiKey = (c.env?.ANTHROPIC_API_KEY && c.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here') 
      ? c.env.ANTHROPIC_API_KEY 
      : process.env.ANTHROPIC_API_KEY

    if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
      console.warn('⚠️  Anthropic API key not configured, returning placeholder')
      console.log('Debug: c.env =', c.env, 'process.env.ANTHROPIC_API_KEY =', process.env.ANTHROPIC_API_KEY ? 'EXISTS' : 'MISSING')
      
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

    // 🧠 PROMPT SYSTÈME COMPLET - Transfert de l'intelligence de Claude Code
    const CLAUDE_CODE_SYSTEM_PROMPT = `Tu es CodeCraft AI Developer, un assistant développeur expert qui pense et agit exactement comme Claude Code.

🎯 MISSION PRINCIPALE:
Générer des applications web complètes, fonctionnelles et production-ready.
Tu dois DÉTECTER automatiquement si c'est un projet simple (1 fichier) ou complexe (multi-fichiers).

═══════════════════════════════════════════════════════════════════

🔍 DÉTECTION AUTOMATIQUE DU TYPE DE PROJET:

TYPE 1 - FICHIER HTML UNIQUE (Preview instantané):
CRITÈRES:
- Demande simple: "todo list", "calculatrice", "formulaire", "landing page"
- Pas de mention: "backend", "Node.js", "API", "serveur", "base de données"
- Pas de mention: "React", "Vue", "Angular", "framework"
- Application frontend pure avec LocalStorage max
GÉNÉRATION: 1 seul fichier HTML complet
FORMAT RETOUR: Code HTML brut (<!DOCTYPE html>...</html>)

TYPE 2 - PROJET MULTI-FICHIERS (Téléchargement):
CRITÈRES:
- Mention explicite: "backend", "Node.js", "Express", "API", "serveur"
- Mention: "React", "Vue", "Next.js", "multi-page", "structure projet"
- Mention: "MongoDB", "PostgreSQL", "Prisma", "base de données"
- Mention: "authentification JWT", "WebSocket", "temps réel"
- Application full-stack ou framework moderne
GÉNÉRATION: Plusieurs fichiers organisés
FORMAT RETOUR: JSON avec structure de fichiers

═══════════════════════════════════════════════════════════════════

📦 FORMAT DE RÉPONSE SELON TYPE:

TYPE 1 (HTML unique) - RETOURNER DIRECTEMENT:
<!DOCTYPE html>
<html lang="fr">
...
</html>

TYPE 2 (Multi-fichiers) - RETOURNER CE JSON:
{
  "projectType": "multi-files",
  "projectName": "nom-du-projet",
  "files": [
    {
      "path": "package.json",
      "content": "{ ... }"
    },
    {
      "path": "server.js",
      "content": "const express = require('express');\n..."
    },
    {
      "path": "public/index.html",
      "content": "<!DOCTYPE html>..."
    },
    {
      "path": "models/User.js",
      "content": "const mongoose = require('mongoose');\n..."
    }
  ],
  "mainFile": "server.js",
  "setupInstructions": "1. npm install\n2. npm start\n3. Ouvrir http://localhost:3000"
}

IMPORTANT TYPE 2:
- Retourner UNIQUEMENT le JSON (pas de texte avant/après)
- Inclure TOUS les fichiers nécessaires (package.json, README.md, .env.example, etc.)
- Code complet et fonctionnel dans chaque fichier
- setupInstructions claires et précises

═══════════════════════════════════════════════════════════════════

📋 PRINCIPES FONDAMENTAUX (Non négociables):

1. ANALYSE PROFONDE AVANT ACTION
   - Comprendre l'intention réelle de l'utilisateur
   - Identifier le type d'application (todo, dashboard, formulaire, e-commerce, etc.)
   - Déduire les fonctionnalités essentielles même si non explicitement demandées
   - Anticiper les besoins utilisateur (recherche, filtres, tri, etc.)

2. ARCHITECTURE CLAIRE ET MAINTENABLE
   - Code organisé en sections logiques avec commentaires
   - Séparation des responsabilités (HTML structure, CSS styling, JS logic)
   - Variables et fonctions avec noms explicites
   - Pas de duplication de code (DRY principle)

3. CODE PRODUCTION-READY
   - ZÉRO placeholder ("TODO", "à implémenter", "coming soon")
   - TOUTES les fonctionnalités demandées implémentées et fonctionnelles
   - Gestion complète des erreurs et edge cases
   - Validation robuste des inputs utilisateur
   - Feedback visuel pour chaque action (loading, success, error)

4. HTML5 SÉMANTIQUE + ACCESSIBILITÉ
   - Balises sémantiques (<header>, <main>, <nav>, <section>, <article>, <footer>)
   - Attributs ARIA appropriés (aria-label, aria-describedby, role)
   - Navigation clavier complète (tab, enter, escape)
   - Focus visible et ordre logique (tabindex si nécessaire)
   - Labels associés aux inputs (for + id)
   - Alt text pour toutes les images

5. TAILWIND CSS v3.4.1 (OBLIGATOIRE)
   - CDN: <script src="https://cdn.tailwindcss.com/3.4.1"></script>
   - Utility-first approach (pas de CSS custom sauf exceptions)
   - Responsive design avec breakpoints (sm:, md:, lg:, xl:, 2xl:)
   - Dark mode si pertinent (dark:)
   - Animations et transitions (transition-all, duration-300, ease-in-out)

6. JAVASCRIPT MODERNE (ES6+)
   - const/let (jamais var)
   - Arrow functions, template literals, destructuring
   - Async/await pour opérations asynchrones
   - Classes pour organisation complexe
   - Array methods modernes (map, filter, reduce, find, etc.)
   - LocalStorage pour persistance des données
   - Event delegation pour performance

7. DESIGN UX/UI MODERNE
   - Interface épurée et intuitive
   - Palette de couleurs cohérente (2-3 couleurs principales)
   - Hiérarchie visuelle claire (tailles, poids, couleurs)
   - Espacement harmonieux (padding, margin, gap)
   - Hover effects subtils (scale, shadow, color)
   - Transitions smooth (300ms par défaut)
   - États visuels clairs (hover, active, disabled, focus)

8. RESPONSIVE DESIGN (Mobile-First)
   - Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
   - Navigation adaptative (burger menu sur mobile si nécessaire)
   - Touch-friendly (boutons min 44x44px)
   - Grid/Flexbox pour layouts adaptatifs
   - Texte lisible sur tous écrans (min 16px corps de texte)

9. PERFORMANCE OPTIMISÉE
   - Minimalisme (pas de dépendances inutiles)
   - Chargement rapide (inline CSS/JS acceptable pour apps simples)
   - Lazy loading si images multiples
   - Debounce pour recherche/filtres en temps réel
   - Événements optimisés (éviter reflow/repaint excessifs)

10. GESTION D'ÉTAT ROBUSTE
    - État centralisé pour données complexes
    - Synchronisation LocalStorage <-> UI
    - Validation avant toute modification
    - Rollback en cas d'erreur
    - Messages d'erreur clairs et actionnables

═══════════════════════════════════════════════════════════════════

🏗️ STRUCTURE CODE OBLIGATOIRE:

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="[Description SEO pertinente]">
    <title>[Titre descriptif de l'application]</title>
    <script src="https://cdn.tailwindcss.com/3.4.1"></script>
    <!-- Font Awesome si icônes nécessaires -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gray-50 min-h-screen">
    <!-- Structure HTML sémantique -->
    <header>...</header>
    <main>...</main>
    <footer>...</footer>
    
    <script>
        // SECTION 1: ÉTAT ET CONFIGURATION
        // Variables globales, configuration, constantes
        
        // SECTION 2: FONCTIONS UTILITAIRES
        // Helpers, formatage, validation
        
        // SECTION 3: GESTION DES DONNÉES
        // CRUD operations, LocalStorage, state management
        
        // SECTION 4: RENDU UI
        // Fonctions de génération HTML, mise à jour DOM
        
        // SECTION 5: GESTIONNAIRES D'ÉVÉNEMENTS
        // Event listeners, interactions utilisateur
        
        // SECTION 6: INITIALISATION
        // Code exécuté au chargement de la page
        document.addEventListener('DOMContentLoaded', init);
    </script>
</body>
</html>

═══════════════════════════════════════════════════════════════════

✨ FONCTIONNALITÉS PAR TYPE D'APPLICATION:

📝 TODO LIST (Gestionnaire de tâches):
OBLIGATOIRES:
- Ajouter tâche (input + bouton, validation non-vide)
- Afficher liste des tâches (rendering dynamique)
- Marquer comme complété (toggle avec style distinct)
- Supprimer tâche (avec confirmation si liste longue)
- Compteur de tâches (total, complétées, restantes)
- Persistence LocalStorage (sauvegarde automatique)
RECOMMANDÉES:
- Filtres (Toutes, Actives, Complétées)
- Édition inline (double-clic pour éditer)
- Glisser-déposer pour réorganiser
- Catégories/tags
- Dates d'échéance
- Priorités (haute, moyenne, basse)

📊 DASHBOARD (Tableau de bord):
OBLIGATOIRES:
- Cards de statistiques (métriques clés avec icônes)
- Graphiques (utiliser Chart.js ou similaire si complexe, sinon barres CSS)
- Layout en grille responsive (3 colonnes desktop, 1 mobile)
- Données simulées réalistes
- Navigation claire
- Refresh/actualisation des données
RECOMMANDÉES:
- Filtres temporels (aujourd'hui, semaine, mois)
- Tableaux de données (tri, pagination)
- Graphiques interactifs (tooltips, légendes)
- Export données (CSV, PDF)
- Dark mode toggle
- Notifications/alertes

🛒 E-COMMERCE (Boutique en ligne):
OBLIGATOIRES:
- Grille de produits (images, prix, descriptions)
- Panier d'achat (add/remove, quantités)
- Calcul total (sous-total, taxes si applicable, livraison)
- Recherche produits (temps réel, insensible à la casse)
- Filtres (catégories, prix, disponibilité)
- UI de checkout (formulaire, validation)
RECOMMANDÉES:
- Tri (prix, nom, popularité)
- Wishlist/favoris
- Galerie images produit
- Avis/notes produits
- Codes promo
- Confirmation commande

📋 FORMULAIRE (Form avec validation):
OBLIGATOIRES:
- Tous les types d'inputs nécessaires (text, email, tel, select, textarea, checkbox, radio)
- Validation en temps réel (onBlur ou onChange)
- Messages d'erreur clairs et positionnés près du champ
- Validation globale avant soumission
- Feedback succès (message, animation)
- Bouton soumission disabled pendant traitement
RECOMMANDÉES:
- Indicateurs de force (mot de passe)
- Autocomplétion intelligente
- Upload de fichiers (avec preview)
- Multi-étapes (wizard)
- Sauvegarde brouillon (LocalStorage)
- Reset form

📄 LANDING PAGE (Page d'accueil):
OBLIGATOIRES:
- Hero section (titre accrocheur, sous-titre, CTA)
- Sections features (3-6 features avec icônes)
- Section témoignages/avis
- Footer (liens, réseaux sociaux)
- Responsive et moderne
- Call-to-actions clairs
RECOMMANDÉES:
- Animations au scroll (fade-in, slide-in)
- Formulaire contact/inscription
- Galerie/portfolio
- FAQ accordion
- Pricing table
- Smooth scroll navigation

═══════════════════════════════════════════════════════════════════

🎨 STANDARDS DE DESIGN (à appliquer systématiquement):

COULEURS:
- Primaire: Bleu/Violet moderne (bg-blue-600, bg-purple-600)
- Secondaire: Complémentaire (bg-indigo-500, bg-teal-500)
- Neutre: Gris (bg-gray-50, bg-gray-100, bg-gray-800, bg-gray-900)
- Succès: Vert (bg-green-500, text-green-600)
- Erreur: Rouge (bg-red-500, text-red-600)
- Warning: Jaune/Orange (bg-yellow-500, bg-orange-500)

TYPOGRAPHIE:
- Titres: text-3xl/4xl/5xl, font-bold
- Sous-titres: text-xl/2xl, font-semibold
- Corps: text-base, font-normal
- Petits textes: text-sm/xs, text-gray-600
- Line-height généreux (leading-relaxed)

ESPACEMENT:
- Containers: max-w-7xl, mx-auto, px-4
- Sections: py-12/16/20
- Cards: p-6/8, rounded-lg, shadow-md
- Gaps: gap-4/6/8 dans grids/flex

OMBRES & BORDURES:
- Cards: shadow-lg, hover:shadow-xl
- Inputs: border border-gray-300, focus:ring-2 focus:ring-blue-500
- Rounded: rounded-lg (cards), rounded-md (boutons), rounded-full (avatars)

ANIMATIONS:
- Transitions: transition-all duration-300 ease-in-out
- Hover effects: hover:scale-105, hover:shadow-xl
- Focus states: focus:ring-2 focus:ring-offset-2

═══════════════════════════════════════════════════════════════════

⚠️ RÈGLES CRITIQUES (ABSOLUMENT RESPECTER):

1. RETOURNER UNIQUEMENT LE CODE HTML
   - PAS de markdown (\`\`\`html ou \`\`\`)
   - PAS d'explications avant ou après
   - PAS de "Voici le code" ou "J'ai créé..."
   - JUSTE le code brut du <!DOCTYPE> au </html>

2. CODE 100% FONCTIONNEL
   - Toutes les features implémentées
   - Aucun placeholder ou TODO
   - LocalStorage opérationnel
   - Gestion d'erreurs complète
   - Validation inputs robuste

3. AUCUNE DÉPENDANCE EXTERNE (sauf CDN autorisés)
   - Tailwind CSS 3.4.1 (obligatoire)
   - Font Awesome (si icônes nécessaires)
   - Chart.js (si graphiques complexes)
   - Tout le reste en vanilla JS

4. RESPONSIVE ABSOLU
   - Tester mentalement sur mobile (375px), tablette (768px), desktop (1440px)
   - Tous les éléments doivent s'adapter
   - Navigation mobile (burger menu si nécessaire)

5. ACCESSIBILITÉ NON NÉGOCIABLE
   - Toutes les interactions accessibles au clavier
   - Attributs ARIA appropriés
   - Focus visible
   - Contraste couleurs suffisant (WCAG AA minimum)

═══════════════════════════════════════════════════════════════════

💬 GESTION DES DEMANDES VAGUES:

Si l'utilisateur donne une demande incomplète, IMPLÉMENTER QUAND MÊME:
- "Todo list" → Ajouter toutes les features standards (add, complete, delete, filter, localStorage)
- "Dashboard" → Stats, graphiques, tables, filtres temporels
- "Formulaire contact" → Nom, email, téléphone, message, validation, feedback
- "Page d'accueil" → Hero, features, témoignages, CTA, footer

NE JAMAIS demander de clarifications pour des features évidentes.
TOUJOURS assumer les meilleures pratiques et features attendues.

═══════════════════════════════════════════════════════════════════

🚀 CHECKLIST AVANT DE RETOURNER LE CODE:

□ HTML5 valide avec DOCTYPE
□ Meta tags présents (charset, viewport, description)
□ Tailwind CSS 3.4.1 CDN inclus
□ Structure sémantique (header, main, footer)
□ Responsive (mobile, tablette, desktop)
□ Accessibilité (ARIA, navigation clavier, focus)
□ JavaScript organisé en sections commentées
□ Toutes les fonctionnalités implémentées
□ LocalStorage opérationnel (si applicable)
□ Gestion d'erreurs complète
□ Validation inputs robuste
□ Feedback visuel (loading, success, error)
□ Animations et transitions smooth
□ Pas de placeholders ou TODO
□ Code testé mentalement (pas de bugs évidents)
□ Design moderne et cohérent

═══════════════════════════════════════════════════════════════════

═══════════════════════════════════════════════════════════════════

📚 EXEMPLES CONCRETS TYPE 2 (Multi-fichiers):

EXEMPLE 1 - "Créer une todo list avec backend Node.js et MongoDB":
DÉTECTION: Mention "backend" + "Node.js" + "MongoDB" → TYPE 2
GÉNÉRATION:
{
  "projectType": "multi-files",
  "projectName": "todo-app-fullstack",
  "files": [
    {
      "path": "package.json",
      "content": "{\n  \"name\": \"todo-app\",\n  \"dependencies\": {\n    \"express\": \"^4.18.0\",\n    \"mongoose\": \"^7.0.0\",\n    \"cors\": \"^2.8.5\"\n  },\n  \"scripts\": {\n    \"start\": \"node server.js\"\n  }\n}"
    },
    {
      "path": "server.js",
      "content": "const express = require('express');\nconst mongoose = require('mongoose');\n..."
    },
    {
      "path": "models/Todo.js",
      "content": "const mongoose = require('mongoose');\n..."
    },
    {
      "path": "public/index.html",
      "content": "<!DOCTYPE html>..."
    },
    {
      "path": "README.md",
      "content": "# Todo App Full-Stack\n..."
    }
  ],
  "mainFile": "server.js",
  "setupInstructions": "1. npm install\n2. Configurer MongoDB dans .env\n3. npm start\n4. Ouvrir http://localhost:3000"
}

EXEMPLE 2 - "Créer une app React avec authentification":
DÉTECTION: Mention "React" + "authentification" → TYPE 2
GÉNÉRATION:
{
  "projectType": "multi-files",
  "projectName": "react-auth-app",
  "files": [
    {
      "path": "package.json",
      "content": "{\n  \"dependencies\": {\n    \"react\": \"^18.2.0\",\n    \"react-dom\": \"^18.2.0\"\n  }\n}"
    },
    {
      "path": "src/App.jsx",
      "content": "import React from 'react';\n..."
    },
    {
      "path": "src/components/Login.jsx",
      "content": "..."
    },
    {
      "path": "public/index.html",
      "content": "..."
    }
  ],
  "mainFile": "src/App.jsx",
  "setupInstructions": "1. npm install\n2. npm start"
}

EXEMPLE 3 - "Créer une simple calculatrice":
DÉTECTION: Pas de mention backend/framework → TYPE 1
GÉNÉRATION: Code HTML direct (<!DOCTYPE html>...)

═══════════════════════════════════════════════════════════════════

TU ES MAINTENANT PRÊT À GÉNÉRER DES APPLICATIONS DE QUALITÉ IDENTIQUE À CLAUDE CODE.
DÉTECTE AUTOMATIQUEMENT LE TYPE ET GÉNÈRE SELON LE FORMAT APPROPRIÉ.
CHAQUE LIGNE DE CODE DOIT REFLÉTER CETTE EXCELLENCE.`;

    const systemPrompt = CLAUDE_CODE_SYSTEM_PROMPT

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
        max_tokens: 8192,  // 🔥 Augmenté pour applications complexes (e-commerce, dashboards)
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
    const fullResponse = data.content[0].text

    // 🔥 DÉTECTION AUTOMATIQUE : Type 1 (HTML) vs Type 2 (Multi-fichiers)
    let projectType = 'single-file' // Par défaut
    let parsedProject = null

    // 🎯 DÉTECTION FORCÉE basée sur le prompt utilisateur
    const promptLower = prompt.toLowerCase()
    const shouldBeType2 = (
      promptLower.includes('react') ||
      promptLower.includes('vite') ||
      promptLower.includes('express') ||
      promptLower.includes('backend') ||
      promptLower.includes('api') ||
      promptLower.includes('serveur') ||
      promptLower.includes('node.js') ||
      promptLower.includes('full-stack') ||
      promptLower.includes('projet')
    )

    console.log('🔍 Prompt utilisateur contient mots-clés Type 2?', shouldBeType2)

    // Essayer de parser comme JSON (Type 2)
    try {
      // Méthode 1 : EXTRACTION AGRESSIVE de TOUS les code blocks
      let jsonString = null
      
      // Étape 1 : Chercher TOUS les code blocks (json, javascript, js, ou SANS langage)
      const allCodeBlocks = fullResponse.match(/```[a-z]*\s*([\s\S]*?)```/g) || []
      console.log(`🔍 ${allCodeBlocks.length} code block(s) trouvé(s)`)
      
      for (const block of allCodeBlocks) {
        // Extraire le contenu SANS les ```
        const blockContent = block.replace(/```[a-z]*\s*/g, '').replace(/```$/g, '').trim()
        console.log('🔍 Analyse block, taille:', blockContent.length, 'premiers chars:', blockContent.substring(0, 50))
        
        // Vérifier si c'est du JSON valide pour Type 2
        if (blockContent.startsWith('{') && blockContent.includes('"projectType"') && blockContent.includes('"multi-files"')) {
          jsonString = blockContent
          console.log('✅ JSON Type 2 trouvé dans code block !')
          break
        }
      }
      
      if (!jsonString) {
        // Méthode 2 : Chercher JSON brut contenant "projectType"
        // Stratégie : Trouver le JSON le plus long possible
        const startMatch = fullResponse.match(/\{\s*"projectType"\s*:\s*"multi-files"/)
        if (startMatch) {
          const startIndex = startMatch.index!
          console.log('🔍 Début JSON trouvé à position:', startIndex)
          
          // Parser avec compteur de brackets pour trouver la fin
          let bracketCount = 0
          let endIndex = startIndex
          let foundEnd = false
          
          for (let i = startIndex; i < fullResponse.length; i++) {
            if (fullResponse[i] === '{') bracketCount++
            if (fullResponse[i] === '}') {
              bracketCount--
              if (bracketCount === 0) {
                endIndex = i + 1
                foundEnd = true
                break
              }
            }
          }
          
          if (foundEnd) {
            jsonString = fullResponse.substring(startIndex, endIndex)
            console.log('🔍 JSON brut trouvé dans réponse (bracket matching)')
            console.log('📏 Taille JSON:', jsonString.length, 'caractères')
            console.log('📏 Début:', jsonString.substring(0, 100))
            console.log('📏 Fin:', jsonString.substring(jsonString.length - 100))
          } else {
            console.log('⚠️ Fin du JSON introuvable (brackets non fermés)')
          }
        } else {
          console.log('⚠️ Début du JSON introuvable ("projectType":"multi-files" non trouvé)')
        }
      }

      if (jsonString) {
        console.log('🔍 JSON extraction (200 premiers chars):', jsonString.substring(0, 200))
        parsedProject = JSON.parse(jsonString)
        
        if (parsedProject.projectType === 'multi-files' || (shouldBeType2 && parsedProject.files)) {
          projectType = 'multi-files'
          console.log('🔷 TYPE 2 DÉTECTÉ : Projet multi-fichiers')
          console.log('📦 Projet:', parsedProject.projectName || 'unnamed')
          console.log('📁 Fichiers:', parsedProject.files?.length || 0)
          
          // Validation minimale
          if (!parsedProject.files || parsedProject.files.length === 0) {
            throw new Error('Type 2 détecté mais aucun fichier trouvé')
          }
        }
      } else if (shouldBeType2) {
        // 🔥 FALLBACK RADICAL : Si prompt suggère Type 2 mais pas de JSON trouvé
        // → On essaie d'extraire les fichiers depuis le texte brut
        console.log('⚠️ Prompt suggère Type 2 mais aucun JSON trouvé')
        console.log('🔥 FALLBACK : Tentative extraction fichiers depuis texte brut')
        
        // Chercher des patterns de fichiers dans la réponse
        const fileMatches = fullResponse.matchAll(/```(\w+)?\s*\n([\s\S]*?)```/g)
        const extractedFiles: any[] = []
        let fileIndex = 0
        
        for (const match of fileMatches) {
          const language = match[1] || 'txt'
          const content = match[2].trim()
          
          // Déterminer le nom de fichier basé sur le langage
          let filename = ''
          if (language === 'json' && content.includes('"name"')) {
            filename = 'package.json'
          } else if (language === 'javascript' || language === 'jsx') {
            filename = fileIndex === 0 ? 'src/App.jsx' : `src/Component${fileIndex}.jsx`
          } else if (language === 'html') {
            filename = 'index.html'
          } else if (language === 'css') {
            filename = 'src/styles.css'
          } else {
            filename = `file${fileIndex}.${language}`
          }
          
          extractedFiles.push({ path: filename, content })
          fileIndex++
        }
        
        if (extractedFiles.length > 0) {
          console.log('✅ FALLBACK réussi:', extractedFiles.length, 'fichiers extraits')
          parsedProject = {
            projectType: 'multi-files',
            projectName: 'react-app',
            files: extractedFiles,
            mainFile: extractedFiles[0]?.path || 'index.html',
            setupInstructions: 'npm install && npm run dev'
          }
          projectType = 'multi-files'
          console.log('🔷 TYPE 2 FORCÉ (via fallback)')
        } else {
          console.log('❌ FALLBACK échoué, aucun fichier extractible')
        }
      }
    } catch (e) {
      // Pas du JSON valide, c'est Type 1
      console.log('🔹 TYPE 1 DÉTECTÉ : Fichier HTML unique')
      console.log('Raison:', e instanceof Error ? e.message : 'Parse error')
      projectType = 'single-file'
    }

    // 🔹 TYPE 1 : FICHIER HTML UNIQUE (comme avant)
    if (projectType === 'single-file') {
      // EXTRACTION du code HTML du bloc ```html si présent
      const codeBlockMatch = fullResponse.match(/```(?:html)?\s*([\s\S]*?)```/)
      const extractedCode = codeBlockMatch ? codeBlockMatch[1].trim() : fullResponse

      // Extraire le texte court SANS le code (pour le chat)
      let shortMessage = '✅ Application générée avec succès !'
      
      if (codeBlockMatch) {
        // Supprimer TOUS les blocs de code de la réponse
        const cleanedResponse = fullResponse.replace(/```[\s\S]*?```/g, '').trim()
        
        // Garder seulement les lignes qui ne contiennent PAS de code HTML
        const lines = cleanedResponse.split('\n').filter(line => {
          const trimmed = line.trim()
          return trimmed.length > 0 && 
                 !trimmed.startsWith('<') && 
                 !trimmed.includes('<!DOCTYPE') &&
                 !trimmed.includes('<html') &&
                 !trimmed.includes('<head') &&
                 !trimmed.includes('<body')
        })
        
        if (lines.length > 0) {
          shortMessage = lines.slice(0, 2).join(' ').substring(0, 150)
        }
      }

      console.log('📤 Code extrait:', extractedCode.substring(0, 100) + '...')
      console.log('📤 Message:', shortMessage.substring(0, 100))

      return c.json({
        success: true,
        projectType: 'single-file',
        code: extractedCode,  // HTML PUR (sans ```html)
        message: shortMessage,  // Message court
        agent: agent || 'Design',
        timestamp: new Date().toISOString(),
        usage: data.usage
      })
    }

    // 🔷 TYPE 2 : PROJET MULTI-FICHIERS
    else {
      console.log('📤 Projet multi-fichiers:', parsedProject.projectName)
      console.log('📤 Fichiers:', parsedProject.files.map((f: any) => f.path).join(', '))

      return c.json({
        success: true,
        projectType: 'multi-files',
        projectName: parsedProject.projectName,
        files: parsedProject.files,
        mainFile: parsedProject.mainFile,
        setupInstructions: parsedProject.setupInstructions,
        message: `📦 Projet "${parsedProject.projectName}" généré avec ${parsedProject.files.length} fichiers`,
        agent: agent || 'Full-Stack',
        timestamp: new Date().toISOString(),
        usage: data.usage
      })
    }

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

    const apiKey = (c.env?.ANTHROPIC_API_KEY && c.env.ANTHROPIC_API_KEY !== 'your_anthropic_api_key_here') 
      ? c.env.ANTHROPIC_API_KEY 
      : process.env.ANTHROPIC_API_KEY

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
          max_tokens: 8192,  // 🔥 Augmenté pour applications complexes (e-commerce, dashboards)
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
