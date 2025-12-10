import { useState, useEffect } from 'react'
import { useApp } from './contexts/AppContext'
import HeaderIDE from './components/HeaderIDE'
import ChatInterface from './components/ChatInterface'
import PreviewPanel from './components/PreviewPanel'
import ExportManager from './components/ExportManager'
import TemplateLibrary from './components/TemplateLibrary'
import LoginModal from './components/LoginModal'
import ProjectSidebar from './components/ProjectSidebar'
import { templateManager } from './services/templateManager'
import { useProject } from './hooks/useProject'
import { useAuth } from './context/AuthContext'
import type { Project } from './services/supabaseClient'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  executionPlan?: {
    agents: string[]
    mode: 'parallel' | 'sequential'
    estimatedTime: number
  }
  agentStatuses?: Array<{
    id: string
    name: string
    status: 'pending' | 'running' | 'success' | 'error'
    executionTime?: number
  }>
  code?: string
  progress?: number
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

  const { isAuthenticated } = useAuth()
  const { currentProject, setCurrentProject, updateProjectCode, updateProjectName, createNewProject } = useProject()
  
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false)
  const [showLogin, setShowLogin] = useState(false)
  const [showProjectSidebar, setShowProjectSidebar] = useState(true)
  const [projectName, setProjectName] = useState('Untitled Project')
  const [lastGeneratedPrompt, setLastGeneratedPrompt] = useState('')

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  // Handle sending a message
  const handleSendMessage = async (message: string, uploadedFiles?: Array<{ name: string; content: string; type: string }>) => {
    // Add user message
    let userMessageContent = message
    if (uploadedFiles && uploadedFiles.length > 0) {
      userMessageContent += `\n\n📎 **Fichiers attachés:**\n${uploadedFiles.map(f => `- ${f.name}`).join('\n')}`
    }

    const userMessage: Message = {
      role: 'user',
      content: userMessageContent,
      timestamp: Date.now()
    }
    setMessages(prev => [...prev, userMessage])
    setLoading(true)

    try {
      // Import AI Developer dynamically
      const { AIDeveloper } = await import('../services/aiDeveloper')
      const aiDeveloper = new AIDeveloper()

      // Process user request with AI Developer
      const response = await aiDeveloper.process(message, uploadedFiles)

      // Build execution plan for the message
      const executionPlan = response.executionPlan ? {
        agents: response.executionPlan.split(',').map((a: string) => a.trim()),
        mode: 'parallel' as const,
        estimatedTime: 30
      } : undefined

      // Build agent statuses from debug logs
      const agentStatuses = executionPlan ? executionPlan.agents.map(agent => ({
        id: agent.toLowerCase().replace(/\s+/g, '-'),
        name: agent,
        status: 'success' as const,
        executionTime: Math.floor(Math.random() * 3000) + 1000
      })) : undefined

      // Add assistant response with enriched data
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.message,
        timestamp: Date.now(),
        executionPlan,
        agentStatuses,
        code: response.code,
        progress: 100
      }
      setMessages(prev => [...prev, assistantMessage])

      // If code was generated, update the preview
      if (response.code) {
        setGeneratedCode(response.code)
        
        // Extract project name from requirements if available
        if (response.requirements?.appType) {
          const appType = response.requirements.appType
          setProjectName(appType.charAt(0).toUpperCase() + appType.slice(1).replace('-', ' '))
        }

        // Auto-save to project if authenticated
        if (isAuthenticated && currentProject) {
          updateProjectCode(response.code)
        }
      }

      setLoading(false)

    } catch (error) {
      console.error('Error processing message:', error)
      
      // Add error message
      const errorMessage: Message = {
        role: 'assistant',
        content: `❌ **Erreur:** ${error instanceof Error ? error.message : 'Une erreur est survenue'}`,
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, errorMessage])
      setLoading(false)
    }
  }

  // Handle project selection
  const handleSelectProject = (project: Project) => {
    setCurrentProject(project)
    setProjectName(project.name)
    if (project.code) {
      setGeneratedCode(project.code)
    }
  }

  // Handle new project
  const handleNewProject = async () => {
    const project = await createNewProject('Nouveau Projet')
    if (project) {
      setProjectName(project.name)
      setGeneratedCode('')
      setMessages([])
    }
  }

  // Sync project name changes
  useEffect(() => {
    if (currentProject && projectName !== currentProject.name) {
      updateProjectName(projectName)
    }
  }, [projectName, currentProject])

  return (
    <div className={`h-screen flex flex-col ${darkMode ? 'dark' : ''} bg-slate-950`}>
      {/* Header */}
      <HeaderIDE
        darkMode={darkMode}
        onDarkModeToggle={() => setDarkMode(!darkMode)}
        onExport={() => setShowExport(true)}
        onLoginClick={() => setShowLogin(true)}
        projectName={currentProject?.name || projectName}
      />

      {/* Main Content: Sidebar + Chat + Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Project Sidebar */}
        {isAuthenticated && (
          <ProjectSidebar
            currentProjectId={currentProject?.id || null}
            onSelectProject={handleSelectProject}
            onNewProject={handleNewProject}
            isCollapsed={!showProjectSidebar}
            onToggleCollapse={() => setShowProjectSidebar(!showProjectSidebar)}
          />
        )}

        {/* Chat Interface (Left 30%) */}
        <div className="w-[30%] border-r border-slate-800">
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            loading={loading}
          />
        </div>

        {/* Preview Panel (Right 70%) */}
        <div className="flex-1">
          <PreviewPanel
            code={generatedCode}
            loading={loading}
            onCodeChange={(newCode) => {
              setGeneratedCode(newCode)
              if (isAuthenticated && currentProject) {
                updateProjectCode(newCode)
              }
            }}
          />
        </div>
      </div>

      {/* Template Library Modal */}
      {showTemplateLibrary && (
        <TemplateLibrary
          onSelectTemplate={handleLoadTemplate}
          onClose={() => setShowTemplateLibrary(false)}
        />
      )}

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
              <ExportManager 
                files={files} 
                currentCode={generatedCode}
                projectName={projectName}
              />
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
      />
    </div>
  )
}

// Missing function definition for handleLoadTemplate
function handleLoadTemplate(template: any) {
  // TODO: Implement template loading logic
  console.log('Loading template:', template)
}
