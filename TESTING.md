# 🧪 Tests du Système AI Developer

## ✅ **Tests à Effectuer**

### **1. Test Mode Placeholder (Sans clé API)**

#### Test 1.1 : Génération basique
- [ ] Envoyer : "Crée une landing page moderne"
- [ ] Vérifier : Placeholder HTML généré
- [ ] Vérifier : Message "Mode Placeholder"
- [ ] Vérifier : Preview affiche le placeholder

#### Test 1.2 : Upload fichier
- [ ] Upload un fichier .txt
- [ ] Envoyer : "Crée une app basée sur ce fichier"
- [ ] Vérifier : Fichier attaché visible
- [ ] Vérifier : Génération avec contexte fichier

#### Test 1.3 : Clarifications
- [ ] Envoyer : "Je veux une application"
- [ ] Vérifier : Questions de clarification générées
- [ ] Répondre : "e-commerce avec paiement"
- [ ] Vérifier : Génération après clarification

---

### **2. Test Mode Production (Avec clé API Anthropic)**

#### Test 2.1 : Génération simple
- [ ] Configurer `.dev.vars` avec ANTHROPIC_API_KEY
- [ ] Redémarrer PM2
- [ ] Envoyer : "Crée un dashboard analytics"
- [ ] Vérifier : Plan d'exécution affiché
- [ ] Vérifier : Agents activés listés
- [ ] Vérifier : Code réel généré par Claude
- [ ] Vérifier : Preview fonctionnelle

#### Test 2.2 : Multi-agents
- [ ] Envoyer : "Crée une app e-commerce avec auth et paiement Stripe"
- [ ] Vérifier : Agents activés (Architect, Designer, Developer, Backend, Security)
- [ ] Vérifier : Exécution parallèle
- [ ] Vérifier : Fusion des résultats
- [ ] Vérifier : Code cohérent

#### Test 2.3 : Upload + Génération
- [ ] Upload fichier Word avec spécifications
- [ ] Envoyer : "Crée l'application décrite dans le document"
- [ ] Vérifier : Contenu Word extrait
- [ ] Vérifier : Génération contextualisée
- [ ] Vérifier : Respect des spécifications

#### Test 2.4 : Gestion erreurs
- [ ] Désactiver clé API temporairement
- [ ] Envoyer : "Crée une app"
- [ ] Vérifier : Message d'erreur clair
- [ ] Vérifier : Pas de crash
- [ ] Vérifier : Suggestion de configuration

---

### **3. Test Variations**

#### Test 3.1 : Générer variations
- [ ] Générer une app
- [ ] Cliquer sur bouton Variations
- [ ] Vérifier : 3 styles générés (Minimal, Modern, Professional)
- [ ] Vérifier : Preview de chaque variation
- [ ] Vérifier : Boutons "Utiliser", "Copier", "Télécharger"

---

### **4. Test Upload Fichiers**

#### Test 4.1 : Upload Word (.docx)
- [ ] Créer fichier Word avec texte
- [ ] Upload
- [ ] Vérifier : Icône Word
- [ ] Vérifier : Statut "success"
- [ ] Vérifier : Taille fichier affichée
- [ ] Vérifier : Texte extrait correctement

#### Test 4.2 : Upload Excel (.xlsx)
- [ ] Créer fichier Excel avec données
- [ ] Upload
- [ ] Vérifier : Icône Excel
- [ ] Vérifier : Données CSV extraites
- [ ] Vérifier : Toutes les feuilles incluses

#### Test 4.3 : Upload PDF
- [ ] Upload fichier PDF
- [ ] Vérifier : Texte extrait (si possible)
- [ ] Vérifier : Nombre de pages affiché
- [ ] Ou message d'aide si extraction limitée

#### Test 4.4 : Upload multi-fichiers
- [ ] Upload 3 fichiers différents (.txt, .docx, .xlsx)
- [ ] Vérifier : Tous affichés
- [ ] Vérifier : Suppression individuelle fonctionne
- [ ] Envoyer avec tous les fichiers
- [ ] Vérifier : Tous les contenus considérés

#### Test 4.5 : Validation taille
- [ ] Essayer d'upload fichier > 10MB
- [ ] Vérifier : Message d'erreur
- [ ] Vérifier : Fichier rejeté

#### Test 4.6 : Drag & Drop
- [ ] Glisser fichier dans zone upload
- [ ] Vérifier : Zone highlight
- [ ] Drop fichier
- [ ] Vérifier : Upload démarre

---

### **5. Test Export**

#### Test 5.1 : Export HTML
- [ ] Générer une app
- [ ] Cliquer "Export & Deploy"
- [ ] Sélectionner "HTML File"
- [ ] Vérifier : Fichier téléchargé
- [ ] Vérifier : Fichier s'ouvre dans navigateur

#### Test 5.2 : Export ZIP
- [ ] Générer une app
- [ ] Export "Project ZIP"
- [ ] Vérifier : Structure dossiers
- [ ] Vérifier : package.json inclus
- [ ] Vérifier : README.md inclus

---

### **6. Test UI/UX**

#### Test 6.1 : Layout 30/70
- [ ] Vérifier : Chat 30% largeur
- [ ] Vérifier : Preview 70% largeur
- [ ] Vérifier : Responsive

#### Test 6.2 : Boutons compacts
- [ ] Vérifier : Trombone petit
- [ ] Vérifier : Send petit
- [ ] Vérifier : Superposés verticalement
- [ ] Vérifier : Textarea maximisée

#### Test 6.3 : Dark mode
- [ ] Toggle dark mode
- [ ] Vérifier : Tous les composants adaptés
- [ ] Vérifier : Contraste lisible

---

### **7. Test Performance**

#### Test 7.1 : Génération rapide
- [ ] Envoyer prompt simple
- [ ] Mesurer temps de réponse
- [ ] Vérifier : < 30s mode placeholder
- [ ] Vérifier : < 60s mode production

#### Test 7.2 : Gros fichiers
- [ ] Upload fichier 9MB
- [ ] Vérifier : Pas de freeze UI
- [ ] Vérifier : Upload progress visible

---

### **8. Test Edge Cases**

#### Test 8.1 : Prompt vide
- [ ] Essayer d'envoyer sans texte
- [ ] Vérifier : Bouton désactivé

#### Test 8.2 : Prompt très long
- [ ] Envoyer prompt 1000+ caractères
- [ ] Vérifier : Textarea s'adapte
- [ ] Vérifier : Génération fonctionne

#### Test 8.3 : Caractères spéciaux
- [ ] Envoyer prompt avec émojis 🚀
- [ ] Envoyer prompt avec accents éàüö
- [ ] Vérifier : Pas d'erreur

#### Test 8.4 : Fichier corrompu
- [ ] Upload fichier .docx corrompu
- [ ] Vérifier : Message d'erreur graceful
- [ ] Vérifier : Pas de crash

---

## 📊 **Résultats des Tests**

### Test Mode Placeholder
- [ ] ✅ Tous les tests passés
- [ ] ❌ Tests échoués : _____________________

### Test Mode Production  
- [ ] ✅ Tous les tests passés
- [ ] ❌ Tests échoués : _____________________

### Test Upload Fichiers
- [ ] ✅ Tous les tests passés
- [ ] ❌ Tests échoués : _____________________

### Test UI/UX
- [ ] ✅ Tous les tests passés
- [ ] ❌ Tests échoués : _____________________

---

## 🐛 **Bugs Identifiés**

| # | Bug | Sévérité | Statut |
|---|-----|----------|--------|
| 1 |  |  |  |
| 2 |  |  |  |

---

## ✅ **Validation Finale**

- [ ] Tous les tests critiques passés
- [ ] Gestion d'erreurs robuste
- [ ] Performance acceptable
- [ ] UX fluide
- [ ] Prêt pour production

---

**Date des tests** : _____________________  
**Testeur** : _____________________  
**Version** : v1.0.0 (Sprint 1 - Action 2/25)
