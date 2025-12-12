var m=Object.defineProperty;var f=(r,e,t)=>e in r?m(r,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):r[e]=t;var a=(r,e,t)=>f(r,typeof e!="symbol"?e+"":e,t);class d extends Error{constructor(e,t,s=500,o){super(t),this.code=e,this.message=t,this.statusCode=s,this.details=o,this.name="AppError"}}class p extends d{constructor(e,t){super("VALIDATION_ERROR",e,400,t),this.name="ValidationError"}}function w(r){return r instanceof d?`❌ **${r.name}**

${r.message}${r.details?`

Détails: ${JSON.stringify(r.details,null,2)}`:""}`:r instanceof Error?`❌ **Erreur**

${r.message}`:`❌ **Erreur inconnue**

Une erreur inattendue est survenue.`}function g(r,e){const t=new Date().toISOString(),s=e?`[${e}]`:"";console.error(`${t} ${s} Error:`,r),r instanceof d&&(console.error(`  Code: ${r.code}`),console.error(`  Status: ${r.statusCode}`),r.details&&console.error("  Details:",r.details))}const i=class i{constructor(){a(this,"logs",[]);a(this,"listeners",[])}static getInstance(){return i.instance||(i.instance=new i),i.instance}addListener(e){this.listeners.push(e)}removeListener(e){this.listeners=this.listeners.filter(t=>t!==e)}log(e,t,s){const o={id:`log-${Date.now()}-${Math.random().toString(36).substring(7)}`,level:e,message:t,timestamp:Date.now(),data:s};this.logs.push(o),this.listeners.forEach(n=>n(o)),console[e==="error"?"error":e==="warn"?"warn":"log"](`[${e.toUpperCase()}] ${t}`,s)}logAgent(e,t,s,o,l){const n={id:`log-${Date.now()}-${Math.random().toString(36).substring(7)}`,level:"info",message:s,timestamp:Date.now(),agentId:e,agentName:t,data:o,duration:l};this.logs.push(n),this.listeners.forEach(h=>h(n)),console.log(`[AGENT:${t}] ${s}`,o)}info(e,t){this.log("info",e,t)}warn(e,t){this.log("warn",e,t)}error(e,t){this.log("error",e,t)}success(e,t){this.log("success",e,t)}debug(e,t){this.log("debug",e,t)}getLogs(){return[...this.logs]}getAgentLogs(e){return this.logs.filter(t=>t.agentId===e)}clear(){this.logs=[],this.info("Logs cleared")}export(){return JSON.stringify(this.logs,null,2)}};a(i,"instance");let u=i;const c=u.getInstance();class E{async process(e,t){try{if(!e||e.trim().length===0)throw new p("Le prompt ne peut pas être vide");if(e.length>1e4)throw new p("Le prompt est trop long (maximum 10000 caractères)");return this.isSimpleQuestion(e)?{type:"clarification",message:this.generateQuestionResponse(e)}:(c.info("🚀 Génération directe avec Claude (mode simplifié)"),await this.generateDirect(e,t))}catch(s){return g(s,"AIDeveloper.process"),{type:"error",message:w(s)}}}async generateDirect(e,t){try{c.info("⚡ [CLAUDE MODE] Appel API direct");const s=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:e,agent:"design",conversation:[]})});if(!s.ok)throw new Error(`API error: ${s.status}`);const o=await s.json();if(!o.code)throw new Error("No code returned from API");return c.info("✅ [CLAUDE MODE] Code généré:",o.code.length,"chars"),{type:"execution",message:o.message||`✅ **Application générée avec succès !**

Votre application est prête dans le Preview.`,code:o.code,executionPlan:"⚡ Génération directe avec Claude"}}catch(s){return g(s,"AIDeveloper.generateDirect"),{type:"error",message:"❌ Erreur lors de la génération. Veuillez réessayer ou reformuler votre demande."}}}isSimpleQuestion(e){const t=e.toLowerCase();return["créer","crée","créé","cree","faire","fais","fait","générer","génère","construire","développer","développe","app","application","site","page","dashboard","todo","formulaire","form","landing","portfolio","blog"].some(n=>t.includes(n))?!1:["comment","pourquoi","qu'est-ce","aide","help"].some(n=>t.includes(n))}generateQuestionResponse(e){const t=e.toLowerCase();return t.includes("comment")||t.includes("aide")?`💡 **Aide - Comment utiliser CodeCraft Studio ?**

Je suis votre assistant développeur IA. Voici ce que je peux faire :

**Créer des applications :**
- "Crée une landing page moderne"
- "Je veux un dashboard e-commerce"
- "Génère une todo list avec React"

**Exemples de commandes :**
- "Crée une application [type] avec [features]"
- "Landing page minimale"
- "Dashboard avec graphiques"
- "Formulaire de contact"

**Que voulez-vous créer aujourd'hui ? 🚀**`:`Je suis prêt à créer votre application ! Décrivez-moi ce que vous voulez, ou demandez de l'aide en tapant "aide" ou "comment ça marche".`}resetState(){c.info("🔄 État réinitialisé")}}export{E as AIDeveloper};
