/**
 * Debug Logger - Logger intelligent pour la collaboration multi-agents
 * Stratégie : Option C - Mode Debug optionnel (transparent ou caché selon préférence utilisateur)
 */

import { BugReport } from './bugDetector'
import { CollaborationMessage, CollaborationSession } from './agentCollaboration'

export interface DebugLog {
  id: string
  timestamp: number
  level: 'info' | 'warning' | 'error' | 'success' | 'debug'
  category: 'bug-detection' | 'collaboration' | 'execution' | 'performance' | 'system'
  message: string
  data?: any
  agentId?: string
  agentName?: string
}

export interface DebugConfig {
  enabled: boolean
  showAgentCommunication: boolean
  showBugDetection: boolean
  showPerformanceMetrics: boolean
  verbosity: 'minimal' | 'normal' | 'verbose'
}

export class DebugLogger {
  private logs: DebugLog[] = []
  private config: DebugConfig = {
    enabled: false, // Par défaut désactivé (utilisateur ne voit que le résultat final)
    showAgentCommunication: true,
    showBugDetection: true,
    showPerformanceMetrics: true,
    verbosity: 'normal',
  }

  private maxLogs = 1000 // Limite pour éviter surcharge mémoire

  /**
   * Configure le mode Debug
   */
  configure(config: Partial<DebugConfig>): void {
    this.config = { ...this.config, ...config }
    this.log('system', 'info', `Mode Debug ${config.enabled ? 'activé' : 'désactivé'}`, config)
  }

  /**
   * Obtient la configuration actuelle
   */
  getConfig(): DebugConfig {
    return { ...this.config }
  }

  /**
   * Active le mode Debug
   */
  enable(): void {
    this.config.enabled = true
    this.log('system', 'success', '✅ Mode Debug activé')
  }

  /**
   * Désactive le mode Debug
   */
  disable(): void {
    this.config.enabled = false
    this.log('system', 'info', '🔇 Mode Debug désactivé')
  }

  /**
   * Vérifie si le mode Debug est activé
   */
  isEnabled(): boolean {
    return this.config.enabled
  }

  /**
   * Log un message générique
   */
  private log(
    category: DebugLog['category'],
    level: DebugLog['level'],
    message: string,
    data?: any,
    agentId?: string,
    agentName?: string
  ): void {
    // Si Debug désactivé et level !== 'error', on ne log pas
    if (!this.config.enabled && level !== 'error') {
      return
    }

    const log: DebugLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level,
      category,
      message,
      data,
      agentId,
      agentName,
    }

    this.logs.push(log)

    // Limiter la taille du log
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // Console output si Debug activé
    if (this.config.enabled) {
      this.consoleOutput(log)
    }
  }

  /**
   * Affichage console selon le niveau
   */
  private consoleOutput(log: DebugLog): void {
    const prefix = log.agentName ? `[${log.agentName}]` : '[System]'
    const timestamp = new Date(log.timestamp).toLocaleTimeString()
    const fullMessage = `${timestamp} ${prefix} ${log.message}`

    switch (log.level) {
      case 'info':
        console.log(`ℹ️ ${fullMessage}`, log.data || '')
        break
      case 'warning':
        console.warn(`⚠️ ${fullMessage}`, log.data || '')
        break
      case 'error':
        console.error(`❌ ${fullMessage}`, log.data || '')
        break
      case 'success':
        console.log(`✅ ${fullMessage}`, log.data || '')
        break
      case 'debug':
        console.debug(`🐛 ${fullMessage}`, log.data || '')
        break
    }
  }

  /**
   * Log la détection d'un bug
   */
  logBugDetection(
    agentId: string,
    agentName: string,
    bug: BugReport,
    codeSnippet?: string
  ): void {
    if (!this.config.showBugDetection) return

    this.log(
      'bug-detection',
      bug.severity === 'critical' || bug.severity === 'high' ? 'warning' : 'info',
      `🔍 Bug détecté: ${bug.description}`,
      {
        bugId: bug.id,
        severity: bug.severity,
        type: bug.type,
        autoFixable: bug.autoFixable,
        suggestedFix: bug.suggestedFix,
        codeSnippet,
      },
      agentId,
      agentName
    )
  }

  /**
   * Log un message de collaboration entre agents
   */
  logCollaboration(message: CollaborationMessage): void {
    if (!this.config.showAgentCommunication) return

    const icon = this.getMessageTypeIcon(message.type)
    const fromAgent = message.from
    const toAgent = message.to

    this.log(
      'collaboration',
      message.priority === 'critical' ? 'warning' : 'info',
      `${icon} ${fromAgent} → ${toAgent}: ${message.content}`,
      {
        messageId: message.id,
        type: message.type,
        priority: message.priority,
        relatedBug: message.relatedBug?.id,
        code: message.code ? 'Patch proposé' : undefined,
      },
      message.from
    )
  }

  /**
   * Log le résumé d'une session de collaboration
   */
  logSessionSummary(session: CollaborationSession): void {
    if (!this.config.showAgentCommunication) return

    const duration = session.endTime
      ? ((session.endTime - session.startTime) / 1000).toFixed(2)
      : 'En cours'

    this.log(
      'collaboration',
      session.resolved ? 'success' : 'info',
      `📊 Session ${session.resolved ? 'résolue' : 'en cours'}`,
      {
        sessionId: session.id,
        participants: session.participants,
        messagesCount: session.messages.length,
        duration: `${duration}s`,
        resolved: session.resolved,
        finalDecision: session.finalDecision,
      }
    )
  }

  /**
   * Log une métrique de performance
   */
  logPerformance(
    operation: string,
    duration: number,
    agentId?: string,
    agentName?: string
  ): void {
    if (!this.config.showPerformanceMetrics) return

    const level = duration > 5000 ? 'warning' : 'info'

    this.log(
      'performance',
      level,
      `⏱️ ${operation}: ${duration}ms`,
      { duration, operation },
      agentId,
      agentName
    )
  }

  /**
   * Log l'exécution d'un agent
   */
  logAgentExecution(
    agentId: string,
    agentName: string,
    status: 'start' | 'success' | 'error',
    details?: any
  ): void {
    const messages = {
      start: `🚀 Démarrage de l'exécution...`,
      success: `✅ Exécution réussie`,
      error: `❌ Erreur lors de l'exécution`,
    }

    this.log(
      'execution',
      status === 'error' ? 'error' : status === 'success' ? 'success' : 'info',
      messages[status],
      details,
      agentId,
      agentName
    )
  }

  /**
   * Obtient l'icône pour un type de message
   */
  private getMessageTypeIcon(type: CollaborationMessage['type']): string {
    switch (type) {
      case 'discussion':
        return '💬'
      case 'patch':
        return '🔧'
      case 'validation':
        return '✅'
      case 'escalation':
        return '🚨'
      default:
        return '📝'
    }
  }

  /**
   * Récupère tous les logs
   */
  getLogs(filters?: {
    level?: DebugLog['level']
    category?: DebugLog['category']
    agentId?: string
    limit?: number
  }): DebugLog[] {
    let filtered = [...this.logs]

    if (filters?.level) {
      filtered = filtered.filter(log => log.level === filters.level)
    }

    if (filters?.category) {
      filtered = filtered.filter(log => log.category === filters.category)
    }

    if (filters?.agentId) {
      filtered = filtered.filter(log => log.agentId === filters.agentId)
    }

    if (filters?.limit) {
      filtered = filtered.slice(-filters.limit)
    }

    return filtered
  }

  /**
   * Formate les logs pour affichage utilisateur
   */
  formatLogsForDisplay(verbosity?: 'minimal' | 'normal' | 'verbose'): string {
    const level = verbosity || this.config.verbosity
    let output = ''

    const relevantLogs = this.logs.filter(log => {
      if (level === 'minimal') {
        return log.level === 'error' || log.level === 'warning'
      } else if (level === 'normal') {
        return log.level !== 'debug'
      }
      return true // verbose: tout afficher
    })

    relevantLogs.forEach(log => {
      const time = new Date(log.timestamp).toLocaleTimeString()
      const icon = this.getLevelIcon(log.level)
      const agent = log.agentName ? `[${log.agentName}]` : '[System]'

      output += `${time} ${icon} ${agent} ${log.message}\n`

      if (level === 'verbose' && log.data) {
        output += `   └─ ${JSON.stringify(log.data, null, 2)}\n`
      }
    })

    return output
  }

  /**
   * Obtient l'icône pour un niveau de log
   */
  private getLevelIcon(level: DebugLog['level']): string {
    switch (level) {
      case 'info':
        return 'ℹ️'
      case 'warning':
        return '⚠️'
      case 'error':
        return '❌'
      case 'success':
        return '✅'
      case 'debug':
        return '🐛'
    }
  }

  /**
   * Exporte les logs au format JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  /**
   * Obtient des statistiques sur les logs
   */
  getStatistics() {
    return {
      total: this.logs.length,
      byLevel: {
        info: this.logs.filter(l => l.level === 'info').length,
        warning: this.logs.filter(l => l.level === 'warning').length,
        error: this.logs.filter(l => l.level === 'error').length,
        success: this.logs.filter(l => l.level === 'success').length,
        debug: this.logs.filter(l => l.level === 'debug').length,
      },
      byCategory: {
        'bug-detection': this.logs.filter(l => l.category === 'bug-detection').length,
        collaboration: this.logs.filter(l => l.category === 'collaboration').length,
        execution: this.logs.filter(l => l.category === 'execution').length,
        performance: this.logs.filter(l => l.category === 'performance').length,
        system: this.logs.filter(l => l.category === 'system').length,
      },
    }
  }

  /**
   * Nettoie les logs
   */
  clear(): void {
    const count = this.logs.length
    this.logs = []
    this.log('system', 'info', `🧹 ${count} log(s) nettoyé(s)`)
  }
}

// Instance singleton
export const debugLogger = new DebugLogger()
