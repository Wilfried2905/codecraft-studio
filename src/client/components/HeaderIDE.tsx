import { Code2, Download, Settings, Sun, Moon } from 'lucide-react'

interface HeaderIDEProps {
  darkMode: boolean
  onDarkModeToggle: () => void
  onExport: () => void
  projectName?: string
}

export default function HeaderIDE({
  darkMode,
  onDarkModeToggle,
  onExport,
  projectName = 'Untitled Project'
}: HeaderIDEProps) {
  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 flex-shrink-0">
      {/* Left: Logo + Project Name */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-primary-400" />
          <h1 className="text-lg font-bold text-white">
            Code<span className="text-gradient">Craft</span> Studio
          </h1>
        </div>
        
        <div className="h-6 w-px bg-slate-700" />
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">{projectName}</span>
        </div>
      </div>
      
      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {/* Export/Deploy */}
        <button
          onClick={onExport}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors group"
          title="Export & Deploy"
        >
          <Download className="w-5 h-5 text-slate-400 group-hover:text-white" />
        </button>
        
        {/* Dark Mode Toggle */}
        <button
          onClick={onDarkModeToggle}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          title="Toggle Dark Mode"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-slate-400 hover:text-white" />
          ) : (
            <Moon className="w-5 h-5 text-slate-400 hover:text-white" />
          )}
        </button>
        
        {/* Settings */}
        <button
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors group"
          title="Settings"
        >
          <Settings className="w-5 h-5 text-slate-400 group-hover:text-white" />
        </button>
      </div>
    </header>
  )
}
