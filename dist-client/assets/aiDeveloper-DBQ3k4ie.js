var b=Object.defineProperty;var v=(r,e,t)=>e in r?b(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var p=(r,e,t)=>v(r,typeof e!="symbol"?e+"":e,t);class A{async analyze(e,t){const s=e.toLowerCase(),i=this.detectIntent(s),n=this.extractRequirements(s,t),a=this.evaluateClarificationNeeds(i,n);return{intent:{...i,needsClarification:a.needed,clarificationQuestions:a.questions},requirements:n}}detectIntent(e){const t=["créer","faire","générer","construire","développer","app","site","application"],s=["modifier","changer","améliorer","ajouter","supprimer","corriger"],i=["comment","pourquoi","qu'est-ce","est-ce que","peux-tu","?"];let n="question",a=0;return t.some(o=>e.includes(o))&&(n="create_app",a=.8),s.some(o=>e.includes(o))&&(n="modify_app",a=.7),i.some(o=>e.includes(o))&&!t.some(o=>e.includes(o))&&(n="question",a=.6),{type:n,confidence:a,detectedFeatures:this.detectFeatures(e),detectedStack:this.detectStack(e),complexity:this.detectComplexity(e),needsClarification:!1,clarificationQuestions:[]}}extractRequirements(e,t){const s={};return e.includes("e-commerce")||e.includes("boutique")||e.includes("shop")?s.appType="e-commerce":e.includes("landing")||e.includes("page d'accueil")?s.appType="landing-page":e.includes("dashboard")||e.includes("tableau de bord")?s.appType="dashboard":e.includes("portfolio")?s.appType="portfolio":e.includes("blog")?s.appType="blog":(e.includes("crm")||e.includes("gestion"))&&(s.appType="crm"),s.features=this.detectFeatures(e),s.stack=this.detectStack(e),e.includes("minimal")?s.design="minimal":e.includes("moderne")||e.includes("animé")?s.design="modern":(e.includes("corporate")||e.includes("professionnel"))&&(s.design="corporate"),s.database=e.includes("base de données")||e.includes("database")||e.includes("db"),s.authentication=e.includes("auth")||e.includes("connexion")||e.includes("login")||e.includes("utilisateur"),t&&t.length>0&&(s.uploadedFiles=t),s}detectFeatures(e){const t=[],s={auth:["authentification","connexion","login","inscription","register"],payment:["paiement","payment","stripe","paypal","checkout"],crud:["crud","créer","modifier","supprimer","gestion"],realtime:["temps réel","realtime","live","instantané"],search:["recherche","search","filtre","filter"],upload:["upload","télécharger","fichier","image"],api:["api","backend","serveur"],responsive:["responsive","mobile","tablette","adaptatif"],seo:["seo","référencement","meta"],analytics:["analytics","statistiques","tracking"]};for(const[i,n]of Object.entries(s))n.some(a=>e.includes(a))&&t.push(i);return t}detectStack(e){const t=["React","TypeScript","Tailwind CSS"];return e.includes("vue")&&t.push("Vue.js"),e.includes("angular")&&t.push("Angular"),e.includes("svelte")&&t.push("Svelte"),e.includes("node")&&t.push("Node.js"),e.includes("express")&&t.push("Express"),e.includes("next")&&t.push("Next.js"),e.includes("supabase")&&t.push("Supabase"),e.includes("firebase")&&t.push("Firebase"),t}detectComplexity(e){const t=this.detectFeatures(e);return t.length<=2?"simple":t.length<=5?"medium":"complex"}evaluateClarificationNeeds(e,t){var i,n;const s=[];return!t.appType&&e.type==="create_app"&&s.push("Quel type d'application voulez-vous créer ? (e-commerce, landing page, dashboard, portfolio, blog, CRM)"),(i=t.features)!=null&&i.includes("payment")&&s.push("Quel système de paiement préférez-vous ? (Stripe, PayPal, ou les deux)"),t.database&&!((n=t.stack)!=null&&n.some(a=>a.includes("Supabase")||a.includes("Firebase")))&&s.push("Voulez-vous utiliser Supabase, Firebase, ou une autre base de données ?"),!t.design&&e.type==="create_app"&&s.push("Quel style de design préférez-vous ? (minimal, moderne/animé, corporate/professionnel)"),{needed:s.length>0,questions:s}}}class T{generateQuestions(e,t){var o,c,u,d,l;const s=[],i={};return!t.appType&&e.type==="create_app"&&(s.push(`📱 **Quel type d'application voulez-vous créer ?**
- E-commerce
- Landing Page
- Dashboard
- Portfolio
- Blog
- CRM / Gestion
- Autre (précisez)`),i.appType="landing-page"),t.design||(s.push(`🎨 **Quel style de design préférez-vous ?**
- Minimal (épuré, sobre)
- Moderne (animations, gradients)
- Corporate (professionnel, sérieux)`),i.design="modern"),t.appType==="e-commerce"&&((o=t.features)!=null&&o.includes("payment")||(s.push(`💳 **Système de paiement ?**
- Stripe
- PayPal
- Les deux
- Aucun pour l'instant`),i.payment="stripe"),t.database||(s.push(`📦 **Gestion de l'inventaire ?**
- Oui, avec base de données (Supabase)
- Non, données statiques pour l'instant`),i.database=!0)),((c=t.features)!=null&&c.includes("auth")||t.authentication)&&(s.push(`🔐 **Type d'authentification ?**
- Email/Password
- OAuth (Google, GitHub)
- Les deux`),i.authType="both"),(u=t.features)!=null&&u.includes("responsive")||(s.push(`📱 **Compatibilité mobile ?**
- Oui, responsive design
- Desktop uniquement`),i.responsive=!0),((d=t.features)!=null&&d.includes("api")||(l=t.features)!=null&&l.includes("crud"))&&(s.push(`⚙️ **Backend nécessaire ?**
- Oui, avec API REST
- Non, frontend uniquement
- Serverless (Cloudflare Workers)`),i.backend="serverless"),s.length===0?{needsClarification:!1,questions:[]}:{needsClarification:!0,questions:[`📋 **J'ai besoin de quelques précisions pour créer l'application parfaite pour vous :**

`+s.join(`

`)+`

💡 **Vous pouvez répondre simplement, ou me dire "utilise les options par défaut" si vous voulez que je décide.**`],suggestedDefaults:i}}parseUserResponse(e,t){var n;const s=e.toLowerCase(),i={...t};return s.includes("défaut")||s.includes("default")||s.includes("décide")?{...i,appType:i.appType||"landing-page",design:i.design||"modern",stack:i.stack||["React","TypeScript","Tailwind CSS"],features:[...i.features||[],"responsive","seo"],database:i.database??!1,authentication:i.authentication??!1}:(s.includes("e-commerce")||s.includes("boutique")?i.appType="e-commerce":s.includes("landing")?i.appType="landing-page":s.includes("dashboard")||s.includes("tableau")?i.appType="dashboard":s.includes("portfolio")?i.appType="portfolio":s.includes("blog")?i.appType="blog":(s.includes("crm")||s.includes("gestion"))&&(i.appType="crm"),s.includes("minimal")||s.includes("épuré")?i.design="minimal":s.includes("moderne")||s.includes("animé")?i.design="modern":(s.includes("corporate")||s.includes("professionnel"))&&(i.design="corporate"),s.includes("stripe")&&(i.features=[...i.features||[],"payment-stripe"]),s.includes("paypal")&&(i.features=[...i.features||[],"payment-paypal"]),(s.includes("base de données")||s.includes("database")||s.includes("supabase"))&&(i.database=!0,(n=i.stack)!=null&&n.includes("Supabase")||(i.stack=[...i.stack||[],"Supabase"])),(s.includes("auth")||s.includes("connexion")||s.includes("login"))&&(i.authentication=!0,i.features=[...i.features||[],"auth"]),(s.includes("responsive")||s.includes("mobile")||s.includes("oui"))&&(i.features=[...i.features||[],"responsive"]),i)}}const f=class f{constructor(){p(this,"logs",[]);p(this,"listeners",[])}static getInstance(){return f.instance||(f.instance=new f),f.instance}addListener(e){this.listeners.push(e)}removeListener(e){this.listeners=this.listeners.filter(t=>t!==e)}log(e,t,s){const i={id:`log-${Date.now()}-${Math.random().toString(36).substring(7)}`,level:e,message:t,timestamp:Date.now(),data:s};this.logs.push(i),this.listeners.forEach(a=>a(i)),console[e==="error"?"error":e==="warn"?"warn":"log"](`[${e.toUpperCase()}] ${t}`,s)}logAgent(e,t,s,i,n){const a={id:`log-${Date.now()}-${Math.random().toString(36).substring(7)}`,level:"info",message:s,timestamp:Date.now(),agentId:e,agentName:t,data:i,duration:n};this.logs.push(a),this.listeners.forEach(o=>o(a)),console.log(`[AGENT:${t}] ${s}`,i)}info(e,t){this.log("info",e,t)}warn(e,t){this.log("warn",e,t)}error(e,t){this.log("error",e,t)}success(e,t){this.log("success",e,t)}debug(e,t){this.log("debug",e,t)}getLogs(){return[...this.logs]}getAgentLogs(e){return this.logs.filter(t=>t.agentId===e)}clear(){this.logs=[],this.info("Logs cleared")}export(){return JSON.stringify(this.logs,null,2)}};p(f,"instance");let m=f;const g=m.getInstance();class S{constructor(){p(this,"agents",[{id:"architect",name:"Architecte",role:"Structure et architecture de l'application",systemPrompt:`Tu es un architecte logiciel expert. Ton rôle est de concevoir la structure complète de l'application : 
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

Génère une application accessible à tous (WCAG 2.1 AAA).`,priority:4}])}selectAgents(e){var s,i,n,a,o;const t=[];return t.push(this.getAgent("architect"),this.getAgent("designer"),this.getAgent("developer")),((s=e.features)!=null&&s.includes("api")||e.database)&&t.push(this.getAgent("backend")),(e.authentication||(i=e.features)!=null&&i.includes("auth"))&&t.push(this.getAgent("security")),((n=e.features)!=null&&n.includes("seo")||e.appType==="landing-page")&&(t.push(this.getAgent("seo")),t.push(this.getAgent("performance"))),(e.target==="mobile"||(a=e.features)!=null&&a.includes("responsive"))&&t.push(this.getAgent("mobile")),((o=e.features)!=null&&o.includes("payment")||e.appType==="e-commerce")&&(t.push(this.getAgent("security")),t.push(this.getAgent("backend"))),t.push(this.getAgent("tester"),this.getAgent("documenter")),t.push(this.getAgent("accessibility")),Array.from(new Set(t)).sort((c,u)=>c.priority-u.priority)}createPlan(e){const t=this.selectAgents(e),s=e.complexity==="complex"?"sequential":"parallel",i=s==="parallel"?30:t.length*10;return{selectedAgents:t,executionMode:s,estimatedTime:i}}async execute(e,t,s="/api/generate"){const i=[];if(e.executionMode==="parallel"){const a=e.selectedAgents.map(c=>this.executeAgent(c,t,s));(await Promise.allSettled(a)).forEach((c,u)=>{c.status==="fulfilled"?i.push(c.value):i.push({agentId:e.selectedAgents[u].id,agentName:e.selectedAgents[u].name,output:`Erreur: ${c.reason}`,executionTime:0,success:!1})})}else{g.info("🔗 Exécution séquentielle des agents");for(const a of e.selectedAgents){const o=await this.executeAgent(a,t,s);i.push(o)}}const n=i.filter(a=>a.success).length;return g.success(`✅ Exécution terminée: ${n}/${i.length} agents réussis`,{results:i.map(a=>({agent:a.agentName,success:a.success,duration:a.executionTime}))}),i}async executeAgent(e,t,s){const i=Date.now();g.logAgent(e.id,e.name,"🔄 Démarrage de l'exécution...");try{const n=this.buildPromptForAgent(e,t);g.logAgent(e.id,e.name,`📝 Prompt construit (${n.length} caractères)`),g.logAgent(e.id,e.name,"🌐 Appel API...");const a=await fetch(s,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:n,agentId:e.id,agentName:e.name,systemPrompt:e.systemPrompt})});if(!a.ok)throw new Error(`API Error: ${a.status}`);const o=await a.json(),c=Date.now()-i;return g.logAgent(e.id,e.name,"✅ Exécution réussie",{outputLength:(o.code||o.response||"").length},c),{agentId:e.id,agentName:e.name,output:o.code||o.response||"",executionTime:c,success:!0}}catch(n){const a=Date.now()-i,o=n instanceof Error?n.message:"Unknown error";return g.logAgent(e.id,e.name,`❌ Erreur: ${o}`,{error:n},a),{agentId:e.id,agentName:e.name,output:`Erreur: ${o}`,executionTime:a,success:!1}}}buildPromptForAgent(e,t){var i;let s=`Tu es ${e.name}. ${e.role}

`;return s+=`**Contexte du projet :**
`,s+=`- Type d'application : ${t.appType||"Application web"}
`,s+=`- Stack technique : ${((i=t.stack)==null?void 0:i.join(", "))||"React, TypeScript, Tailwind CSS"}
`,s+=`- Design : ${t.design||"modern"}
`,t.features&&t.features.length>0&&(s+=`- Features : ${t.features.join(", ")}
`),t.database&&(s+=`- Base de données : Oui
`),t.authentication&&(s+=`- Authentification : Oui
`),t.uploadedFiles&&t.uploadedFiles.length>0&&(s+=`
**Fichiers fournis par l'utilisateur :**
`,t.uploadedFiles.forEach(n=>{s+=`
### ${n.name} (${n.type})
`,s+=`${n.content.substring(0,2e3)}...
`})),s+=`
**Ta mission :**
`,s+=`Génère le code ${e.role} pour cette application. Sois précis, professionnel et production-ready.
`,s}mergeResults(e,t){var n,a;const s=e.filter(o=>o.success);if(s.length===0)return`// Erreur: Aucun agent n'a pu générer de code
`;let i=`// ========================================
`;return i+=`// ${((n=t.appType)==null?void 0:n.toUpperCase())||"APPLICATION"} - Généré par CodeCraft Studio
`,i+=`// Stack: ${((a=t.stack)==null?void 0:a.join(", "))||"React + TypeScript + Tailwind"}
`,i+=`// ========================================

`,s.forEach(o=>{i+=`
// ========== ${o.agentName.toUpperCase()} ==========
`,i+=`// Temps d'exécution: ${o.executionTime}ms

`,i+=o.output,i+=`

`}),i}getAgent(e){const t=this.agents.find(s=>s.id===e);if(!t)throw new Error(`Agent '${e}' not found`);return t}getAllAgents(){return this.agents}}class h extends Error{constructor(e,t,s=500,i){super(t),this.code=e,this.message=t,this.statusCode=s,this.details=i,this.name="AppError"}}class y extends h{constructor(e,t){super("VALIDATION_ERROR",e,400,t),this.name="ValidationError"}}function x(r){return r instanceof h?`❌ **${r.name}**

${r.message}${r.details?`

Détails: ${JSON.stringify(r.details,null,2)}`:""}`:r instanceof Error?`❌ **Erreur**

${r.message}`:`❌ **Erreur inconnue**

Une erreur inattendue est survenue.`}function C(r,e){const t=new Date().toISOString(),s=`[${e}]`;console.error(`${t} ${s} Error:`,r),r instanceof h&&(console.error(`  Code: ${r.code}`),console.error(`  Status: ${r.statusCode}`),r.details&&console.error("  Details:",r.details))}function w(r){const e=[],t=[];if(!r||r.trim().length===0)return e.push("Le code généré est vide"),{isValid:!1,errors:e,warnings:t};r.includes("<html")||t.push("Pas de balise <html> détectée"),r.includes("<head")||t.push("Pas de balise <head> détectée"),r.includes("<body")||t.push("Pas de balise <body> détectée");const s=r.match(/<(?!\/)[\w-]+(?:\s[^>]*)?>/g)||[],i=r.match(/<\/[\w-]+>/g)||[],n=s.map(d=>{var l;return(l=d.match(/^<([\w-]+)/))==null?void 0:l[1]}).filter(Boolean),a=i.map(d=>{var l;return(l=d.match(/^<\/([\w-]+)>/))==null?void 0:l[1]}).filter(Boolean),o=["br","hr","img","input","meta","link"],c=n.filter(d=>!o.includes(d||"")&&n.filter(l=>l===d).length>a.filter(l=>l===d).length);c.length>0&&t.push(`Balises potentiellement non fermées: ${c.join(", ")}`),(r.includes("<script>alert")||r.includes("javascript:"))&&t.push("Code JavaScript potentiellement dangereux détecté");const u=(r.match(/style\s*=\s*"/g)||[]).length;return u>10&&t.push(`Beaucoup de styles inline (${u}). Considérez utiliser des classes CSS.`),{isValid:e.length===0,errors:e,warnings:t,sanitized:r}}function E(r){let e=r;return["onerror","onload","onclick","onmouseover"].forEach(s=>{const i=new RegExp(`${s}\\s*=\\s*["'][^"']*["']`,"gi");e=e.replace(i,"")}),e=e.replace(/javascript:/gi,""),e=e.replace(/data:text\/html/gi,""),e}function $(r,e,t){const s=w(r),i={isValid:!0,errors:[],warnings:[]},n={isValid:!0,errors:[],warnings:[]};return{isValid:s.isValid&&i.isValid&&n.isValid,errors:[...s.errors.map(a=>`HTML: ${a}`),...i.errors.map(a=>`CSS: ${a}`),...n.errors.map(a=>`JS: ${a}`)],warnings:[...s.warnings.map(a=>`HTML: ${a}`),...i.warnings.map(a=>`CSS: ${a}`),...n.warnings.map(a=>`JS: ${a}`)],sanitized:E(r)}}function P(r){if(r.isValid&&r.warnings.length===0)return"✅ **Code valide** - Aucun problème détecté";let e="";return r.isValid||(e+=`❌ **Erreurs détectées**

`,r.errors.forEach((t,s)=>{e+=`${s+1}. ${t}
`}),e+=`
`),r.warnings.length>0&&(e+=`⚠️  **Avertissements**

`,r.warnings.forEach((t,s)=>{e+=`${s+1}. ${t}
`})),e}class k{constructor(){p(this,"intentAnalyzer");p(this,"clarificationEngine");p(this,"agentOrchestrator");p(this,"conversationState");this.intentAnalyzer=new A,this.clarificationEngine=new T,this.agentOrchestrator=new S,this.conversationState={awaitingClarification:!1}}async process(e,t){try{if(!e||e.trim().length===0)throw new y("Le prompt ne peut pas être vide");if(e.length>1e4)throw new y("Le prompt est trop long (maximum 10000 caractères)");const{intent:s,requirements:i}=await this.intentAnalyzer.analyze(e,t);return this.conversationState.awaitingClarification?await this.handleClarificationResponse(e):s.type==="question"?{type:"clarification",message:this.generateQuestionResponse(e)}:s.needsClarification?this.requestClarification(s,i):await this.executeGeneration(i)}catch(s){return C(s,"AIDeveloper.process"),{type:"error",message:x(s)}}}requestClarification(e,t){const s=this.clarificationEngine.generateQuestions(e,t);return this.conversationState={awaitingClarification:!0,currentIntent:e,currentRequirements:t},{type:"clarification",message:s.questions.join(`

`),requirements:t}}async handleClarificationResponse(e){if(!this.conversationState.currentRequirements)return{type:"error",message:"Erreur: État de clarification invalide"};const t=this.clarificationEngine.parseUserResponse(e,this.conversationState.currentRequirements);return this.conversationState.awaitingClarification=!1,await this.executeGeneration(t)}async executeGeneration(e){const t=this.agentOrchestrator.createPlan(e),s=this.generatePlanMessage(t,e),i=await this.agentOrchestrator.execute(t,e),n=this.agentOrchestrator.mergeResults(i,e),a=$(n),o=P(a),c=this.generateExecutionMessage(i,e);return{type:"execution",message:s+`

`+c+`

`+o,code:a.sanitized||n,requirements:e,agentResults:i,executionPlan:s}}generatePlanMessage(e,t){var a;const s=t.appType||"Application web",i=((a=t.stack)==null?void 0:a.join(", "))||"React, TypeScript, Tailwind CSS";let n=`✅ **Parfait ! Je vais créer votre ${s}**

`;return n+=`📦 **Stack technique :**
`,n+=`- ${i}
`,t.design&&(n+=`- Design : ${t.design}
`),t.features&&t.features.length>0&&(n+=`
🎨 **Features incluses :**
`,t.features.forEach(o=>{n+=`- ${o}
`})),n+=`
🤖 **Agents mobilisés (${e.selectedAgents.length}) :**
`,e.selectedAgents.forEach(o=>{n+=`- ${o.name} (${o.role})
`}),n+=`
⚡ **Mode d'exécution :** ${e.executionMode==="parallel"?"Parallèle (rapide)":"Séquentiel (précis)"}
`,n+=`⏱️ **Temps estimé :** ~${e.estimatedTime}s
`,n+=`
🚀 **Génération en cours...**`,n}generateExecutionMessage(e,t){const s=e.filter(o=>o.success).length,i=e.length;let n=`

✅ **Génération terminée !**

`;n+=`📊 **Résumé :**
`,n+=`- ${s}/${i} agents ont réussi
`;const a=e.reduce((o,c)=>o+c.executionTime,0);return n+=`- Temps total : ${(a/1e3).toFixed(2)}s
`,n+=`
💻 **Code généré :**
`,n+=`- Structure complète de projet
`,n+=`- Composants React + TypeScript
`,n+=`- Styles Tailwind CSS
`,n+=`- Configuration Vite
`,t.features&&t.features.length>0&&(n+=`
✨ **Features implémentées :**
`,t.features.forEach(o=>{n+=`- ${o}
`})),n+=`
📝 **Prochaines étapes :**
`,n+=`1. Consulter le code généré dans l'éditeur
`,n+=`2. Tester l'application dans la preview
`,n+=`3. Demander des modifications si nécessaire
`,n+=`4. Exporter ou déployer le projet
`,n}generateQuestionResponse(e){const t=e.toLowerCase();return t.includes("comment")||t.includes("aide")?`💡 **Aide - Comment utiliser CodeCraft Studio ?**

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

Que voulez-vous créer aujourd'hui ? 🚀`:`Je suis prêt à créer votre application ! Décrivez-moi ce que vous voulez, ou demandez de l'aide en tapant "aide" ou "comment ça marche".`}resetState(){this.conversationState={awaitingClarification:!1}}}export{k as AIDeveloper};
//# sourceMappingURL=aiDeveloper-DBQ3k4ie.js.map
