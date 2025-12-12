/**
 * File System Converter
 * Convertit le format backend {path, content} vers format WebContainer FileSystemTree
 */

export interface FileItem {
  path: string
  content: string
}

export interface FileSystemTree {
  [name: string]: FileNode
}

export type FileNode = 
  | { file: { contents: string } }
  | { directory: FileSystemTree }

/**
 * Convertit un tableau de fichiers vers FileSystemTree WebContainer
 * 
 * Exemple Input:
 * [
 *   { path: "package.json", content: "{...}" },
 *   { path: "src/App.jsx", content: "export default..." },
 *   { path: "src/index.js", content: "import..." }
 * ]
 * 
 * Exemple Output:
 * {
 *   "package.json": { file: { contents: "{...}" } },
 *   "src": {
 *     directory: {
 *       "App.jsx": { file: { contents: "export default..." } },
 *       "index.js": { file: { contents: "import..." } }
 *     }
 *   }
 * }
 */
export function convertToFileSystemTree(files: FileItem[]): FileSystemTree {
  const tree: FileSystemTree = {}

  for (const file of files) {
    const pathParts = file.path.split('/').filter(Boolean)
    let currentLevel = tree

    // Parcourir tous les segments du chemin sauf le dernier (nom du fichier)
    for (let i = 0; i < pathParts.length - 1; i++) {
      const dirName = pathParts[i]
      
      // Créer le dossier s'il n'existe pas
      if (!currentLevel[dirName]) {
        currentLevel[dirName] = {
          directory: {}
        }
      }

      // Vérifier que c'est bien un dossier
      if ('directory' in currentLevel[dirName]) {
        currentLevel = currentLevel[dirName].directory
      } else {
        console.error(`Conflit: ${dirName} existe déjà comme fichier`)
        break
      }
    }

    // Ajouter le fichier au dernier niveau
    const fileName = pathParts[pathParts.length - 1]
    currentLevel[fileName] = {
      file: {
        contents: file.content
      }
    }
  }

  return tree
}

/**
 * Valide qu'un projet contient les fichiers minimum pour React + Vite
 */
export function validateReactProject(files: FileItem[]): {
  valid: boolean
  missing: string[]
} {
  const requiredFiles = ['package.json', 'index.html']
  const missing: string[] = []

  for (const required of requiredFiles) {
    const found = files.some(f => f.path === required || f.path.endsWith(`/${required}`))
    if (!found) {
      missing.push(required)
    }
  }

  return {
    valid: missing.length === 0,
    missing
  }
}

/**
 * Détecte le type de projet à partir des fichiers
 */
export function detectProjectType(files: FileItem[]): 'react-vite' | 'express' | 'full-stack' | 'unknown' {
  const hasPackageJson = files.some(f => f.path === 'package.json')
  if (!hasPackageJson) return 'unknown'

  const packageJsonFile = files.find(f => f.path === 'package.json')
  if (!packageJsonFile) return 'unknown'

  try {
    const packageJson = JSON.parse(packageJsonFile.content)
    const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies }

    const hasReact = 'react' in dependencies
    const hasVite = 'vite' in dependencies
    const hasExpress = 'express' in dependencies

    if (hasReact && hasVite && hasExpress) return 'full-stack'
    if (hasReact && hasVite) return 'react-vite'
    if (hasExpress) return 'express'

    return 'unknown'
  } catch (error) {
    console.error('Failed to parse package.json:', error)
    return 'unknown'
  }
}

/**
 * Récupère la commande de démarrage depuis package.json
 */
export function getStartCommand(files: FileItem[]): string {
  const packageJsonFile = files.find(f => f.path === 'package.json')
  if (!packageJsonFile) return 'npm run dev'

  try {
    const packageJson = JSON.parse(packageJsonFile.content)
    const scripts = packageJson.scripts || {}

    // Priorité: dev > start > build
    if (scripts.dev) return 'npm run dev'
    if (scripts.start) return 'npm start'
    if (scripts.build) return 'npm run build'

    return 'npm run dev'
  } catch (error) {
    console.error('Failed to parse package.json:', error)
    return 'npm run dev'
  }
}

/**
 * Affiche l'arborescence de fichiers de manière lisible (pour debug)
 */
export function printFileTree(tree: FileSystemTree, indent: string = ''): string {
  let output = ''
  
  for (const [name, node] of Object.entries(tree)) {
    if ('file' in node) {
      output += `${indent}📄 ${name}\n`
    } else if ('directory' in node) {
      output += `${indent}📁 ${name}/\n`
      output += printFileTree(node.directory, indent + '  ')
    }
  }
  
  return output
}
