/**
 * Template Library - Bibliothèque de templates personnalisés
 */

import { useState, useEffect } from 'react'
import { BookOpen, Star, Search, Plus, Trash2, Download, Upload, X } from 'lucide-react'
import { templateManager, CustomTemplate } from '../services/templateManager'

interface TemplateLibraryProps {
  onSelectTemplate: (template: CustomTemplate) => void
  onClose: () => void
}

export default function TemplateLibrary({ onSelectTemplate, onClose }: TemplateLibraryProps) {
  const [templates, setTemplates] = useState<CustomTemplate[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | CustomTemplate['category']>('all')
  const [showSaveDialog, setShowSaveDialog] = useState(false)

  // Charger les templates
  useEffect(() => {
    loadTemplates()
  }, [selectedCategory, searchQuery])

  const loadTemplates = () => {
    let result = templateManager.getAllTemplates()

    if (selectedCategory !== 'all') {
      result = templateManager.getTemplatesByCategory(selectedCategory)
    }

    if (searchQuery) {
      result = templateManager.searchTemplates(searchQuery)
    }

    setTemplates(result)
  }

  const handleToggleFavorite = (id: string) => {
    templateManager.toggleFavorite(id)
    loadTemplates()
  }

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
      templateManager.deleteTemplate(id)
      loadTemplates()
    }
  }

  const handleUseTemplate = (template: CustomTemplate) => {
    templateManager.incrementUsage(template.id)
    onSelectTemplate(template)
    onClose()
  }

  const handleExportTemplates = () => {
    const json = templateManager.exportTemplates()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'codecraft-templates.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportTemplates = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const text = await file.text()
        const count = templateManager.importTemplates(text)
        alert(`${count} template(s) importé(s) avec succès !`)
        loadTemplates()
      }
    }
    input.click()
  }

  const stats = templateManager.getStats()

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl w-full max-w-6xl h-[80vh] border border-slate-700 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Mes Templates</h2>
              <p className="text-sm text-slate-400">
                {stats.totalTemplates} template(s) • {stats.favoriteTemplates} favori(s)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportTemplates}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400"
              title="Exporter les templates"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={handleImportTemplates}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400"
              title="Importer des templates"
            >
              <Upload className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="p-6 border-b border-slate-800 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un template..."
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {['all', 'landing-page', 'dashboard', 'app', 'website', 'ecommerce', 'form', 'custom'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {cat === 'all' ? 'Tous' : cat.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <BookOpen className="w-16 h-16 text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">
                Aucun template trouvé
              </h3>
              <p className="text-sm text-slate-500">
                Générez une application et sauvegardez-la comme template !
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-purple-500/50 transition-all group"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-1 line-clamp-1">
                        {template.name}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggleFavorite(template.id)}
                      className="p-1 hover:bg-slate-700 rounded transition-colors"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          template.favorite ? 'fill-yellow-400 text-yellow-400' : 'text-slate-500'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-slate-900/50 text-slate-400 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                    <span>{template.usageCount} utilisation(s)</span>
                    <span>{new Date(template.createdAt).toLocaleDateString()}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="flex-1 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
                    >
                      Utiliser
                    </button>
                    <button
                      onClick={() => handleDeleteTemplate(template.id)}
                      className="p-1.5 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
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
