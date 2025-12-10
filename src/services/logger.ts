/**
 * Logger - Système de logging central pour suivre l'exécution des agents
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'debug'

export interface Log {
  id: string
  level: LogLevel
  message: string
  timestamp: number
  data?: any
  agentId?: string
  agentName?: string
  duration?: number
}

export class Logger {
  private static instance: Logger
  private logs: Log[] = []
  private listeners: ((log: Log) => void)[] = []

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  /**
   * Ajoute un listener qui sera appelé à chaque nouveau log
   */
  addListener(listener: (log: Log) => void) {
    this.listeners.push(listener)
  }

  /**
   * Retire un listener
   */
  removeListener(listener: (log: Log) => void) {
    this.listeners = this.listeners.filter(l => l !== listener)
  }

  /**
   * Log un message
   */
  log(level: LogLevel, message: string, data?: any) {
    const log: Log = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      level,
      message,
      timestamp: Date.now(),
      data
    }

    this.logs.push(log)
    
    // Notifier tous les listeners
    this.listeners.forEach(listener => listener(log))

    // Log aussi dans la console
    const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'
    console[consoleMethod](`[${level.toUpperCase()}] ${message}`, data)
  }

  /**
   * Log spécifique pour un agent
   */
  logAgent(agentId: string, agentName: string, message: string, data?: any, duration?: number) {
    const log: Log = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      level: 'info',
      message,
      timestamp: Date.now(),
      agentId,
      agentName,
      data,
      duration
    }

    this.logs.push(log)
    this.listeners.forEach(listener => listener(log))
    
    console.log(`[AGENT:${agentName}] ${message}`, data)
  }

  /**
   * Shortcuts
   */
  info(message: string, data?: any) {
    this.log('info', message, data)
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data)
  }

  error(message: string, data?: any) {
    this.log('error', message, data)
  }

  success(message: string, data?: any) {
    this.log('success', message, data)
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data)
  }

  /**
   * Récupère tous les logs
   */
  getLogs(): Log[] {
    return [...this.logs]
  }

  /**
   * Récupère les logs d'un agent spécifique
   */
  getAgentLogs(agentId: string): Log[] {
    return this.logs.filter(log => log.agentId === agentId)
  }

  /**
   * Efface tous les logs
   */
  clear() {
    this.logs = []
    this.info('Logs cleared')
  }

  /**
   * Exporte les logs en JSON
   */
  export(): string {
    return JSON.stringify(this.logs, null, 2)
  }
}

// Export singleton instance
export const logger = Logger.getInstance()
