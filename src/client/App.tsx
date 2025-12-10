import { useState, useEffect, useRef } from 'react'
import { Send, Loader } from 'lucide-react'
import { useApp } from './contexts/AppContext'
import Header from './components/Header'
import TemplatesLibrary from './components/TemplatesLibrary'
import FileManager from './components/FileManager'
import ExportManager from './components/ExportManager'
import MonacoEditor from './components/MonacoEditor'
import { TEMPLATES } from './constants/templates'
import { AGENTS } from './constants/agents'
import { extractCode } from './utils/codeExtractor'
import type { Template } from './constants/templates'
import type { FileItem } from './contexts/AppContext'

export default function App() {
  // Context state
  const {
    darkMode,
    setDarkMode,
    files,
    setFiles,
    activeFile,
    setActiveFile,
    messages,
    setMessages,
    activeAgent,
    setActiveAgent,
    userMemory,
    setUserMemory,
    generatedCode,
    setGeneratedCode
  } = useApp()
  
  // Local UI state
  const [showTemplates, setShowTemplates] = useState(false)
  const [showFiles, setShowFiles] = useState(true)
  const [userInput, setUserInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [editorMode, setEditorMode] = useState<'preview' | 'editor' | 'split'>('preview')
  
  // Refs
  const previewRef = useRef<HTMLIFrameElement>(null)
  
  // Update preview when code changes
  useEffect(() => {
    if (previewRef.current && generatedCode) {
      previewRef.current.srcdoc = generatedCode
    }
  }, [generatedCode])
  
  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])
  
  // Handle template selection
  const handleTemplateSelect = (template: Template) => {
    setUserInput(template.prompt)
    setShowTemplates(false)
    // Auto-send after short delay
    setTimeout(() => handleSend(template.prompt), 100)
  }
  
  // Handle file operations
  const handleFileCreate = (file: FileItem) => {
    setFiles(prev => [...prev, file])
    setActiveFile(file)
  }
  
  const handleFileRename = (fileId: string, newName: string) => {
    setFiles(prev =>
      prev.map(f => (f.id === fileId ? { ...f, name: newName } : f))
    )
  }
  
  const handleFileDelete = (fileId: string) => {
    if (files.length === 1) {
      alert('Impossible de supprimer le dernier fichier')
      return
    }
    
    setFiles(prev => prev.filter(f => f.id !== fileId))
    
    if (activeFile?.id === fileId) {
      const remainingFiles = files.filter(f => f.id !== fileId)
      setActiveFile(remainingFiles[0] || null)
    }
  }
  
  const handleFileSelect = (file: FileItem) => {
    setActiveFile(file)
    setGeneratedCode(file.content)
  }
  
  // Save code to active file
  const saveToActiveFile = (code: string) => {
    if (activeFile) {
      setFiles(prev =>
        prev.map(f =>
          f.id === activeFile.id
            ? { ...f, content: code, lastModified: Date.now() }
            : f
        )
      )
    }
  }
  
  // Handle send message
  const handleSend = async (promptOverride?: string) => {
    const prompt = promptOverride || userInput
    if (!prompt.trim()) return
    
    const selectedAgent = AGENTS.find(a => a.id === activeAgent)
    if (!selectedAgent) return
    
    // Add user message
    const newMessage = { role: 'user' as const, content: prompt, timestamp: Date.now() }
    setMessages(prev => [...prev, newMessage])
    setUserInput('')
    setLoading(true)
    
    try {
      // Call API route for code generation
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          agent: selectedAgent.id,
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

      const assistantMessage = {
        role: 'assistant' as const,
        content: data.placeholder 
          ? `✨ Code généré (mode placeholder)\n\n${data.code}` 
          : `✨ Code généré par ${selectedAgent.name}\n\n${data.code}`,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, assistantMessage])
      
      // Extract and display code
      const code = data.code
      setGeneratedCode(code)
      saveToActiveFile(code)
      
    } catch (error) {
      console.error('Generation error:', error)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `❌ Erreur: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: Date.now()
        }
      ])
    } finally {
      setLoading(false)
    }
  }
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        setShowFiles(!showFiles)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault()
        setShowTemplates(true)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault()
        setEditorMode(prev => (prev === 'preview' ? 'editor' : 'preview'))
      }
    }
    
    window.addEventListener('keydown', handleKeyboard)
    return () => window.removeEventListener('keydown', handleKeyboard)
  }, [showFiles])
  
  return (
    <div className={`h-screen flex flex-col ${darkMode ? 'dark' : ''} bg-slate-950`}>
      {/* Header */}
      <Header
        activeAgent={activeAgent}
        onAgentChange={setActiveAgent}
        darkMode={darkMode}
        onDarkModeToggle={() => setDarkMode(!darkMode)}
        onTemplatesOpen={() => setShowTemplates(true)}
        onFilesToggle={() => setShowFiles(!showFiles)}
        showFiles={showFiles}
        onExportClick={() => {}}
        templatesCount={TEMPLATES.length}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Manager Sidebar */}
        {showFiles && (
          <FileManager
            files={files}
            activeFile={activeFile}
            onFileSelect={handleFileSelect}
            onFileCreate={handleFileCreate}
            onFileRename={handleFileRename}
            onFileDelete={handleFileDelete}
          />
        )}
        
        {/* Center: Preview */}
        <div className="flex-1 flex flex-col">
          {/* Mode Toggle */}
          <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex gap-2 items-center flex-shrink-0">
            <button
              onClick={() => setEditorMode('preview')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                editorMode === 'preview'
                  ? 'bg-primary-500 text-white'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setEditorMode('editor')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                editorMode === 'editor'
                  ? 'bg-primary-500 text-white'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              Code
            </button>
            <button
              onClick={() => setEditorMode('split')}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                editorMode === 'split'
                  ? 'bg-primary-500 text-white'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              Split
            </button>
            
            <div className="flex-1" />
            
            {/* Export Button */}
            <ExportManager files={files} currentCode={generatedCode} />
          </div>
          
          {/* Preview/Editor Area */}
          <div className="flex-1 overflow-hidden bg-slate-950">
            {editorMode === 'preview' && (
              <iframe
                ref={previewRef}
                className="w-full h-full bg-white"
                sandbox="allow-scripts"
                title="Preview"
              />
            )}
            
            {editorMode === 'editor' && (
              <MonacoEditor />
            )}
            
            {editorMode === 'split' && (
              <div className="flex h-full">
                <div className="w-1/2 border-r border-slate-800">
                  <MonacoEditor />
                </div>
                <div className="w-1/2">
                  <iframe
                    ref={previewRef}
                    className="w-full h-full bg-white"
                    sandbox="allow-scripts"
                    title="Preview"
                  />
                </div>
              </div>
            )}
          </div>
          
          {/* Chat Input */}
          <div className="bg-slate-900 border-t border-slate-800 p-4 flex-shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={`Demandez à ${AGENTS.find(a => a.id === activeAgent)?.name} de créer quelque chose...`}
                className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-slate-500"
                disabled={loading}
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !userInput.trim()}
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-600 text-white rounded-lg hover:opacity-90 disabled:opacity-50 transition-all font-medium flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Génération...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Envoyer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <TemplatesLibrary
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleTemplateSelect}
      />
    </div>
  )
}

// Placeholder HTML generator (will be replaced with real API call)

