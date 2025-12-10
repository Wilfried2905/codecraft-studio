/**
 * Search & Replace Panel Component
 * 
 * Advanced search and replace functionality:
 * - Global search (Ctrl+F)
 * - Replace single/all (Ctrl+H)
 * - Regex support
 * - Case sensitive toggle
 * - Match count
 * - Navigation between matches
 */

import { useState, useEffect } from 'react'

interface SearchReplacePanelProps {
  code: string
  onCodeChange: (newCode: string) => void
  isOpen: boolean
  onClose: () => void
}

export default function SearchReplacePanel({
  code,
  onCodeChange,
  isOpen,
  onClose
}: SearchReplacePanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [replaceQuery, setReplaceQuery] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [useRegex, setUseRegex] = useState(false)
  const [matches, setMatches] = useState<number>(0)
  const [currentMatch, setCurrentMatch] = useState(0)
  const [showReplace, setShowReplace] = useState(false)

  // Count matches
  useEffect(() => {
    if (!searchQuery || !code) {
      setMatches(0)
      setCurrentMatch(0)
      return
    }

    try {
      let regex: RegExp
      if (useRegex) {
        regex = new RegExp(searchQuery, caseSensitive ? 'g' : 'gi')
      } else {
        const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        regex = new RegExp(escapedQuery, caseSensitive ? 'g' : 'gi')
      }

      const matchesArray = code.match(regex)
      setMatches(matchesArray ? matchesArray.length : 0)
      if (matchesArray && matchesArray.length > 0) {
        setCurrentMatch(1)
      } else {
        setCurrentMatch(0)
      }
    } catch (error) {
      // Invalid regex
      setMatches(0)
      setCurrentMatch(0)
    }
  }, [searchQuery, code, caseSensitive, useRegex])

  // Replace single match
  const handleReplaceSingle = () => {
    if (!searchQuery || !code) return

    try {
      let regex: RegExp
      if (useRegex) {
        regex = new RegExp(searchQuery, caseSensitive ? '' : 'i')
      } else {
        const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        regex = new RegExp(escapedQuery, caseSensitive ? '' : 'i')
      }

      const newCode = code.replace(regex, replaceQuery)
      onCodeChange(newCode)
    } catch (error) {
      console.error('Replace error:', error)
    }
  }

  // Replace all matches
  const handleReplaceAll = () => {
    if (!searchQuery || !code) return

    try {
      let regex: RegExp
      if (useRegex) {
        regex = new RegExp(searchQuery, caseSensitive ? 'g' : 'gi')
      } else {
        const escapedQuery = searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        regex = new RegExp(escapedQuery, caseSensitive ? 'g' : 'gi')
      }

      const newCode = code.replace(regex, replaceQuery)
      onCodeChange(newCode)
      setSearchQuery('')
      setReplaceQuery('')
    } catch (error) {
      console.error('Replace error:', error)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+F: Open search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        // Already handled by parent component
      }
      
      // Ctrl+H: Open replace
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault()
        setShowReplace(true)
      }

      // Escape: Close panel
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }

      // Enter: Next match or replace
      if (e.key === 'Enter' && isOpen) {
        if (e.shiftKey) {
          // Shift+Enter: Previous match
          handlePreviousMatch()
        } else if (e.ctrlKey || e.metaKey) {
          // Ctrl+Enter: Replace and next
          handleReplaceSingle()
        } else {
          // Enter: Next match
          handleNextMatch()
        }
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, searchQuery, currentMatch, matches])

  // Navigate to next match
  const handleNextMatch = () => {
    if (matches > 0) {
      setCurrentMatch((prev) => (prev % matches) + 1)
    }
  }

  // Navigate to previous match
  const handlePreviousMatch = () => {
    if (matches > 0) {
      setCurrentMatch((prev) => (prev === 1 ? matches : prev - 1))
    }
  }

  if (!isOpen) return null

  return (
    <div className="absolute top-14 right-4 z-10 bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-4 w-96">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">
          {showReplace ? 'Rechercher & Remplacer' : 'Rechercher'}
        </h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
          title="Fermer (Esc)"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Search Input */}
      <div className="mb-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            className="w-full px-3 py-2 pr-20 bg-slate-700 border border-slate-600 rounded text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {/* Match counter */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400">
            {matches > 0 ? `${currentMatch}/${matches}` : matches === 0 && searchQuery ? '0' : ''}
          </div>
        </div>
      </div>

      {/* Replace Input */}
      {showReplace && (
        <div className="mb-3">
          <input
            type="text"
            placeholder="Remplacer par..."
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Options */}
      <div className="flex items-center gap-3 mb-3">
        <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={caseSensitive}
            onChange={(e) => setCaseSensitive(e.target.checked)}
            className="rounded"
          />
          Aa (Sensible à la casse)
        </label>
        <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={useRegex}
            onChange={(e) => setUseRegex(e.target.checked)}
            className="rounded"
          />
          .* (Regex)
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {/* Navigation buttons */}
        <div className="flex gap-1">
          <button
            onClick={handlePreviousMatch}
            disabled={matches === 0}
            className="px-2 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs rounded transition-colors"
            title="Précédent (Shift+Enter)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNextMatch}
            disabled={matches === 0}
            className="px-2 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs rounded transition-colors"
            title="Suivant (Enter)"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Replace buttons */}
        {!showReplace ? (
          <button
            onClick={() => setShowReplace(true)}
            className="flex-1 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs rounded transition-colors"
            title="Ctrl+H"
          >
            Remplacer
          </button>
        ) : (
          <>
            <button
              onClick={handleReplaceSingle}
              disabled={matches === 0}
              className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs rounded transition-colors"
              title="Ctrl+Enter"
            >
              Remplacer
            </button>
            <button
              onClick={handleReplaceAll}
              disabled={matches === 0}
              className="flex-1 px-3 py-1.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs rounded transition-colors"
            >
              Tout remplacer
            </button>
          </>
        )}
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="mt-3 pt-3 border-t border-slate-700 text-xs text-slate-400">
        <div className="grid grid-cols-2 gap-1">
          <div><kbd className="px-1 py-0.5 bg-slate-700 rounded text-xs">Ctrl+F</kbd> Rechercher</div>
          <div><kbd className="px-1 py-0.5 bg-slate-700 rounded text-xs">Ctrl+H</kbd> Remplacer</div>
          <div><kbd className="px-1 py-0.5 bg-slate-700 rounded text-xs">Enter</kbd> Suivant</div>
          <div><kbd className="px-1 py-0.5 bg-slate-700 rounded text-xs">Esc</kbd> Fermer</div>
        </div>
      </div>
    </div>
  )
}
