# CodeCraft Studio

**IDE conversationnel avec système multi-agents pour générer du code**

🚀 **Application déployée** : https://3000-ihdye4xvkepvg23f15bfe-5c13a017.sandbox.novita.ai/

---

## 🎯 Vue d'ensemble

CodeCraft Studio est un IDE conversationnel innovant qui combine:
- **5 Agents spécialisés** (Design, Code, Test, Doc, Variations)
- **20+ Templates** pré-configurés (landing pages, dashboards, apps, etc.)
- **File Manager** complet avec CRUD operations
- **Preview/Editor/Split** modes pour une expérience optimale
- **Export** multiple (HTML, ZIP séparé, Project ZIP, Clipboard)

---

## ✨ Fonctionnalités actuellement implémentées

### ✅ **JOUR 1 - Infrastructure & Design System**
- Stack: Hono + React 18 + Vite + Cloudflare Pages
- Tailwind CSS avec design system custom (teal/purple/amber)
- Context API pour state management
- LocalStorage persistence (files, userMemory)
- Git repository configuré

### ✅ **JOUR 2 - UI Components**
- **Header** avec agent selector et actions
- **Templates Library** modal avec 20+ templates et catégories
- **File Manager** sidebar avec création/édition/suppression
- **Export Manager** avec 4 options d'export
- **Preview Engine** avec modes preview/editor/split
- **Keyboard Shortcuts** (Ctrl+B, Ctrl+T, Ctrl+E)

### ✅ **JOUR 3 - Monaco Editor + API Routes**
- **Monaco Editor** intégration complète avec 20+ langages
- **API Routes** sécurisées (/api/generate, /api/variations)
- **Anthropic Claude** intégration (Sonnet 4)
- **Chat amélioré** avec appels API réels
- **Syntax highlighting** et autocompletion
- **Mode placeholder** pour développement sans clé API

---

## 🎨 Design System

### Couleurs primaires
- **Primary (Teal)**: #14b8a6
- **Secondary (Purple)**: #a855f7
- **Accent (Amber)**: #f59e0b
- **Neutrals (Slate)**: Dark mode par défaut

### Typographie
- **UI**: Inter (400-900)
- **Code**: JetBrains Mono

### Composants
- Buttons (primary, secondary, ghost)
- Cards (standard, glass)
- Inputs & textareas
- Badges (success, warning, error, info)
- Modals avec overlay

---

## 🤖 Agents disponibles

1. **Agent Design** 🎨 - Expert UI/UX, focus esthétique
2. **Agent Code** 💻 - Implémentation propre et optimisée
3. **Agent Test** 🐛 - Validation et debugging
4. **Agent Doc** 📚 - Documentation claire et pédagogique
5. **Agent Variations** ✨ - 3 variations de style (Minimal, Modern, Pro)

---

## 📦 Templates disponibles (20+)

### Landing Pages
- Landing Page Moderne
- SaaS Landing
- App Showcase

### Dashboards
- Analytics Dashboard
- E-commerce Admin
- CRM Dashboard

### Applications
- Todo App
- Calculatrice
- Weather App
- Notes App

### Websites
- Portfolio
- Blog
- Restaurant
- Digital Agency

### E-commerce
- Online Shop
- Product Page
- Checkout Flow

### Forms
- Contact Form
- Login Page
- Survey Form

---

## 🚀 Prochaines étapes

### **SPRINT 1 (en cours)**
- ⏳ Monaco Editor integration
- ⏳ Agent Variations modal (3 styles)
- ⏳ API routes sécurisées (Anthropic)
- ⏳ Chat Interface améliorée

### **SPRINT 2**
- Supabase setup + Auth
- Projects management (save/load cloud)
- Search & Replace global
- Keyboard Shortcuts helper

### **SPRINT 3**
- WebContainers + Terminal
- GitHub Integration
- Deploy Cloudflare Pages
- Performance optimization

---

## 🛠️ Stack technique

- **Frontend**: React 18 + TypeScript
- **Backend**: Hono (Cloudflare Workers)
- **Build**: Vite 6
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Code Editor**: Monaco Editor (à venir)
- **Deployment**: Cloudflare Pages

---

## 💻 Développement local

### Installation
```bash
npm install
```

### Développement
```bash
npm run dev
# Ouvre http://localhost:3000
```

### Build
```bash
npm run build
```

### Sandbox (avec PM2)
```bash
npm run build
pm2 start ecosystem.config.cjs
```

### Scripts utiles
```bash
npm run clean-port    # Nettoie le port 3000
npm run test          # Teste http://localhost:3000
npm run git:commit    # Git commit rapide
npm run git:status    # Git status
```

---

## ⌨️ Raccourcis clavier

- `Ctrl+B` - Toggle sidebar fichiers
- `Ctrl+T` - Ouvrir templates
- `Ctrl+E` - Toggle mode éditeur
- `Ctrl+S` - Export (à venir)
- `Ctrl+F` - Rechercher (à venir)
- `Ctrl+N` - Nouveau fichier
- `Enter` - Envoyer message (dans input)

---

## 📊 État d'avancement

- ✅ Infrastructure (100%)
- ✅ Design System (100%)
- ✅ Templates Library (100%)
- ✅ File Manager (100%)
- ✅ Export Manager (100%)
- ✅ Monaco Editor (100%)
- ✅ API Integration (100%)
- ⏳ Agent Variations (0%)
- ⏳ Supabase (0%)
- ⏳ WebContainers (0%)

**Score actuel**: ~65/100 - Très bon progrès ! 🚀

---

## 📝 Notes importantes

### ⚠️ API Anthropic
L'API Anthropic est connectée ! Deux modes :
- **Mode Placeholder** : Sans clé API (pour tester l'interface)
- **Mode Production** : Avec clé API dans `.dev.vars`

Pour activer le mode production :
```bash
# Créer .dev.vars à la racine
echo "ANTHROPIC_API_KEY=votre_cle_ici" > .dev.vars
```

### 🔐 Sécurité
- Les clés API seront stockées comme secrets Cloudflare
- Routes API backend pour masquer les tokens
- Aucune clé exposée côté client

### 🎨 UI/UX
- Dark mode par défaut
- Responsive design (mobile-first)
- Animations fluides (150-300ms)
- Accessibility (ARIA, contraste, keyboard nav)

---

## 🤝 Contribution

Ce projet est généré par **CodeCraft Studio AI Assistant**.

Développé avec ❤️ par l'équipe CodeCraft

---

**Dernière mise à jour**: Jour 2 - 10 décembre 2025
