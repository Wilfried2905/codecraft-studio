import { useState } from 'react'
import { X, Loader, Eye, Copy, Download, Sparkles } from 'lucide-react'

interface Variation {
  style: string
  code: string
}

interface AgentVariationsProps {
  isOpen: boolean
  onClose: () => void
  currentCode: string
  currentPrompt: string
  onSelectVariation: (code: string, style: string) => void
}

export default function AgentVariations({
  isOpen,
  onClose,
  currentCode,
  currentPrompt,
  onSelectVariation
}: AgentVariationsProps) {
  const [loading, setLoading] = useState(false)
  const [variations, setVariations] = useState<Variation[]>([])
  const [selectedVariation, setSelectedVariation] = useState<number | null>(null)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)

  // Generate 3 variations
  const generateVariations = async () => {
    if (!currentCode) {
      alert('Aucun code à modifier. Générez d\'abord du code.')
      return
    }

    setLoading(true)
    setVariations([])
    
    try {
      const response = await fetch('/api/variations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: currentCode,
          prompt: currentPrompt
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Variation generation failed')
      }

      setVariations(data.variations)
      
    } catch (error) {
      console.error('Variations error:', error)
      alert(`Erreur: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Handle variation selection
  const handleSelectVariation = (index: number) => {
    const variation = variations[index]
    onSelectVariation(variation.code, variation.style)
    onClose()
  }

  // Copy variation to clipboard
  const copyToClipboard = (code: string, style: string) => {
    navigator.clipboard.writeText(code)
    alert(`✓ Variation "${style}" copiée dans le presse-papier`)
  }

  // Download variation as HTML
  const downloadVariation = (code: string, style: string) => {
    const blob = new Blob([code], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `variation-${style.toLowerCase().replace(/\//g, '-')}.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-slate-900 rounded-2xl w-full max-w-7xl max-h-[90vh] flex flex-col border border-slate-700 shadow-2xl animate-slideInRight">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary-500 to-accent-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Variations d'Agent</h2>
              <p className="text-sm text-slate-400">
                Générez 3 variations de style différentes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Generate Button */}
          {variations.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-secondary-500/20 to-accent-500/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-secondary-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Générer des Variations
              </h3>
              <p className="text-slate-400 mb-6 max-w-md mx-auto">
                Créez 3 variations de style différentes à partir de votre code actuel.
                Chaque variation conserve les fonctionnalités mais change complètement l'apparence.
              </p>
              <button
                onClick={generateVariations}
                disabled={!currentCode}
                className="px-8 py-4 bg-gradient-to-r from-secondary-500 to-accent-500 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all font-semibold flex items-center gap-3 mx-auto"
              >
                <Sparkles className="w-5 h-5" />
                <span>Générer 3 Variations</span>
              </button>
              {!currentCode && (
                <p className="text-amber-400 text-sm mt-4">
                  ⚠️ Générez d'abord du code pour créer des variations
                </p>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-16">
              <Loader className="w-12 h-12 mx-auto mb-4 text-secondary-500 animate-spin" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Génération en cours...
              </h3>
              <p className="text-slate-400">
                L'Agent Variations crée 3 styles différents pour vous
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <div className="px-4 py-2 bg-slate-800 rounded-lg">
                  <div className="text-xs text-slate-500 mb-1">Style 1</div>
                  <div className="text-sm font-medium text-white">Minimal</div>
                </div>
                <div className="px-4 py-2 bg-slate-800 rounded-lg">
                  <div className="text-xs text-slate-500 mb-1">Style 2</div>
                  <div className="text-sm font-medium text-white">Modern/Bold</div>
                </div>
                <div className="px-4 py-2 bg-slate-800 rounded-lg">
                  <div className="text-xs text-slate-500 mb-1">Style 3</div>
                  <div className="text-sm font-medium text-white">Professional</div>
                </div>
              </div>
            </div>
          )}

          {/* Variations Grid */}
          {variations.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  {variations.length} Variations générées
                </h3>
                <button
                  onClick={generateVariations}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  Régénérer
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {variations.map((variation, index) => (
                  <div
                    key={index}
                    className={`bg-slate-800 rounded-xl border-2 transition-all overflow-hidden ${
                      selectedVariation === index
                        ? 'border-secondary-500 shadow-lg shadow-secondary-500/20'
                        : 'border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {/* Variation Header */}
                    <div className="p-4 border-b border-slate-700">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-white">
                          {variation.style}
                        </h4>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          index === 0 ? 'bg-teal-500/20 text-teal-400' :
                          index === 1 ? 'bg-purple-500/20 text-purple-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          Style {index + 1}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400">
                        {index === 0 && 'Design épuré, minimaliste, beaucoup d\'espace blanc'}
                        {index === 1 && 'Design moderne, couleurs vives, typographie audacieuse'}
                        {index === 2 && 'Design corporate, sobre, élégant'}
                      </p>
                    </div>

                    {/* Preview */}
                    <div className="relative aspect-video bg-slate-950">
                      <iframe
                        srcDoc={variation.code}
                        className="w-full h-full"
                        sandbox="allow-scripts"
                        title={`Preview ${variation.style}`}
                      />
                      {previewIndex !== index && (
                        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
                          <button
                            onClick={() => setPreviewIndex(index)}
                            className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg transition-all flex items-center gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Aperçu
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="p-4 flex gap-2">
                      <button
                        onClick={() => handleSelectVariation(index)}
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-secondary-500 to-accent-500 text-white rounded-lg hover:opacity-90 transition-all font-medium text-sm"
                      >
                        Utiliser
                      </button>
                      <button
                        onClick={() => copyToClipboard(variation.code, variation.style)}
                        className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                        title="Copier"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => downloadVariation(variation.code, variation.style)}
                        className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                        title="Télécharger"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-800/50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              💡 Astuce: Les variations conservent les fonctionnalités mais changent l'apparence
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
