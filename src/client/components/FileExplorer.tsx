/**
 * FileExplorer - Explorateur de fichiers pour projets multi-fichiers
 * Affiche la structure du projet avec un éditeur de code
 */

import { useState } from 'react'

interface FileItem {
  path: string
  content: string
}

interface FileExplorerProps {
  projectName: string
  files: FileItem[]
  mainFile: string
  setupInstructions: string
  onDownload: () => void
}

export function FileExplorer({
  projectName,
  files,
  mainFile,
  setupInstructions,
  onDownload
}: FileExplorerProps) {
  const [selectedFile, setSelectedFile] = useState<FileItem>(
    files.find(f => f.path === mainFile) || files[0]
  )
  const [copied, setCopied] = useState(false)

  // Organiser les fichiers par dossier
  const fileTree = files.reduce((acc: Record<string, FileItem[]>, file) => {
    const folder = file.path.includes('/') ? file.path.split('/')[0] : 'root'
    if (!acc[folder]) acc[folder] = []
    acc[folder].push(file)
    return acc
  }, {})

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Déterminer le langage pour la coloration syntaxique
  const getFileLanguage = (path: string) => {
    if (path.endsWith('.js') || path.endsWith('.jsx')) return 'javascript'
    if (path.endsWith('.ts') || path.endsWith('.tsx')) return 'typescript'
    if (path.endsWith('.json')) return 'json'
    if (path.endsWith('.html')) return 'html'
    if (path.endsWith('.css')) return 'css'
    if (path.endsWith('.md')) return 'markdown'
    return 'plaintext'
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 text-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-3">
          <i className="fas fa-folder-open text-blue-400 text-xl"></i>
          <div>
            <h2 className="text-lg font-semibold">{projectName}</h2>
            <p className="text-sm text-gray-400">{files.length} fichiers</p>
          </div>
        </div>
        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <i className="fas fa-download"></i>
          Télécharger ZIP
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - File Tree */}
        <div className="w-64 border-r border-gray-700 bg-gray-850 overflow-y-auto">
          <div className="p-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2">Fichiers</h3>
            {Object.entries(fileTree).map(([folder, folderFiles]) => (
              <div key={folder} className="mb-3">
                {folder !== 'root' && (
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                    <i className="fas fa-folder text-yellow-500"></i>
                    <span>{folder}/</span>
                  </div>
                )}
                {folderFiles.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => setSelectedFile(file)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${
                      selectedFile.path === file.path
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-700 text-gray-300'
                    } ${folder === 'root' ? '' : 'ml-4'}`}
                  >
                    <i className={`fas ${
                      file.path.endsWith('.js') || file.path.endsWith('.jsx') ? 'fa-file-code text-yellow-400' :
                      file.path.endsWith('.ts') || file.path.endsWith('.tsx') ? 'fa-file-code text-blue-400' :
                      file.path.endsWith('.json') ? 'fa-file-code text-green-400' :
                      file.path.endsWith('.html') ? 'fa-file-code text-orange-400' :
                      file.path.endsWith('.css') ? 'fa-file-code text-pink-400' :
                      file.path.endsWith('.md') ? 'fa-file-alt text-gray-400' :
                      'fa-file text-gray-400'
                    }`}></i>
                    <span className="truncate">
                      {folder === 'root' ? file.path : file.path.split('/').slice(1).join('/')}
                    </span>
                    {file.path === mainFile && (
                      <i className="fas fa-star text-yellow-500 text-xs ml-auto" title="Fichier principal"></i>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* File Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700 bg-gray-800">
            <div className="flex items-center gap-2 text-sm">
              <i className="fas fa-file-code text-gray-400"></i>
              <span className="font-mono">{selectedFile.path}</span>
              <span className="text-xs text-gray-500">({getFileLanguage(selectedFile.path)})</span>
            </div>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-3 py-1 rounded-md transition-colors ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
              }`}
            >
              <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
              {copied ? 'Copié !' : 'Copier'}
            </button>
          </div>

          {/* Code Editor */}
          <div className="flex-1 overflow-auto p-4 bg-gray-900">
            <pre className="text-sm font-mono leading-relaxed">
              <code className={`language-${getFileLanguage(selectedFile.path)}`}>
                {selectedFile.content}
              </code>
            </pre>
          </div>
        </div>
      </div>

      {/* Footer - Setup Instructions */}
      <div className="border-t border-gray-700 bg-gray-800 p-4">
        <div className="flex items-start gap-3">
          <i className="fas fa-terminal text-green-400 text-lg mt-1"></i>
          <div className="flex-1">
            <h3 className="text-sm font-semibold mb-2">Instructions d'installation</h3>
            <pre className="text-xs font-mono text-gray-300 bg-gray-900 p-3 rounded-md overflow-x-auto">
              {setupInstructions}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
