/**
 * useWebContainer Hook
 * Gère le cycle de vie de WebContainer pour exécuter Node.js dans le navigateur
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import { WebContainer } from '@webcontainer/api'

export interface WebContainerStatus {
  phase: 'idle' | 'booting' | 'mounting' | 'installing' | 'starting' | 'ready' | 'error'
  message: string
  progress: number
  url?: string
  error?: string
}

export interface UseWebContainerResult {
  status: WebContainerStatus
  container: WebContainer | null
  startProject: (files: Record<string, any>, command?: string) => Promise<void>
  getLogs: () => string[]
  isSupported: boolean
}

/**
 * Hook pour gérer WebContainer
 */
export function useWebContainer(): UseWebContainerResult {
  const [status, setStatus] = useState<WebContainerStatus>({
    phase: 'idle',
    message: 'Prêt à démarrer',
    progress: 0
  })
  
  const [logs, setLogs] = useState<string[]>([])
  const containerRef = useRef<WebContainer | null>(null)
  const isBootingRef = useRef(false)

  // Vérifier support WebContainer (Chrome/Edge/Safari uniquement)
  const isSupported = typeof window !== 'undefined' && 'SharedArrayBuffer' in window

  /**
   * Ajouter un log
   */
  const addLog = useCallback((log: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${log}`])
  }, [])

  /**
   * Boot WebContainer instance
   */
  const bootContainer = useCallback(async (): Promise<WebContainer> => {
    if (containerRef.current) {
      return containerRef.current
    }

    if (isBootingRef.current) {
      // Attendre que le boot en cours se termine
      while (isBootingRef.current) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      if (containerRef.current) {
        return containerRef.current
      }
    }

    try {
      isBootingRef.current = true
      setStatus({ phase: 'booting', message: 'Démarrage de WebContainer...', progress: 10 })
      addLog('🚀 Démarrage de WebContainer...')

      const container = await WebContainer.boot()
      containerRef.current = container
      
      addLog('✅ WebContainer démarré avec succès')
      return container
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue'
      addLog(`❌ Erreur boot: ${errorMsg}`)
      throw error
    } finally {
      isBootingRef.current = false
    }
  }, [addLog])

  /**
   * Démarrer un projet dans WebContainer
   */
  const startProject = useCallback(async (
    files: Record<string, any>,
    command: string = 'npm run dev'
  ) => {
    try {
      setLogs([]) // Reset logs
      
      // 1. Boot container
      const container = await bootContainer()

      // 2. Mount files
      setStatus({ phase: 'mounting', message: 'Montage des fichiers...', progress: 30 })
      addLog('📁 Montage des fichiers du projet...')
      await container.mount(files)
      addLog(`✅ ${Object.keys(files).length} fichiers montés`)

      // 3. Install dependencies
      setStatus({ phase: 'installing', message: 'Installation des dépendances (npm install)...', progress: 50 })
      addLog('📦 Installation des dépendances...')
      
      const installProcess = await container.spawn('npm', ['install'])
      
      // Écouter stdout/stderr
      installProcess.output.pipeTo(new WritableStream({
        write(data) {
          const text = data.trim()
          if (text) addLog(`[npm install] ${text}`)
        }
      }))

      const installExitCode = await installProcess.exit
      if (installExitCode !== 0) {
        throw new Error(`npm install failed with exit code ${installExitCode}`)
      }
      
      addLog('✅ Dépendances installées')

      // 4. Start dev server
      setStatus({ phase: 'starting', message: `Démarrage du serveur (${command})...`, progress: 75 })
      addLog(`🚀 Démarrage: ${command}`)
      
      const devProcess = await container.spawn('npm', ['run', 'dev'])
      
      // Écouter stdout pour détecter quand le serveur est prêt
      devProcess.output.pipeTo(new WritableStream({
        write(data) {
          const text = data.trim()
          if (text) addLog(`[dev] ${text}`)
        }
      }))

      // Attendre que le serveur démarre (détection du port)
      await new Promise<void>((resolve) => {
        const checkServer = async () => {
          try {
            // Vite démarre généralement sur le port 5173
            container.on('server-ready', (port, url) => {
              addLog(`✅ Serveur prêt sur port ${port}: ${url}`)
              setStatus({
                phase: 'ready',
                message: 'Application démarrée !',
                progress: 100,
                url
              })
              resolve()
            })
          } catch (error) {
            // Retry
            setTimeout(checkServer, 500)
          }
        }
        
        // Commencer à vérifier après 2s (temps de démarrage Vite)
        setTimeout(checkServer, 2000)
        
        // Timeout après 30s
        setTimeout(() => {
          addLog('⚠️ Timeout: serveur ne répond pas après 30s')
          resolve()
        }, 30000)
      })

    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue'
      setStatus({
        phase: 'error',
        message: `Erreur: ${errorMsg}`,
        progress: 0,
        error: errorMsg
      })
      addLog(`❌ ERREUR: ${errorMsg}`)
    }
  }, [bootContainer, addLog])

  /**
   * Récupérer les logs
   */
  const getLogs = useCallback(() => logs, [logs])

  /**
   * Cleanup au démontage
   */
  useEffect(() => {
    return () => {
      if (containerRef.current) {
        // WebContainer n'a pas de méthode destroy, mais on peut nettoyer la référence
        containerRef.current = null
      }
    }
  }, [])

  return {
    status,
    container: containerRef.current,
    startProject,
    getLogs,
    isSupported
  }
}
