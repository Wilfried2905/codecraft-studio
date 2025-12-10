/**
 * Keyboard Shortcuts Modal - Affiche tous les raccourcis clavier disponibles
 */

import { X, Keyboard } from 'lucide-react'

interface Shortcut {
  key: string
  description: string
  category: 'général' | 'navigation' | 'édition' | 'export'
}

interface KeyboardShortcutsModalProps {
  onClose: () => void
}

export default function KeyboardShortcutsModal({ onClose }: KeyboardShortcutsModalProps) {
  const shortcuts: Shortcut[] = [
    // Général
    { key: '?', description: 'Afficher ce panneau d\'aide', category: 'général' },
    { key: 'Ctrl+K', description: 'Recherche rapide', category: 'général' },
    { key: 'Esc', description: 'Fermer les modaux', category: 'général' },
    
    // Navigation
    { key: 'Ctrl+T', description: 'Ouvrir la bibliothèque de templates', category: 'navigation' },
    { key: 'Ctrl+H', description: 'Afficher l\'historique', category: 'navigation' },
    { key: 'Ctrl+N', description: 'Nouvelle conversation', category: 'navigation' },
    
    // Édition
    { key: 'Ctrl+Enter', description: 'Envoyer le message', category: 'édition' },
    { key: 'Shift+Enter', description: 'Nouvelle ligne dans le chat', category: 'édition' },
    { key: 'Ctrl+S', description: 'Sauvegarder comme template', category: 'édition' },
    { key: 'Ctrl+/', description: 'Commenter le code sélectionné', category: 'édition' },
    
    // Export
    { key: 'Ctrl+E', description: 'Ouvrir le menu d\'export', category: 'export' },
    { key: 'Ctrl+Shift+C', description: 'Copier le code', category: 'export' },
    { key: 'Ctrl+Shift+D', description: 'Télécharger HTML', category: 'export' },
  ]

  const categories = {
    'général': '⚡ Général',
    'navigation': '🧭 Navigation',
    'édition': '✏️ Édition',
    'export': '📦 Export'
  }

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = []
    }
    acc[shortcut.category].push(shortcut)
    return acc
  }, {} as Record<string, Shortcut[]>)

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Keyboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Raccourcis Clavier</h2>
              <p className="text-sm text-slate-400">Boostez votre productivité</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold text-white mb-3">
                {categories[category as keyof typeof categories]}
              </h3>
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <span className="text-slate-300">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.key.split('+').map((key, i) => (
                        <span key={i} className="flex items-center gap-1">
                          {i > 0 && <span className="text-slate-600">+</span>}
                          <kbd className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-slate-300">
                            {key}
                          </kbd>
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Tips */}
          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-400 mb-2">💡 Astuce</h4>
            <p className="text-sm text-slate-300">
              Appuyez sur <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs font-mono">?</kbd> à tout moment pour afficher ce panneau d'aide.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Tous les raccourcis sont personnalisables dans les paramètres
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Compris !
          </button>
        </div>
      </div>
    </div>
  )
}
