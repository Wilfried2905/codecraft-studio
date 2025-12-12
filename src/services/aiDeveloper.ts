/**
 * AI Developer - Version Simplifiée "Claude Code"
 * 🎯 Architecture ultra-simple : 1 appel API direct, comme Claude Code
 * ✅ Fonctionne à l'identique de Claude dans Genspark
 */

import { logError, formatErrorMessage, ValidationError } from './errorHandler'
import { logger } from './logger'

export interface DeveloperResponse {
  type: 'clarification' | 'execution' | 'error';
  message: string;
  code?: string;
  executionPlan?: string;
}

export class AIDeveloper {
  /**
   * Point d'entrée principal - Ultra simplifié comme Claude Code
   * 🔥 1 SEUL APPEL API : Prompt → Claude → Code
   */
  async process(
    userPrompt: string,
    uploadedFiles?: Array<{ name: string; content: string; type: string }>
  ): Promise<DeveloperResponse> {
    try {
      // Validation basique
      if (!userPrompt || userPrompt.trim().length === 0) {
        throw new ValidationError('Le prompt ne peut pas être vide');
      }

      if (userPrompt.length > 10000) {
        throw new ValidationError('Le prompt est trop long (maximum 10000 caractères)');
      }

      // 🎯 DÉTECTION SIMPLE : Question ou Génération ?
      const isQuestion = this.isSimpleQuestion(userPrompt);
      
      if (isQuestion) {
        return {
          type: 'clarification',
          message: this.generateQuestionResponse(userPrompt),
        };
      }

      // 🚀 GÉNÉRATION DIRECTE (comme Claude Code)
      logger.info('🚀 Génération directe avec Claude (mode simplifié)');
      return await this.generateDirect(userPrompt, uploadedFiles);

    } catch (error) {
      logError(error, 'AIDeveloper.process');
      return {
        type: 'error',
        message: formatErrorMessage(error),
      };
    }
  }

  /**
   * 🚀 Génération directe - 1 seul appel API (comme Claude Code)
   */
  private async generateDirect(
    userPrompt: string,
    uploadedFiles?: Array<{ name: string; content: string; type: string }>
  ): Promise<DeveloperResponse> {
    try {
      logger.info('⚡ [CLAUDE MODE] Appel API direct');

      // 🔥 1 SEUL APPEL à /api/generate
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

      // Gérer Type 1 (code) et Type 2 (files)
      if (!data.code && !data.files) {
        throw new Error('No code or files returned from API');
      }

      if (data.projectType === 'multi-files' && data.files) {
        // TYPE 2 : Multi-fichiers
        logger.info('✅ [CLAUDE MODE] Type 2 détecté:', data.files.length, 'fichiers');
        
        return {
          type: 'execution',
          message: data.message || `📦 Projet "${data.projectName}" créé avec ${data.files.length} fichiers`,
          projectType: 'multi-files',
          projectName: data.projectName,
          files: data.files,
          mainFile: data.mainFile,
          setupInstructions: data.setupInstructions,
          executionPlan: '⚡ Génération directe avec Claude',
        };
      } else {
        // TYPE 1 : HTML simple
        logger.info('✅ [CLAUDE MODE] Type 1 détecté:', data.code.length, 'chars');
        
        return {
          type: 'execution',
          message: data.message || '✅ **Application générée avec succès !**\n\nVotre application est prête dans le Preview.',
          code: data.code,
          executionPlan: '⚡ Génération directe avec Claude',
        };
      }

    } catch (error) {
      logError(error, 'AIDeveloper.generateDirect');
      
      // Fallback : Message d'erreur clair
      return {
        type: 'error',
        message: '❌ Erreur lors de la génération. Veuillez réessayer ou reformuler votre demande.',
      };
    }
  }

  /**
   * 🔍 Détection ultra-simple : Question ou Génération ?
   */
  private isSimpleQuestion(prompt: string): boolean {
    const lowerPrompt = prompt.toLowerCase();
    
    // Mots-clés de création
    const createKeywords = [
      'créer', 'crée', 'créé', 'cree', 'faire', 'fais', 'fait',
      'générer', 'génère', 'construire', 'développer', 'développe',
      'app', 'application', 'site', 'page', 'dashboard', 'todo',
      'formulaire', 'form', 'landing', 'portfolio', 'blog'
    ];
    
    // Si au moins 1 mot de création → PAS une question
    const hasCreateIntent = createKeywords.some(kw => lowerPrompt.includes(kw));
    
    if (hasCreateIntent) {
      return false; // C'est une demande de création
    }
    
    // Sinon, c'est probablement une question
    const questionKeywords = ['comment', 'pourquoi', 'qu\'est-ce', 'aide', 'help'];
    return questionKeywords.some(kw => lowerPrompt.includes(kw));
  }

  /**
   * 💬 Réponse aux questions simples
   */
  private generateQuestionResponse(question: string): string {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('comment') || lowerQuestion.includes('aide')) {
      return `💡 **Aide - Comment utiliser CodeCraft Studio ?**

Je suis votre assistant développeur IA. Voici ce que je peux faire :

**Créer des applications :**
- "Crée une landing page moderne"
- "Je veux un dashboard e-commerce"
- "Génère une todo list avec React"

**Exemples de commandes :**
- "Crée une application [type] avec [features]"
- "Landing page minimale"
- "Dashboard avec graphiques"
- "Formulaire de contact"

**Que voulez-vous créer aujourd'hui ? 🚀**`;
    }

    return `Je suis prêt à créer votre application ! Décrivez-moi ce que vous voulez, ou demandez de l'aide en tapant "aide" ou "comment ça marche".`;
  }

  /**
   * Réinitialise l'état (compatibilité)
   */
  resetState(): void {
    // Pas d'état à réinitialiser dans la version simplifiée
    logger.info('🔄 État réinitialisé');
  }
}
