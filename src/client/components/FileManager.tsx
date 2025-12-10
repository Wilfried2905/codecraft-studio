import { useState } from 'react'
import { FolderOpen, FilePlus, File, Edit2, Trash2, X, Check } from 'lucide-react'
import type { FileItem } from '../contexts/AppContext'

interface FileManagerProps {
  files: FileItem[]
  activeFile: FileItem | null
  onFileSelect: (file: FileItem) => void
  onFileCreate: (file: FileItem) => void
  onFileRename: (fileId: string, newName: string) => void
  onFileDelete: (fileId: string) => void
}

export default function FileManager({
  files,
  activeFile,
  onFileSelect,
  onFileCreate,
  onFileRename,
  onFileDelete
}: FileManagerProps) {
  const [creating, setCreating] = useState(false)
  const [newFileName, setNewFileName] = useState('')
  const [editing, setEditing] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  
  const handleCreate = () => {
    if (!newFileName.trim()) return
    
    const extension = newFileName.includes('.') ? newFileName.split('.').pop() : 'html'
    const newFile: FileItem = {
      id: Date.now().toString(),
      name: newFileName,
      content: '',
      type: extension || 'html',
      lastModified: Date.now()
    }
    
    onFileCreate(newFile)
    setNewFileName('')
    setCreating(false)
  }
  
  const handleRename = (fileId: string) => {
    if (!editName.trim()) return
    onFileRename(fileId, editName)
    setEditing(null)
    setEditName('')
  }
  
  const startEditing = (file: FileItem) => {
    setEditing(file.id)
    setEditName(file.name)
  }
  
  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full flex-shrink-0">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex justify-between items-center flex-shrink-0">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-primary-400" />
          Fichiers
        </h3>
        <button
          onClick={() => setCreating(true)}
          className="p-1.5 text-primary-400 hover:bg-slate-800 rounded transition-colors"
          title="Nouveau fichier (Ctrl+N)"
        >
          <FilePlus className="w-5 h-5" />
        </button>
      </div>
      
      {/* Create Input */}
      {creating && (
        <div className="p-3 bg-slate-800 border-b border-slate-700 animate-fadeIn">
          <input
            type="text"
            value={newFileName}
            onChange={e => setNewFileName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleCreate()
              if (e.key === 'Escape') setCreating(false)
            }}
            placeholder="fichier.html"
            className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-sm focus:border-primary-500 focus:outline-none"
            autoFocus
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleCreate}
              className="flex-1 px-3 py-1 bg-primary-500 text-white rounded text-sm hover:bg-primary-600 transition-colors flex items-center justify-center gap-1"
            >
              <Check className="w-3 h-3" />
              Créer
            </button>
            <button
              onClick={() => setCreating(false)}
              className="flex-1 px-3 py-1 bg-slate-700 text-white rounded text-sm hover:bg-slate-600 transition-colors flex items-center justify-center gap-1"
            >
              <X className="w-3 h-3" />
              Annuler
            </button>
          </div>
        </div>
      )}
      
      {/* Files List */}
      <div className="flex-1 overflow-y-auto p-2">
        {files.map(file => {
          const isActive = activeFile?.id === file.id
          const isEditing = editing === file.id
          
          if (isEditing) {
            return (
              <div key={file.id} className="p-2 bg-slate-800 rounded mb-1 animate-fadeIn">
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleRename(file.id)
                    if (e.key === 'Escape') setEditing(null)
                  }}
                  className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white text-sm focus:border-primary-500 focus:outline-none"
                  autoFocus
                />
              </div>
            )
          }
          
          return (
            <div
              key={file.id}
              onClick={() => onFileSelect(file)}
              className={`group flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-all mb-1 ${
                isActive
                  ? 'bg-primary-500/20 border border-primary-500 text-white'
                  : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <File className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 text-sm truncate">{file.name}</span>
              
              {/* Actions (visible on hover) */}
              <div className="hidden group-hover:flex items-center gap-1">
                <button
                  onClick={e => {
                    e.stopPropagation()
                    startEditing(file)
                  }}
                  className="p-1 text-slate-400 hover:text-primary-400 transition-colors"
                  title="Renommer"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation()
                    if (confirm(`Supprimer "${file.name}" ?`)) {
                      onFileDelete(file.id)
                    }
                  }}
                  className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          )
        })}
      </div>
      
      {/* Footer */}
      <div className="p-3 border-t border-slate-800 text-xs text-slate-500 flex-shrink-0">
        {files.length} fichier{files.length > 1 ? 's' : ''}
      </div>
    </div>
  )
}
