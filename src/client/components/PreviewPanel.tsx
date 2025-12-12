import { useState, useRef, useEffect } from 'react'
import { Code, Eye, Smartphone, Tablet, Monitor, RefreshCw, ExternalLink, Search, Terminal } from 'lucide-react'
import MonacoEditor from './MonacoEditor'
import SearchReplacePanel from './SearchReplacePanel'
import ConsolePanel from './ConsolePanel'
import { FileExplorer } from './FileExplorer'
import { generateAndDownloadZip } from '../utils/zipGenerator'

interface FileItem {
  path: string
  content: string
}

interface PreviewPanelProps {
  code: string
  loading: boolean
  onCodeChange?: (code: string) => void
  // 🔥 Nouveau : Support multi-fichiers
  projectType?: 'single-file' | 'multi-files'
  projectName?: string
  files?: FileItem[]
  mainFile?: string
  setupInstructions?: string
}

type ViewMode = 'preview' | 'code' | 'split'
type DeviceMode = 'desktop' | 'tablet' | 'mobile'

export default function PreviewPanel({ 
  code, 
  loading, 
  onCodeChange,
  projectType = 'single-file',
  projectName,
  files,
  mainFile,
  setupInstructions
}: PreviewPanelProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('preview')
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [showConsole, setShowConsole] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Update iframe when code changes
  useEffect(() => {
    if (iframeRef.current && code) {
      iframeRef.current.srcdoc = code
    }
  }, [code])

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+F: Open search (only in code/split mode)
      if ((e.ctrlKey || e.metaKey) && e.key === 'f' && (viewMode === 'code' || viewMode === 'split')) {
        e.preventDefault()
        setShowSearch(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [viewMode])

  const handleRefresh = () => {
    setIsRefreshing(true)
    if (iframeRef.current) {
      iframeRef.current.srcdoc = code
    }
    setTimeout(() => setIsRefreshing(false), 500)
  }

  const handleOpenInNewTab = () => {
    const blob = new Blob([code], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }

  const getDeviceWidth = () => {
    switch (deviceMode) {
      case 'mobile': return '375px'
      case 'tablet': return '768px'
      case 'desktop': return '100%'
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Toolbar */}
      <div className="h-12 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 flex-shrink-0">
        {/* Left: View Mode */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setViewMode('preview')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
              viewMode === 'preview'
                ? 'bg-primary-500 text-white'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
            title="Preview"
          >
            <Eye className="w-4 h-4" />
            <span>Preview</span>
          </button>
          
          <button
            onClick={() => setViewMode('code')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
              viewMode === 'code'
                ? 'bg-primary-500 text-white'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
            title="Code"
          >
            <Code className="w-4 h-4" />
            <span>Code</span>
          </button>
          
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
              viewMode === 'split'
                ? 'bg-primary-500 text-white'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
            title="Split View"
          >
            <div className="flex gap-0.5">
              <div className="w-2 h-4 bg-current rounded-l" />
              <div className="w-2 h-4 bg-current rounded-r" />
            </div>
            <span>Split</span>
          </button>
        </div>

        {/* Right: Device Mode & Actions */}
        <div className="flex items-center gap-2">
          {/* Search Button (visible in code/split mode) */}
          {(viewMode === 'code' || viewMode === 'split') && (
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-2 rounded-lg transition-colors ${
                showSearch
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
              title="Search & Replace (Ctrl+F)"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          {viewMode !== 'code' && (
            <>
              {/* Device Mode */}
              <div className="flex items-center gap-1 mr-2">
                <button
                  onClick={() => setDeviceMode('desktop')}
                  className={`p-2 rounded-lg transition-colors ${
                    deviceMode === 'desktop'
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                  title="Desktop"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => setDeviceMode('tablet')}
                  className={`p-2 rounded-lg transition-colors ${
                    deviceMode === 'tablet'
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                  title="Tablet"
                >
                  <Tablet className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => setDeviceMode('mobile')}
                  className={`p-2 rounded-lg transition-colors ${
                    deviceMode === 'mobile'
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                  title="Mobile"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>

              {/* Console Toggle */}
              <button
                onClick={() => setShowConsole(!showConsole)}
                className={`p-2 rounded-lg transition-colors ${
                  showConsole
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
                title="Toggle Console"
              >
                <Terminal className="w-4 h-4" />
              </button>

              {/* Refresh */}
              <button
                onClick={handleRefresh}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                title="Refresh Preview"
              >
                <RefreshCw className={`w-4 h-4 text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* Open in New Tab */}
              <button
                onClick={handleOpenInNewTab}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                title="Open in New Tab"
              >
                <ExternalLink className="w-4 h-4 text-slate-400" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {/* Search & Replace Panel */}
        {showSearch && onCodeChange && (
          <SearchReplacePanel
            code={code}
            onCodeChange={onCodeChange}
            isOpen={showSearch}
            onClose={() => setShowSearch(false)}
          />
        )}

        {!code && !loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Eye className="w-16 h-16 mx-auto mb-4 text-slate-600" />
              <p className="text-slate-400 text-lg mb-2">Aucune application à prévisualiser</p>
              <p className="text-slate-500 text-sm">
                Décrivez votre application dans le chat pour commencer
              </p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-lg mb-2">Construction de votre application...</p>
              <p className="text-slate-500 text-sm">
                Cela peut prendre quelques secondes
              </p>
            </div>
          </div>
        ) : projectType === 'multi-files' && files ? (
          // 🔷 MODE MULTI-FICHIERS : Afficher FileExplorer
          <FileExplorer
            projectName={projectName || 'project'}
            files={files}
            mainFile={mainFile || files[0]?.path}
            setupInstructions={setupInstructions || 'No setup instructions provided'}
            onDownload={() => generateAndDownloadZip(projectName || 'project', files)}
          />
        ) : (
          // 🔹 MODE SINGLE-FILE : Afficher Preview/Code comme avant
          <>
            {viewMode === 'preview' && (
              <div className="h-full flex items-center justify-center bg-slate-900 p-4 relative">
                <div
                  className="bg-white h-full transition-all duration-300"
                  style={{ 
                    width: getDeviceWidth(),
                    maxWidth: '100%'
                  }}
                >
                  <iframe
                    ref={iframeRef}
                    className="w-full h-full border-0"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                    title="Preview"
                  />
                </div>

                {/* Console Panel */}
                <ConsolePanel
                  iframeRef={iframeRef}
                  isOpen={showConsole}
                  onToggle={() => setShowConsole(!showConsole)}
                />
              </div>
            )}

            {viewMode === 'code' && (
              <div className="h-full">
                <MonacoEditor />
              </div>
            )}

            {viewMode === 'split' && (
              <div className="flex h-full">
                <div className="w-1/2 border-r border-slate-800">
                  <MonacoEditor />
                </div>
                <div className="w-1/2 flex items-center justify-center bg-slate-900 p-4 relative">
                  <div
                    className="bg-white h-full transition-all duration-300"
                    style={{ 
                      width: deviceMode === 'mobile' ? '375px' : '100%',
                      maxWidth: '100%'
                    }}
                  >
                    <iframe
                      ref={iframeRef}
                      className="w-full h-full border-0"
                      sandbox="allow-scripts allow-same-origin allow-forms"
                      title="Preview"
                    />
                  </div>

                  {/* Console Panel */}
                  <ConsolePanel
                    iframeRef={iframeRef}
                    isOpen={showConsole}
                    onToggle={() => setShowConsole(!showConsole)}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
