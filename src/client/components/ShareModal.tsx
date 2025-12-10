/**
 * Share Modal Component
 * 
 * Modal for sharing projects with public links:
 * - Generate share link
 * - Copy to clipboard
 * - Share settings (public, fork, comment)
 * - View count analytics
 * - Expiration date
 */

import { useState, useEffect } from 'react'
import { 
  createShareLink, 
  getShareSettings, 
  updateShareSettings, 
  deleteShareLink,
  type ShareSettings 
} from '../services/sharingService'

interface ShareModalProps {
  projectId: string
  projectName: string
  isOpen: boolean
  onClose: () => void
}

export default function ShareModal({ projectId, projectName, isOpen, onClose }: ShareModalProps) {
  const [shareLink, setShareLink] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [settings, setSettings] = useState<ShareSettings>({
    is_public: true,
    can_fork: true,
    can_comment: true
  })
  const [viewCount, setViewCount] = useState(0)

  // Load existing share settings
  useEffect(() => {
    if (isOpen && projectId) {
      loadShareSettings()
    }
  }, [isOpen, projectId])

  const loadShareSettings = async () => {
    const { shared, error } = await getShareSettings(projectId)
    if (!error && shared) {
      setShareLink(`${window.location.origin}/share/${shared.share_token}`)
      setSettings({
        is_public: shared.is_public,
        can_fork: shared.can_fork,
        can_comment: shared.can_comment
      })
      setViewCount(shared.view_count)
    }
  }

  const handleCreateShareLink = async () => {
    setLoading(true)
    const { shareLink, error } = await createShareLink(projectId, settings)
    
    if (!error && shareLink) {
      setShareLink(shareLink)
    } else {
      alert('Erreur lors de la création du lien de partage')
    }
    setLoading(false)
  }

  const handleCopyLink = async () => {
    if (shareLink) {
      await navigator.clipboard.writeText(shareLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleUpdateSettings = async () => {
    setLoading(true)
    const { error } = await updateShareSettings(projectId, settings)
    
    if (!error) {
      alert('Paramètres mis à jour !')
    } else {
      alert('Erreur lors de la mise à jour')
    }
    setLoading(false)
  }

  const handleDeleteShare = async () => {
    if (window.confirm('Voulez-vous vraiment supprimer ce lien de partage ?')) {
      setLoading(true)
      const { error } = await deleteShareLink(projectId)
      
      if (!error) {
        setShareLink(null)
        setViewCount(0)
      } else {
        alert('Erreur lors de la suppression')
      }
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Partager le projet
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {projectName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Share Link */}
        {shareLink ? (
          <div className="space-y-4">
            {/* Link Display */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Lien de partage
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareLink}
                  readOnly
                  className="flex-1 px-3 py-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copié !
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copier
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Analytics */}
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span className="font-medium">{viewCount}</span>
                <span className="text-sm">vues</span>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-3 border-t border-slate-200 dark:border-slate-700 pt-4">
              <h3 className="font-semibold text-slate-900 dark:text-white">Paramètres</h3>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.is_public}
                  onChange={(e) => setSettings({ ...settings, is_public: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Rendre public (visible par tous)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.can_fork}
                  onChange={(e) => setSettings({ ...settings, can_fork: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Autoriser le fork (duplication)
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.can_comment}
                  onChange={(e) => setSettings({ ...settings, can_comment: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Autoriser les commentaires
                </span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <button
                onClick={handleUpdateSettings}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-500 text-white rounded-lg font-medium transition-colors"
              >
                {loading ? 'Mise à jour...' : 'Mettre à jour'}
              </button>
              <button
                onClick={handleDeleteShare}
                disabled={loading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-500 text-white rounded-lg font-medium transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Settings before creating */}
            <div className="space-y-3">
              <h3 className="font-semibold text-slate-900 dark:text-white">Paramètres de partage</h3>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.is_public}
                  onChange={(e) => setSettings({ ...settings, is_public: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Rendre public
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.can_fork}
                  onChange={(e) => setSettings({ ...settings, can_fork: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Autoriser le fork
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.can_comment}
                  onChange={(e) => setSettings({ ...settings, can_comment: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  Autoriser les commentaires
                </span>
              </label>
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreateShareLink}
              disabled={loading}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-500 text-white rounded-lg font-medium transition-colors"
            >
              {loading ? 'Création...' : 'Créer un lien de partage'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
