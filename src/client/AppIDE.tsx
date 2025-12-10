import { useState, useEffect } from 'react'
import { useApp } from './contexts/AppContext'
import HeaderIDE from './components/HeaderIDE'
import ChatInterface from './components/ChatInterface'
import PreviewPanel from './components/PreviewPanel'
import ExportManager from './components/ExportManager'
import TemplateLibrary from './components/TemplateLibrary'
import LoginModal from './components/LoginModal'
import ProjectSidebar from './components/ProjectSidebar'
import ShareProjectModal from './components/ShareProjectModal'
import VersionHistoryModal from './components/VersionHistoryModal'
import { GitPanel } from './components/GitPanel'
import { DeployPanel } from './components/DeployPanel'
import { ImageGenerationPanel } from './components/ImageGenerationPanel'
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
  const [showShare, setShowShare] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
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

      {/* Share Project Modal */}
      {showShare && currentProject && (
        <ShareProjectModal
          projectId={currentProject.id}
          projectName={currentProject.name}
          isOpen={showShare}
          onClose={() => setShowShare(false)}
        />
      )}

      {/* Version History Modal */}
      {showVersionHistory && currentProject && (
        <VersionHistoryModal
          projectId={currentProject.id}
          currentCode={generatedCode}
          isOpen={showVersionHistory}
          onClose={() => setShowVersionHistory(false)}
          onRestore={(code) => {
            setGeneratedCode(code)
            if (isAuthenticated && currentProject) {
              updateProjectCode(code)
            }
          }}
        />
      )}

      {/* Git Panel */}
      <GitPanel
        isOpen={showGitPanel}
        onClose={() => setShowGitPanel(false)}
        projectCode={generatedCode}
        projectName={projectName}
      />

      {/* Deploy Panel */}
      <DeployPanel
        isOpen={showDeployPanel}
        onClose={() => setShowDeployPanel(false)}
        projectCode={generatedCode}
        projectName={projectName}
      />

      {/* Image Generation Panel */}
      <ImageGenerationPanel
        isOpen={showImageGeneration}
        onClose={() => setShowImageGeneration(false)}
        onImageGenerated={(imageUrl) => {
          console.log('Image generated:', imageUrl)
          // You can integrate this with the code generation
        }}
      />

      {/* Floating Action Buttons */}
      {generatedCode && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-10">
          {/* Image Generation Button */}
          <button
            onClick={() => setShowImageGeneration(true)}
            className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-colors flex items-center gap-2"
            title="Générer une image AI"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Images AI
          </button>

          {/* Deploy Button */}
          <button
            onClick={() => setShowDeployPanel(true)}
            className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg transition-colors flex items-center gap-2"
            title="Déployer sur Cloudflare"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            Deploy
          </button>

          {/* Git Button */}
          <button
            onClick={() => setShowGitPanel(true)}
            className="px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg transition-colors flex items-center gap-2"
            title="Push vers GitHub"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
            </svg>
            GitHub
          </button>

          {isAuthenticated && currentProject && (
            <>
              {/* Version History Button */}
              <button
                onClick={() => setShowVersionHistory(true)}
                className="px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-full shadow-lg transition-colors flex items-center gap-2"
                title="Historique des versions"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Versions
              </button>

              {/* Share Button */}
              <button
                onClick={() => setShowShare(true)}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors flex items-center gap-2"
                title="Partager ce projet"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Partager
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// Missing function definition for handleLoadTemplate
function handleLoadTemplate(template: any) {
  // TODO: Implement template loading logic
  console.log('Loading template:', template)
}
