import { useState } from 'react'
import { Download, File, Layers, FolderOpen, Copy, Check, Package } from 'lucide-react'
import { exportHTML, exportSeparatedZIP, exportProjectZIP, copyToClipboard } from '../utils/zipGenerator'
import { ReactProjectExporter } from '../utils/reactProjectExporter'
import type { FileItem } from '../contexts/AppContext'

interface ExportManagerProps {
  files: FileItem[]
  currentCode: string
  projectName?: string
}

export default function ExportManager({ files, currentCode, projectName = 'my-react-app' }: ExportManagerProps) {
  const [showMenu, setShowMenu] = useState(false)
  const [copied, setCopied] = useState(false)
  
  const handleExportHTML = () => {
    exportHTML(currentCode)
    setShowMenu(false)
  }
  
  const handleExportSeparated = async () => {
    await exportSeparatedZIP(currentCode)
    setShowMenu(false)
  }
  
  const handleExportProject = async () => {
    await exportProjectZIP(files)
    setShowMenu(false)
  }

  const handleExportReactProject = async () => {
    const exporter = new ReactProjectExporter()
    await exporter.exportProject({
      projectName,
      code: currentCode,
      description: `Application React générée par CodeCraft Studio`,
      author: 'CodeCraft Studio User'
    })
    setShowMenu(false)
  }
  
  const handleCopy = async () => {
    const success = await copyToClipboard(currentCode)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
    setShowMenu(false)
  }
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="p-2 text-slate-400 hover:bg-slate-800 rounded-lg transition-colors"
        title="Export Options"
      >
        <Download className="w-5 h-5" />
      </button>
      
      {/* Dropdown Menu */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          
          {/* Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-slate-800 rounded-lg shadow-xl z-50 py-1 border border-slate-700 animate-fadeIn">
            <button
              onClick={handleExportHTML}
              className="w-full px-4 py-2 text-left hover:bg-slate-700 flex items-center gap-3 text-white transition-colors"
            >
              <File className="w-4 h-4 text-primary-400" />
              <div>
                <div className="text-sm font-medium">Export HTML</div>
                <div className="text-xs text-slate-400">Fichier HTML unique</div>
              </div>
            </button>
            
            <button
              onClick={handleExportSeparated}
              className="w-full px-4 py-2 text-left hover:bg-slate-700 flex items-center gap-3 text-white transition-colors"
            >
              <Layers className="w-4 h-4 text-secondary-400" />
              <div>
                <div className="text-sm font-medium">Export Séparé (ZIP)</div>
                <div className="text-xs text-slate-400">HTML, CSS, JS séparés</div>
              </div>
            </button>
            
            <button
              onClick={handleExportProject}
              className="w-full px-4 py-2 text-left hover:bg-slate-700 flex items-center gap-3 text-white transition-colors"
            >
              <FolderOpen className="w-4 h-4 text-accent-400" />
              <div>
                <div className="text-sm font-medium">Export Projet (ZIP)</div>
                <div className="text-xs text-slate-400">Tous les fichiers + README</div>
              </div>
            </button>

            <button
              onClick={handleExportReactProject}
              className="w-full px-4 py-2 text-left hover:bg-slate-700 flex items-center gap-3 text-white transition-colors"
            >
              <Package className="w-4 h-4 text-blue-400" />
              <div>
                <div className="text-sm font-medium">Export React Project</div>
                <div className="text-xs text-slate-400">Projet React complet (npm ready)</div>
              </div>
            </button>
            
            <div className="border-t border-slate-700 my-1" />
            
            <button
              onClick={handleCopy}
              className="w-full px-4 py-2 text-left hover:bg-slate-700 flex items-center gap-3 text-white transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-slate-400" />
              )}
              <div>
                <div className="text-sm font-medium">
                  {copied ? 'Copié !' : 'Copier le code'}
                </div>
                <div className="text-xs text-slate-400">Vers le presse-papier</div>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
