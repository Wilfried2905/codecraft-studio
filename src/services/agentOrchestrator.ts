/**
 * Agent Orchestrator - Orchestre l'exécution intelligente et parallèle des agents
 * Avec système de détection hybride de bugs et collaboration inter-agents
 * Version améliorée avec les 4 couches: Universal, Bug Handling, Specialty, Context
 */

import { Requirements } from './intentAnalyzer'
import { logger } from './logger'
import { bugDetector, BugReport } from './bugDetector'
import { agentCollaboration, CollaborationSession } from './agentCollaboration'
import { debugLogger } from './debugLogger'

export interface Agent {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  priority: number;
}

export interface AgentResult {
  agentId: string;
  agentName: string;
  output: string;
  executionTime: number;
  success: boolean;
  bugsDetected?: BugReport[]; // Nouveaux bugs détectés
  bugsFixed?: BugReport[]; // Bugs corrigés
  collaborationSessionId?: string; // ID de session collaborative si applicable
}

export interface OrchestrationPlan {
  selectedAgents: Agent[];
  executionMode: 'parallel' | 'sequential';
  estimatedTime: number;
  debugMode?: boolean; // Mode debug pour voir la collaboration
}

export class AgentOrchestrator {
  private agents: Agent[] = [
    // ========== AGENTS DE BASE ==========
    {
      id: 'architect',
      name: 'Architecte',
      role: 'Structure et architecture de l\'application',
      systemPrompt: 'architect', // Voir agentPrompts.ts pour le prompt complet
      priority: 1,
    },
    {
      id: 'designer',
      name: 'Designer UI/UX',
      role: 'Design, styles, animations, expérience utilisateur',
      systemPrompt: 'designer', // Voir agentPrompts.ts
      priority: 2,
    },
    {
      id: 'developer',
      name: 'Développeur',
      role: 'Code fonctionnel, logique métier, intégration API',
      systemPrompt: 'developer', // Voir agentPrompts.ts
      priority: 3,
    },
    {
      id: 'tester',
      name: 'Testeur QA',
      role: 'Tests, validation, edge cases',
      systemPrompt: 'tester', // Voir agentPrompts.ts
      priority: 4,
    },
    {
      id: 'documenter',
      name: 'Documenteur',
      role: 'Documentation technique, README, commentaires',
      systemPrompt: 'documenter', // Voir agentPrompts.ts
      priority: 5,
    },

    // ========== AGENTS CONTEXTUELS ==========
    {
      id: 'backend',
      name: 'Backend Developer',
      role: 'API, serveur, base de données',
      systemPrompt: 'backend', // Voir agentPrompts.ts
      priority: 3,
    },
    {
      id: 'security',
      name: 'Security Expert',
      role: 'Sécurité, authentification, protection',
      systemPrompt: 'security', // Voir agentPrompts.ts
      priority: 2,
    },
    {
      id: 'performance',
      name: 'Performance Engineer',
      role: 'Optimisation, performance, SEO',
      systemPrompt: 'performance', // Voir agentPrompts.ts
      priority: 4,
    },
    {
      id: 'devops',
      name: 'DevOps Engineer',
      role: 'Déploiement, CI/CD, monitoring',
      systemPrompt: 'devops', // Voir agentPrompts.ts (même si pas dans AGENT_SPECIALTIES, utilisera défaut)
      priority: 5,
    },
    {
      id: 'mobile',
      name: 'Mobile Developer',
      role: 'Responsive, PWA, mobile-first',
      systemPrompt: 'mobile', // Voir agentPrompts.ts
      priority: 3,
    },
    {
      id: 'seo',
      name: 'SEO Specialist',
      role: 'Référencement, meta tags, analytics',
      systemPrompt: 'seo', // Voir agentPrompts.ts
      priority: 4,
    },
    {
      id: 'accessibility',
      name: 'Accessibility Expert',
      role: 'Accessibilité, ARIA, navigation clavier',
      systemPrompt: 'accessibility', // Voir agentPrompts.ts
      priority: 4,
    },
  ];

  /**
   * Sélectionne les agents nécessaires selon les requirements
   */
  selectAgents(requirements: Requirements): Agent[] {
    const selectedAgents: Agent[] = [];

    // Agents de base (toujours activés)
    selectedAgents.push(
      this.getAgent('architect'),
      this.getAgent('designer'),
      this.getAgent('developer')
    );

    // Agents contextuels selon les features
    if (requirements.features?.includes('api') || requirements.database) {
      selectedAgents.push(this.getAgent('backend'));
    }

    if (requirements.authentication || requirements.features?.includes('auth')) {
      selectedAgents.push(this.getAgent('security'));
    }

    if (requirements.features?.includes('seo') || requirements.appType === 'landing-page') {
      selectedAgents.push(this.getAgent('seo'));
      selectedAgents.push(this.getAgent('performance'));
    }

    if (requirements.target === 'mobile' || requirements.features?.includes('responsive')) {
      selectedAgents.push(this.getAgent('mobile'));
    }

    if (requirements.features?.includes('payment') || requirements.appType === 'e-commerce') {
      selectedAgents.push(this.getAgent('security'));
      selectedAgents.push(this.getAgent('backend'));
    }

    // Toujours ajouter le testeur et le documenteur
    selectedAgents.push(
      this.getAgent('tester'),
      this.getAgent('documenter')
    );

    // Toujours ajouter l'accessibilité
    selectedAgents.push(this.getAgent('accessibility'));

    // Retirer les doublons et trier par priorité
    return Array.from(new Set(selectedAgents))
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Crée un plan d'orchestration
   */
  createPlan(requirements: Requirements): OrchestrationPlan {
    const selectedAgents = this.selectAgents(requirements);
    
    // Déterminer le mode d'exécution
    const executionMode: 'parallel' | 'sequential' = 
      requirements.complexity === 'complex' ? 'sequential' : 'parallel';

    // Estimer le temps
    const estimatedTime = executionMode === 'parallel' 
      ? 30 // 30 secondes en parallèle
      : selectedAgents.length * 10; // 10 secondes par agent en séquentiel

    return {
      selectedAgents,
      executionMode,
      estimatedTime,
    };
  }

  /**
   * Exécute les agents selon le plan (avec vraie API Anthropic)
   */
  async execute(
    plan: OrchestrationPlan,
    requirements: Requirements,
    apiUrl: string = '/api/generate'
  ): Promise<AgentResult[]> {
    const results: AgentResult[] = [];

    if (plan.executionMode === 'parallel') {
      // Exécution parallèle
      const promises = plan.selectedAgents.map(agent =>
        this.executeAgent(agent, requirements, apiUrl)
      );

      const executionResults = await Promise.allSettled(promises);

      executionResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            agentId: plan.selectedAgents[index].id,
            agentName: plan.selectedAgents[index].name,
            output: `Erreur: ${result.reason}`,
            executionTime: 0,
            success: false,
          });
        }
      });
    } else {
      // Exécution séquentielle
      logger.info('🔗 Exécution séquentielle des agents')
      for (const agent of plan.selectedAgents) {
        const result = await this.executeAgent(agent, requirements, apiUrl)
        results.push(result)
      }
    }

    const successCount = results.filter(r => r.success).length
    logger.success(`✅ Exécution terminée: ${successCount}/${results.length} agents réussis`, {
      results: results.map(r => ({
        agent: r.agentName,
        success: r.success,
        duration: r.executionTime
      }))
    })

    return results
  }

  /**
   * Exécute un agent individuel via l'API avec détection de bugs et collaboration
   */
  private async executeAgent(
    agent: Agent,
    requirements: Requirements,
    apiUrl: string
  ): Promise<AgentResult> {
    const startTime = Date.now()

    // Logger le démarrage
    debugLogger.logAgentExecution(agent.id, agent.name, 'start')
    logger.logAgent(agent.id, agent.name, `🔄 Démarrage de l'exécution...`)

    try {
      // Construire le prompt pour l'agent
      const prompt = this.buildPromptForAgent(agent, requirements)

      logger.logAgent(agent.id, agent.name, `📝 Prompt construit (${prompt.length} caractères)`)

      // Appel API
      logger.logAgent(agent.id, agent.name, `🌐 Appel API...`)
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          agentId: agent.id,
          agentName: agent.name,
          systemPrompt: agent.systemPrompt,
        }),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      const generatedCode = data.code || data.response || ''
      const executionTime = Date.now() - startTime

      // 🔍 DÉTECTION AUTOMATIQUE DE BUGS
      const bugDetectionResult = bugDetector.detectBugs(
        generatedCode,
        agent.id,
        agent.name
      )

      // Logger les bugs détectés
      bugDetectionResult.bugs.forEach(bug => {
        debugLogger.logBugDetection(agent.id, agent.name, bug, generatedCode.substring(0, 200))
      })

      // 🤝 COLLABORATION SI NÉCESSAIRE
      let collaborationSessionId: string | undefined
      let fixedCode = generatedCode

      if (bugDetectionResult.needsLeadAgent && bugDetectionResult.bugs.length > 0) {
        logger.warning(`🚨 [${agent.name}] Escalade vers Lead Agent pour ${bugDetectionResult.bugs.length} bug(s)`)

        // Démarrer une session de collaboration
        const session = agentCollaboration.startSession(
          bugDetectionResult.bugs[0], // Bug principal
          'lead', // Lead Agent
          [agent.id] // Agents impliqués
        )
        collaborationSessionId = session.id

        // Proposer des corrections automatiques pour les bugs auto-fixables
        const autoFixableBugs = bugDetectionResult.bugs.filter(b => b.autoFixable)
        if (autoFixableBugs.length > 0) {
          logger.info(`🔧 [${agent.name}] Auto-correction de ${autoFixableBugs.length} bug(s)...`)

          // Appliquer les corrections automatiques
          fixedCode = this.applyAutoFixes(generatedCode, autoFixableBugs)

          // Logger les corrections
          autoFixableBugs.forEach(bug => {
            agentCollaboration.proposePatch(
              session,
              agent.id,
              bug,
              generatedCode.substring(0, 200),
              fixedCode.substring(0, 200)
            )
          })

          // Résoudre la session
          agentCollaboration.resolveSession(
            session.id,
            'lead',
            `${autoFixableBugs.length} bug(s) auto-corrigé(s) par ${agent.name}`
          )
        }

        // Logger le résumé de la session
        debugLogger.logSessionSummary(session)
      }

      // Logger les performances
      debugLogger.logPerformance(`Exécution ${agent.name}`, executionTime, agent.id, agent.name)

      // Logger le succès
      debugLogger.logAgentExecution(agent.id, agent.name, 'success', {
        outputLength: fixedCode.length,
        bugsDetected: bugDetectionResult.bugs.length,
        bugsFixed: bugDetectionResult.bugs.filter(b => b.autoFixable).length,
      })

      logger.logAgent(
        agent.id,
        agent.name,
        `✅ Exécution réussie`,
        { 
          outputLength: fixedCode.length,
          bugsDetected: bugDetectionResult.bugs.length,
          bugsFixed: bugDetectionResult.bugs.filter(b => b.autoFixable).length,
        },
        executionTime
      )

      return {
        agentId: agent.id,
        agentName: agent.name,
        output: fixedCode,
        executionTime,
        success: true,
        bugsDetected: bugDetectionResult.bugs,
        bugsFixed: bugDetectionResult.bugs.filter(b => b.autoFixable),
        collaborationSessionId,
      }
    } catch (error) {
      const executionTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Logger l'erreur
      debugLogger.logAgentExecution(agent.id, agent.name, 'error', { error: errorMessage })
      
      logger.logAgent(
        agent.id,
        agent.name,
        `❌ Erreur: ${errorMessage}`,
        { error },
        executionTime
      )

      return {
        agentId: agent.id,
        agentName: agent.name,
        output: `Erreur: ${errorMessage}`,
        executionTime,
        success: false,
      }
    }
  }

  /**
   * Applique automatiquement les corrections pour les bugs auto-fixables
   */
  private applyAutoFixes(code: string, bugs: BugReport[]): string {
    let fixedCode = code

    bugs.forEach(bug => {
      if (!bug.autoFixable || !bug.suggestedFix) return

      // Correction selon le type de bug
      switch (bug.type) {
        case 'syntax':
          // Corriger les typos comme "Name=" -> "className="
          if (bug.description.includes('Name=')) {
            fixedCode = fixedCode.replace(/Name=/g, 'className=')
          }
          break

        case 'logic':
          // Ajouter les imports manquants
          if (bug.description.includes('useState') && !fixedCode.includes('import { useState }')) {
            fixedCode = `import { useState } from 'react'\n${fixedCode}`
          }
          break

        // Autres types de corrections...
      }
    })

    return fixedCode
  }

  /**
   * Construit le prompt pour un agent spécifique avec les 4 couches
   */
  private buildPromptForAgent(agent: Agent, requirements: Requirements): string {
    // Importer la fonction depuis agentPrompts.ts
    const { buildEnhancedPrompt } = require('./agentPrompts')

    // Construire le contexte du projet
    const projectContext = {
      appType: requirements.appType || 'Application web',
      stack: requirements.stack || ['React', 'TypeScript', 'Tailwind CSS'],
      design: requirements.design || 'moderne',
      features: requirements.features || [],
      database: requirements.database,
      authentication: requirements.authentication,
    }

    // Construire la demande utilisateur
    let userRequest = `Génère le code ${agent.role} pour cette application.\n\n`

    if (requirements.uploadedFiles && requirements.uploadedFiles.length > 0) {
      userRequest += `**Fichiers fournis par l'utilisateur :**\n`;
      requirements.uploadedFiles.forEach(file => {
        userRequest += `\n### ${file.name} (${file.type})\n`;
        userRequest += `${file.content.substring(0, 2000)}...\n`; // Limiter à 2000 caractères
      });
    }

    // Utiliser le système de prompts en 4 couches
    return buildEnhancedPrompt(
      agent.systemPrompt as any, // ID de l'agent
      agent.name,
      agent.role,
      userRequest,
      projectContext
    )
  }

  /**
   * Fusionne intelligemment les résultats de tous les agents
   */
  mergeResults(results: AgentResult[], requirements: Requirements): string {
    const successfulResults = results.filter(r => r.success);

    if (successfulResults.length === 0) {
      return '// Erreur: Aucun agent n\'a pu générer de code\n';
    }

    // Créer une structure de projet complète
    let mergedCode = `// ========================================\n`;
    mergedCode += `// ${requirements.appType?.toUpperCase() || 'APPLICATION'} - Généré par CodeCraft Studio\n`;
    mergedCode += `// Stack: ${requirements.stack?.join(', ') || 'React + TypeScript + Tailwind'}\n`;
    mergedCode += `// ========================================\n\n`;

    // Fusionner les outputs par agent
    successfulResults.forEach(result => {
      mergedCode += `\n// ========== ${result.agentName.toUpperCase()} ==========\n`;
      mergedCode += `// Temps d'exécution: ${result.executionTime}ms\n\n`;
      mergedCode += result.output;
      mergedCode += `\n\n`;
    });

    return mergedCode;
  }

  /**
   * Récupère un agent par son ID
   */
  private getAgent(id: string): Agent {
    const agent = this.agents.find(a => a.id === id);
    if (!agent) {
      throw new Error(`Agent '${id}' not found`);
    }
    return agent;
  }

  /**
   * Récupère tous les agents disponibles
   */
  getAllAgents(): Agent[] {
    return this.agents;
  }
}
