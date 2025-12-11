/**
 * Bug Detector - Détection automatique des bugs par agent avec escalade vers Lead Agent
 * Stratégie : Option C - Hybride (chaque agent détecte dans son domaine + Lead Agent supervise)
 */

import { logger } from './logger'

export interface BugReport {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  type: 'syntax' | 'logic' | 'security' | 'performance' | 'ui' | 'accessibility'
  detectedBy: string // Agent ID
  location: {
    file?: string
    line?: number
    component?: string
  }
  description: string
  suggestedFix?: string
  autoFixable: boolean
  timestamp: number
}

export interface BugDetectionResult {
  bugs: BugReport[]
  needsLeadAgent: boolean // Si true, escalade vers Lead Agent
  confidence: number // 0-100
}

export class BugDetector {
  private bugHistory: BugReport[] = []

  /**
   * Détecte les bugs dans le code selon le domaine de l'agent
   */
  detectBugs(
    code: string,
    agentId: string,
    agentName: string,
    context?: any
  ): BugDetectionResult {
    const bugs: BugReport[] = []
    let needsLeadAgent = false

    logger.info(`🔍 [${agentName}] Détection de bugs dans son domaine...`)

    // Détection selon le domaine de l'agent
    switch (agentId) {
      case 'architect':
        bugs.push(...this.detectArchitectureBugs(code))
        break
      case 'designer':
        bugs.push(...this.detectUIBugs(code))
        break
      case 'developer':
        bugs.push(...this.detectLogicBugs(code))
        break
      case 'security':
        bugs.push(...this.detectSecurityBugs(code))
        break
      case 'performance':
        bugs.push(...this.detectPerformanceBugs(code))
        break
      case 'tester':
        bugs.push(...this.detectTestingBugs(code))
        break
      case 'accessibility':
        bugs.push(...this.detectAccessibilityBugs(code))
        break
      default:
        bugs.push(...this.detectGenericBugs(code))
    }

    // Marquer chaque bug avec l'agent détecteur
    bugs.forEach(bug => {
      bug.detectedBy = agentId
      bug.timestamp = Date.now()
      bug.id = `${agentId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    })

    // Déterminer si on a besoin du Lead Agent
    const criticalBugs = bugs.filter(b => b.severity === 'critical' || b.severity === 'high')
    needsLeadAgent = criticalBugs.length > 0 || bugs.length > 3

    // Calculer la confiance
    const confidence = this.calculateConfidence(bugs, code)

    // Logger les résultats
    if (bugs.length > 0) {
      logger.warning(`⚠️ [${agentName}] ${bugs.length} bug(s) détecté(s)`, {
        critical: bugs.filter(b => b.severity === 'critical').length,
        high: bugs.filter(b => b.severity === 'high').length,
        medium: bugs.filter(b => b.severity === 'medium').length,
        low: bugs.filter(b => b.severity === 'low').length,
      })

      if (needsLeadAgent) {
        logger.warning(`🚨 [${agentName}] Escalade vers Lead Agent nécessaire !`)
      }
    } else {
      logger.success(`✅ [${agentName}] Aucun bug détecté dans son domaine`)
    }

    // Ajouter à l'historique
    this.bugHistory.push(...bugs)

    return {
      bugs,
      needsLeadAgent,
      confidence,
    }
  }

  /**
   * Détection de bugs d'architecture
   */
  private detectArchitectureBugs(code: string): BugReport[] {
    const bugs: BugReport[] = []

    // Détection de problèmes de structure
    if (code.includes('import React from') && !code.includes('export')) {
      bugs.push({
        id: '',
        severity: 'medium',
        type: 'logic',
        detectedBy: '',
        location: {},
        description: 'Composant importé mais non exporté',
        suggestedFix: 'Ajouter export default ou export const',
        autoFixable: true,
        timestamp: 0,
      })
    }

    // Détection de dépendances circulaires
    if (code.match(/import.*from ['"]\.\.\/.*['"]/g)?.length > 5) {
      bugs.push({
        id: '',
        severity: 'high',
        type: 'logic',
        detectedBy: '',
        location: {},
        description: 'Possibles dépendances circulaires détectées',
        suggestedFix: 'Réorganiser la structure des dossiers',
        autoFixable: false,
        timestamp: 0,
      })
    }

    return bugs
  }

  /**
   * Détection de bugs UI/UX
   */
  private detectUIBugs(code: string): BugReport[] {
    const bugs: BugReport[] = []

    // Détection de classes Tailwind invalides
    if (code.includes('className=') && code.includes('Name=')) {
      bugs.push({
        id: '',
        severity: 'critical',
        type: 'syntax',
        detectedBy: '',
        location: {},
        description: 'Typo: "Name=" au lieu de "className="',
        suggestedFix: 'Remplacer "Name=" par "className="',
        autoFixable: true,
        timestamp: 0,
      })
    }

    // Détection de contraste insuffisant (exemple simplifié)
    if (code.includes('text-gray-400') && code.includes('bg-gray-300')) {
      bugs.push({
        id: '',
        severity: 'medium',
        type: 'ui',
        detectedBy: '',
        location: {},
        description: 'Contraste de couleurs potentiellement insuffisant',
        suggestedFix: 'Utiliser text-gray-900 sur bg-gray-300',
        autoFixable: true,
        timestamp: 0,
      })
    }

    return bugs
  }

  /**
   * Détection de bugs de logique
   */
  private detectLogicBugs(code: string): BugReport[] {
    const bugs: BugReport[] = []

    // Détection de variables non définies
    const undefinedVarMatches = code.matchAll(/isOpen=\{(\w+)\}/g)
    for (const match of undefinedVarMatches) {
      const varName = match[1]
      if (!code.includes(`const [${varName}`) && !code.includes(`let ${varName}`)) {
        bugs.push({
          id: '',
          severity: 'critical',
          type: 'logic',
          detectedBy: '',
          location: {},
          description: `Variable "${varName}" non définie`,
          suggestedFix: `Ajouter: const [${varName}, set${varName.charAt(0).toUpperCase() + varName.slice(1)}] = useState(false)`,
          autoFixable: true,
          timestamp: 0,
        })
      }
    }

    // Détection de hooks React mal utilisés
    if (code.includes('useState') && !code.includes('import { useState }')) {
      bugs.push({
        id: '',
        severity: 'critical',
        type: 'logic',
        detectedBy: '',
        location: {},
        description: 'useState utilisé mais non importé',
        suggestedFix: "Ajouter: import { useState } from 'react'",
        autoFixable: true,
        timestamp: 0,
      })
    }

    return bugs
  }

  /**
   * Détection de bugs de sécurité
   */
  private detectSecurityBugs(code: string): BugReport[] {
    const bugs: BugReport[] = []

    // Détection de clés API exposées
    if (code.match(/api[_-]?key\s*=\s*['"][a-zA-Z0-9]{20,}['"]/i)) {
      bugs.push({
        id: '',
        severity: 'critical',
        type: 'security',
        detectedBy: '',
        location: {},
        description: 'Clé API potentiellement exposée dans le code',
        suggestedFix: 'Utiliser des variables d\'environnement (.env)',
        autoFixable: false,
        timestamp: 0,
      })
    }

    // Détection de dangerouslySetInnerHTML
    if (code.includes('dangerouslySetInnerHTML')) {
      bugs.push({
        id: '',
        severity: 'high',
        type: 'security',
        detectedBy: '',
        location: {},
        description: 'Utilisation de dangerouslySetInnerHTML (risque XSS)',
        suggestedFix: 'Utiliser DOMPurify pour sanitizer le HTML',
        autoFixable: false,
        timestamp: 0,
      })
    }

    return bugs
  }

  /**
   * Détection de bugs de performance
   */
  private detectPerformanceBugs(code: string): BugReport[] {
    const bugs: BugReport[] = []

    // Détection de re-renders inutiles
    if (code.includes('useEffect(() => {') && !code.includes('}, [')) {
      bugs.push({
        id: '',
        severity: 'medium',
        type: 'performance',
        detectedBy: '',
        location: {},
        description: 'useEffect sans tableau de dépendances (peut causer des re-renders)',
        suggestedFix: 'Ajouter un tableau de dépendances à useEffect',
        autoFixable: false,
        timestamp: 0,
      })
    }

    // Détection d'imports lourds
    if (code.includes('import * as') || code.includes('import lodash')) {
      bugs.push({
        id: '',
        severity: 'low',
        type: 'performance',
        detectedBy: '',
        location: {},
        description: 'Import complet détecté (augmente bundle size)',
        suggestedFix: 'Utiliser des imports nommés: import { fonction } from "lib"',
        autoFixable: true,
        timestamp: 0,
      })
    }

    return bugs
  }

  /**
   * Détection de bugs de tests
   */
  private detectTestingBugs(code: string): BugReport[] {
    const bugs: BugReport[] = []

    // Détection de composants sans tests
    if (code.includes('export default') && !code.includes('test(') && !code.includes('it(')) {
      bugs.push({
        id: '',
        severity: 'low',
        type: 'logic',
        detectedBy: '',
        location: {},
        description: 'Composant sans tests unitaires',
        suggestedFix: 'Créer un fichier de test .test.tsx',
        autoFixable: false,
        timestamp: 0,
      })
    }

    return bugs
  }

  /**
   * Détection de bugs d'accessibilité
   */
  private detectAccessibilityBugs(code: string): BugReport[] {
    const bugs: BugReport[] = []

    // Détection d'images sans alt
    if (code.includes('<img') && !code.includes('alt=')) {
      bugs.push({
        id: '',
        severity: 'high',
        type: 'accessibility',
        detectedBy: '',
        location: {},
        description: 'Image sans attribut alt (accessibilité)',
        suggestedFix: 'Ajouter alt="Description de l\'image"',
        autoFixable: true,
        timestamp: 0,
      })
    }

    // Détection de boutons sans label
    if (code.includes('<button') && !code.includes('aria-label')) {
      const hasChildren = code.match(/<button[^>]*>([^<]+)<\/button>/)
      if (!hasChildren) {
        bugs.push({
          id: '',
          severity: 'medium',
          type: 'accessibility',
          detectedBy: '',
          location: {},
          description: 'Bouton sans label textuel ou aria-label',
          suggestedFix: 'Ajouter aria-label ou du texte visible',
          autoFixable: true,
          timestamp: 0,
        })
      }
    }

    return bugs
  }

  /**
   * Détection générique de bugs
   */
  private detectGenericBugs(code: string): BugReport[] {
    const bugs: BugReport[] = []

    // Détection de console.log (à supprimer en production)
    if (code.includes('console.log') || code.includes('console.error')) {
      bugs.push({
        id: '',
        severity: 'low',
        type: 'logic',
        detectedBy: '',
        location: {},
        description: 'console.log détecté (à supprimer en production)',
        suggestedFix: 'Utiliser un logger ou supprimer',
        autoFixable: true,
        timestamp: 0,
      })
    }

    // Détection de code commenté
    if (code.match(/\/\/.{50,}/g)?.length > 3) {
      bugs.push({
        id: '',
        severity: 'low',
        type: 'logic',
        detectedBy: '',
        location: {},
        description: 'Beaucoup de code commenté détecté',
        suggestedFix: 'Nettoyer le code commenté',
        autoFixable: true,
        timestamp: 0,
      })
    }

    return bugs
  }

  /**
   * Calcule la confiance de la détection
   */
  private calculateConfidence(bugs: BugReport[], code: string): number {
    if (bugs.length === 0) return 100

    let confidence = 90

    // Réduire la confiance si beaucoup de bugs détectés (peut être faux positif)
    if (bugs.length > 10) confidence -= 20
    else if (bugs.length > 5) confidence -= 10

    // Augmenter la confiance si des bugs critiques sont détectés
    const criticalCount = bugs.filter(b => b.severity === 'critical').length
    if (criticalCount > 0) confidence = Math.min(100, confidence + criticalCount * 5)

    // Réduire si code très court (peut manquer de contexte)
    if (code.length < 100) confidence -= 15

    return Math.max(0, Math.min(100, confidence))
  }

  /**
   * Récupère l'historique des bugs
   */
  getBugHistory(): BugReport[] {
    return this.bugHistory
  }

  /**
   * Nettoie l'historique
   */
  clearHistory(): void {
    this.bugHistory = []
  }

  /**
   * Récupère les statistiques
   */
  getStatistics() {
    return {
      total: this.bugHistory.length,
      bySeverity: {
        critical: this.bugHistory.filter(b => b.severity === 'critical').length,
        high: this.bugHistory.filter(b => b.severity === 'high').length,
        medium: this.bugHistory.filter(b => b.severity === 'medium').length,
        low: this.bugHistory.filter(b => b.severity === 'low').length,
      },
      byType: {
        syntax: this.bugHistory.filter(b => b.type === 'syntax').length,
        logic: this.bugHistory.filter(b => b.type === 'logic').length,
        security: this.bugHistory.filter(b => b.type === 'security').length,
        performance: this.bugHistory.filter(b => b.type === 'performance').length,
        ui: this.bugHistory.filter(b => b.type === 'ui').length,
        accessibility: this.bugHistory.filter(b => b.type === 'accessibility').length,
      },
      autoFixable: this.bugHistory.filter(b => b.autoFixable).length,
    }
  }
}

// Instance singleton
export const bugDetector = new BugDetector()
