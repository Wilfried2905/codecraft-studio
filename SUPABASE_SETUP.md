# 🔐 Configuration Supabase pour CodeCraft Studio

Ce guide vous aide à configurer Supabase pour l'authentification et le stockage des données.

## 📋 Étape 1 : Créer un projet Supabase

1. **Aller sur [Supabase](https://supabase.com)** et créer un compte gratuit
2. **Créer un nouveau projet** :
   - Nom du projet : `codecraft-studio` (ou votre choix)
   - Mot de passe de la base de données : **Notez-le bien !**
   - Région : Choisir la plus proche de vous

## 🗄️ Étape 2 : Créer les tables

1. **Aller dans l'éditeur SQL** : `Database` → `SQL Editor`
2. **Copier et exécuter ce script SQL** :

```sql
-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  code TEXT,
  html TEXT,
  css TEXT,
  javascript TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations table
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates table
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT FALSE,
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for conversations
CREATE POLICY "Users can view own conversations" ON conversations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON conversations
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for templates
CREATE POLICY "Users can view own templates" ON templates
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own templates" ON templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own templates" ON templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own templates" ON templates
  FOR DELETE USING (auth.uid() = user_id);
```

3. **Cliquer sur "Run"** pour exécuter le script

## 🔑 Étape 3 : Récupérer les clés API

1. **Aller dans les paramètres API** : `Settings` → `API`
2. **Copier ces 2 valeurs** :
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

## ⚙️ Étape 4 : Configuration locale (développement)

1. **Créer le fichier `.dev.vars`** à la racine du projet :

```bash
# .dev.vars (local development only - NEVER commit this file!)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
ANTHROPIC_API_KEY=your-anthropic-api-key
```

2. **Remplacer les valeurs** par vos vraies clés Supabase

3. **Vérifier que `.dev.vars` est dans `.gitignore`** (déjà fait normalement)

## 🚀 Étape 5 : Configuration production (Cloudflare Pages)

Pour déployer en production, ajouter les secrets Cloudflare :

```bash
# Supabase URL
npx wrangler secret put VITE_SUPABASE_URL
# Copier/coller: https://your-project-id.supabase.co

# Supabase Anon Key
npx wrangler secret put VITE_SUPABASE_ANON_KEY
# Copier/coller: your-anon-key-here
```

## ✅ Étape 6 : Tester la configuration

1. **Démarrer le serveur de développement** :
```bash
npm run build
pm2 start ecosystem.config.cjs
```

2. **Ouvrir l'application** dans le navigateur

3. **Cliquer sur "Connexion"** dans le header

4. **Créer un compte de test** :
   - Email : `test@example.com`
   - Mot de passe : `Test123!`

5. **Vérifier dans Supabase** :
   - Aller dans `Authentication` → `Users`
   - Vous devriez voir votre utilisateur de test

## 🔒 Sécurité

- ✅ **Row Level Security (RLS)** : Activé sur toutes les tables
- ✅ **Policies** : Chaque utilisateur ne voit que ses propres données
- ✅ **JWT** : Authentification par token sécurisé
- ✅ **HTTPS** : Toutes les communications sont chiffrées

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)

## ❓ Problèmes courants

### Erreur "Invalid API key"
→ Vérifier que vous avez copié la clé `anon public` (pas la clé `service_role`)

### Erreur "Failed to fetch"
→ Vérifier que le `VITE_SUPABASE_URL` est correct

### L'utilisateur ne peut pas voir ses données
→ Vérifier que les RLS policies sont bien créées

### Variables d'environnement non détectées
→ Redémarrer le serveur de développement après modification de `.dev.vars`

---

**Besoin d'aide ?** Consultez la [documentation Supabase](https://supabase.com/docs) ou ouvrez une issue GitHub.
