/**
 * Share Project Modal Component
 * 
 * UI for sharing projects:
 * - Generate share link
 * - Copy link to clipboard
 * - Share settings (public, fork, comment)
 * - Expiration date
 * - View count
 * - Delete share
 */

import { useState, useEffect } from 'react'
import { createShare, getProjectShares, updateShare, deleteShare, getShareUrl } from '../services/sharingService'
import type { ProjectShare } from '../services/sharingService'

interface ShareProjectModalProps {
  projectId: string
  projectName: string
  isOpen: boolean
  onClose: () => void
}

export default function ShareProjectModal({
  projectId,
  projectName,
  isOpen,
  onClose
}: ShareProjectModalProps) {
  const [shares, setShares] = useState<ProjectShare[]>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  // Load existing shares
  useEffect(() => {
    if (isOpen && projectId) {
      loadShares()
    }
  }, [isOpen, projectId])

  const loadShares = async () => {
    setLoading(true)
    const { shares, error } = await getProjectShares(projectId)
    if (!error) {
      setShares(shares)
    }
    setLoading(false)
  }

  // Create new share
  const handleCreateShare = async () => {
    setCreating(true)
    const { share, error } = await createShare({
      project_id: projectId,
      is_public: true,
      can_fork: true,
      can_comment: true
    })
    
    if (!error && share) {
      setShares([share, ...shares])
    }
    setCreating(false)
  }

  // Copy share URL
  const handleCopyUrl = async (token: string) => {
    const url = getShareUrl(token)
    await navigator.clipboard.writeText(url)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  // Toggle share setting
  const handleToggleSetting = async (
    shareId: string,
    setting: 'is_public' | 'can_fork' | 'can_comment',
    value: boolean
  ) => {
    const { share, error } = await updateShare(shareId, { [setting]: value })
    if (!error && share) {
      setShares(shares.map(s => s.id === shareId ? share : s))
    }
  }

  // Delete share
  const handleDeleteShare = async (shareId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce lien de partage ?')) {
      const { error } = await deleteShare(shareId)
      if (!error) {
        setShares(shares.filter(s => s.id !== shareId))
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Partager le projet</h2>
            <p className="text-sm text-slate-400 mt-1">{projectName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Create new share button */}
          <button
            onClick={handleCreateShare}
            disabled={creating}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 mb-6"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            {creating ? 'Création...' : 'Créer un nouveau lien de partage'}
          </button>

          {/* Loading */}
          {loading ? (
            <div className="text-center py-8 text-slate-400">
              Chargement...
            </div>
          ) : shares.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <p>Aucun lien de partage</p>
              <p className="text-sm mt-1">Créez-en un pour partager ce projet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {shares.map((share) => (
                <div
                  key={share.id}
                  className="bg-slate-700 rounded-lg p-4 border border-slate-600"
                >
                  {/* Share URL */}
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="text"
                      readOnly
                      value={getShareUrl(share.share_token)}
                      className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded text-sm text-white font-mono"
                    />
                    <button
                      onClick={() => handleCopyUrl(share.share_token)}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                      title="Copier le lien"
                    >
                      {copiedToken === share.share_token ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Settings */}
                  <div className="space-y-2 mb-3">
                    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={share.is_public}
                        onChange={(e) => handleToggleSetting(share.id, 'is_public', e.target.checked)}
                        className="rounded"
                      />
                      Public (visible par tous)
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={share.can_fork}
                        onChange={(e) => handleToggleSetting(share.id, 'can_fork', e.target.checked)}
                        className="rounded"
                      />
                      Autoriser le fork
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={share.can_comment}
                        onChange={(e) => handleToggleSetting(share.id, 'can_comment', e.target.checked)}
                        className="rounded"
                      />
                      Autoriser les commentaires
                    </label>
                  </div>

                  {/* Stats & Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-600">
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {share.view_count} vues
                      </div>
                      <div>
                        Créé le {new Date(share.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteShare(share.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Supprimer"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
