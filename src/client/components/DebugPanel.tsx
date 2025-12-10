/**
 * DebugPanel - Affiche les logs d'exécution des agents
 */

import { useState } from 'react'
import { ChevronDown, ChevronUp, Bug, Clock, CheckCircle, XCircle, Download } from 'lucide-react'

export interface AgentLog {
  agentId: string
  agentName: string
  status: 'pending' | 'running' | 'success' | 'error'
  startTime?: number
  endTime?: number
  executionTime?: number
  output?: string
  error?: string
}

interface DebugPanelProps {
  logs: AgentLog[]
  isOpen: boolean
  onToggle: () => void
}

export default function DebugPanel({ logs, isOpen, onToggle }: DebugPanelProps) {
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())

  const toggleLog = (agentId: string) => {
    const newExpanded = new Set(expandedLogs)
    if (newExpanded.has(agentId)) {
      newExpanded.delete(agentId)
    } else {
      newExpanded.add(agentId)
    }
    setExpandedLogs(newExpanded)
  }

  const getStatusIcon = (status: AgentLog['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />
      case 'running':
        return <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusColor = (status: AgentLog['status']) => {
    switch (status) {
      case 'pending':
        return 'text-gray-400'
      case 'running':
        return 'text-primary-400'
      case 'success':
        return 'text-green-400'
      case 'error':
        return 'text-red-400'
    }
  }

  const exportLogs = () => {
    const logData = JSON.stringify(logs, null, 2)
    const blob = new Blob([logData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `debug-logs-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const stats = {
    total: logs.length,
    success: logs.filter(l => l.status === 'success').length,
    error: logs.filter(l => l.status === 'error').length,
    running: logs.filter(l => l.status === 'running').length,
    totalTime: logs.reduce((sum, l) => sum + (l.executionTime || 0), 0)
  }

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 p-3 bg-slate-800 hover:bg-slate-700 rounded-full shadow-lg transition-colors z-50"
        title="Ouvrir le panneau de debug"
      >
        <Bug className="w-5 h-5 text-primary-400" />
        {logs.filter(l => l.status === 'running').length > 0 && (
          <span className="absolute top-0 right-0 w-3 h-3 bg-primary-500 rounded-full animate-pulse" />
        )}
      </button>
    )
  }

  return (
    <div className="fixed bottom-0 right-0 w-full md:w-96 h-[50vh] bg-slate-900 border-t border-l border-slate-700 shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center gap-2">
          <Bug className="w-5 h-5 text-primary-400" />
          <h3 className="font-semibold text-white">Debug Panel</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportLogs}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
            title="Export logs"
          >
            <Download className="w-4 h-4 text-slate-400" />
          </button>
          <button
            onClick={onToggle}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <ChevronDown className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="p-3 border-b border-slate-700 bg-slate-850">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Total</div>
            <div className="text-white font-semibold">{stats.total}</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Réussis</div>
            <div className="text-green-400 font-semibold">{stats.success}</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Erreurs</div>
            <div className="text-red-400 font-semibold">{stats.error}</div>
          </div>
          <div className="bg-slate-800 rounded p-2">
            <div className="text-slate-400">Temps</div>
            <div className="text-primary-400 font-semibold">{(stats.totalTime / 1000).toFixed(1)}s</div>
          </div>
        </div>
      </div>

      {/* Logs List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {logs.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            Aucun log pour le moment
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.agentId}
              className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden"
            >
              {/* Log Header */}
              <button
                onClick={() => toggleLog(log.agentId)}
                className="w-full p-3 flex items-center justify-between hover:bg-slate-750 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {getStatusIcon(log.status)}
                  <span className="text-sm font-medium text-white">
                    {log.agentName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {log.executionTime && (
                    <span className="text-xs text-slate-400">
                      {(log.executionTime / 1000).toFixed(2)}s
                    </span>
                  )}
                  {expandedLogs.has(log.agentId) ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Log Details */}
              {expandedLogs.has(log.agentId) && (
                <div className="p-3 border-t border-slate-700 bg-slate-900">
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-400">Status: </span>
                      <span className={getStatusColor(log.status)}>
                        {log.status}
                      </span>
                    </div>
                    {log.startTime && (
                      <div>
                        <span className="text-slate-400">Début: </span>
                        <span className="text-slate-300">
                          {new Date(log.startTime).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                    {log.endTime && (
                      <div>
                        <span className="text-slate-400">Fin: </span>
                        <span className="text-slate-300">
                          {new Date(log.endTime).toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                    {log.output && (
                      <div>
                        <div className="text-slate-400 mb-1">Output:</div>
                        <pre className="bg-slate-950 p-2 rounded text-slate-300 overflow-x-auto max-h-48">
                          {log.output.substring(0, 500)}
                          {log.output.length > 500 && '...'}
                        </pre>
                      </div>
                    )}
                    {log.error && (
                      <div>
                        <div className="text-red-400 mb-1">Error:</div>
                        <pre className="bg-red-950 p-2 rounded text-red-300 overflow-x-auto">
                          {log.error}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
