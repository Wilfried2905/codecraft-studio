/**
 * Agent Orchestrator - Orchestre l'exécution intelligente et parallèle des agents
 */

import { Requirements } from './intentAnalyzer'
import { logger } from './logger'

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
}

export interface OrchestrationPlan {
  selectedAgents: Agent[];
  executionMode: 'parallel' | 'sequential';
  estimatedTime: number;
}

export class AgentOrchestrator {
  private agents: Agent[] = [
    // ========== AGENTS DE BASE ==========
    {
      id: 'architect',
      name: 'Architecte',
      role: 'Structure et architecture de l\'application',
      systemPrompt: `Tu es un architecte logiciel expert. Ton rôle est de concevoir la structure complète de l'application : 
- Architecture des dossiers et fichiers
- Choix des dépendances et packages
- Structure des composants React
- Gestion de l'état (Context, hooks)
- Routing et navigation
- Configuration (tsconfig, vite.config, etc.)

Génère une structure de projet claire, scalable et maintenable.`,
      priority: 1,
    },
    {
      id: 'designer',
      name: 'Designer UI/UX',
      role: 'Design, styles, animations, expérience utilisateur',
      systemPrompt: `Tu es un designer UI/UX expert. Ton rôle est de créer une interface moderne et intuitive :
- Design system (couleurs, typographie, espacements)
- Composants UI réutilisables
- Animations et transitions fluides
- Responsive design (mobile, tablet, desktop)
- Accessibilité (ARIA, contraste, navigation clavier)

Utilise Tailwind CSS et crée des interfaces élégantes et performantes.`,
      priority: 2,
    },
    {
      id: 'developer',
      name: 'Développeur',
      role: 'Code fonctionnel, logique métier, intégration API',
      systemPrompt: `Tu es un développeur fullstack expert React/TypeScript. Ton rôle est d'implémenter :
- Composants React fonctionnels avec TypeScript
- Hooks personnalisés (useState, useEffect, useContext)
- Logique métier et gestion de l'état
- Intégration d'API externes
- Gestion des erreurs et validations
- Performance et optimisations

Génère du code propre, typé, commenté et production-ready.`,
      priority: 3,
    },
    {
      id: 'tester',
      name: 'Testeur QA',
      role: 'Tests, validation, edge cases',
      systemPrompt: `Tu es un testeur QA expert. Ton rôle est de garantir la qualité :
- Tests unitaires (Vitest, React Testing Library)
- Tests d'intégration
- Edge cases et scénarios d'erreur
- Validation des inputs
- Tests de performance
- Accessibilité (a11y)

Génère des tests complets et des validations robustes.`,
      priority: 4,
    },
    {
      id: 'documenter',
      name: 'Documenteur',
      role: 'Documentation technique, README, commentaires',
      systemPrompt: `Tu es un expert en documentation technique. Ton rôle est de documenter :
- README.md complet avec exemples
- Commentaires de code clairs
- Documentation des API
- Guide d'installation et déploiement
- Exemples d'utilisation
- Troubleshooting et FAQ

Génère une documentation claire, concise et utile.`,
      priority: 5,
    },

    // ========== AGENTS CONTEXTUELS ==========
    {
      id: 'backend',
      name: 'Backend Developer',
      role: 'API, serveur, base de données',
      systemPrompt: `Tu es un développeur backend expert. Ton rôle est de créer :
- API REST avec Hono (Cloudflare Workers)
- Routes et middlewares
- Intégration base de données (Supabase, D1)
- Authentification et sécurité
- Gestion des sessions et tokens
- Rate limiting et caching

Génère des API sécurisées, performantes et scalables.`,
      priority: 3,
    },
    {
      id: 'security',
      name: 'Security Expert',
      role: 'Sécurité, authentification, protection',
      systemPrompt: `Tu es un expert en sécurité web. Ton rôle est de sécuriser :
- Authentification (JWT, OAuth, sessions)
- Protection CSRF, XSS, injection SQL
- Validation et sanitization des inputs
- CORS et headers de sécurité
- Gestion des secrets et API keys
- Rate limiting et protection DDoS

Génère un code sécurisé selon les meilleures pratiques OWASP.`,
      priority: 2,
    },
    {
      id: 'performance',
      name: 'Performance Engineer',
      role: 'Optimisation, performance, SEO',
      systemPrompt: `Tu es un expert en performance web. Ton rôle est d'optimiser :
- Lazy loading et code splitting
- Image optimization (formats modernes, responsive)
- Caching stratégies
- Bundle size optimization
- Core Web Vitals (LCP, FID, CLS)
- SEO (meta tags, sitemap, robots.txt)

Génère une application ultra-rapide et SEO-friendly.`,
      priority: 4,
    },
    {
      id: 'devops',
      name: 'DevOps Engineer',
      role: 'Déploiement, CI/CD, monitoring',
      systemPrompt: `Tu es un expert DevOps. Ton rôle est de configurer :
- Déploiement Cloudflare Pages / Workers
- CI/CD avec GitHub Actions
- Environment variables et secrets
- Monitoring et logging
- Backup et disaster recovery
- Scaling et auto-healing

Génère une infrastructure cloud robuste et automatisée.`,
      priority: 5,
    },
    {
      id: 'mobile',
      name: 'Mobile Developer',
      role: 'Responsive, PWA, mobile-first',
      systemPrompt: `Tu es un expert en développement mobile. Ton rôle est de créer :
- Design responsive (mobile-first)
- PWA (Progressive Web App) avec service workers
- Touch gestures et interactions mobiles
- Performance mobile (3G, 4G)
- Offline mode et caching
- App-like experience (splash screen, icons)

Génère une expérience mobile native-like.`,
      priority: 3,
    },
    {
      id: 'seo',
      name: 'SEO Specialist',
      role: 'Référencement, meta tags, analytics',
      systemPrompt: `Tu es un expert SEO. Ton rôle est d'optimiser :
- Meta tags (title, description, OG, Twitter)
- Structured data (JSON-LD)
- Sitemap.xml et robots.txt
- Performance (Core Web Vitals)
- Analytics (Google Analytics, Plausible)
- Accessibility pour SEO

Génère une application parfaitement référencée.`,
      priority: 4,
    },
    {
      id: 'accessibility',
      name: 'Accessibility Expert',
      role: 'Accessibilité, ARIA, navigation clavier',
      systemPrompt: `Tu es un expert en accessibilité (a11y). Ton rôle est d'assurer :
- ARIA labels et roles
- Navigation clavier complète
- Screen reader compatibility
- Contraste de couleurs (WCAG AAA)
- Focus management
- Alternative text et descriptions

Génère une application accessible à tous (WCAG 2.1 AAA).`,
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
   * Exécute un agent individuel via l'API
   */
  private async executeAgent(
    agent: Agent,
    requirements: Requirements,
    apiUrl: string
  ): Promise<AgentResult> {
    const startTime = Date.now()

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
      const executionTime = Date.now() - startTime

      logger.logAgent(
        agent.id,
        agent.name,
        `✅ Exécution réussie`,
        { outputLength: (data.code || data.response || '').length },
        executionTime
      )

      return {
        agentId: agent.id,
        agentName: agent.name,
        output: data.code || data.response || '',
        executionTime,
        success: true,
      }
    } catch (error) {
      const executionTime = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
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
   * Construit le prompt pour un agent spécifique
   */
  private buildPromptForAgent(agent: Agent, requirements: Requirements): string {
    let prompt = `Tu es ${agent.name}. ${agent.role}\n\n`;

    prompt += `**Contexte du projet :**\n`;
    prompt += `- Type d'application : ${requirements.appType || 'Application web'}\n`;
    prompt += `- Stack technique : ${requirements.stack?.join(', ') || 'React, TypeScript, Tailwind CSS'}\n`;
    prompt += `- Design : ${requirements.design || 'modern'}\n`;
    
    if (requirements.features && requirements.features.length > 0) {
      prompt += `- Features : ${requirements.features.join(', ')}\n`;
    }

    if (requirements.database) {
      prompt += `- Base de données : Oui\n`;
    }

    if (requirements.authentication) {
      prompt += `- Authentification : Oui\n`;
    }

    if (requirements.uploadedFiles && requirements.uploadedFiles.length > 0) {
      prompt += `\n**Fichiers fournis par l'utilisateur :**\n`;
      requirements.uploadedFiles.forEach(file => {
        prompt += `\n### ${file.name} (${file.type})\n`;
        prompt += `${file.content.substring(0, 2000)}...\n`; // Limiter à 2000 caractères
      });
    }

    prompt += `\n**Ta mission :**\n`;
    prompt += `Génère le code ${agent.role} pour cette application. Sois précis, professionnel et production-ready.\n`;

    return prompt;
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
