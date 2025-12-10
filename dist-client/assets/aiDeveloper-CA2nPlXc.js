var f=Object.defineProperty;var g=(c,e,i)=>e in c?f(c,e,{enumerable:!0,configurable:!0,writable:!0,value:i}):c[e]=i;var u=(c,e,i)=>g(c,typeof e!="symbol"?e+"":e,i);class m{async analyze(e,i){const t=e.toLowerCase(),s=this.detectIntent(t),n=this.extractRequirements(t,i),o=this.evaluateClarificationNeeds(s,n);return{intent:{...s,needsClarification:o.needed,clarificationQuestions:o.questions},requirements:n}}detectIntent(e){const i=["créer","faire","générer","construire","développer","app","site","application"],t=["modifier","changer","améliorer","ajouter","supprimer","corriger"],s=["comment","pourquoi","qu'est-ce","est-ce que","peux-tu","?"];let n="question",o=0;return i.some(a=>e.includes(a))&&(n="create_app",o=.8),t.some(a=>e.includes(a))&&(n="modify_app",o=.7),s.some(a=>e.includes(a))&&!i.some(a=>e.includes(a))&&(n="question",o=.6),{type:n,confidence:o,detectedFeatures:this.detectFeatures(e),detectedStack:this.detectStack(e),complexity:this.detectComplexity(e),needsClarification:!1,clarificationQuestions:[]}}extractRequirements(e,i){const t={};return e.includes("e-commerce")||e.includes("boutique")||e.includes("shop")?t.appType="e-commerce":e.includes("landing")||e.includes("page d'accueil")?t.appType="landing-page":e.includes("dashboard")||e.includes("tableau de bord")?t.appType="dashboard":e.includes("portfolio")?t.appType="portfolio":e.includes("blog")?t.appType="blog":(e.includes("crm")||e.includes("gestion"))&&(t.appType="crm"),t.features=this.detectFeatures(e),t.stack=this.detectStack(e),e.includes("minimal")?t.design="minimal":e.includes("moderne")||e.includes("animé")?t.design="modern":(e.includes("corporate")||e.includes("professionnel"))&&(t.design="corporate"),t.database=e.includes("base de données")||e.includes("database")||e.includes("db"),t.authentication=e.includes("auth")||e.includes("connexion")||e.includes("login")||e.includes("utilisateur"),i&&i.length>0&&(t.uploadedFiles=i),t}detectFeatures(e){const i=[],t={auth:["authentification","connexion","login","inscription","register"],payment:["paiement","payment","stripe","paypal","checkout"],crud:["crud","créer","modifier","supprimer","gestion"],realtime:["temps réel","realtime","live","instantané"],search:["recherche","search","filtre","filter"],upload:["upload","télécharger","fichier","image"],api:["api","backend","serveur"],responsive:["responsive","mobile","tablette","adaptatif"],seo:["seo","référencement","meta"],analytics:["analytics","statistiques","tracking"]};for(const[s,n]of Object.entries(t))n.some(o=>e.includes(o))&&i.push(s);return i}detectStack(e){const i=["React","TypeScript","Tailwind CSS"];return e.includes("vue")&&i.push("Vue.js"),e.includes("angular")&&i.push("Angular"),e.includes("svelte")&&i.push("Svelte"),e.includes("node")&&i.push("Node.js"),e.includes("express")&&i.push("Express"),e.includes("next")&&i.push("Next.js"),e.includes("supabase")&&i.push("Supabase"),e.includes("firebase")&&i.push("Firebase"),i}detectComplexity(e){const i=this.detectFeatures(e);return i.length<=2?"simple":i.length<=5?"medium":"complex"}evaluateClarificationNeeds(e,i){var s,n;const t=[];return!i.appType&&e.type==="create_app"&&t.push("Quel type d'application voulez-vous créer ? (e-commerce, landing page, dashboard, portfolio, blog, CRM)"),(s=i.features)!=null&&s.includes("payment")&&t.push("Quel système de paiement préférez-vous ? (Stripe, PayPal, ou les deux)"),i.database&&!((n=i.stack)!=null&&n.some(o=>o.includes("Supabase")||o.includes("Firebase")))&&t.push("Voulez-vous utiliser Supabase, Firebase, ou une autre base de données ?"),!i.design&&e.type==="create_app"&&t.push("Quel style de design préférez-vous ? (minimal, moderne/animé, corporate/professionnel)"),{needed:t.length>0,questions:t}}}class h{generateQuestions(e,i){var a,r,l,d,p;const t=[],s={};return!i.appType&&e.type==="create_app"&&(t.push(`📱 **Quel type d'application voulez-vous créer ?**
- E-commerce
- Landing Page
- Dashboard
- Portfolio
- Blog
- CRM / Gestion
- Autre (précisez)`),s.appType="landing-page"),i.design||(t.push(`🎨 **Quel style de design préférez-vous ?**
- Minimal (épuré, sobre)
- Moderne (animations, gradients)
- Corporate (professionnel, sérieux)`),s.design="modern"),i.appType==="e-commerce"&&((a=i.features)!=null&&a.includes("payment")||(t.push(`💳 **Système de paiement ?**
- Stripe
- PayPal
- Les deux
- Aucun pour l'instant`),s.payment="stripe"),i.database||(t.push(`📦 **Gestion de l'inventaire ?**
- Oui, avec base de données (Supabase)
- Non, données statiques pour l'instant`),s.database=!0)),((r=i.features)!=null&&r.includes("auth")||i.authentication)&&(t.push(`🔐 **Type d'authentification ?**
- Email/Password
- OAuth (Google, GitHub)
- Les deux`),s.authType="both"),(l=i.features)!=null&&l.includes("responsive")||(t.push(`📱 **Compatibilité mobile ?**
- Oui, responsive design
- Desktop uniquement`),s.responsive=!0),((d=i.features)!=null&&d.includes("api")||(p=i.features)!=null&&p.includes("crud"))&&(t.push(`⚙️ **Backend nécessaire ?**
- Oui, avec API REST
- Non, frontend uniquement
- Serverless (Cloudflare Workers)`),s.backend="serverless"),t.length===0?{needsClarification:!1,questions:[]}:{needsClarification:!0,questions:[`📋 **J'ai besoin de quelques précisions pour créer l'application parfaite pour vous :**

`+t.join(`

`)+`

💡 **Vous pouvez répondre simplement, ou me dire "utilise les options par défaut" si vous voulez que je décide.**`],suggestedDefaults:s}}parseUserResponse(e,i){var n;const t=e.toLowerCase(),s={...i};return t.includes("défaut")||t.includes("default")||t.includes("décide")?{...s,appType:s.appType||"landing-page",design:s.design||"modern",stack:s.stack||["React","TypeScript","Tailwind CSS"],features:[...s.features||[],"responsive","seo"],database:s.database??!1,authentication:s.authentication??!1}:(t.includes("e-commerce")||t.includes("boutique")?s.appType="e-commerce":t.includes("landing")?s.appType="landing-page":t.includes("dashboard")||t.includes("tableau")?s.appType="dashboard":t.includes("portfolio")?s.appType="portfolio":t.includes("blog")?s.appType="blog":(t.includes("crm")||t.includes("gestion"))&&(s.appType="crm"),t.includes("minimal")||t.includes("épuré")?s.design="minimal":t.includes("moderne")||t.includes("animé")?s.design="modern":(t.includes("corporate")||t.includes("professionnel"))&&(s.design="corporate"),t.includes("stripe")&&(s.features=[...s.features||[],"payment-stripe"]),t.includes("paypal")&&(s.features=[...s.features||[],"payment-paypal"]),(t.includes("base de données")||t.includes("database")||t.includes("supabase"))&&(s.database=!0,(n=s.stack)!=null&&n.includes("Supabase")||(s.stack=[...s.stack||[],"Supabase"])),(t.includes("auth")||t.includes("connexion")||t.includes("login"))&&(s.authentication=!0,s.features=[...s.features||[],"auth"]),(t.includes("responsive")||t.includes("mobile")||t.includes("oui"))&&(s.features=[...s.features||[],"responsive"]),s)}}class y{constructor(){u(this,"agents",[{id:"architect",name:"Architecte",role:"Structure et architecture de l'application",systemPrompt:`Tu es un architecte logiciel expert. Ton rôle est de concevoir la structure complète de l'application : 
- Architecture des dossiers et fichiers
- Choix des dépendances et packages
- Structure des composants React
- Gestion de l'état (Context, hooks)
- Routing et navigation
- Configuration (tsconfig, vite.config, etc.)

Génère une structure de projet claire, scalable et maintenable.`,priority:1},{id:"designer",name:"Designer UI/UX",role:"Design, styles, animations, expérience utilisateur",systemPrompt:`Tu es un designer UI/UX expert. Ton rôle est de créer une interface moderne et intuitive :
- Design system (couleurs, typographie, espacements)
- Composants UI réutilisables
- Animations et transitions fluides
- Responsive design (mobile, tablet, desktop)
- Accessibilité (ARIA, contraste, navigation clavier)

Utilise Tailwind CSS et crée des interfaces élégantes et performantes.`,priority:2},{id:"developer",name:"Développeur",role:"Code fonctionnel, logique métier, intégration API",systemPrompt:`Tu es un développeur fullstack expert React/TypeScript. Ton rôle est d'implémenter :
- Composants React fonctionnels avec TypeScript
- Hooks personnalisés (useState, useEffect, useContext)
- Logique métier et gestion de l'état
- Intégration d'API externes
- Gestion des erreurs et validations
- Performance et optimisations

Génère du code propre, typé, commenté et production-ready.`,priority:3},{id:"tester",name:"Testeur QA",role:"Tests, validation, edge cases",systemPrompt:`Tu es un testeur QA expert. Ton rôle est de garantir la qualité :
- Tests unitaires (Vitest, React Testing Library)
- Tests d'intégration
- Edge cases et scénarios d'erreur
- Validation des inputs
- Tests de performance
- Accessibilité (a11y)

Génère des tests complets et des validations robustes.`,priority:4},{id:"documenter",name:"Documenteur",role:"Documentation technique, README, commentaires",systemPrompt:`Tu es un expert en documentation technique. Ton rôle est de documenter :
- README.md complet avec exemples
- Commentaires de code clairs
- Documentation des API
- Guide d'installation et déploiement
- Exemples d'utilisation
- Troubleshooting et FAQ

Génère une documentation claire, concise et utile.`,priority:5},{id:"backend",name:"Backend Developer",role:"API, serveur, base de données",systemPrompt:`Tu es un développeur backend expert. Ton rôle est de créer :
- API REST avec Hono (Cloudflare Workers)
- Routes et middlewares
- Intégration base de données (Supabase, D1)
- Authentification et sécurité
- Gestion des sessions et tokens
- Rate limiting et caching

Génère des API sécurisées, performantes et scalables.`,priority:3},{id:"security",name:"Security Expert",role:"Sécurité, authentification, protection",systemPrompt:`Tu es un expert en sécurité web. Ton rôle est de sécuriser :
- Authentification (JWT, OAuth, sessions)
- Protection CSRF, XSS, injection SQL
- Validation et sanitization des inputs
- CORS et headers de sécurité
- Gestion des secrets et API keys
- Rate limiting et protection DDoS

Génère un code sécurisé selon les meilleures pratiques OWASP.`,priority:2},{id:"performance",name:"Performance Engineer",role:"Optimisation, performance, SEO",systemPrompt:`Tu es un expert en performance web. Ton rôle est d'optimiser :
- Lazy loading et code splitting
- Image optimization (formats modernes, responsive)
- Caching stratégies
- Bundle size optimization
- Core Web Vitals (LCP, FID, CLS)
- SEO (meta tags, sitemap, robots.txt)

Génère une application ultra-rapide et SEO-friendly.`,priority:4},{id:"devops",name:"DevOps Engineer",role:"Déploiement, CI/CD, monitoring",systemPrompt:`Tu es un expert DevOps. Ton rôle est de configurer :
- Déploiement Cloudflare Pages / Workers
- CI/CD avec GitHub Actions
- Environment variables et secrets
- Monitoring et logging
- Backup et disaster recovery
- Scaling et auto-healing

Génère une infrastructure cloud robuste et automatisée.`,priority:5},{id:"mobile",name:"Mobile Developer",role:"Responsive, PWA, mobile-first",systemPrompt:`Tu es un expert en développement mobile. Ton rôle est de créer :
- Design responsive (mobile-first)
- PWA (Progressive Web App) avec service workers
- Touch gestures et interactions mobiles
- Performance mobile (3G, 4G)
- Offline mode et caching
- App-like experience (splash screen, icons)

Génère une expérience mobile native-like.`,priority:3},{id:"seo",name:"SEO Specialist",role:"Référencement, meta tags, analytics",systemPrompt:`Tu es un expert SEO. Ton rôle est d'optimiser :
- Meta tags (title, description, OG, Twitter)
- Structured data (JSON-LD)
- Sitemap.xml et robots.txt
- Performance (Core Web Vitals)
- Analytics (Google Analytics, Plausible)
- Accessibility pour SEO

Génère une application parfaitement référencée.`,priority:4},{id:"accessibility",name:"Accessibility Expert",role:"Accessibilité, ARIA, navigation clavier",systemPrompt:`Tu es un expert en accessibilité (a11y). Ton rôle est d'assurer :
- ARIA labels et roles
- Navigation clavier complète
- Screen reader compatibility
- Contraste de couleurs (WCAG AAA)
- Focus management
- Alternative text et descriptions

Génère une application accessible à tous (WCAG 2.1 AAA).`,priority:4}])}selectAgents(e){var t,s,n,o,a;const i=[];return i.push(this.getAgent("architect"),this.getAgent("designer"),this.getAgent("developer")),((t=e.features)!=null&&t.includes("api")||e.database)&&i.push(this.getAgent("backend")),(e.authentication||(s=e.features)!=null&&s.includes("auth"))&&i.push(this.getAgent("security")),((n=e.features)!=null&&n.includes("seo")||e.appType==="landing-page")&&(i.push(this.getAgent("seo")),i.push(this.getAgent("performance"))),(e.target==="mobile"||(o=e.features)!=null&&o.includes("responsive"))&&i.push(this.getAgent("mobile")),((a=e.features)!=null&&a.includes("payment")||e.appType==="e-commerce")&&(i.push(this.getAgent("security")),i.push(this.getAgent("backend"))),i.push(this.getAgent("tester"),this.getAgent("documenter")),i.push(this.getAgent("accessibility")),Array.from(new Set(i)).sort((r,l)=>r.priority-l.priority)}createPlan(e){const i=this.selectAgents(e),t=e.complexity==="complex"?"sequential":"parallel",s=t==="parallel"?30:i.length*10;return{selectedAgents:i,executionMode:t,estimatedTime:s}}async execute(e,i,t="/api/generate"){const s=[];if(e.executionMode==="parallel"){const n=e.selectedAgents.map(a=>this.executeAgent(a,i,t));(await Promise.allSettled(n)).forEach((a,r)=>{a.status==="fulfilled"?s.push(a.value):s.push({agentId:e.selectedAgents[r].id,agentName:e.selectedAgents[r].name,output:`Erreur: ${a.reason}`,executionTime:0,success:!1})})}else for(const n of e.selectedAgents){const o=await this.executeAgent(n,i,t);s.push(o)}return s}async executeAgent(e,i,t){const s=Date.now();try{const n=this.buildPromptForAgent(e,i),o=await fetch(t,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:n,agentId:e.id,agentName:e.name,systemPrompt:e.systemPrompt})});if(!o.ok)throw new Error(`API Error: ${o.status}`);const a=await o.json(),r=Date.now()-s;return{agentId:e.id,agentName:e.name,output:a.code||a.response||"",executionTime:r,success:!0}}catch(n){return{agentId:e.id,agentName:e.name,output:`Erreur: ${n instanceof Error?n.message:"Unknown error"}`,executionTime:Date.now()-s,success:!1}}}buildPromptForAgent(e,i){var s;let t=`Tu es ${e.name}. ${e.role}

`;return t+=`**Contexte du projet :**
`,t+=`- Type d'application : ${i.appType||"Application web"}
`,t+=`- Stack technique : ${((s=i.stack)==null?void 0:s.join(", "))||"React, TypeScript, Tailwind CSS"}
`,t+=`- Design : ${i.design||"modern"}
`,i.features&&i.features.length>0&&(t+=`- Features : ${i.features.join(", ")}
`),i.database&&(t+=`- Base de données : Oui
`),i.authentication&&(t+=`- Authentification : Oui
`),i.uploadedFiles&&i.uploadedFiles.length>0&&(t+=`
**Fichiers fournis par l'utilisateur :**
`,i.uploadedFiles.forEach(n=>{t+=`
### ${n.name} (${n.type})
`,t+=`${n.content.substring(0,2e3)}...
`})),t+=`
**Ta mission :**
`,t+=`Génère le code ${e.role} pour cette application. Sois précis, professionnel et production-ready.
`,t}mergeResults(e,i){var n,o;const t=e.filter(a=>a.success);if(t.length===0)return`// Erreur: Aucun agent n'a pu générer de code
`;let s=`// ========================================
`;return s+=`// ${((n=i.appType)==null?void 0:n.toUpperCase())||"APPLICATION"} - Généré par CodeCraft Studio
`,s+=`// Stack: ${((o=i.stack)==null?void 0:o.join(", "))||"React + TypeScript + Tailwind"}
`,s+=`// ========================================

`,t.forEach(a=>{s+=`
// ========== ${a.agentName.toUpperCase()} ==========
`,s+=`// Temps d'exécution: ${a.executionTime}ms

`,s+=a.output,s+=`

`}),s}getAgent(e){const i=this.agents.find(t=>t.id===e);if(!i)throw new Error(`Agent '${e}' not found`);return i}getAllAgents(){return this.agents}}class v{constructor(){u(this,"intentAnalyzer");u(this,"clarificationEngine");u(this,"agentOrchestrator");u(this,"conversationState");this.intentAnalyzer=new m,this.clarificationEngine=new h,this.agentOrchestrator=new y,this.conversationState={awaitingClarification:!1}}async process(e,i){try{const{intent:t,requirements:s}=await this.intentAnalyzer.analyze(e,i);return this.conversationState.awaitingClarification?await this.handleClarificationResponse(e):t.type==="question"?{type:"clarification",message:this.generateQuestionResponse(e)}:t.needsClarification?this.requestClarification(t,s):await this.executeGeneration(s)}catch(t){return{type:"error",message:`Erreur: ${t instanceof Error?t.message:"Unknown error"}`}}}requestClarification(e,i){const t=this.clarificationEngine.generateQuestions(e,i);return this.conversationState={awaitingClarification:!0,currentIntent:e,currentRequirements:i},{type:"clarification",message:t.questions.join(`

`),requirements:i}}async handleClarificationResponse(e){if(!this.conversationState.currentRequirements)return{type:"error",message:"Erreur: État de clarification invalide"};const i=this.clarificationEngine.parseUserResponse(e,this.conversationState.currentRequirements);return this.conversationState.awaitingClarification=!1,await this.executeGeneration(i)}async executeGeneration(e){const i=this.agentOrchestrator.createPlan(e),t=this.generatePlanMessage(i,e),s=await this.agentOrchestrator.execute(i,e),n=this.agentOrchestrator.mergeResults(s,e),o=this.generateExecutionMessage(s,e);return{type:"execution",message:t+`

`+o,code:n,requirements:e,agentResults:s,executionPlan:t}}generatePlanMessage(e,i){var o;const t=i.appType||"Application web",s=((o=i.stack)==null?void 0:o.join(", "))||"React, TypeScript, Tailwind CSS";let n=`✅ **Parfait ! Je vais créer votre ${t}**

`;return n+=`📦 **Stack technique :**
`,n+=`- ${s}
`,i.design&&(n+=`- Design : ${i.design}
`),i.features&&i.features.length>0&&(n+=`
🎨 **Features incluses :**
`,i.features.forEach(a=>{n+=`- ${a}
`})),n+=`
🤖 **Agents mobilisés (${e.selectedAgents.length}) :**
`,e.selectedAgents.forEach(a=>{n+=`- ${a.name} (${a.role})
`}),n+=`
⚡ **Mode d'exécution :** ${e.executionMode==="parallel"?"Parallèle (rapide)":"Séquentiel (précis)"}
`,n+=`⏱️ **Temps estimé :** ~${e.estimatedTime}s
`,n+=`
🚀 **Génération en cours...**`,n}generateExecutionMessage(e,i){const t=e.filter(a=>a.success).length,s=e.length;let n=`

✅ **Génération terminée !**

`;n+=`📊 **Résumé :**
`,n+=`- ${t}/${s} agents ont réussi
`;const o=e.reduce((a,r)=>a+r.executionTime,0);return n+=`- Temps total : ${(o/1e3).toFixed(2)}s
`,n+=`
💻 **Code généré :**
`,n+=`- Structure complète de projet
`,n+=`- Composants React + TypeScript
`,n+=`- Styles Tailwind CSS
`,n+=`- Configuration Vite
`,i.features&&i.features.length>0&&(n+=`
✨ **Features implémentées :**
`,i.features.forEach(a=>{n+=`- ${a}
`})),n+=`
📝 **Prochaines étapes :**
`,n+=`1. Consulter le code généré dans l'éditeur
`,n+=`2. Tester l'application dans la preview
`,n+=`3. Demander des modifications si nécessaire
`,n+=`4. Exporter ou déployer le projet
`,n}generateQuestionResponse(e){const i=e.toLowerCase();return i.includes("comment")||i.includes("aide")?`💡 **Aide - Comment utiliser CodeCraft Studio ?**

Je suis votre assistant développeur IA. Voici ce que je peux faire :

**Créer des applications :**
- "Crée une landing page moderne pour une startup SaaS"
- "Je veux un e-commerce avec paiement Stripe"
- "Génère un dashboard admin avec authentification"

**Fonctionnalités :**
- Upload de fichiers Word/Excel/PowerPoint pour générer des apps basées sur vos documents
- Génération intelligente avec multi-agents (Design, Code, Test, Doc, etc.)
- Preview live instantanée
- Export en ZIP ou déploiement direct

**Exemples de commandes :**
- "Crée une application [type] avec [features]"
- "Ajoute l'authentification Google"
- "Modifie le design en version minimale"
- "Génère 3 variations de cette page"

Que voulez-vous créer aujourd'hui ? 🚀`:`Je suis prêt à créer votre application ! Décrivez-moi ce que vous voulez, ou demandez de l'aide en tapant "aide" ou "comment ça marche".`}resetState(){this.conversationState={awaitingClarification:!1}}}export{v as AIDeveloper};
//# sourceMappingURL=aiDeveloper-CA2nPlXc.js.map
