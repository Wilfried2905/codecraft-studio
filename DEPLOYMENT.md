# 🚀 Deployment Guide - Cloudflare Pages

Ce guide vous aide à déployer CodeCraft Studio sur Cloudflare Pages.

---

## 📋 Prérequis

- Un compte Cloudflare (gratuit) : https://dash.cloudflare.com
- Une clé API Anthropic : https://console.anthropic.com
- (Optionnel) Supabase configuré pour le cloud storage

---

## 🛠️ Méthode 1 : Déploiement via Wrangler CLI (Recommandé)

### 1. Installer Wrangler (déjà installé dans le projet)

```bash
npm install -g wrangler
```

### 2. Authentification Cloudflare

```bash
wrangler login
```

Cela ouvrira un navigateur pour vous connecter à Cloudflare.

### 3. Créer le projet Cloudflare Pages

```bash
# Première fois seulement
wrangler pages project create codecraft-studio \
  --production-branch main
```

### 4. Configurer les secrets (variables d'environnement)

```bash
# Anthropic API Key (REQUIS)
wrangler pages secret put ANTHROPIC_API_KEY --project-name codecraft-studio
# Entrez votre clé API Anthropic

# Supabase (OPTIONNEL)
wrangler pages secret put VITE_SUPABASE_URL --project-name codecraft-studio
# Entrez: https://xxxxx.supabase.co

wrangler pages secret put VITE_SUPABASE_ANON_KEY --project-name codecraft-studio
# Entrez votre anon key
```

### 5. Build et Deploy

```bash
# Build l'application
npm run build

# Deploy sur Cloudflare Pages
npm run deploy

# Ou directement avec wrangler
wrangler pages deploy dist --project-name codecraft-studio
```

### 6. Accéder à votre application

Après le déploiement, vous recevrez une URL :
```
https://codecraft-studio.pages.dev
```

---

## 🌐 Méthode 2 : Déploiement via GitHub + Cloudflare Dashboard

### 1. Pousser le code sur GitHub

```bash
# Initialiser git (si pas déjà fait)
git init
git add .
git commit -m "Initial commit"

# Créer un nouveau repo sur GitHub
# Puis:
git remote add origin https://github.com/your-username/codecraft-studio.git
git push -u origin main
```

### 2. Connecter GitHub à Cloudflare Pages

1. Allez sur https://dash.cloudflare.com
2. **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**
3. Sélectionnez votre repo GitHub
4. Configuration :
   - **Project name**: `codecraft-studio`
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`

### 3. Configurer les variables d'environnement

Dans **Settings** > **Environment variables** :

```
ANTHROPIC_API_KEY = sk-ant-xxxxx
VITE_SUPABASE_URL = https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY = eyJxxxxx
```

### 4. Deploy

Cliquez sur **Save and Deploy**. Chaque push sur `main` redéploiera automatiquement.

---

## ⚙️ Configuration Build

Le fichier `wrangler.jsonc` contient la configuration :

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "codecraft-studio",
  "compatibility_date": "2025-12-10",
  "pages_build_output_dir": "./dist",
  "compatibility_flags": ["nodejs_compat"]
}
```

---

## 🔐 Gestion des Secrets

### Lister les secrets
```bash
wrangler pages secret list --project-name codecraft-studio
```

### Supprimer un secret
```bash
wrangler pages secret delete ANTHROPIC_API_KEY --project-name codecraft-studio
```

### Mettre à jour un secret
```bash
# Même commande que pour ajouter
wrangler pages secret put ANTHROPIC_API_KEY --project-name codecraft-studio
```

---

## 🌍 Custom Domain (Optionnel)

### 1. Ajouter un domaine personnalisé

```bash
wrangler pages domain add example.com --project-name codecraft-studio
```

### 2. Configurer le DNS

Ajoutez un enregistrement CNAME dans votre DNS :
```
CNAME   @   codecraft-studio.pages.dev
```

### 3. Activer HTTPS

Cloudflare gère automatiquement le certificat SSL.

---

## 📊 Monitoring & Logs

### Voir les logs de déploiement
```bash
wrangler pages deployment list --project-name codecraft-studio
```

### Voir les logs en temps réel
```bash
wrangler tail codecraft-studio
```

---

## 🔄 CI/CD avec GitHub Actions

Créez `.github/workflows/deploy.yml` :

```yaml
name: Deploy to Cloudflare Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: codecraft-studio
          directory: dist
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

---

## 🐛 Troubleshooting

### Erreur: "Build failed"
- Vérifiez que `npm run build` fonctionne localement
- Vérifiez les logs de build dans Cloudflare Dashboard

### Erreur: "API Key not found"
- Vérifiez que les secrets sont bien configurés
- Utilisez `wrangler pages secret list` pour lister

### Erreur: "404 Not Found" après déploiement
- Vérifiez que `dist/` contient bien les fichiers
- Vérifiez le `pages_build_output_dir` dans `wrangler.jsonc`

### Performance lente
- Activez **Auto Minify** dans Cloudflare Dashboard
- Utilisez **Argo Smart Routing** (payant)

---

## 📈 Optimisations Production

### 1. Enable Caching
Dans `wrangler.jsonc`, ajoutez :
```jsonc
{
  "routes": [
    {
      "pattern": "/static/*",
      "cache": true
    }
  ]
}
```

### 2. Compression
Cloudflare gère automatiquement Brotli et Gzip.

### 3. Analytics
Activez **Web Analytics** dans Cloudflare Dashboard pour suivre :
- Page views
- Temps de chargement
- Erreurs JavaScript

---

## 🆘 Support

- **Cloudflare Docs**: https://developers.cloudflare.com/pages
- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler
- **Discord Community**: https://discord.gg/cloudflaredev

---

## ✅ Checklist finale

- [ ] Code buildé sans erreur (`npm run build`)
- [ ] Secrets configurés (Anthropic API key)
- [ ] Deploy réussi
- [ ] URL accessible et fonctionnelle
- [ ] Génération de code fonctionne
- [ ] Monaco Editor charge correctement
- [ ] (Optionnel) Custom domain configuré
- [ ] (Optionnel) CI/CD GitHub Actions configuré

---

**Bon déploiement ! 🎉**
