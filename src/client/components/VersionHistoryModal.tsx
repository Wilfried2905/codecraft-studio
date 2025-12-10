/**
 * Version History Modal Component
 * 
 * UI for version management:
 * - List all versions
 * - Create new version
 * - Restore version
 * - View diff
 * - Delete version
 * - Tag versions
 */

import { useState, useEffect } from 'react'
import { getProjectVersions, createVersion, restoreVersion, deleteVersion, getDiff } from '../services/versionService'
import type { Version } from '../services/versionService'

interface VersionHistoryModalProps {
  projectId: string
  currentCode: string
  isOpen: boolean
  onClose: () => void
  onRestore: (code: string) => void
}

export default function VersionHistoryModal({
  projectId,
  currentCode,
  isOpen,
  onClose,
  onRestore
}: VersionHistoryModalProps) {
  const [versions, setVersions] = useState<Version[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [showDiff, setShowDiff] = useState<string | null>(null)
  const [versionMessage, setVersionMessage] = useState('')
  const [versionTag, setVersionTag] = useState('')

  // Load versions
  useEffect(() => {
    if (isOpen && projectId) {
      loadVersions()
    }
  }, [isOpen, projectId])

  const loadVersions = async () => {
    setLoading(true)
    const { versions, error } = await getProjectVersions(projectId)
    if (!error) {
      setVersions(versions)
    }
    setLoading(false)
  }

  // Create new version
  const handleCreateVersion = async () => {
    if (!versionMessage.trim()) {
      alert('Veuillez entrer un message de version')
      return
    }

    setCreating(true)
    const { version, error } = await createVersion({
      project_id: projectId,
      code_snapshot: currentCode,
      message: versionMessage,
      tag: versionTag || undefined
    })

    if (!error && version) {
      setVersions([version, ...versions])
      setVersionMessage('')
      setVersionTag('')
      alert('Version créée avec succès !')
    } else {
      alert('Erreur lors de la création de la version')
    }
    setCreating(false)
  }

  // Restore version
  const handleRestore = async (versionId: string, versionNumber: number) => {
    if (!window.confirm(`Restaurer la version ${versionNumber} ? Les modifications non sauvegardées seront perdues.`)) {
      return
    }

    const { success, error } = await restoreVersion(versionId, projectId)
    
    if (success) {
      const version = versions.find(v => v.id === versionId)
      if (version) {
        onRestore(version.code_snapshot)
        alert('Version restaurée avec succès !')
        onClose()
      }
    } else {
      alert('Erreur lors de la restauration')
    }
  }

  // Delete version
  const handleDelete = async (versionId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette version ?')) {
      return
    }

    const { error } = await deleteVersion(versionId)
    if (!error) {
      setVersions(versions.filter(v => v.id !== versionId))
    }
  }

  // View diff
  const handleViewDiff = (versionId: string) => {
    setShowDiff(showDiff === versionId ? null : versionId)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Historique des versions</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Create new version */}
        <div className="p-6 border-b border-slate-700 bg-slate-750">
          <h3 className="text-sm font-semibold text-white mb-3">Créer une nouvelle version</h3>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Message de version (obligatoire)"
              value={versionMessage}
              onChange={(e) => setVersionMessage(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
            />
            <input
              type="text"
              placeholder="Tag (optionnel, ex: v1.0.0)"
              value={versionTag}
              onChange={(e) => setVersionTag(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-slate-400"
            />
            <button
              onClick={handleCreateVersion}
              disabled={creating || !versionMessage.trim()}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded font-medium transition-colors"
            >
              {creating ? 'Création...' : 'Créer une version'}
            </button>
          </div>
        </div>

        {/* Version list */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-8 text-slate-400">Chargement...</div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>Aucune version sauvegardée</p>
              <p className="text-sm mt-1">Créez votre première version ci-dessus</p>
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version) => (
                <div key={version.id} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                  {/* Version header */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-bold text-white">v{version.version_number}</span>
                        {version.tag && (
                          <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded">
                            {version.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-300">{version.message || 'Sans message'}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {new Date(version.created_at).toLocaleString('fr-FR')}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewDiff(version.id)}
                        className="px-3 py-1 text-xs bg-slate-600 hover:bg-slate-500 text-white rounded transition-colors"
                        title="Voir le code"
                      >
                        {showDiff === version.id ? 'Masquer' : 'Voir'}
                      </button>
                      <button
                        onClick={() => handleRestore(version.id, version.version_number)}
                        className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                        title="Restaurer cette version"
                      >
                        Restaurer
                      </button>
                      <button
                        onClick={() => handleDelete(version.id)}
                        className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                        title="Supprimer"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>

                  {/* Code preview */}
                  {showDiff === version.id && (
                    <div className="mt-3 pt-3 border-t border-slate-600">
                      <pre className="bg-slate-800 p-3 rounded text-xs text-slate-300 overflow-x-auto max-h-96 overflow-y-auto">
                        {version.code_snapshot}
                      </pre>
                      
                      {/* Simple diff with current */}
                      <div className="mt-2">
                        <p className="text-xs text-slate-400 mb-2">Comparaison avec la version actuelle :</p>
                        <div className="bg-slate-800 p-3 rounded text-xs space-y-1 max-h-48 overflow-y-auto">
                          {(() => {
                            const diff = getDiff(version.code_snapshot, currentCode)
                            return (
                              <>
                                {diff.removed.length > 0 && (
                                  <div className="text-red-400">
                                    - {diff.removed.length} lignes supprimées
                                  </div>
                                )}
                                {diff.added.length > 0 && (
                                  <div className="text-green-400">
                                    + {diff.added.length} lignes ajoutées
                                  </div>
                                )}
                                {diff.removed.length === 0 && diff.added.length === 0 && (
                                  <div className="text-slate-400">Identique à la version actuelle</div>
                                )}
                              </>
                            )
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
