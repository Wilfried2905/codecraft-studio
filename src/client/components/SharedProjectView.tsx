/**
 * Shared Project View Component
 * 
 * Public page to view shared projects:
 * - Load project by share token
 * - Display project info
 * - Preview project
 * - Fork button
 * - View-only mode
 */

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getShareByToken, forkProject } from '../services/sharingService'
import PreviewPanel from './PreviewPanel'

interface SharedProjectViewProps {
  shareToken: string
}

export default function SharedProjectView({ shareToken }: SharedProjectViewProps) {
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [share, setShare] = useState<any>(null)
  const [project, setProject] = useState<any>(null)
  const [forking, setForking] = useState(false)

  // Load shared project
  useEffect(() => {
    loadSharedProject()
  }, [shareToken])

  const loadSharedProject = async () => {
    setLoading(true)
    setError(null)
    
    const { share, project, error } = await getShareByToken(shareToken)
    
    if (error || !share || !project) {
      setError(error?.message || 'Projet partagé introuvable')
    } else {
      setShare(share)
      setProject(project)
    }
    
    setLoading(false)
  }

  // Fork project
  const handleFork = async () => {
    if (!isAuthenticated) {
      alert('Veuillez vous connecter pour forker ce projet')
      return
    }

    setForking(true)
    const { project: forkedProject, error } = await forkProject(shareToken)
    
    if (error) {
      alert(error.message || 'Erreur lors du fork')
    } else if (forkedProject) {
      alert('Projet forké avec succès !')
      // Redirect to forked project
      window.location.href = '/'
    }
    
    setForking(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-lg">Chargement du projet partagé...</p>
        </div>
      </div>
    )
  }

  if (error || !share || !project) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md">
          <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h1 className="text-2xl font-bold text-white mb-2">Projet introuvable</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <a
            href="/"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 flex-shrink-0">
        <div className="flex items-center gap-4">
          <a href="/" className="text-blue-500 hover:text-blue-400 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </a>
          <div>
            <h1 className="text-lg font-bold text-white">{project.name}</h1>
            {project.description && (
              <p className="text-xs text-slate-400">{project.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View count */}
          <div className="flex items-center gap-1 text-sm text-slate-400 mr-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            {share.view_count} vues
          </div>

          {/* Fork button */}
          {share.can_fork && (
            <button
              onClick={handleFork}
              disabled={forking || !isAuthenticated}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {forking ? 'Fork en cours...' : 'Forker ce projet'}
            </button>
          )}

          {!isAuthenticated && share.can_fork && (
            <p className="text-xs text-slate-400">Connectez-vous pour forker</p>
          )}
        </div>
      </header>

      {/* Preview */}
      <div className="flex-1 overflow-hidden">
        <PreviewPanel
          code={project.code || ''}
          loading={false}
        />
      </div>

      {/* Footer */}
      <footer className="h-12 bg-slate-900 border-t border-slate-800 flex items-center justify-center px-6 flex-shrink-0">
        <p className="text-xs text-slate-400">
          Partagé avec <span className="text-blue-500">CodeCraft Studio</span>
        </p>
      </footer>
    </div>
  )
}
