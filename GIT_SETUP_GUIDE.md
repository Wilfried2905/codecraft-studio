# 🔧 Git Integration Setup Guide

## Configuration GitHub pour CodeCraft Studio

### Option 1: Personal Access Token (Recommandé - Simple)

1. **Générer un token GitHub:**
   - Aller sur https://github.com/settings/tokens
   - Cliquer "Generate new token (classic)"
   - Nom: `CodeCraft Studio`
   - Scopes: Cocher `repo` (full access)
   - Copier le token généré

2. **Ajouter au projet:**
   - Créer fichier `.dev.vars` :
   ```bash
   GITHUB_TOKEN=ghp_your_token_here
   ```

3. **Pour production (Cloudflare):**
   ```bash
   npx wrangler secret put GITHUB_TOKEN
   ```

### Option 2: GitHub OAuth App (Avancé)

1. **Créer OAuth App:**
   - https://github.com/settings/developers
   - "New OAuth App"
   - Application name: `CodeCraft Studio`
   - Homepage URL: Votre URL app
   - Authorization callback: `https://your-url/api/auth/github/callback`

2. **Configuration:**
   ```bash
   # .dev.vars
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```

## Fonctionnalités disponibles

### Avec Personal Token:
✅ Create repository
✅ Commit files
✅ Push to branch
✅ List repositories
✅ View commit history

### Limitations:
❌ Ne peut pas cloner repos (pas nécessaire dans notre cas)
❌ Commits au nom du token owner uniquement

## Usage dans l'app

1. **Connecter GitHub:**
   - Settings → GitHub Token
   - Coller token
   - Tester connexion

2. **Push projet:**
   - Generate code
   - Click "Push to GitHub"
   - Select repo ou créer nouveau
   - Commit message
   - Push automatique

## Sécurité

- ✅ Token stocké sécurisé (Cloudflare secrets)
- ✅ Jamais exposé côté client
- ✅ API route protégée
- ⚠️ Scope minimal (repo only)
