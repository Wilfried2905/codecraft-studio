import { useState, useRef, useEffect } from 'react'
import { Send, Loader, Sparkles, Paperclip } from 'lucide-react'
import FileUpload from './FileUpload'
import MessageBubble, { MessageData } from './MessageBubble'
import { VoiceInputButton } from './VoiceInputButton'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  executionPlan?: any
  agentStatuses?: any[]
  code?: string
  progress?: number
}

interface ChatInterfaceProps {
  messages: Message[]
  onSendMessage: (message: string, uploadedFiles?: Array<{ name: string; content: string; type: string }>) => void
  loading: boolean
}

export default function ChatInterface({ messages, onSendMessage, loading }: ChatInterfaceProps) {
  const [input, setInput] = useState('')
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; content: string; type: string }>>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  const handleFilesUploaded = (files: Array<{ name: string; content: string; type: string }>) => {
    setUploadedFiles(files)
  }

  const handleSend = () => {
    console.log('🟢 ChatInterface.handleSend() appelé')
    console.log('🟢 Input:', input)
    console.log('🟢 Loading:', loading)
    console.log('🟢 onSendMessage type:', typeof onSendMessage)
    
    if (!input.trim() || loading) {
      console.log('🟡 Envoi bloqué - input vide ou loading actif')
      return
    }
    
    console.log('🟢 Appel onSendMessage avec:', input.trim())
    onSendMessage(input.trim(), uploadedFiles)
    setInput('')
    setUploadedFiles([])
    setShowFileUpload(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Bienvenue sur CodeCraft Studio
            </h2>
            <p className="text-slate-400 max-w-md mb-6">
              Décrivez l'application que vous voulez créer et je vais la construire pour vous en temps réel.
            </p>
            <div className="grid grid-cols-1 gap-3 max-w-md">
              <button
                onClick={() => setInput("Crée une application de gestion de tâches avec React")}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-left text-sm text-slate-300 transition-colors"
              >
                📝 Crée une app de gestion de tâches
              </button>
              <button
                onClick={() => setInput("Construis un dashboard analytics moderne")}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-left text-sm text-slate-300 transition-colors"
              >
                📊 Construis un dashboard analytics
              </button>
              <button
                onClick={() => setInput("Développe une landing page pour un SaaS")}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-left text-sm text-slate-300 transition-colors"
              >
                🚀 Développe une landing page SaaS
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <MessageBubble
                key={index}
                message={message as MessageData}
                onCopy={() => {
                  if (message.code) {
                    navigator.clipboard.writeText(message.code)
                  }
                }}
                onDownload={() => {
                  if (message.code) {
                    const blob = new Blob([message.code], { type: 'text/html' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'generated-app.html'
                    a.click()
                    URL.revokeObjectURL(url)
                  }
                }}
                onVariations={() => {
                  console.log('Generate variations - TODO')
                }}
              />
            ))}
            
            {loading && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                  🤖
                </div>
                <div className="bg-slate-800 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin text-primary-400" />
                    <span className="text-sm text-slate-400">
                      Construction de votre application...
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-800 p-4 bg-slate-900">
        {/* File Upload Area (collapsible) */}
        {showFileUpload && (
          <div className="mb-4">
            <FileUpload onFilesUploaded={handleFilesUploaded} />
          </div>
        )}

        <div className="flex gap-2 items-end">
          {/* Textarea - Takes all available space */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Décrivez l'application que vous voulez créer..."
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all resize-none max-h-32"
              rows={1}
              disabled={loading}
            />
          </div>

          {/* Action Buttons - Stacked vertically */}
          <div className="flex flex-col gap-1 flex-shrink-0">
            {/* Attach Files Button */}
            <button
              onClick={() => setShowFileUpload(!showFileUpload)}
              className={`p-2 rounded-lg transition-all ${
                showFileUpload 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
              title="Upload Word, Excel, PowerPoint, PDF"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Voice Input Button */}
            <VoiceInputButton
              onTranscript={(text) => {
                setInput(prev => (prev ? prev + ' ' + text : text))
              }}
              className=""
            />
            
            {/* Send Button - Stacked below */}
            <button
              onClick={(e) => {
                console.log('🟣 Bouton cliqué !', e)
                console.log('🟣 Disabled:', loading || !input.trim())
                handleSend()
              }}
              disabled={loading || !input.trim()}
              className="p-2 bg-gradient-to-r from-primary-500 to-secondary-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center"
              title={loading ? "Création en cours..." : "Envoyer"}
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        
        <p className="text-xs text-slate-500 mt-2">
          {uploadedFiles.length > 0 && (
            <span className="text-primary-400 mr-2">
              📎 {uploadedFiles.length} fichier(s) attaché(s)
            </span>
          )}
          Appuyez sur <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">Entrée</kbd> pour envoyer, 
          <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-400 ml-1">Shift + Entrée</kbd> pour un saut de ligne
        </p>
      </div>
    </div>
  )
}
