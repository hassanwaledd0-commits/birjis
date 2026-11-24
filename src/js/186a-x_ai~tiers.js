/* ---------- Meyslon's AI in three tiers (prefix ai) ----------
   (a) Claude inside the page: window.claude.use("sample") when the page runs as a Claude artifact.
   (b) the site's own server: POST to the address in <meta name="birjis-ai"> (netlify/functions/ask.mjs). The key lives in Netlify's
       environment variables (ANTHROPIC_API_KEY), never in the page. The meta tag is written by tools/mksite.py from site.config.json,
       so the Claude artifact copy (dist/aircraft-atlas.html) has no tier (b).
   (c) offline: an answer built from the site's own content (x_ai~local.js), with buttons to the lesson / part / term / AMM card.
   getSample() returns ONE function with the contract of sample: sm(prompt,{signal,onText,images,local,kind}) -> {text,tier,links,note}.
   A tier that fails (rate_limited, not_granted, network, not deployed, empty answer) is skipped for a while and the next one answers.
   opts.local: () => {text,links} | string | null, the offline answer for this request. Without it the error code "offline" reaches the caller
   (the flight coach then keeps its rule-based advice). Pictures (opts.images) need tier a or b; with neither the error code is "no_vision". */
const AI={raw:undefined, aDown:0, bDown:0, last:"", note:"", busy:0};
const AI_MAXP=20000;   /* = MAX_PROMPT of the server function */
function aiErr(code){ const e=new Error(code); e.code=code; if(code==="aborted") e.name="AbortError"; return e; }
function aiEndpoint(){
  try{ if(!/^https?:$/.test(location.protocol)) return "";
    const m=document.querySelector('meta[name="birjis-ai"]'), u=m&&m.getAttribute("content")||"";
    return /^\/[A-Za-z0-9_\/-]+$/.test(u)?u:""; }catch(e){ return ""; }
}
async function aiRawA(){
  if(AI.raw!==undefined) return AI.raw;
  try{ AI.raw=(window.claude&&window.claude.use)?((await window.claude.use("sample"))||null):null; }catch(e){ AI.raw=null; }
  return AI.raw;
}
/* the tier that will most likely answer the next question */
function aiPredict(){ const t=Date.now(); if(AI.raw&&AI.aDown<t) return "a"; if(aiEndpoint()&&AI.bDown<t) return "b"; return "c"; }
function aiCanSee(){ const t=Date.now(); return !!((AI.raw&&AI.aDown<t)||(aiEndpoint()&&AI.bDown<t)); }
function aiLangPrompt(p){ try{ if(IL.lang==="en"&&typeof IL_AI_EN==="string") return p+IL_AI_EN; }catch(e){} return p; }
const aiStopped=o=>!!(o.signal&&o.signal.aborted);
const AI_NOTE={
  aGrant:"لم تتم الموافقة على استخدام Claude في هذه الصفحة، فانتقلت للوضع التالي.",
  aLimit:"وصل Claude داخل الصفحة إلى حد الاستخدام مؤقتاً، فانتقلت للوضع التالي.",
  aFail:"تعذّر الوصول إلى Claude داخل الصفحة، فانتقلت للوضع التالي.",
  bLimit:"خادم الموقع مشغول بطلبات كثيرة الآن، فأجبتك من محتوى الموقع.",
  bOff:"خادم الذكاء الاصطناعي غير مفعّل في هذا النشر، فأجبتك من محتوى الموقع.",
  bFail:"تعذّر الوصول إلى خادم الموقع (الشبكة؟)، فأجبتك من محتوى الموقع."
};
async function aiTryA(p,o){
  const sm=await aiRawA(); if(!sm||AI.aDown>Date.now()) return null;
  if(o.images&&o.images.length&&sm.limits){ try{ const l=await sm.limits(); if(l&&l.images===false) return null; }catch(e){} }
  try{
    const r=await sm(p,{signal:o.signal,cache:false,onText:o.onText,images:o.images});
    const t=String(r&&r.text||"").trim(); if(t) return {text:t,tier:"a"};
    AI.aDown=Date.now()+15e3; AI.note=AI_NOTE.aFail; return null;
  }catch(e){
    if(aiStopped(o)) throw aiErr("aborted");
    const c=e&&e.code; if(c==="aborted") throw aiErr("aborted");
    AI.aDown=Date.now()+(c==="not_granted"?30*60e3:c==="rate_limited"?60e3:15e3);
    AI.note=c==="not_granted"?AI_NOTE.aGrant:c==="rate_limited"?AI_NOTE.aLimit:AI_NOTE.aFail; return null;
  }
}
function aiB64(file){ return new Promise((ok,no)=>{ const r=new FileReader(); r.onload=()=>{ const s=String(r.result||""), i=s.indexOf(","); ok({media_type:file.type||"image/jpeg",data:s.slice(i+1)}); }; r.onerror=()=>no(r.error); r.readAsDataURL(file); }); }
async function aiTryB(p,o){
  const ep=aiEndpoint(); if(!ep||AI.bDown>Date.now()) return null;
  const body={prompt:p.slice(0,AI_MAXP),kind:o.kind||"chat",lang:(typeof IL!=="undefined"&&IL.lang)||"ar"};
  if(o.images&&o.images.length){ try{ body.image=await aiB64(o.images[0]); }catch(e){ return null; } }
  const ctl=new AbortController(), stop=()=>ctl.abort(), to=setTimeout(stop,40000);
  if(o.signal) o.signal.addEventListener("abort",stop,{once:true});
  let res=null, j=null;
  try{
    res=await fetch(ep,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body),signal:ctl.signal,credentials:"same-origin",cache:"no-store"});
    try{ j=await res.json(); }catch(e){ j=null; }
  }catch(e){ if(aiStopped(o)) throw aiErr("aborted"); }
  finally{ clearTimeout(to); if(o.signal) o.signal.removeEventListener("abort",stop); }
  if(aiStopped(o)) throw aiErr("aborted");
  const t=j&&typeof j.text==="string"?j.text.trim():"";
  if(res&&res.ok&&t){ try{ if(o.onText) o.onText({text:t}); }catch(e){} return {text:t,tier:"b"}; }
  const st=res?res.status:0, c=(j&&j.error)||"";
  const off=st===404||st===405||c==="not_configured", lim=st===429||c==="rate_limited";
  AI.bDown=Date.now()+(off?60*60e3:lim?60e3:20e3);
  AI.note=lim?AI_NOTE.bLimit:off?AI_NOTE.bOff:AI_NOTE.bFail; return null;
}
function aiTryC(o){
  if(o.images&&o.images.length) throw aiErr("no_vision");
  let r=null; try{ r=o.local?o.local():null; }catch(e){ r=null; }
  if(typeof r==="string") r={text:r};
  if(!r||!String(r.text||"").trim()) return null;
  try{ if(o.onText) o.onText({text:r.text}); }catch(e){}
  return {text:String(r.text).trim(),links:r.links||[],tier:"c"};
}
async function aiAsk(prompt,o){
  o=o||{}; AI.note=""; const p=aiLangPrompt(String(prompt||""));
  let r=await aiTryA(p,o);
  if(!r) r=await aiTryB(p,o);
  if(!r){ if(aiStopped(o)) throw aiErr("aborted"); r=aiTryC(o); }
  if(!r){ aiModeSync(); throw aiErr("offline"); }
  AI.last=r.tier; r.note=AI.note; aiModeSync(); return r;
}
function aiSample(){
  const f=(prompt,o)=>aiAsk(prompt,o);
  f.limits=async()=>({images:aiCanSee()}); f.tiered=true; return f;
}

/* ---- the small line under each AI box: which mode answers now ---- */
const AI_MODE={a:["الوضع: Claude داخل الصفحة","Mode: Claude inside the page"],b:["الوضع: خادم الموقع (Claude)","Mode: the site's server (Claude)"],c:["الوضع: محلي بدون إنترنت، الإجابة من محتوى الموقع","Mode: offline, answers from the site's own content"]};
function aiModeHTML(){ return `<p class="status aimode" data-aimode></p>`; }
function aiModeSync(){
  const t=AI.last||aiPredict(), m=AI_MODE[t]||AI_MODE.c;
  document.querySelectorAll("[data-aimode]").forEach(el=>{ el.dataset.tier=t; el.textContent=ilTA(m[0],m[1])+(AI.note?" · "+ilT(AI.note):""); });
}
document.addEventListener("il-lang",()=>{ try{ aiModeSync(); }catch(e){} });

/* ---- buttons under an answer: open the lesson / part / term / AMM card it came from ---- */
function aiLinksHTML(L){
  if(!L||!L.length) return "";
  return `<div class="ailinks" role="group" aria-label="${esc(ilTA("افتح في الموقع","Open in the site"))}">${L.map(l=>`<button type="button" class="chip" data-aigo="${esc(l.go)}"><small>${esc(l.k||"")}</small> ${esc(l.t)}</button>`).join("")}</div>`;
}
function aiGo(go){
  const m=/^(\w+):(.*)$/.exec(go||""); if(!m) return; const k=m[1], v=m[2];
  try{
    if(k==="part"&&PARTS[v]){ setTab("parts"); select(v); const el=document.getElementById("view"); if(el&&el.scrollIntoView) el.scrollIntoView({behavior:"smooth",block:"start"}); }
    else if(k==="lesson"){ const q=v.split(":"), b=q[0], i=+q[1]; if(!LESSONS[b]||!LESSONS[b][i]) return; try{ localStorage.setItem("atlas-lrn",JSON.stringify({b,i})); }catch(e){} LRN.book=b; LRN.i=i; setTab("learn"); const a=document.getElementById("lArt"); if(a&&a.scrollIntoView) a.scrollIntoView({behavior:"smooth",block:"start"}); }
    else if(k==="lsearch"){ LRN.pendingQ=v; setTab("learn"); }
    else if(k==="gloss"){ GL_Q.q=v; GL_Q.cat="all"; setTab("gloss"); }
    else if(k==="amm"&&AMM_TASKS.some(t=>t.id===v)){ AMMS.view="tasks"; AMMS.task=v; setTab("amm"); }
  }catch(e){ console.error(e); }
}
document.addEventListener("click",e=>{ const b=e.target.closest&&e.target.closest("[data-aigo]"); if(b){ e.preventDefault(); aiGo(b.dataset.aigo); } });

ilExtra([
  [AI_NOTE.aGrant,"Using Claude was not allowed on this page, so I moved to the next mode."],
  [AI_NOTE.aLimit,"Claude inside the page reached its usage limit for now, so I moved to the next mode."],
  [AI_NOTE.aFail,"Claude inside the page could not be reached, so I moved to the next mode."],
  [AI_NOTE.bLimit,"The site's server has too many requests right now, so I answered from the site's content."],
  [AI_NOTE.bOff,"The AI server is not switched on in this deployment, so I answered from the site's content."],
  [AI_NOTE.bFail,"The site's server could not be reached (network?), so I answered from the site's content."],
  ["افتح في الموقع","Open in the site"],
  ["اختر القطعة يدوياً","Pick the part yourself"],
  ["— اختر قطعة —","— choose a part —"],
  ["التعرّف على الصور يحتاج Claude (داخل الصفحة أو عبر خادم الموقع)، وهو غير متاح الآن. اختر القطعة من القائمة وسأشرحها لك من محتوى الموقع.","Recognising photos needs Claude (inside the page or through the site's server), and it is not available right now. Pick the part from the list and I will explain it from the site's content."],
  ["صوّر قطعة من طائرة أو محرك أو معدات أرضية، والمهندس الذكي يتعرّف عليها ويشرحها لك. وإذا ما توفّر الذكاء الاصطناعي، اختر القطعة يدوياً.","Photograph a part of an aircraft, an engine or ground equipment and the AI engineer identifies and explains it. Without AI, pick the part yourself."]
]);
