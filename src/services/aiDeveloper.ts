/**
 * AI Developer - Cerveau principal du système
 * Orchestre l'analyse, la clarification et l'exécution des agents
 */

import { IntentAnalyzer, Requirements, UserIntent } from './intentAnalyzer'
import { ClarificationEngine } from './clarificationEngine'
import { AgentOrchestrator, AgentResult } from './agentOrchestrator'
import { logError, formatErrorMessage, ValidationError } from './errorHandler'
import { validateProject, generateValidationReport } from './codeValidator'
import { logger } from './logger'

export interface DeveloperResponse {
  type: 'clarification' | 'execution' | 'error';
  message: string;
  code?: string;
  requirements?: Requirements;
  agentResults?: AgentResult[];
  executionPlan?: string;
}

export class AIDeveloper {
  private intentAnalyzer: IntentAnalyzer;
  private clarificationEngine: ClarificationEngine;
  private agentOrchestrator: AgentOrchestrator;
  private conversationState: {
    awaitingClarification: boolean;
    currentIntent?: UserIntent;
    currentRequirements?: Requirements;
  };

  constructor() {
    this.intentAnalyzer = new IntentAnalyzer();
    this.clarificationEngine = new ClarificationEngine();
    this.agentOrchestrator = new AgentOrchestrator();
    this.conversationState = {
      awaitingClarification: false,
    };
  }

  /**
   * Point d'entrée principal - Traite la demande de l'utilisateur
   * 🔥 MODE HYBRIDE : Fast (1 appel) vs Advanced (6 agents)
   */
  async process(
    userPrompt: string,
    uploadedFiles?: Array<{ name: string; content: string; type: string }>
  ): Promise<DeveloperResponse> {
    try {
      // Validation
      if (!userPrompt || userPrompt.trim().length === 0) {
        throw new ValidationError('Le prompt ne peut pas être vide');
      }

      if (userPrompt.length > 10000) {
        throw new ValidationError('Le prompt est trop long (maximum 10000 caractères)');
      }

      // Étape 1: Analyser l'intention
      const { intent, requirements } = await this.intentAnalyzer.analyze(userPrompt, uploadedFiles);

      // Cas 1: L'utilisateur répond à une clarification
      if (this.conversationState.awaitingClarification) {
        return await this.handleClarificationResponse(userPrompt);
      }

      // Cas 2: Simple question (pas de code à générer)
      if (intent.type === 'question') {
        return {
          type: 'clarification',
          message: this.generateQuestionResponse(userPrompt),
        };
      }

      // 🔥 ROUTING HYBRIDE : Déterminer Fast vs Advanced
      const isSimple = this.isSimpleRequest(userPrompt, requirements);
      
      if (isSimple && intent.type === 'create_app') {
        // MODE FAST : Génération rapide (1 appel API)
        logger.info('⚡ MODE FAST activé pour:', userPrompt.substring(0, 50));
        return await this.fastGeneration(userPrompt, requirements);
      } else {
        // MODE ADVANCED : Multi-agents (existant)
        logger.info('🤖 MODE ADVANCED activé pour:', userPrompt.substring(0, 50));
        
        // Cas 3: Clarification nécessaire
        if (intent.needsClarification) {
          return this.requestClarification(intent, requirements);
        }

        // Cas 4: Exécution multi-agents
        return await this.executeGeneration(requirements);
      }

    } catch (error) {
      logError(error, 'AIDeveloper.process');
      return {
        type: 'error',
        message: formatErrorMessage(error),
      };
    }
  }

  /**
   * Demande des clarifications à l'utilisateur
   */
  private requestClarification(intent: UserIntent, requirements: Requirements): DeveloperResponse {
    const clarification = this.clarificationEngine.generateQuestions(intent, requirements);

    // Sauvegarder l'état
    this.conversationState = {
      awaitingClarification: true,
      currentIntent: intent,
      currentRequirements: requirements,
    };

    return {
      type: 'clarification',
      message: clarification.questions.join('\n\n'),
      requirements,
    };
  }

  /**
   * Traite la réponse de l'utilisateur à une clarification
   */
  private async handleClarificationResponse(userResponse: string): Promise<DeveloperResponse> {
    if (!this.conversationState.currentRequirements) {
      return {
        type: 'error',
        message: 'Erreur: État de clarification invalide',
      };
    }

    // Parser la réponse et mettre à jour les requirements
    const updatedRequirements = this.clarificationEngine.parseUserResponse(
      userResponse,
      this.conversationState.currentRequirements
    );

    // Réinitialiser l'état
    this.conversationState.awaitingClarification = false;

    // Exécuter la génération
    return await this.executeGeneration(updatedRequirements);
  }

  /**
   * Exécute la génération de l'application
   */
  private async executeGeneration(requirements: Requirements): Promise<DeveloperResponse> {
    // Créer le plan d'orchestration
    const plan = this.agentOrchestrator.createPlan(requirements);

    // Message de début
    const planMessage = this.generatePlanMessage(plan, requirements);

    // Exécuter les agents
    const agentResults = await this.agentOrchestrator.execute(plan, requirements);

    // Fusionner les résultats
    const generatedCode = this.agentOrchestrator.mergeResults(agentResults, requirements);

    // Valider le code généré
    const validationResult = validateProject(generatedCode);
    const validationReport = generateValidationReport(validationResult);

    // Générer le message de réponse
    const responseMessage = this.generateExecutionMessage(agentResults, requirements);

    // Ajouter le rapport de validation au message
    const finalMessage = planMessage + '\n\n' + responseMessage + '\n\n' + validationReport;

    return {
      type: 'execution',
      message: finalMessage,
      code: validationResult.sanitized || generatedCode,
      requirements,
      agentResults,
      executionPlan: planMessage,
    };
  }

  /**
   * Génère le message du plan d'exécution
   */
  private generatePlanMessage(plan: any, requirements: Requirements): string {
    const appType = requirements.appType || 'Application web';
    const stack = requirements.stack?.join(', ') || 'React, TypeScript, Tailwind CSS';

    let message = `✅ **Parfait ! Je vais créer votre ${appType}**\n\n`;

    message += `📦 **Stack technique :**\n`;
    message += `- ${stack}\n`;
    
    if (requirements.design) {
      message += `- Design : ${requirements.design}\n`;
    }

    if (requirements.features && requirements.features.length > 0) {
      message += `\n🎨 **Features incluses :**\n`;
      requirements.features.forEach(feature => {
        message += `- ${feature}\n`;
      });
    }

    message += `\n🤖 **Agents mobilisés (${plan.selectedAgents.length}) :**\n`;
    plan.selectedAgents.forEach((agent: any) => {
      message += `- ${agent.name} (${agent.role})\n`;
    });

    message += `\n⚡ **Mode d'exécution :** ${plan.executionMode === 'parallel' ? 'Parallèle (rapide)' : 'Séquentiel (précis)'}\n`;
    message += `⏱️ **Temps estimé :** ~${plan.estimatedTime}s\n`;

    message += `\n🚀 **Génération en cours...**`;

    return message;
  }

  /**
   * Génère le message après l'exécution
   */
  private generateExecutionMessage(agentResults: AgentResult[], requirements: Requirements): string {
    const successCount = agentResults.filter(r => r.success).length;
    const totalCount = agentResults.length;

    let message = `\n\n✅ **Génération terminée !**\n\n`;
    message += `📊 **Résumé :**\n`;
    message += `- ${successCount}/${totalCount} agents ont réussi\n`;

    const totalTime = agentResults.reduce((sum, r) => sum + r.executionTime, 0);
    message += `- Temps total : ${(totalTime / 1000).toFixed(2)}s\n`;

    message += `\n💻 **Code généré :**\n`;
    message += `- Structure complète de projet\n`;
    message += `- Composants React + TypeScript\n`;
    message += `- Styles Tailwind CSS\n`;
    message += `- Configuration Vite\n`;

    if (requirements.features && requirements.features.length > 0) {
      message += `\n✨ **Features implémentées :**\n`;
      requirements.features.forEach(feature => {
        message += `- ${feature}\n`;
      });
    }

    message += `\n📝 **Prochaines étapes :**\n`;
    message += `1. Consulter le code généré dans l'éditeur\n`;
    message += `2. Tester l'application dans la preview\n`;
    message += `3. Demander des modifications si nécessaire\n`;
    message += `4. Exporter ou déployer le projet\n`;

    return message;
  }

  /**
   * Génère une réponse à une simple question
   */
  private generateQuestionResponse(question: string): string {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('comment') || lowerQuestion.includes('aide')) {
      return `💡 **Aide - Comment utiliser CodeCraft Studio ?**

Je suis votre assistant développeur IA. Voici ce que je peux faire :

**Créer des applications :**
- "Crée une landing page moderne pour une startup SaaS"
- "Je veux un e-commerce avec paiement Stripe"
- "Génère un dashboard admin avec authentification"

**Fonctionnalités :**
- Upload de fichiers Word/Excel/PowerPoint pour générer des apps basées sur vos documents
- Génération intelligente avec multi-agents (Design, Code, Test, Doc, etc.)
- Preview live instantanée
- Export en ZIP ou déploiement direct

**Exemples de commandes :**
- "Crée une application [type] avec [features]"
- "Ajoute l'authentification Google"
- "Modifie le design en version minimale"
- "Génère 3 variations de cette page"

Que voulez-vous créer aujourd'hui ? 🚀`;
    }

    return `Je suis prêt à créer votre application ! Décrivez-moi ce que vous voulez, ou demandez de l'aide en tapant "aide" ou "comment ça marche".`;
  }

  /**
   * 🔥 MODE FAST : Génération rapide avec 1 seul appel API
   */
  private async fastGeneration(
    userPrompt: string,
    requirements: Requirements
  ): Promise<DeveloperResponse> {
    try {
      logger.info('⚡ [FAST MODE] Appel API direct pour génération rapide');

      // Appel direct à /api/generate
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          agent: 'design',
          conversation: []
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.code) {
        throw new Error('No code returned from API');
      }

      logger.info('⚡ [FAST MODE] Code généré avec succès:', data.code.length, 'chars');

      return {
        type: 'execution',
        message: data.message || '⚡ **Génération rapide terminée !**\n\nVotre application est prête dans le Preview.',
        code: data.code,
        requirements,
        executionPlan: '⚡ Mode Rapide (1 agent intelligent)',
      };

    } catch (error) {
      // 🔥 FALLBACK OPTION A : Retry en MODE ADVANCED
      logger.warn('⚠️ [FAST MODE] Échec, passage en MODE ADVANCED:', error);
      logger.info('🤖 [FALLBACK] Retry avec multi-agents...');
      
      // Retry avec le mode multi-agents
      return await this.executeGeneration(requirements);
    }
  }

  /**
   * 🔥 DÉTECTION : Simple vs Complex request
   */
  private isSimpleRequest(prompt: string, requirements: Requirements): boolean {
    const lowerPrompt = prompt.toLowerCase();

    // Mots-clés de complexité
    const complexKeywords = [
      'authentification', 'auth', 'connexion', 'login', 'signup', 'register',
      'paiement', 'payment', 'stripe', 'paypal', 'checkout',
      'base de données', 'database', 'db', 'backend', 'api', 'serveur',
      'temps réel', 'realtime', 'websocket', 'live',
      'admin', 'multi-page', 'plusieurs pages', 'complet', 'avancé',
      'professionnel', 'enterprise'
    ];

    // Cas spécial : e-commerce → toujours ADVANCED
    if (lowerPrompt.includes('e-commerce') || lowerPrompt.includes('ecommerce') || lowerPrompt.includes('boutique')) {
      logger.info('🔍 [DETECTION] E-commerce détecté → ADVANCED');
      return false;
    }

    // Vérification mots-clés complexes
    const hasComplexKeyword = complexKeywords.some(kw => lowerPrompt.includes(kw));
    if (hasComplexKeyword) {
      logger.info('🔍 [DETECTION] Mot-clé complexe détecté → ADVANCED');
      return false;
    }

    // Vérification nombre de features
    const featureCount = requirements.features?.length || 0;
    if (featureCount > 2) {
      logger.info('🔍 [DETECTION]', featureCount, 'features → ADVANCED');
      return false;
    }

    // Vérification auth/db
    if (requirements.authentication) {
      logger.info('🔍 [DETECTION] Authentication requise → ADVANCED');
      return false;
    }

    if (requirements.database) {
      logger.info('🔍 [DETECTION] Database requise → ADVANCED');
      return false;
    }

    // Vérification longueur prompt
    if (prompt.length > 200) {
      logger.info('🔍 [DETECTION] Prompt long (', prompt.length, 'chars) → ADVANCED');
      return false;
    }

    // Tous les critères passent → SIMPLE
    logger.info('🔍 [DETECTION] Requête simple détectée → FAST MODE');
    return true;
  }

  /**
   * Réinitialise l'état de la conversation
   */
  resetState(): void {
    this.conversationState = {
      awaitingClarification: false,
    }
  }
}
