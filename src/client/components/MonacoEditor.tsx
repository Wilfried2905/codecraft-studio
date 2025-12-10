import { useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react'
import { useApp } from '../contexts/AppContext'

export default function MonacoEditor() {
  const { files, activeFileId, updateFileContent } = useApp()
  const editorRef = useRef<any>(null)

  const activeFile = files.find(f => f.id === activeFileId)

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor
    
    // Configure editor options
    editor.updateOptions({
      fontSize: 14,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      roundedSelection: false,
      readOnly: false,
      cursorStyle: 'line',
      automaticLayout: true,
      formatOnPaste: true,
      formatOnType: true,
      lineNumbers: 'on',
      wordWrap: 'on',
      wrappingIndent: 'indent',
      renderWhitespace: 'selection',
    })

    // Add keyboard shortcuts
    editor.addCommand(
      editor.KeyMod.CtrlCmd | editor.KeyCode.KeyS,
      () => {
        // Save file (will be implemented)
        console.log('Save shortcut triggered')
      }
    )
  }

  const handleEditorChange = (value: string | undefined) => {
    if (activeFile && value !== undefined) {
      updateFileContent(activeFile.id, value)
    }
  }

  // Detect language from file extension
  const getLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase()
    
    const languageMap: Record<string, string> = {
      'html': 'html',
      'htm': 'html',
      'css': 'css',
      'scss': 'scss',
      'sass': 'sass',
      'less': 'less',
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'json': 'json',
      'md': 'markdown',
      'txt': 'plaintext',
      'xml': 'xml',
      'svg': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'py': 'python',
      'rb': 'ruby',
      'php': 'php',
      'java': 'java',
      'c': 'c',
      'cpp': 'cpp',
      'cs': 'csharp',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin',
      'sh': 'shell',
      'bash': 'shell',
      'sql': 'sql',
    }
    
    return languageMap[ext || ''] || 'plaintext'
  }

  if (!activeFile) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <svg
            className="w-20 h-20 mx-auto mb-4 text-slate-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-slate-400 text-lg mb-2">Aucun fichier sélectionné</p>
          <p className="text-slate-500 text-sm">
            Créez un nouveau fichier ou sélectionnez-en un existant
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-900">
      {/* Editor Header */}
      <div className="h-10 bg-slate-800 border-b border-slate-700 flex items-center px-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <div className="ml-4 flex items-center gap-2">
          <svg
            className="w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span className="text-sm text-slate-300 font-medium">
            {activeFile.name}
          </span>
          <span className="text-xs text-slate-500 uppercase">
            {getLanguage(activeFile.name)}
          </span>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={getLanguage(activeFile.name)}
          value={activeFile.content}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            lineHeight: 22,
            padding: { top: 16, bottom: 16 },
            smoothScrolling: true,
            contextmenu: true,
            mouseWheelZoom: true,
            quickSuggestions: true,
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            tabCompletion: 'on',
            wordBasedSuggestions: 'matchingDocuments',
            bracketPairColorization: {
              enabled: true,
            },
            guides: {
              bracketPairs: true,
              indentation: true,
            },
            'semanticHighlighting.enabled': true,
          }}
        />
      </div>
    </div>
  )
}
