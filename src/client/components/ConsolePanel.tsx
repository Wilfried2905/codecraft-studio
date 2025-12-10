/**
 * Console Panel Component
 * 
 * Integrated JavaScript console for preview iframe:
 * - Capture console.log, warn, error
 * - Display with syntax highlighting
 * - Clear console
 * - Filter by log level
 * - Timestamp
 */

import { useState, useEffect, useRef } from 'react'

export interface ConsoleMessage {
  id: string
  type: 'log' | 'warn' | 'error' | 'info'
  message: string
  timestamp: number
  args?: any[]
}

interface ConsolePanelProps {
  iframeRef: React.RefObject<HTMLIFrameElement>
  isOpen: boolean
  onToggle: () => void
}

export default function ConsolePanel({ iframeRef, isOpen, onToggle }: ConsolePanelProps) {
  const [messages, setMessages] = useState<ConsoleMessage[]>([])
  const [filter, setFilter] = useState<'all' | 'log' | 'warn' | 'error'>('all')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Setup console capture
  useEffect(() => {
    const setupConsoleCapture = () => {
      if (!iframeRef.current?.contentWindow) return

      const iframeWindow = iframeRef.current.contentWindow

      // Store original console methods
      const originalConsole = {
        log: iframeWindow.console.log,
        warn: iframeWindow.console.warn,
        error: iframeWindow.console.error,
        info: iframeWindow.console.info
      }

      // Override console methods
      iframeWindow.console.log = (...args: any[]) => {
        originalConsole.log.apply(iframeWindow.console, args)
        addMessage('log', args)
      }

      iframeWindow.console.warn = (...args: any[]) => {
        originalConsole.warn.apply(iframeWindow.console, args)
        addMessage('warn', args)
      }

      iframeWindow.console.error = (...args: any[]) => {
        originalConsole.error.apply(iframeWindow.console, args)
        addMessage('error', args)
      }

      iframeWindow.console.info = (...args: any[]) => {
        originalConsole.info.apply(iframeWindow.console, args)
        addMessage('info', args)
      }

      // Capture uncaught errors
      iframeWindow.addEventListener('error', (e: ErrorEvent) => {
        addMessage('error', [`${e.message} at ${e.filename}:${e.lineno}:${e.colno}`])
      })
    }

    // Setup capture when iframe loads
    const iframe = iframeRef.current
    if (iframe) {
      iframe.addEventListener('load', setupConsoleCapture)
      setupConsoleCapture()
    }

    return () => {
      if (iframe) {
        iframe.removeEventListener('load', setupConsoleCapture)
      }
    }
  }, [iframeRef])

  // Add message to console
  const addMessage = (type: ConsoleMessage['type'], args: any[]) => {
    const message: ConsoleMessage = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      message: args.map(arg => {
        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2)
          } catch {
            return String(arg)
          }
        }
        return String(arg)
      }).join(' '),
      timestamp: Date.now(),
      args
    }

    setMessages(prev => [...prev, message])
  }

  // Clear console
  const clearConsole = () => {
    setMessages([])
  }

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  // Filter messages
  const filteredMessages = filter === 'all' 
    ? messages 
    : messages.filter(msg => msg.type === filter)

  // Get icon for message type
  const getIcon = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'error':
        return (
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      case 'warn':
        return (
          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      case 'info':
        return (
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  // Get text color for message type
  const getTextColor = (type: ConsoleMessage['type']) => {
    switch (type) {
      case 'error': return 'text-red-400'
      case 'warn': return 'text-yellow-400'
      case 'info': return 'text-blue-400'
      default: return 'text-slate-300'
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="absolute bottom-4 right-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg shadow-lg transition-colors flex items-center gap-2 z-10"
        title="Toggle Console"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        Console
        {messages.length > 0 && (
          <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
            {messages.length}
          </span>
        )}
      </button>
    )
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 h-64 bg-slate-900 border-t border-slate-700 flex flex-col z-10">
      {/* Header */}
      <div className="h-10 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-medium text-white">Console</span>
          {messages.length > 0 && (
            <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-xs rounded">
              {filteredMessages.length}/{messages.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-2 py-1 bg-slate-700 border border-slate-600 rounded text-xs text-white"
          >
            <option value="all">Tous</option>
            <option value="log">Log</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
          </select>

          {/* Clear */}
          <button
            onClick={clearConsole}
            className="px-2 py-1 text-xs text-slate-400 hover:text-white transition-colors"
            title="Clear console"
          >
            Effacer
          </button>

          {/* Close */}
          <button
            onClick={onToggle}
            className="text-slate-400 hover:text-white transition-colors"
            title="Close console"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 font-mono text-xs">
        {filteredMessages.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            {messages.length === 0 ? 'Aucun message dans la console' : 'Aucun message filtré'}
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-2 p-2 hover:bg-slate-800/50 rounded">
              {getIcon(msg.type)}
              <div className="flex-1 min-w-0">
                <div className={`${getTextColor(msg.type)} whitespace-pre-wrap break-words`}>
                  {msg.message}
                </div>
                <div className="text-slate-500 text-xs mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
