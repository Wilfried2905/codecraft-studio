# 🗄️ Supabase Setup Guide

Ce guide vous aide à configurer Supabase pour CodeCraft Studio afin de sauvegarder vos projets dans le cloud.

---

## 📋 Prérequis

- Un compte Supabase (gratuit) : https://supabase.com

---

## 🚀 Étapes d'installation

### 1. Créer un projet Supabase

1. Connectez-vous sur https://supabase.com
2. Cliquez sur **"New Project"**
3. Remplissez les informations :
   - **Name**: `codecraft-studio`
   - **Database Password**: (choisissez un mot de passe fort)
   - **Region**: Choisissez le plus proche de vous
4. Cliquez sur **"Create new project"**
5. Attendez ~2 minutes que le projet soit créé

### 2. Récupérer les identifiants

1. Dans votre projet Supabase, allez dans **Settings** > **API**
2. Copiez :
   - **Project URL** (ex: `https://xxxxx.supabase.co`)
   - **anon public** key (longue clé commençant par `eyJ...`)

### 3. Créer le schéma de base de données

1. Allez dans **SQL Editor** dans Supabase
2. Créez une nouvelle requête
3. Copiez-collez ce SQL :

```sql
-- Table: projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  files JSONB NOT NULL DEFAULT '[]'::jsonb,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: agent_history (pour l'apprentissage)
CREATE TABLE IF NOT EXISTS agent_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id TEXT NOT NULL,
  prompt TEXT NOT NULL,
  response TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: user_memory (préférences utilisateur)
CREATE TABLE IF NOT EXISTS user_memory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  shortcuts JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON projects(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_agent_history_user_id ON agent_history(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_history_agent_id ON agent_history(agent_id);

-- Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memory ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for agent_history
CREATE POLICY "Users can view their own history"
  ON agent_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own history"
  ON agent_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_memory
CREATE POLICY "Users can view their own memory"
  ON user_memory FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own memory"
  ON user_memory FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memory"
  ON user_memory FOR UPDATE
  USING (auth.uid() = user_id);

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_memory_updated_at
  BEFORE UPDATE ON user_memory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

4. Cliquez sur **"Run"**
5. Vérifiez que toutes les tables sont créées (aucune erreur)

### 4. Configurer l'authentification

1. Allez dans **Authentication** > **Providers**
2. Activez **Email** (déjà activé par défaut)
3. (Optionnel) Activez **Google**, **GitHub** pour OAuth

### 5. Ajouter les identifiants au projet

**En développement local :**

Créez ou modifiez `.dev.vars` à la racine :

```bash
# Anthropic API
ANTHROPIC_API_KEY=votre_cle_anthropic

# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxx...
```

**En production (Cloudflare Pages) :**

```bash
# Via wrangler CLI
wrangler pages secret put VITE_SUPABASE_URL
# Entrez: https://xxxxx.supabase.co

wrangler pages secret put VITE_SUPABASE_ANON_KEY
# Entrez: eyJxxxx...
```

### 6. Redémarrer l'application

```bash
pm2 restart codecraft-studio-dev
```

---

## ✅ Vérification

Ouvrez l'application et vérifiez :

1. **Badge "Cloud"** apparaît dans le header (si configuré)
2. **Bouton "Save to Cloud"** disponible
3. **Menu "My Projects"** accessible
4. Pas d'erreurs dans la console

---

## 🔐 Sécurité

- ✅ **RLS activé** : Chaque utilisateur ne voit que ses propres données
- ✅ **anon key public** : OK d'exposer côté client (RLS protège les données)
- ❌ **NE JAMAIS exposer** : Service role key (admin)

---

## 📊 Structure des données

### Table `projects`
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "name": "My Project",
  "description": "Project description",
  "files": [
    {
      "id": "file-1",
      "name": "index.html",
      "content": "<!DOCTYPE html>...",
      "language": "html",
      "lastModified": 1234567890
    }
  ],
  "messages": [
    {
      "role": "user",
      "content": "Create a landing page",
      "timestamp": 1234567890
    }
  ],
  "settings": {
    "activeAgent": "design",
    "darkMode": true
  }
}
```

---

## 🆘 Troubleshooting

### Erreur: "Supabase not configured"
- Vérifiez que `.dev.vars` contient les bonnes valeurs
- Redémarrez PM2

### Erreur: "Row Level Security policy violation"
- Vérifiez que vous êtes connecté (auth)
- Vérifiez que les RLS policies sont créées

### Erreur: "relation does not exist"
- Exécutez à nouveau le SQL de création des tables
- Vérifiez dans Supabase > Table Editor

---

## 🎓 Pour aller plus loin

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase + React](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)

---

**Bon développement ! 🚀**
