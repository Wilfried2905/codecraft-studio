/**
 * Clarification Engine - Génère des questions intelligentes pour clarifier les besoins
 */

import { Requirements, UserIntent } from './intentAnalyzer';

export interface ClarificationResponse {
  needsClarification: boolean;
  questions: string[];
  suggestedDefaults?: Record<string, any>;
}

export class ClarificationEngine {
  /**
   * Génère des questions de clarification intelligentes
   */
  generateQuestions(intent: UserIntent, requirements: Requirements): ClarificationResponse {
    const questions: string[] = [];
    const suggestedDefaults: Record<string, any> = {};

    // 1. Type d'application
    if (!requirements.appType && intent.type === 'create_app') {
      questions.push("📱 **Quel type d'application voulez-vous créer ?**\n- E-commerce\n- Landing Page\n- Dashboard\n- Portfolio\n- Blog\n- CRM / Gestion\n- Autre (précisez)");
      suggestedDefaults.appType = 'landing-page';
    }

    // 2. Design & Style
    if (!requirements.design) {
      questions.push("🎨 **Quel style de design préférez-vous ?**\n- Minimal (épuré, sobre)\n- Moderne (animations, gradients)\n- Corporate (professionnel, sérieux)");
      suggestedDefaults.design = 'modern';
    }

    // 3. Features avancées
    if (requirements.appType === 'e-commerce') {
      if (!requirements.features?.includes('payment')) {
        questions.push("💳 **Système de paiement ?**\n- Stripe\n- PayPal\n- Les deux\n- Aucun pour l'instant");
        suggestedDefaults.payment = 'stripe';
      }

      if (!requirements.database) {
        questions.push("📦 **Gestion de l'inventaire ?**\n- Oui, avec base de données (Supabase)\n- Non, données statiques pour l'instant");
        suggestedDefaults.database = true;
      }
    }

    // 4. Authentification
    if (requirements.features?.includes('auth') || requirements.authentication) {
      questions.push("🔐 **Type d'authentification ?**\n- Email/Password\n- OAuth (Google, GitHub)\n- Les deux");
      suggestedDefaults.authType = 'both';
    }

    // 5. Responsive
    if (!requirements.features?.includes('responsive')) {
      questions.push("📱 **Compatibilité mobile ?**\n- Oui, responsive design\n- Desktop uniquement");
      suggestedDefaults.responsive = true;
    }

    // 6. Backend / API
    if (requirements.features?.includes('api') || requirements.features?.includes('crud')) {
      questions.push("⚙️ **Backend nécessaire ?**\n- Oui, avec API REST\n- Non, frontend uniquement\n- Serverless (Cloudflare Workers)");
      suggestedDefaults.backend = 'serverless';
    }

    // Si pas de questions, tout est clair
    if (questions.length === 0) {
      return {
        needsClarification: false,
        questions: [],
      };
    }

    // Ajouter un message d'introduction
    const intro = `📋 **J'ai besoin de quelques précisions pour créer l'application parfaite pour vous :**\n\n`;
    const outro = `\n\n💡 **Vous pouvez répondre simplement, ou me dire "utilise les options par défaut" si vous voulez que je décide.**`;

    return {
      needsClarification: true,
      questions: [intro + questions.join('\n\n') + outro],
      suggestedDefaults,
    };
  }

  /**
   * Parse la réponse de l'utilisateur aux questions de clarification
   */
  parseUserResponse(userResponse: string, previousRequirements: Requirements): Requirements {
    const normalized = userResponse.toLowerCase();
    const updatedRequirements = { ...previousRequirements };

    // Détecter "utilise les options par défaut"
    if (normalized.includes('défaut') || normalized.includes('default') || normalized.includes('décide')) {
      return {
        ...updatedRequirements,
        appType: updatedRequirements.appType || 'landing-page',
        design: updatedRequirements.design || 'modern',
        stack: updatedRequirements.stack || ['React', 'TypeScript', 'Tailwind CSS'],
        features: [...(updatedRequirements.features || []), 'responsive', 'seo'],
        database: updatedRequirements.database ?? false,
        authentication: updatedRequirements.authentication ?? false,
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
