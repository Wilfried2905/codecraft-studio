/**
 * MessageBubble - Affiche un message enrichi avec plan d'exécution, progression, agents
 */

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

export interface AgentStatus {
  id: string
  name: string
  status: 'pending' | 'running' | 'success' | 'error'
  executionTime?: number
}

export interface ExecutionPlan {
  agents: string[]
  mode: 'parallel' | 'sequential'
  estimatedTime: number
}

export interface MessageData {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  executionPlan?: ExecutionPlan
  agentStatuses?: AgentStatus[]
  code?: string
  progress?: number
}

interface MessageBubbleProps {
  message: MessageData
  onCopy?: () => void
  onDownload?: () => void
  onVariations?: () => void
}

export default function MessageBubble({ 
  message, 
  onCopy, 
  onDownload, 
  onVariations 
}: MessageBubbleProps) {
  const [showCode, setShowCode] = useState(false)
  const isUser = message.role === 'user'

  // Format timestamp
  const timeStr = new Date(message.timestamp).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Message bubble */}
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-gradient-to-br from-teal-600 to-teal-700 text-white'
              : 'bg-slate-800/50 border border-slate-700/50 text-slate-100'
          }`}
        >
          {/* Execution Plan (assistant only) */}
          {!isUser && message.executionPlan && (
            <div className="mb-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold text-teal-400">📋 PLAN D'EXÉCUTION</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-slate-400">Agents:</span>
                  <span className="ml-1 font-medium text-white">
                    {message.executionPlan.agents.length}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Mode:</span>
                  <span className="ml-1 font-medium text-white">
                    {message.executionPlan.mode === 'parallel' ? '⚡ Parallèle' : '🔗 Séquentiel'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Temps:</span>
                  <span className="ml-1 font-medium text-white">
                    ~{message.executionPlan.estimatedTime}s
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar (assistant only, during execution) */}
          {!isUser && message.progress !== undefined && message.progress < 100 && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-400">Progression</span>
                <span className="text-xs font-medium text-teal-400">{message.progress}%</span>
              </div>
              <div className="h-1.5 bg-slate-900/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-purple-500 transition-all duration-300"
                  style={{ width: `${message.progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Agent Statuses (assistant only) */}
          {!isUser && message.agentStatuses && message.agentStatuses.length > 0 && (
            <div className="mb-3 space-y-1">
              {message.agentStatuses.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center justify-between text-xs p-2 bg-slate-900/30 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    {agent.status === 'pending' && (
                      <span className="text-slate-500">⏳</span>
                    )}
                    {agent.status === 'running' && (
                      <span className="text-yellow-400 animate-pulse">🔄</span>
                    )}
                    {agent.status === 'success' && (
                      <span className="text-green-400">✅</span>
                    )}
                    {agent.status === 'error' && (
                      <span className="text-red-400">❌</span>
                    )}
                    <span className={`font-medium ${
                      agent.status === 'success' ? 'text-green-400' :
                      agent.status === 'error' ? 'text-red-400' :
                      agent.status === 'running' ? 'text-yellow-400' :
                      'text-slate-400'
                    }`}>
                      {agent.name}
                    </span>
                  </div>
                  {agent.executionTime && (
                    <span className="text-slate-500">{agent.executionTime}ms</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Message Content with Markdown */}
          <div className="prose prose-sm prose-invert max-w-none">
            <ReactMarkdown
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '')
                  return !inline && match ? (
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    >
                      {String(children).replace(/\n$/, '')}
                    </SyntaxHighlighter>
                  ) : (
                    <code className="bg-slate-900/50 px-1 py-0.5 rounded text-teal-400" {...props}>
                      {children}
                    </code>
                  )
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Code Preview Toggle (assistant only) */}
          {!isUser && message.code && (
            <button
              onClick={() => setShowCode(!showCode)}
              className="mt-3 text-xs text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1"
            >
              {showCode ? '▼' : '▶'} {showCode ? 'Masquer' : 'Voir'} le code généré
            </button>
          )}

          {/* Code Block (expandable) */}
          {!isUser && message.code && showCode && (
            <div className="mt-3 max-h-64 overflow-auto rounded-lg">
              <SyntaxHighlighter
                style={vscDarkPlus}
                language="html"
                PreTag="div"
                customStyle={{ margin: 0, fontSize: '11px' }}
              >
                {message.code}
              </SyntaxHighlighter>
            </div>
          )}
        </div>

        {/* Quick Actions (assistant only) */}
        {!isUser && message.code && (
          <div className="flex items-center gap-2 mt-2 ml-2">
            {onCopy && (
              <button
                onClick={onCopy}
                className="text-xs px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-lg transition-colors flex items-center gap-1.5"
                title="Copier le code"
              >
                📋 Copier
              </button>
            )}
            {onDownload && (
              <button
                onClick={onDownload}
                className="text-xs px-3 py-1.5 bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 rounded-lg transition-colors flex items-center gap-1.5"
                title="Télécharger"
              >
                💾 Télécharger
              </button>
            )}
            {onVariations && (
              <button
                onClick={onVariations}
                className="text-xs px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-colors flex items-center gap-1.5"
                title="Générer des variations"
              >
                ✨ Variations
              </button>
            )}
          </div>
        )}

        {/* Timestamp */}
        <div className={`text-xs text-slate-500 mt-1 ${isUser ? 'text-right' : 'text-left'} ml-2`}>
          {timeStr}
        </div>
      </div>

      {/* Avatar */}
      <div className={`flex-shrink-0 ${isUser ? 'order-1 mr-3' : 'order-2 ml-3'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
          isUser
            ? 'bg-gradient-to-br from-teal-500 to-teal-600'
            : 'bg-gradient-to-br from-purple-500 to-pink-500'
        }`}>
          {isUser ? '👤' : '🤖'}
        </div>
      </div>
    </div>
  )
}
