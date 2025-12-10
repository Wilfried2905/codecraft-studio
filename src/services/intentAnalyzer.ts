/**
 * Intent Analyzer - Détecte l'intention et les besoins de l'utilisateur
 */

export interface UserIntent {
  type: 'create_app' | 'modify_app' | 'question' | 'clarification_needed';
  confidence: number;
  detectedFeatures: string[];
  detectedStack: string[];
  complexity: 'simple' | 'medium' | 'complex';
  needsClarification: boolean;
  clarificationQuestions: string[];
}

export interface Requirements {
  appType?: string; // 'e-commerce', 'landing-page', 'dashboard', 'portfolio', etc.
  stack?: string[]; // ['React', 'TypeScript', 'Tailwind']
  features?: string[]; // ['auth', 'payment', 'crud', 'realtime']
  design?: string; // 'minimal', 'modern', 'corporate'
  target?: string; // 'web', 'mobile', 'both'
  database?: boolean;
  authentication?: boolean;
  uploadedFiles?: Array<{ name: string; content: string; type: string }>;
}

export class IntentAnalyzer {
  /**
   * Analyse le prompt utilisateur et détecte l'intention
   */
  async analyze(userPrompt: string, uploadedFiles?: Array<{ name: string; content: string; type: string }>): Promise<{
    intent: UserIntent;
    requirements: Requirements;
  }> {
    const normalizedPrompt = userPrompt.toLowerCase();

    // Détecter le type d'intention
    const intent = this.detectIntent(normalizedPrompt);

    // Extraire les requirements
    const requirements = this.extractRequirements(normalizedPrompt, uploadedFiles);

    // Évaluer si clarification nécessaire
    const clarification = this.evaluateClarificationNeeds(intent, requirements);

    return {
      intent: {
        ...intent,
        needsClarification: clarification.needed,
        clarificationQuestions: clarification.questions,
      },
      requirements,
    };
  }

  /**
   * Détecte le type d'intention principale
   */
  private detectIntent(prompt: string): UserIntent {
    const createKeywords = ['créer', 'faire', 'générer', 'construire', 'développer', 'app', 'site', 'application'];
    const modifyKeywords = ['modifier', 'changer', 'améliorer', 'ajouter', 'supprimer', 'corriger'];
    const questionKeywords = ['comment', 'pourquoi', 'qu\'est-ce', 'est-ce que', 'peux-tu', '?'];

    let type: UserIntent['type'] = 'question';
    let confidence = 0;

    // Détecter "créer une application"
    if (createKeywords.some(kw => prompt.includes(kw))) {
      type = 'create_app';
      confidence = 0.8;
    }

    // Détecter "modifier"
    if (modifyKeywords.some(kw => prompt.includes(kw))) {
      type = 'modify_app';
      confidence = 0.7;
    }

    // Détecter une simple question
    if (questionKeywords.some(kw => prompt.includes(kw)) && !createKeywords.some(kw => prompt.includes(kw))) {
      type = 'question';
      confidence = 0.6;
    }

    return {
      type,
      confidence,
      detectedFeatures: this.detectFeatures(prompt),
      detectedStack: this.detectStack(prompt),
      complexity: this.detectComplexity(prompt),
      needsClarification: false,
      clarificationQuestions: [],
    };
  }

  /**
   * Extrait les requirements techniques du prompt
   */
  private extractRequirements(prompt: string, uploadedFiles?: Array<{ name: string; content: string; type: string }>): Requirements {
    const requirements: Requirements = {};

    // Détecter le type d'application
    if (prompt.includes('e-commerce') || prompt.includes('boutique') || prompt.includes('shop')) {
      requirements.appType = 'e-commerce';
    } else if (prompt.includes('landing') || prompt.includes('page d\'accueil')) {
      requirements.appType = 'landing-page';
    } else if (prompt.includes('dashboard') || prompt.includes('tableau de bord')) {
      requirements.appType = 'dashboard';
    } else if (prompt.includes('portfolio')) {
      requirements.appType = 'portfolio';
    } else if (prompt.includes('blog')) {
      requirements.appType = 'blog';
    } else if (prompt.includes('crm') || prompt.includes('gestion')) {
      requirements.appType = 'crm';
    }

    // Détecter les features
    requirements.features = this.detectFeatures(prompt);

    // Détecter le stack technique
    requirements.stack = this.detectStack(prompt);

    // Détecter le design
    if (prompt.includes('minimal')) {
      requirements.design = 'minimal';
    } else if (prompt.includes('moderne') || prompt.includes('animé')) {
      requirements.design = 'modern';
    } else if (prompt.includes('corporate') || prompt.includes('professionnel')) {
      requirements.design = 'corporate';
    }

    // Détecter database
    requirements.database = prompt.includes('base de données') || prompt.includes('database') || prompt.includes('db');

    // Détecter authentication
    requirements.authentication = prompt.includes('auth') || prompt.includes('connexion') || prompt.includes('login') || prompt.includes('utilisateur');

    // Ajouter les fichiers uploadés
    if (uploadedFiles && uploadedFiles.length > 0) {
      requirements.uploadedFiles = uploadedFiles;
    }

    return requirements;
  }

  /**
   * Détecte les features demandées
   */
  private detectFeatures(prompt: string): string[] {
    const features: string[] = [];

    const featureMap: Record<string, string[]> = {
      auth: ['authentification', 'connexion', 'login', 'inscription', 'register'],
      payment: ['paiement', 'payment', 'stripe', 'paypal', 'checkout'],
      crud: ['crud', 'créer', 'modifier', 'supprimer', 'gestion'],
      realtime: ['temps réel', 'realtime', 'live', 'instantané'],
      search: ['recherche', 'search', 'filtre', 'filter'],
      upload: ['upload', 'télécharger', 'fichier', 'image'],
      api: ['api', 'backend', 'serveur'],
      responsive: ['responsive', 'mobile', 'tablette', 'adaptatif'],
      seo: ['seo', 'référencement', 'meta'],
      analytics: ['analytics', 'statistiques', 'tracking'],
    };

    for (const [feature, keywords] of Object.entries(featureMap)) {
      if (keywords.some(kw => prompt.includes(kw))) {
        features.push(feature);
      }
    }

    return features;
  }

  /**
   * Détecte le stack technique
   */
  private detectStack(prompt: string): string[] {
    const stack: string[] = ['React', 'TypeScript', 'Tailwind CSS']; // Stack par défaut

    if (prompt.includes('vue')) stack.push('Vue.js');
    if (prompt.includes('angular')) stack.push('Angular');
    if (prompt.includes('svelte')) stack.push('Svelte');
    if (prompt.includes('node')) stack.push('Node.js');
    if (prompt.includes('express')) stack.push('Express');
    if (prompt.includes('next')) stack.push('Next.js');
    if (prompt.includes('supabase')) stack.push('Supabase');
    if (prompt.includes('firebase')) stack.push('Firebase');

    return stack;
  }

  /**
   * Détecte la complexité de la demande
   */
  private detectComplexity(prompt: string): 'simple' | 'medium' | 'complex' {
    const features = this.detectFeatures(prompt);

    if (features.length <= 2) return 'simple';
    if (features.length <= 5) return 'medium';
    return 'complex';
  }

  /**
   * Évalue si des clarifications sont nécessaires
   */
  private evaluateClarificationNeeds(intent: UserIntent, requirements: Requirements): {
    needed: boolean;
    questions: string[];
  } {
    const questions: string[] = [];

    // Si pas de type d'app détecté
    if (!requirements.appType && intent.type === 'create_app') {
      questions.push("Quel type d'application voulez-vous créer ? (e-commerce, landing page, dashboard, portfolio, blog, CRM)");
    }

    // Si payment détecté mais pas de provider
    if (requirements.features?.includes('payment')) {
      questions.push("Quel système de paiement préférez-vous ? (Stripe, PayPal, ou les deux)");
    }

    // Si database mais pas de précision
    if (requirements.database && !requirements.stack?.some(s => s.includes('Supabase') || s.includes('Firebase'))) {
      questions.push("Voulez-vous utiliser Supabase, Firebase, ou une autre base de données ?");
    }

    // Si pas de design spécifié
    if (!requirements.design && intent.type === 'create_app') {
      questions.push("Quel style de design préférez-vous ? (minimal, moderne/animé, corporate/professionnel)");
    }

    return {
      needed: questions.length > 0,
      questions,
    };
  }
}
