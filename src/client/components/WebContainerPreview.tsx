/**
 * WebContainerPreview Component
 * Affiche une preview d'un projet Node.js exécuté dans le navigateur via WebContainer
 */

import { useEffect, useRef, useState } from 'react'
import { Terminal, Loader2, CheckCircle, XCircle, PlayCircle, Download } from 'lucide-react'
import { useWebContainer } from '../hooks/useWebContainer'
import { convertToFileSystemTree, getStartCommand, detectProjectType, printFileTree } from '../utils/fileSystemConverter'

interface FileItem {
  path: string
  content: string
}

interface WebContainerPreviewProps {
  files: FileItem[]
  projectName: string
  onFallback?: () => void  // Callback si WebContainer échoue
}

export default function WebContainerPreview({ files, projectName, onFallback }: WebContainerPreviewProps) {
  const { status, startProject, getLogs, isSupported } = useWebContainer()
  const [showLogs, setShowLogs] = useState(false)
  const [hasStarted, setHasStarted] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const logsEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll logs
  useEffect(() => {
    if (showLogs && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [getLogs(), showLogs])

  // Démarrer le projet automatiquement
  useEffect(() => {
    if (!hasStarted && files.length > 0 && isSupported) {
      setHasStarted(true)
      
      // Convertir fichiers et détecter le type
      const fileSystemTree = convertToFileSystemTree(files)
      const projectType = detectProjectType(files)
      const startCommand = getStartCommand(files)

      console.log('🔷 WebContainer - Type projet détecté:', projectType)
      console.log('🔷 WebContainer - Commande démarrage:', startCommand)
      console.log('🔷 WebContainer - Arborescence fichiers:')
      console.log(printFileTree(fileSystemTree))

      // Démarrer le projet
      startProject(fileSystemTree, startCommand)
    }
  }, [files, hasStarted, startProject, isSupported])

  // Mettre à jour l'iframe quand l'URL est prête
  useEffect(() => {
    if (status.phase === 'ready' && status.url && iframeRef.current) {
      iframeRef.current.src = status.url
    }
  }, [status.phase, status.url])

  // Fallback si WebContainer pas supporté
  if (!isSupported) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900 p-8">
        <div className="max-w-md text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            WebContainer non supporté
          </h3>
          <p className="text-slate-400 mb-4">
            Votre navigateur ne supporte pas WebContainer (SharedArrayBuffer requis).
          </p>
          <p className="text-slate-500 text-sm mb-6">
            Navigateurs compatibles : Chrome 102+, Edge 102+, Safari 16.4+
          </p>
          <button
            onClick={onFallback}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
          >
            <Download className="w-4 h-4" />
            Télécharger le projet
          </button>
        </div>
      </div>
    )
  }

  // Affichage selon la phase
  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Barre de statut */}
      <div className="h-12 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Icône de statut */}
          {status.phase === 'ready' ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : status.phase === 'error' ? (
            <XCircle className="w-5 h-5 text-red-500" />
          ) : (
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          )}
          
          {/* Message de statut */}
          <div>
            <p className="text-sm font-medium text-white">{status.message}</p>
            {status.phase !== 'idle' && status.phase !== 'ready' && status.phase !== 'error' && (
              <div className="w-48 h-1 bg-slate-700 rounded-full mt-1 overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${status.progress}%` }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Bouton logs */}
        <button
          onClick={() => setShowLogs(!showLogs)}
          className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
            showLogs
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>{showLogs ? 'Masquer logs' : 'Afficher logs'}</span>
        </button>
      </div>

      {/* Zone de contenu */}
      <div className="flex-1 overflow-hidden relative">
        {/* Panel logs (overlay) */}
        {showLogs && (
          <div className="absolute inset-0 bg-slate-950 z-10 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
              {getLogs().map((log, i) => (
                <div 
                  key={i}
                  className={`mb-1 ${
                    log.includes('❌') || log.includes('ERROR') ? 'text-red-400' :
                    log.includes('✅') || log.includes('success') ? 'text-green-400' :
                    log.includes('⚠️') || log.includes('warn') ? 'text-yellow-400' :
                    'text-slate-400'
                  }`}
                >
                  {log}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>
        )}

        {/* Preview iframe */}
        {status.phase === 'ready' && status.url && (
          <iframe
            ref={iframeRef}
            className="w-full h-full border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups"
            title="WebContainer Preview"
          />
        )}

        {/* État d'attente */}
        {status.phase !== 'ready' && status.phase !== 'error' && !showLogs && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md px-4">
              <Loader2 className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-white mb-2">{status.message}</h3>
              <p className="text-slate-400 text-sm mb-4">
                {status.phase === 'booting' && 'Initialisation de Node.js dans le navigateur...'}
                {status.phase === 'mounting' && 'Copie des fichiers du projet...'}
                {status.phase === 'installing' && 'Installation des dépendances npm (cela peut prendre 10-30s)...'}
                {status.phase === 'starting' && 'Compilation et démarrage du serveur de développement...'}
              </p>
              <div className="w-full max-w-xs mx-auto h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${status.progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* État d'erreur */}
        {status.phase === 'error' && !showLogs && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md px-4">
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Erreur de démarrage</h3>
              <p className="text-slate-400 text-sm mb-4">{status.error}</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setShowLogs(true)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-2"
                >
                  <Terminal className="w-4 h-4" />
                  Voir les logs
                </button>
                {onFallback && (
                  <button
                    onClick={onFallback}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Télécharger le projet
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
