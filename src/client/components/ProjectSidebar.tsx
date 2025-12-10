/**
 * Project Sidebar Component
 * 
 * Displays user's projects with:
 * - Project list with search
 * - Create new project button
 * - Project selection
 * - Project actions (rename, delete)
 * - Recent projects
 */

import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { getUserProjects, searchProjects, deleteProject, createProject } from '../services/projectService'
import type { Project } from '../services/supabaseClient'

interface ProjectSidebarProps {
  currentProjectId: string | null
  onSelectProject: (project: Project) => void
  onNewProject: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export default function ProjectSidebar({
  currentProjectId,
  onSelectProject,
  onNewProject,
  isCollapsed = false,
  onToggleCollapse
}: ProjectSidebarProps) {
  const { isAuthenticated, user } = useAuth()
  const [projects, setProjects] = useState<Project[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)

  // Load projects on mount and when user changes
  useEffect(() => {
    if (isAuthenticated) {
      loadProjects()
    } else {
      setProjects([])
      setLoading(false)
    }
  }, [isAuthenticated, user])

  const loadProjects = async () => {
    setLoading(true)
    const { projects, error } = await getUserProjects()
    if (!error) {
      setProjects(projects)
    }
    setLoading(false)
  }

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const { projects, error } = await searchProjects(query)
      if (!error) {
        setProjects(projects)
      }
    } else {
      loadProjects()
    }
  }

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      const { error } = await deleteProject(projectId)
      if (!error) {
        loadProjects()
      }
    }
  }

  const handleCreateProject = async (name: string) => {
    const { project, error } = await createProject({ name })
    if (!error && project) {
      setShowNewProjectModal(false)
      loadProjects()
      onSelectProject(project)
    }
  }

  // Collapsed view
  if (isCollapsed) {
    return (
      <div className="w-16 bg-slate-900 border-r border-slate-800 flex flex-col items-center py-4 gap-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          title="Expand sidebar"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <button
          onClick={onNewProject}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          title="New project"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    )
  }

  // Not authenticated view
  if (!isAuthenticated) {
    return (
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">Projets</h2>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-400"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-slate-400 text-sm">
            <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p>Connectez-vous pour</p>
            <p>sauvegarder vos projets</p>
          </div>
        </div>
      </div>
    )
  }

  // Authenticated view
  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white">Mes Projets</h2>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 hover:bg-slate-800 rounded transition-colors text-slate-400"
              title="Collapse sidebar"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full px-3 py-2 pl-9 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="w-4 h-4 absolute left-3 top-2.5 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* New Project Button */}
        <button
          onClick={() => setShowNewProjectModal(true)}
          className="w-full mt-3 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau Projet
        </button>
      </div>

      {/* Project List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-slate-400 text-sm">
            Chargement...
          </div>
        ) : projects.length === 0 ? (
          <div className="p-4 text-center text-slate-400 text-sm">
            {searchQuery ? 'Aucun projet trouvé' : 'Aucun projet'}
          </div>
        ) : (
          <div className="p-2">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => onSelectProject(project)}
                className={`w-full p-3 mb-2 rounded-lg text-left transition-colors group ${
                  currentProjectId === project.id
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate text-sm">
                      {project.name}
                    </div>
                    {project.description && (
                      <div className="text-xs opacity-70 truncate mt-0.5">
                        {project.description}
                      </div>
                    )}
                    <div className="text-xs opacity-50 mt-1">
                      {new Date(project.updated_at).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: 'short'
                      })}
                    </div>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDeleteProject(project.id, e)}
                    className="ml-2 p-1 opacity-0 group-hover:opacity-100 hover:bg-red-600 rounded transition-all"
                    title="Supprimer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <NewProjectModal
          onClose={() => setShowNewProjectModal(false)}
          onCreate={handleCreateProject}
        />
      )}
    </div>
  )
}

// New Project Modal Component
interface NewProjectModalProps {
  onClose: () => void
  onCreate: (name: string) => void
}

function NewProjectModal({ onClose, onCreate }: NewProjectModalProps) {
  const [name, setName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onCreate(name.trim())
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-white mb-4">Nouveau Projet</h3>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Nom du projet"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          
          <div className="flex gap-2 mt-4">
            <button
              type="submit"
              disabled={!name.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              Créer
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
