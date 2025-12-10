import { useState, useEffect } from 'react'
import { useApp } from './contexts/AppContext'
import HeaderIDE from './components/HeaderIDE'
import ChatInterface from './components/ChatInterface'
import PreviewPanel from './components/PreviewPanel'
import ExportManager from './components/ExportManager'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export default function AppIDE() {
  const {
    darkMode,
    setDarkMode,
    generatedCode,
    setGeneratedCode,
    files,
    activeFile
  } = useApp()

  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [projectName, setProjectName] = useState('Untitled Project')

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Handle sending a message
  const handleSendMessage = async (message: string) => {
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: Date.now()
    }
    setMessages(prev => [...prev, userMessage])
    setLoading(true)

    try {
      // Call API to generate application
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: message,
          agent: 'code', // Will be handled by intelligent router
          template: null,
          style: null,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Generation failed')
      }

      // Extract project name from prompt if possible
      const projectNameMatch = message.match(/(?:crée|créer|construis|développe)\s+(?:une?\s+)?(?:app(?:lication)?\s+)?(?:de\s+)?(.+?)(?:\s+avec|\s+en|$)/i)
      if (projectNameMatch) {
        const extractedName = projectNameMatch[1].trim()
        setProjectName(extractedName.charAt(0).toUpperCase() + extractedName.slice(1))
      }

      // Add assistant response
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.placeholder 
          ? `✨ **Application créée !**\n\nVotre application est maintenant visible dans le preview.\n\n*Note: Mode placeholder activé. Configurez votre clé API Anthropic pour des générations réelles.*` 
          : `✨ **Application créée avec succès !**\n\nVotre application est maintenant fonctionnelle et visible dans le preview. Vous pouvez la modifier en continuant la conversation.`,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, assistantMessage])
      
      // Update generated code
      setGeneratedCode(data.code)

    } catch (error) {
      console.error('Generation error:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: `❌ **Erreur lors de la génération**\n\n${error instanceof Error ? error.message : 'Une erreur inconnue est survenue'}`,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`h-screen flex flex-col ${darkMode ? 'dark' : ''} bg-slate-950`}>
      {/* Header */}
      <HeaderIDE
        darkMode={darkMode}
        onDarkModeToggle={() => setDarkMode(!darkMode)}
        onExport={() => setShowExport(true)}
        projectName={projectName}
      />

      {/* Main Content: Chat + Preview Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Interface (Left 50%) */}
        <div className="w-1/2 border-r border-slate-800">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            loading={loading}
          />
        </div>

        {/* Preview Panel (Right 50%) */}
        <div className="w-1/2">
          <PreviewPanel
            code={generatedCode}
            loading={loading}
            onCodeChange={(newCode) => setGeneratedCode(newCode)}
          />
        </div>
      </div>

      {/* Export Modal */}
      {showExport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl w-full max-w-2xl border border-slate-700 shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Export & Deploy</h2>
              <button
                onClick={() => setShowExport(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <ExportManager files={files} currentCode={generatedCode} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
