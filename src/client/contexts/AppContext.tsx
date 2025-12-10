import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export interface FileItem {
  id: string
  name: string
  content: string
  type: string
  lastModified?: number
}

export interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp?: number
}

interface AppContextType {
  // UI State
  darkMode: boolean
  setDarkMode: (value: boolean) => void
  
  // Files
  files: FileItem[]
  setFiles: (files: FileItem[] | ((prev: FileItem[]) => FileItem[])) => void
  activeFile: FileItem | null
  setActiveFile: (file: FileItem | null) => void
  
  // Chat
  messages: Message[]
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void
  
  // Agent
  activeAgent: string
  setActiveAgent: (agent: string) => void
  
  // User Memory (learning)
  userMemory: Record<string, any>
  setUserMemory: (memory: Record<string, any> | ((prev: Record<string, any>) => Record<string, any>)) => void
  
  // Generated Code
  generatedCode: string
  setGeneratedCode: (code: string) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  // UI State
  const [darkMode, setDarkMode] = useState(true)
  
  // Files - Initialize with one default file
  const [files, setFiles] = useState<FileItem[]>([
    {
      id: '1',
      name: 'index.html',
      content: '',
      type: 'html',
      lastModified: Date.now()
    }
  ])
  const [activeFile, setActiveFile] = useState<FileItem | null>(files[0])
  
  // Chat
  const [messages, setMessages] = useState<Message[]>([])
  
  // Agent
  const [activeAgent, setActiveAgent] = useState('design')
  
  // User Memory
  const [userMemory, setUserMemory] = useState<Record<string, any>>({})
  
  // Generated Code
  const [generatedCode, setGeneratedCode] = useState('')
  
  // Load user memory from localStorage on mount
  useEffect(() => {
    const savedMemory = localStorage.getItem('userMemory')
    if (savedMemory) {
      try {
        setUserMemory(JSON.parse(savedMemory))
      } catch (e) {
        console.error('Failed to parse user memory:', e)
      }
    }
  }, [])
  
  // Save user memory to localStorage when it changes
  useEffect(() => {
    if (Object.keys(userMemory).length > 0) {
      localStorage.setItem('userMemory', JSON.stringify(userMemory))
    }
  }, [userMemory])
  
  // Save files to localStorage
  useEffect(() => {
    if (files.length > 0) {
      localStorage.setItem('files', JSON.stringify(files))
    }
  }, [files])
  
  // Load files from localStorage on mount
  useEffect(() => {
    const savedFiles = localStorage.getItem('files')
    if (savedFiles) {
      try {
        const parsed = JSON.parse(savedFiles)
        if (parsed && parsed.length > 0) {
          setFiles(parsed)
          setActiveFile(parsed[0])
        }
      } catch (e) {
        console.error('Failed to parse files:', e)
      }
    }
  }, [])
  
  const value: AppContextType = {
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
  }
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider')
  }
  return context
}
