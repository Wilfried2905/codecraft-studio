/**
 * ZIP Generator - Génère un fichier ZIP à partir d'une structure de fichiers
 * Utilise JSZip (chargé via CDN dans index.html)
 */

interface FileItem {
  path: string
  content: string
}

/**
 * Génère et télécharge un fichier ZIP contenant tous les fichiers du projet
 */
export async function generateAndDownloadZip(
  projectName: string,
  files: FileItem[]
): Promise<void> {
  // Charger JSZip dynamiquement via CDN si pas déjà chargé
  if (!(window as any).JSZip) {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
    document.head.appendChild(script)
    
    await new Promise((resolve, reject) => {
      script.onload = resolve
      script.onerror = reject
    })
  }

  const JSZip = (window as any).JSZip
  const zip = new JSZip()

  // Ajouter chaque fichier au ZIP
  files.forEach(file => {
    zip.file(file.path, file.content)
  })

  // Générer le blob ZIP
  const blob = await zip.generateAsync({ type: 'blob' })

  // Créer un lien de téléchargement
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${projectName}.zip`
  
  // Déclencher le téléchargement
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Nettoyer
  URL.revokeObjectURL(url)
}

/**
 * Copie tous les fichiers dans le presse-papiers (alternative au ZIP)
 */
export async function copyFilesToClipboard(files: FileItem[]): Promise<void> {
  const content = files.map(file => 
    `// ${file.path}\n${'-'.repeat(50)}\n${file.content}\n\n`
  ).join('\n')

  await navigator.clipboard.writeText(content)
}

/**
 * Export HTML simple (télécharge le code HTML directement)
 */
export function exportHTML(code: string): void {
  const blob = new Blob([code], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'index.html'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Export ZIP séparé (HTML/CSS/JS dans des fichiers distincts)
 */
export async function exportSeparatedZIP(code: string): Promise<void> {
  // Extraction basique HTML/CSS/JS
  const htmlMatch = code.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  const cssMatch = code.match(/<style[^>]*>([\s\S]*?)<\/style>/i)
  const jsMatch = code.match(/<script[^>]*>([\s\S]*?)<\/script>/i)

  const files: FileItem[] = [
    {
      path: 'index.html',
      content: code.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '<link rel="stylesheet" href="styles.css">')
                  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '<script src="app.js"></script>')
    },
    {
      path: 'styles.css',
      content: cssMatch ? cssMatch[1] : '/* No CSS found */'
    },
    {
      path: 'app.js',
      content: jsMatch ? jsMatch[1] : '// No JavaScript found'
    }
  ]

  await generateAndDownloadZip('app-separated', files)
}

/**
 * Export ZIP complet avec structure de projet
 */
export async function exportProjectZIP(files: FileItem[]): Promise<void> {
  await generateAndDownloadZip('project', files)
}

/**
 * Copie le code dans le presse-papiers
 */
export async function copyToClipboard(code: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(code)
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}
