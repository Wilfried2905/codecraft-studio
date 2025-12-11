/**
 * Agent Collaboration - Gestion de la communication intelligente entre agents
 * Stratégie : Option C - Hybride intelligent (patches directs + discussion textuelle)
 */

import { BugReport } from './bugDetector'
import { logger } from './logger'

export interface CollaborationMessage {
  id: string
  from: string // Agent ID
  to: string | 'all' | 'lead' // Agent ID ou 'all' pour broadcast
  type: 'discussion' | 'patch' | 'validation' | 'escalation'
  content: string
  timestamp: number
  priority: 'low' | 'medium' | 'high' | 'critical'
  relatedBug?: BugReport
  code?: {
    before: string
    after: string
    file?: string
    line?: number
  }
}

export interface CollaborationSession {
  id: string
  participants: string[] // Agent IDs
  messages: CollaborationMessage[]
  startTime: number
  endTime?: number
  resolved: boolean
  finalDecision?: string
}

export class AgentCollaboration {
  private sessions: Map<string, CollaborationSession> = new Map()
  private messageHistory: CollaborationMessage[] = []

  /**
   * Démarre une session de collaboration pour résoudre un bug
   */
  startSession(
    bugReport: BugReport,
    leadAgentId: string,
    relevantAgents: string[]
  ): CollaborationSession {
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const session: CollaborationSession = {
      id: sessionId,
      participants: [leadAgentId, ...relevantAgents],
      messages: [],
      startTime: Date.now(),
      resolved: false,
    }

    this.sessions.set(sessionId, session)

    logger.info(`🤝 Session de collaboration démarrée: ${sessionId}`, {
      bug: bugReport.description,
      participants: session.participants.length,
    })

    // Message initial du Lead Agent
    this.sendMessage(session, {
      from: leadAgentId,
      to: 'all',
      type: 'discussion',
      content: `🚨 Bug critique détecté par ${bugReport.detectedBy}: "${bugReport.description}". Besoin de collaboration pour résoudre.`,
      priority: bugReport.severity,
      relatedBug: bugReport,
    })

    return session
  }

  /**
   * Envoie un message dans une session
   */
  sendMessage(
    session: CollaborationSession,
    message: Omit<CollaborationMessage, 'id' | 'timestamp'>
  ): CollaborationMessage {
    const fullMessage: CollaborationMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    }

    session.messages.push(fullMessage)
    this.messageHistory.push(fullMessage)

    // Logger selon le type de message
    switch (message.type) {
      case 'discussion':
        logger.info(`💬 [${message.from}] → [${message.to}]: ${message.content}`)
        break
      case 'patch':
        logger.info(`🔧 [${message.from}] propose un patch pour corriger le bug`)
        break
      case 'validation':
        logger.success(`✅ [${message.from}] valide la correction`)
        break
      case 'escalation':
        logger.warning(`⚠️ [${message.from}] escalade vers ${message.to}`)
        break
    }

    return fullMessage
  }

  /**
   * Propose une correction (patch) pour un bug
   */
  proposePatch(
    session: CollaborationSession,
    agentId: string,
    bugReport: BugReport,
    beforeCode: string,
    afterCode: string,
    file?: string,
    line?: number
  ): CollaborationMessage {
    return this.sendMessage(session, {
      from: agentId,
      to: 'lead',
      type: 'patch',
      content: `Proposition de correction pour: ${bugReport.description}`,
      priority: bugReport.severity,
      relatedBug: bugReport,
      code: {
        before: beforeCode,
        after: afterCode,
        file,
        line,
      },
    })
  }

  /**
   * Valide une correction proposée
   */
  validatePatch(
    session: CollaborationSession,
    validatorAgentId: string,
    patchMessage: CollaborationMessage,
    approved: boolean,
    reason?: string
  ): CollaborationMessage {
    const content = approved
      ? `✅ Patch validé: ${reason || 'Correction appropriée'}`
      : `❌ Patch rejeté: ${reason || 'Correction insuffisante'}`

    return this.sendMessage(session, {
      from: validatorAgentId,
      to: patchMessage.from,
      type: 'validation',
      content,
      priority: patchMessage.priority,
      relatedBug: patchMessage.relatedBug,
    })
  }

  /**
   * Détermine le meilleur format de communication selon le type de bug
   */
  determineCommunicationFormat(bugReport: BugReport): 'patch' | 'discussion' {
    // Bugs simples auto-fixables → patch direct
    if (bugReport.autoFixable && bugReport.suggestedFix) {
      logger.info(`📦 Bug simple détecté → Patch direct`)
      return 'patch'
    }

    // Bugs complexes ou critiques → discussion
    if (
      bugReport.severity === 'critical' ||
      bugReport.severity === 'high' ||
      !bugReport.suggestedFix
    ) {
      logger.info(`💬 Bug complexe détecté → Discussion nécessaire`)
      return 'discussion'
    }

    // Par défaut : discussion
    return 'discussion'
  }

  /**
   * Résout une session de collaboration
   */
  resolveSession(
    sessionId: string,
    leadAgentId: string,
    finalDecision: string
  ): CollaborationSession {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    session.resolved = true
    session.endTime = Date.now()
    session.finalDecision = finalDecision

    const duration = ((session.endTime - session.startTime) / 1000).toFixed(2)

    logger.success(`✅ Session résolue en ${duration}s`, {
      session: sessionId,
      messages: session.messages.length,
      decision: finalDecision,
    })

    // Message final du Lead Agent
    this.sendMessage(session, {
      from: leadAgentId,
      to: 'all',
      type: 'discussion',
      content: `🎯 Décision finale: ${finalDecision}`,
      priority: 'high',
    })

    return session
  }

  /**
   * Escalade un problème vers un agent spécialisé
   */
  escalate(
    session: CollaborationSession,
    fromAgentId: string,
    toAgentId: string,
    reason: string,
    bugReport: BugReport
  ): CollaborationMessage {
    logger.warning(`🚨 Escalade: ${fromAgentId} → ${toAgentId}`)

    // Ajouter l'agent à la session si pas déjà présent
    if (!session.participants.includes(toAgentId)) {
      session.participants.push(toAgentId)
    }

    return this.sendMessage(session, {
      from: fromAgentId,
      to: toAgentId,
      type: 'escalation',
      content: `Escalade nécessaire: ${reason}`,
      priority: 'critical',
      relatedBug: bugReport,
    })
  }

  /**
   * Génère un résumé de la collaboration pour l'utilisateur
   */
  generateSummary(sessionId: string): string {
    const session = this.sessions.get(sessionId)
    if (!session) {
      return 'Session non trouvée'
    }

    let summary = `📊 **Résumé de la collaboration**\n\n`
    summary += `**Session ID**: ${session.id}\n`
    summary += `**Participants**: ${session.participants.join(', ')}\n`
    summary += `**Durée**: ${((session.endTime || Date.now()) - session.startTime) / 1000}s\n`
    summary += `**Messages échangés**: ${session.messages.length}\n`
    summary += `**Statut**: ${session.resolved ? '✅ Résolu' : '🔄 En cours'}\n\n`

    if (session.finalDecision) {
      summary += `**Décision finale**: ${session.finalDecision}\n\n`
    }

    summary += `**Historique des échanges**:\n`
    session.messages.forEach((msg, index) => {
      const time = new Date(msg.timestamp).toLocaleTimeString()
      const icon = this.getMessageIcon(msg.type)
      summary += `${index + 1}. [${time}] ${icon} **${msg.from}** → ${msg.to}: ${msg.content}\n`
    })

    return summary
  }

  /**
   * Obtient l'icône appropriée pour un type de message
   */
  private getMessageIcon(type: CollaborationMessage['type']): string {
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
   * Récupère une session
   */
  getSession(sessionId: string): CollaborationSession | undefined {
    return this.sessions.get(sessionId)
  }

  /**
   * Récupère toutes les sessions actives
   */
  getActiveSessions(): CollaborationSession[] {
    return Array.from(this.sessions.values()).filter(s => !s.resolved)
  }

  /**
   * Récupère l'historique complet des messages
   */
  getMessageHistory(): CollaborationMessage[] {
    return this.messageHistory
  }

  /**
   * Statistiques de collaboration
   */
  getStatistics() {
    const allSessions = Array.from(this.sessions.values())

    return {
      totalSessions: allSessions.length,
      resolvedSessions: allSessions.filter(s => s.resolved).length,
      activeSessions: allSessions.filter(s => !s.resolved).length,
      totalMessages: this.messageHistory.length,
      averageMessagesPerSession:
        this.messageHistory.length / Math.max(1, allSessions.length),
      averageResolutionTime:
        allSessions
          .filter(s => s.resolved && s.endTime)
          .reduce((sum, s) => sum + (s.endTime! - s.startTime), 0) /
        Math.max(1, allSessions.filter(s => s.resolved).length) /
        1000, // en secondes
      messagesByType: {
        discussion: this.messageHistory.filter(m => m.type === 'discussion').length,
        patch: this.messageHistory.filter(m => m.type === 'patch').length,
        validation: this.messageHistory.filter(m => m.type === 'validation').length,
        escalation: this.messageHistory.filter(m => m.type === 'escalation').length,
      },
    }
  }

  /**
   * Nettoie les anciennes sessions
   */
  cleanup(maxAge: number = 3600000): void {
    const now = Date.now()
    const deletedSessions: string[] = []

    this.sessions.forEach((session, sessionId) => {
      if (session.resolved && session.endTime && now - session.endTime > maxAge) {
        this.sessions.delete(sessionId)
        deletedSessions.push(sessionId)
      }
    })

    if (deletedSessions.length > 0) {
      logger.info(`🧹 ${deletedSessions.length} session(s) nettoyée(s)`)
    }
  }
}

// Instance singleton
export const agentCollaboration = new AgentCollaboration()
