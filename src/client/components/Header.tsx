import { Code2, LayoutGrid, FolderOpen, Sun, Moon, Download, Sparkles } from 'lucide-react'
import { AGENTS } from '../constants/agents'

interface HeaderProps {
  activeAgent: string
  onAgentChange: (agentId: string) => void
  darkMode: boolean
  onDarkModeToggle: () => void
  onTemplatesOpen: () => void
  onVariationsOpen: () => void
  onFilesToggle: () => void
  showFiles: boolean
  onExportClick: () => void
  templatesCount: number
}

export default function Header({
  activeAgent,
  onAgentChange,
  darkMode,
  onDarkModeToggle,
  onTemplatesOpen,
  onVariationsOpen,
  onFilesToggle,
  showFiles,
  onExportClick,
  templatesCount
}: HeaderProps) {
  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 flex-shrink-0">
      {/* Left: Logo + Agent Selector */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Code2 className="w-6 h-6 text-primary-400" />
          <h1 className="text-xl font-bold text-white">
            Code<span className="text-gradient">Craft</span> Studio
          </h1>
        </div>
        
        {/* Agent Selector */}
        <div className="flex gap-2 ml-4">
          {AGENTS.map(agent => {
            const Icon = getIconComponent(agent.icon)
            const isActive = activeAgent === agent.id
            
            return (
              <button
                key={agent.id}
                onClick={() => onAgentChange(agent.id)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? `bg-gradient-to-r ${agent.color} text-white shadow-lg`
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
                title={agent.description}
              >
                <Icon className="w-4 h-4" />
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Templates Button */}
        <button
          onClick={onTemplatesOpen}
          className="px-4 py-2 bg-gradient-to-r from-primary-500 to-secondary-600 text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2 font-medium"
        >
          <LayoutGrid className="w-5 h-5" />
          Templates
          <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
            {templatesCount}
          </span>
        </button>
        
        {/* Variations Button */}
        <button
          onClick={onVariationsOpen}
          className="px-4 py-2 bg-gradient-to-r from-secondary-500 to-accent-500 text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2 font-medium"
          title="Générer 3 variations de style (Ctrl+V)"
        >
          <Sparkles className="w-5 h-5" />
          Variations
        </button>
        
        {/* Toggle Files Sidebar */}
        <button
          onClick={onFilesToggle}
          className={`p-2 rounded-lg transition-colors ${
            showFiles ? 'bg-slate-700 text-primary-400' : 'text-slate-400 hover:bg-slate-800'
          }`}
          title="Toggle Files (Ctrl+B)"
        >
          <FolderOpen className="w-5 h-5" />
        </button>
        
        {/* Export Button */}
        <button
          onClick={onExportClick}
          className="p-2 text-slate-400 hover:bg-slate-800 rounded-lg transition-colors"
          title="Export (Ctrl+S)"
        >
          <Download className="w-5 h-5" />
        </button>
        
        {/* Dark Mode Toggle */}
        <button
          onClick={onDarkModeToggle}
          className="p-2 text-slate-400 hover:bg-slate-800 rounded-lg transition-colors"
          title="Toggle Dark Mode"
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  )
}

// Helper to get icon component from string name
function getIconComponent(iconName: string) {
  const icons: Record<string, any> = {
    Palette: ({ className }: { className?: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    Code2,
    Bug: ({ className }: { className?: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    BookOpen: ({ className }: { className?: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    Sparkles: ({ className }: { className?: string }) => (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    )
  }
  
  return icons[iconName] || Code2
}
