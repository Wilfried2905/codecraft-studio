# 🚀 Getting Started - CodeCraft Studio

Bienvenue dans **CodeCraft Studio**, votre IDE conversationnel avec système multi-agents !

---

## ⚡ Démarrage Immédiat (Mode Test)

L'application est déjà lancée et accessible :

### 🌐 URL de l'application
```
https://3000-ihdye4xvkepvg23f15bfe-5c13a017.sandbox.novita.ai/
```

### ✅ Ce qui fonctionne déjà (sans configuration)
- ✅ Interface complète (Header, File Manager, Monaco Editor, Chat)
- ✅ Templates Library (20+ templates)
- ✅ File Manager (CRUD operations)
- ✅ Export Manager (HTML, ZIP, Clipboard)
- ✅ Preview modes (Preview, Code, Split)
- ✅ Agent selector (5 agents)
- ✅ Variations button
- ✅ **Mode Placeholder** : Génération de code HTML de test

### 🔧 Ce qui nécessite une configuration
- ⚠️ **Génération IA réelle** : Nécessite une clé API Anthropic
- ⚠️ **Variations réelles** : Nécessite une clé API Anthropic
- ⚠️ **Cloud Storage** : Nécessite Supabase (optionnel)

---

## 🎯 Option 1 : Tester sans API Key (Mode Placeholder)

**Vous pouvez tester immédiatement !**

1. Ouvrez l'URL : https://3000-ihdye4xvkepvg23f15bfe-5c13a017.sandbox.novita.ai/
2. Sélectionnez un agent (Design, Code, Test, Doc, Variations)
3. Tapez un prompt : `Crée une landing page moderne pour un SaaS`
4. Cliquez sur **Envoyer**
5. Vous verrez un HTML placeholder généré pour tester l'interface

**Limitations du mode placeholder** :
- Le code généré est un placeholder (HTML de démonstration)
- Les variations génèrent des placeholders également
- Pour avoir de vraie génération IA, configurez l'API Anthropic (voir ci-dessous)

---

## 🤖 Option 2 : Activer l'IA (Anthropic Claude)

Pour activer la vraie génération de code avec Claude Sonnet 4 :

### 1. Obtenir une clé API Anthropic

1. Créez un compte sur https://console.anthropic.com
2. Allez dans **API Keys**
3. Créez une nouvelle clé (`sk-ant-...`)
4. Copiez la clé (vous ne la reverrez plus après)

### 2. Configurer la clé dans le projet

**Dans le sandbox (environnement actuel)** :

```bash
# Éditer .dev.vars
nano /home/user/webapp/.dev.vars

# Remplacer:
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Par votre vraie clé:
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx...
```

**Sauvegarder** : `Ctrl+O` puis `Enter`, puis `Ctrl+X` pour quitter nano

### 3. Redémarrer l'application

```bash
pm2 restart codecraft-studio-dev
```

### 4. Tester

1. Retournez sur l'application
2. Tapez un prompt : `Crée un tableau de bord analytics moderne avec des graphiques`
3. **Claude Sonnet 4** générera du vrai code HTML/CSS/JS !

---

## 🗄️ Option 3 : Activer le Cloud Storage (Supabase)

**⚠️ Optionnel** : Si vous voulez sauvegarder vos projets dans le cloud.

Suivez le guide complet : **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)**

**Résumé rapide** :
1. Créer un projet Supabase (gratuit)
2. Exécuter le SQL de création des tables
3. Copier `Project URL` et `anon key`
4. Ajouter dans `.dev.vars` :
   ```bash
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJxxxxx...
   ```
5. Redémarrer PM2

---

## 🚀 Option 4 : Déployer en Production

Pour déployer sur Cloudflare Pages et avoir votre propre URL :

Suivez le guide complet : **[DEPLOYMENT.md](DEPLOYMENT.md)**

**Résumé rapide (CLI)** :
```bash
# 1. Authentification Cloudflare
wrangler login

# 2. Build
npm run build

# 3. Deploy
npm run deploy

# 4. Configurer les secrets
wrangler pages secret put ANTHROPIC_API_KEY --project-name codecraft-studio
```

Votre application sera accessible sur : `https://codecraft-studio.pages.dev`

---

## 📚 Documentation Complète

| Fichier | Description |
|---------|-------------|
| **README.md** | Documentation principale détaillée |
| **PROJECT_SUMMARY.md** | Récapitulatif complet du projet |
| **SUPABASE_SETUP.md** | Guide Supabase avec SQL schema |
| **DEPLOYMENT.md** | Guide déploiement Cloudflare Pages |
| **GETTING_STARTED.md** | Ce fichier (démarrage rapide) |

---

## ⌨️ Raccourcis Clavier

| Touche | Action |
|--------|--------|
| `Ctrl+T` | Ouvrir les templates |
| `Ctrl+B` | Toggle file manager sidebar |
| `Ctrl+E` | Changer mode éditeur |
| `Ctrl+V` | Ouvrir variations modal |
| `Ctrl+S` | Sauvegarder (dans Monaco) |
| `Ctrl+N` | Nouveau fichier |

---

## 🎨 Tester les Fonctionnalités

### 1. Templates Library (Ctrl+T)
1. Cliquer sur **Templates** (ou `Ctrl+T`)
2. Parcourir les 20+ templates
3. Sélectionner `Landing Page Moderne`
4. → Code généré automatiquement !

### 2. File Manager
1. Cliquer sur **+** dans le sidebar
2. Nom : `style.css`
3. Taper du CSS dans Monaco Editor
4. Fichier sauvegardé automatiquement

### 3. Monaco Editor
- **Syntax highlighting** automatique
- **IntelliSense** : `Ctrl+Space`
- **Format** : `Shift+Alt+F`
- **Rechercher** : `Ctrl+F`

### 4. Agent Variations (Ctrl+V)
1. Générer du code d'abord
2. Cliquer sur **Variations** (ou `Ctrl+V`)
3. Cliquer **Générer 3 Variations**
4. Comparer les 3 styles :
   - Minimal
   - Modern/Bold
   - Professional
5. Cliquer **Utiliser** pour appliquer

### 5. Export Manager
1. Générer du code
2. Cliquer sur l'icône **Download**
3. Choisir :
   - **HTML** : Fichier HTML simple
   - **ZIP Séparé** : HTML + CSS + JS séparés
   - **Project ZIP** : Tous les fichiers
   - **Copier** : Dans le presse-papier

---

## 🐛 Résolution de Problèmes

### L'application ne charge pas
```bash
# Vérifier que PM2 tourne
pm2 list

# Si pas de processus, relancer
cd /home/user/webapp
pm2 start ecosystem.config.cjs --name codecraft-studio-dev
```

### Erreur "API Key not found"
```bash
# Vérifier .dev.vars
cat /home/user/webapp/.dev.vars

# Si vide ou invalide, éditer
nano /home/user/webapp/.dev.vars

# Redémarrer
pm2 restart codecraft-studio-dev
```

### Monaco Editor ne charge pas
- Vider le cache du navigateur
- Attendre ~10 secondes (Monaco est gros)
- Vérifier les logs : `pm2 logs codecraft-studio-dev --nostream`

### Preview ne s'affiche pas
- Vérifier que du code a été généré
- Essayer le mode **Split** pour voir les deux
- Vérifier la console du navigateur (F12)

---

## 💡 Conseils d'Utilisation

### Prompts Efficaces
✅ **Bon** : `Crée un tableau de bord avec 4 cartes de statistiques, un graphique en ligne, et une table de données`

❌ **Mauvais** : `Fais un truc cool`

### Agents Spécialisés
- **Design** 🎨 : Pour l'UI/UX, animations, esthétique
- **Code** 💻 : Pour du code propre, optimisé, performant
- **Test** 🐛 : Pour validation, gestion d'erreurs, robustesse
- **Doc** 📚 : Pour documentation, commentaires, explications
- **Variations** ✨ : Pour avoir 3 styles différents

### Workflow Recommandé
1. Sélectionner un **template** (Ctrl+T)
2. Personnaliser avec un **prompt**
3. Éditer dans **Monaco Editor** (Ctrl+E)
4. Générer des **variations** (Ctrl+V)
5. **Exporter** le résultat

---

## 📞 Besoin d'Aide ?

1. **Documentation** : Lire les fichiers `.md` à la racine
2. **Logs** : `pm2 logs codecraft-studio-dev --nostream`
3. **Console** : F12 dans le navigateur
4. **Reset** : `pm2 restart codecraft-studio-dev`

---

## 🎉 C'est Parti !

Vous êtes prêt ! Voici les 3 prochaines actions :

1. **🌐 Ouvrir l'application** : https://3000-ihdye4xvkepvg23f15bfe-5c13a017.sandbox.novita.ai/

2. **🧪 Tester en mode placeholder** : Sans configuration, pour découvrir l'interface

3. **🤖 Activer l'IA** : Configurer votre clé Anthropic pour la vraie génération

---

**Bon développement ! 🚀✨**
