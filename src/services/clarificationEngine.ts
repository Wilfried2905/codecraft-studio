/**
 * Clarification Engine V2 - Utilise des DÉFAUTS INTELLIGENTS au lieu de poser trop de questions
 * 
 * PHILOSOPHIE (Système Multi-Agents V2) :
 * - L'utilisateur a toujours raison
 * - Si la demande est claire → agir IMMÉDIATEMENT avec défauts intelligents
 * - Questions UNIQUEMENT pour choix architecturaux CRITIQUES
 * - Jamais plus de 1 question à la fois
 * - Défauts : Tailwind, React 19, TypeScript, Responsive, Moderne
 */

import { Requirements, UserIntent } from './intentAnalyzer';

export interface ClarificationResponse {
  needsClarification: boolean;
  questions: string[];
  suggestedDefaults?: Record<string, any>;
}

export class ClarificationEngine {
  /**
   * Génère UNE SEULE question si vraiment critique, sinon utilise défauts intelligents
   */
  generateQuestions(intent: UserIntent, requirements: Requirements): ClarificationResponse {
    const questions: string[] = [];
    const suggestedDefaults: Record<string, any> = {
      // DÉFAUTS INTELLIGENTS APPLIQUÉS AUTOMATIQUEMENT
      design: 'modern', // Moderne par défaut
      responsive: true, // Toujours responsive
      stack: ['React 19', 'TypeScript', 'Tailwind CSS', 'Hono.js'],
      backend: 'serverless', // Cloudflare Workers par défaut
    };

    // ========================================
    // NOUVELLE STRATÉGIE V2 : DÉFAUTS INTELLIGENTS
    // ========================================
    
    // Appliquer les défauts automatiquement
    if (!requirements.appType && intent.type === 'create_app') {
      suggestedDefaults.appType = 'web-app'; // Défaut générique
    }

    if (!requirements.design) {
      suggestedDefaults.design = 'modern'; // Moderne avec animations
    }

    // E-commerce : défauts intelligents
    if (requirements.appType === 'e-commerce') {
      if (!requirements.features?.includes('payment')) {
        suggestedDefaults.payment = 'stripe'; // Stripe par défaut
      }
      if (!requirements.database) {
        suggestedDefaults.database = true; // DB requise pour e-commerce
      }
    }

    // Authentification : défaut OAuth + Email
    if (requirements.features?.includes('auth') || requirements.authentication) {
      suggestedDefaults.authType = 'both'; // Email + OAuth
    }

    // Responsive : TOUJOURS activé
    suggestedDefaults.responsive = true;

    // Backend : Serverless par défaut
    if (requirements.features?.includes('api') || requirements.features?.includes('crud')) {
      suggestedDefaults.backend = 'serverless';
    }

    // ========================================
    // QUESTIONS UNIQUEMENT SI CRITIQUE
    // ========================================
    
    // Question UNIQUEMENT pour choix d'authentification si ambiguïté critique
    // (Exemple : si l'utilisateur mentionne "sécurisé" mais pas le type d'auth)
    const hasCriticalAmbiguity = 
      (requirements.authentication && !requirements.authType) ||
      (requirements.appType === 'e-commerce' && !requirements.features?.includes('payment'));

    if (hasCriticalAmbiguity && requirements.authentication) {
      questions.push("🔐 **Une question rapide** : Authentification Email/Password, OAuth (Google/GitHub), ou les deux ?");
    }

    // Si AUCUNE question critique
    if (questions.length === 0) {
      return {
        needsClarification: false,
        questions: [],
        suggestedDefaults,
      };
    }

    // Si question critique (MAX 1), message court
    const intro = `✨ **Parfait !** Je vais créer votre application avec les meilleurs défauts (React 19, TypeScript, Tailwind, responsive).\n\n`;
    const outro = `\n\n💡 **Ou répondez simplement "par défaut" et je décide pour vous !**`;

    return {
      needsClarification: true,
      questions: [intro + questions[0] + outro], // MAX 1 question
      suggestedDefaults,
    };
  }

  /**
   * Parse la réponse de l'utilisateur (V2 : Défauts intelligents automatiques)
   */
  parseUserResponse(userResponse: string, previousRequirements: Requirements): Requirements {
    const normalized = userResponse.toLowerCase();
    const updatedRequirements = { ...previousRequirements };

    // DÉFAUTS INTELLIGENTS TOUJOURS APPLIQUÉS
    const defaults = {
      appType: updatedRequirements.appType || 'web-app',
      design: updatedRequirements.design || 'modern',
      stack: updatedRequirements.stack || ['React 19', 'TypeScript', 'Tailwind CSS', 'Hono.js'],
      features: [...new Set([...(updatedRequirements.features || []), 'responsive', 'seo'])],
      database: updatedRequirements.database ?? false,
      authentication: updatedRequirements.authentication ?? false,
    };

    // Si l'utilisateur dit "défaut" ou "décide" → appliquer tous les défauts
    if (normalized.includes('défaut') || normalized.includes('default') || normalized.includes('décide') || normalized.includes('par défaut')) {
      return {
        ...updatedRequirements,
        ...defaults,
      };
    }

    // Parser les réponses spécifiques
    
    // Type d'app
    if (normalized.includes('e-commerce') || normalized.includes('boutique')) {
      updatedRequirements.appType = 'e-commerce';
    } else if (normalized.includes('landing')) {
      updatedRequirements.appType = 'landing-page';
    } else if (normalized.includes('dashboard') || normalized.includes('tableau')) {
      updatedRequirements.appType = 'dashboard';
    } else if (normalized.includes('portfolio')) {
      updatedRequirements.appType = 'portfolio';
    } else if (normalized.includes('blog')) {
      updatedRequirements.appType = 'blog';
    } else if (normalized.includes('crm') || normalized.includes('gestion')) {
      updatedRequirements.appType = 'crm';
    }

    // Design
    if (normalized.includes('minimal') || normalized.includes('épuré')) {
      updatedRequirements.design = 'minimal';
    } else if (normalized.includes('moderne') || normalized.includes('animé')) {
      updatedRequirements.design = 'modern';
    } else if (normalized.includes('corporate') || normalized.includes('professionnel')) {
      updatedRequirements.design = 'corporate';
    }

    // Payment
    if (normalized.includes('stripe')) {
      updatedRequirements.features = [...(updatedRequirements.features || []), 'payment-stripe'];
    }
    if (normalized.includes('paypal')) {
      updatedRequirements.features = [...(updatedRequirements.features || []), 'payment-paypal'];
    }

    // Database
    if (normalized.includes('base de données') || normalized.includes('database') || normalized.includes('supabase')) {
      updatedRequirements.database = true;
      if (!updatedRequirements.stack?.includes('Supabase')) {
        updatedRequirements.stack = [...(updatedRequirements.stack || []), 'Supabase'];
      }
    }

    // Authentication
    if (normalized.includes('auth') || normalized.includes('connexion') || normalized.includes('login')) {
      updatedRequirements.authentication = true;
      updatedRequirements.features = [...(updatedRequirements.features || []), 'auth'];
    }

    // Responsive
    if (normalized.includes('responsive') || normalized.includes('mobile') || normalized.includes('oui')) {
      updatedRequirements.features = [...(updatedRequirements.features || []), 'responsive'];
    }

    return updatedRequirements;
  }
}
