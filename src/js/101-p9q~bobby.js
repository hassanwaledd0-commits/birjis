/* ---------- Bobby (ميسلون): the engineer mascot with a voice ----------
   x_bobby_3d.js draws the 3D character; this file holds the speech engine, the public API, the mounting loop, the 2D fallback and the corner widget.
   API: bobMount(box,{size,mood,float,view}) -> {mood,say,gesture,destroy}, bobSay(text,{rate,pitch,priority,caption,onend,key,group,ttl}), bobStop(), bobMood(m,ms),
        bobShow(bool), bobGreet(), bobVoiceOn([bool]), bobCapOn([bool]), bobRead(text,btn), bobAvatarMount(root), bobSpeakable(text).
   Speech: the Web Speech API with the best Arabic voice; lines are cut into sentences (Chrome stops long ones), iOS is unlocked on the first gesture,
   and with no Arabic voice the lines are shown as captions in Bobby's bubble. Every call is wrapped: the page works when speechSynthesis is missing. */
const BOB={v:true,c:false,hid:false,inst:new Set(),q:[],cur:null,keys:{},voice:null,voiceEn:null,noVoiceEn:false,noteDoneEn:false,voices:[],noVoice:false,failed:0,unlocked:false,gate:null,tok:0,id:0,u:null,mood:"idle",over:"",moodT:0,
  sp:{on:false,mo:0,w:1,tgt:0,nt:0,kick:0},hold:0,holdUntil:0,capHide:0,raf:0,last:0,px:0,py:0,pt:0,no3d:false,hosts:[],capT:0,noteDone:false,cssOk:false,wid:null,freeT:0,vt:0};
const bobLS=(k,d)=>{ try{ const v=localStorage.getItem(k); return v===null?d:v; }catch(e){ return d; } };
const bobLW=(k,v)=>{ try{ localStorage.setItem(k,v); }catch(e){} };
BOB.v=bobLS("atlas-bob-voice","1")!=="0"; BOB.c=bobLS("atlas-bob-cap","0")==="1"; BOB.hid=bobLS("atlas-bob-hide","0")==="1"; BOB.noteDone=bobLS("atlas-bob-note","0")==="1"; BOB.noteDoneEn=bobLS("atlas-bob-note-en","0")==="1";
const bobSyn=()=>{ try{ return (typeof speechSynthesis!=="undefined"&&typeof SpeechSynthesisUtterance!=="undefined")?speechSynthesis:null; }catch(e){ return null; } };
const bobReduced=()=>{ try{ return matchMedia("(prefers-reduced-motion:reduce)").matches; }catch(e){ return false; } };
const bobFlyOn=()=>{ const o=document.getElementById("fly"); return !!(o&&!o.hidden); };

/* ----- voices ----- */
function bobPickVoice(){
  const sy=bobSyn(); if(!sy) return null; let vs=[]; try{ vs=sy.getVoices()||[]; }catch(e){} BOB.voices=vs;
  if(typeof myVcPick==="function"){ myVcPick(vs); return BOB.voice; }   /* x_my_voice.js: a man's voice first, the user's saved choice wins */
  const rank=v=>{ const l=String(v.lang||"").toLowerCase().replace("_","-"); let r=0; if(l==="ar-sa") r=50; else if(l==="ar-ae") r=45; else if(l==="ar-eg") r=40; else if(l==="ar") r=35; else if(l.indexOf("ar")===0) r=30; else if(/arab|عرب/i.test(v.name||"")) r=20; else return -1;
    if(v.localService) r+=3; if(/enhanced|premium|natural|neural/i.test(v.name||"")) r+=6; return r; };
  const ar=vs.map(v=>[rank(v),v]).filter(a=>a[0]>=0).sort((a,b)=>b[0]-a[0]); BOB.voice=ar.length?ar[0][1]:null; BOB.noVoice=vs.length>0&&!BOB.voice;
  /* English voice: en-US first, then en-GB and the other English ones */
  const rankE=v=>{ const l=String(v.lang||"").toLowerCase().replace("_","-"); let r=0; if(l==="en-us") r=50; else if(l==="en-gb") r=48; else if(l==="en-au"||l==="en-ca"||l==="en-ie") r=40; else if(l==="en") r=35; else if(l.indexOf("en")===0) r=30; else return -1;
    if(v.localService) r+=3; if(/enhanced|premium|natural|neural|samantha|daniel|google us/i.test(v.name||"")) r+=6; return r; };
  const en=vs.map(v=>[rankE(v),v]).filter(a=>a[0]>=0).sort((a,b)=>b[0]-a[0]); BOB.voiceEn=en.length?en[0][1]:null; BOB.noVoiceEn=vs.length>0&&!BOB.voiceEn;
  return BOB.voice;
}
function bobVoicesInit(){
  const sy=bobSyn(); if(!sy) return; bobPickVoice();
  try{ sy.addEventListener("voiceschanged",()=>{ bobPickVoice(); }); }catch(e){ try{ sy.onvoiceschanged=()=>bobPickVoice(); }catch(e2){} }
  [400,1200,2800].forEach(ms=>setTimeout(()=>{ if(!BOB.voice) bobPickVoice(); },ms));
}
/* voice available? "unknown" (no voice list yet) counts as yes: Android often lists nothing until the first utterance */
const bobCanSpeak=l=>!!bobSyn()&&!(l==="en"?BOB.noVoiceEn:BOB.noVoice)&&BOB.failed<2;
const bobUiLang=()=>{ try{ return typeof ilLang==="function"?ilLang():"ar"; }catch(e){ return "ar"; } };
const bobCapEff=()=>BOB.c||!bobCanSpeak(bobUiLang());
/* language of a line: explicit, else by script (Arabic letters -> ar, otherwise Latin -> en) */
const bobLangOf=t=>{ t=String(t==null?"":t); const a=(t.match(/[\u0600-\u06FF]/g)||[]).length, l=(t.match(/[A-Za-z]/g)||[]).length; return a===0&&l>=2?"en":(a>l?"ar":(l>=4&&a<2?"en":"ar")); };

/* ----- text for speech: strip markdown/Latin, spell acronyms in Arabic ----- */
const BOB_ACR={APU:"وحدة الطاقة المساعدة",AMM:"دليل الصيانة",ILS:"نظام الهبوط بالأجهزة",PFD:"شاشة الطيران الرئيسية",FADEC:"حاسوب المحرك",TCAS:"نظام تفادي التصادم",GPS:"نظام تحديد المواقع",RAT:"التوربين الهوائي",
  FDR:"مسجّل بيانات الطيران",CVR:"مسجّل صوت قمرة القيادة",KT:"عقدة",FT:"قدم",FPM:"قدم في الدقيقة",KM:"كيلومتر",A380:"إيرباص ثلاثمئة وثمانين",VREF:"سرعة الاقتراب",V1:"سرعة القرار",VR:"سرعة الرفع",V2:"سرعة الأمان",
  AP:"الطيار الآلي",VOR:"المساعد الراديوي",IFR:"الطيران بالأجهزة",VFR:"الطيران البصري",ATC:"برج المراقبة",RPM:"دورة في الدقيقة",N1:"سرعة المروحة",EGT:"حرارة العادم",HP:"الضغط العالي",LP:"الضغط المنخفض",PSI:"رطل على البوصة المربعة",ISA:"الجو القياسي"};
const BOB_ACR_EN={kt:"knots",kts:"knots",ft:"feet",fpm:"feet per minute",km:"kilometres",nm:"nautical miles",V1:"V one",V2:"V two",VR:"V R",VREF:"V ref",N1:"N one",N2:"N two",APU:"A P U",ILS:"I L S",PFD:"P F D",ATC:"A T C",GPS:"G P S",AMM:"A M M",EGT:"E G T",VOR:"V O R",IFR:"I F R",VFR:"V F R",RAT:"R A T",FDR:"F D R",CVR:"C V R",AOA:"A O A",AP:"autopilot",TCAS:"T-cass",FADEC:"fadeck",PSI:"P S I",ISA:"I S A",RPM:"R P M",HP:"high pressure",LP:"low pressure",A380:"A three eighty",B737:"seven three seven"};
function bobSpeakableEn(t){
  t=String(t==null?"":t).replace(/[\u2066-\u2069\u200e\u200f]/g,"").replace(/Maysaloon/g,"My-sa-loon").replace(/<[^>]*>/g," ").replace(/&nbsp;/g," ").replace(/&[a-z]+;/g," ");
  t=t.replace(/PART:\s*[A-Za-z_0-9]+\s*$/im,"").replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu,"");
  t=t.replace(/\*\*|__|`+|^#+\s*/gm,"").replace(/^\s*[-*\u2022\u25CF\u25AA]\s+/gm,"").replace(/\s*\((?:[A-Za-z]|Shift|Ctrl|Esc|\d)\)\s*$/,"");   /* a trailing key hint like "(G)" is for the eyes */
  t=t.replace(/\b([A-Za-z][A-Za-z0-9]*)\b/g,(m)=>BOB_ACR_EN[m]!==undefined?BOB_ACR_EN[m]:(BOB_ACR_EN[m.toUpperCase()]!==undefined&&m.length<=5&&m===m.toUpperCase()?BOB_ACR_EN[m.toUpperCase()]:m));
  t=t.replace(/\u00b0/g," degrees ").replace(/%/g," percent ").replace(/[\u2192\u2190\u2191\u2193]/g," ").replace(/[|~_^<>{}\[\]\\]/g," ").replace(/\n+/g,". ").replace(/\s+/g," ").replace(/\s+([,.?!;:])/g,"$1").replace(/([.?!;:]\s*){2,}/g,m=>m.trim().charAt(0)+" ");
  return t.trim();
}
function bobSpeakable(t,lang){
  if(lang==="en") return bobSpeakableEn(t);
  t=String(t==null?"":t).replace(/[\u2066-\u2069\u200e\u200f]/g,"").replace(/ميسلون/g,"مَيْسَلُون").replace(/<[^>]*>/g," ").replace(/&nbsp;/g," ").replace(/&[a-z]+;/g," ");   /* the name with vowel marks, for the speech engine only */
  t=t.replace(/PART:\s*[A-Za-z_0-9]+\s*$/im,"").replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu,"");
  t=t.replace(/\*\*|__|`+|^#+\s*/gm,"").replace(/^\s*[-*•●▪]\s+/gm,"").replace(/^\s*\d+[.)]\s+/gm,m=>m.replace(/[.)]/,"،")).replace(/\([^()]*[A-Za-z][^()]*\)/g," ");
  const nm0=(typeof myName==="function")?myName():"", hold=nm0&&/[A-Za-z]/.test(nm0)?nm0:"";   /* a Latin-letter name of the visitor is kept for the voice */
  if(hold) t=t.split(hold).join("\uE000");
  t=t.replace(/[A-Za-z][A-Za-z0-9\-\/]*/g,m=>{ const k=m.toUpperCase(); return BOB_ACR[k]!==undefined?" "+BOB_ACR[k]+" ":(BOB_ACR[m.replace(/[-\/].*$/,"").toUpperCase()]||" "); });
  if(hold) t=t.split("\uE000").join(hold);
  t=t.replace(/°/g," درجة ").replace(/%/g," بالمئة ").replace(/[→←↑↓]/g," ").replace(/[|~_^<>{}\[\]\\]/g," ").replace(/\s*\/\s*/g," ").replace(/\n+/g,". ").replace(/\s+/g," ").replace(/\s+([،.؟!؛:])/g,"$1").replace(/([.؟!؛،:]\s*){2,}/g,m=>m.trim().charAt(0)+" ");
  return t.trim();
}
/* sentences of at most ~130 characters: Chrome cuts long utterances after about 15 seconds */
function bobChunks(t){
  const out=[], parts=t.match(/[^.!؟?؛\n]+[.!؟?؛]*/g)||[t];
  parts.forEach(p=>{ p=p.trim(); if(!p) return; if(p.length<=130){ out.push(p); return; }
    let cur=""; p.split(/\s+/).forEach(w=>{ if(cur&&(cur+" "+w).length>120){ out.push(cur); cur=""; } cur+=(cur?" ":"")+w; if(cur.length>70&&/[،,:]$/.test(w)){ out.push(cur); cur=""; } }); if(cur) out.push(cur); });
  return out.filter(Boolean);
}

/* ----- captions (the bubble) and notes; hosts: the page corner and, during a flight, the flight overlay ----- */
function bobHost(el,active){ BOB.hosts.push({el,active}); }
function bobHostShow(text,kind,ms){
  BOB.hosts.forEach(h=>{ if(!h.el) return; if(text&&h.active()){ h.el.textContent=text; h.el.className=h.el.className.replace(/\s*bobon|\s*bobn/g,"")+" bobon"+(kind==="note"?" bobn":""); h.el.hidden=false; } else { h.el.className=h.el.className.replace(/\s*bobon|\s*bobn/g,""); h.el.hidden=true; } });
  clearTimeout(BOB.capT); if(text&&ms) BOB.capT=setTimeout(()=>bobHostShow("",""),ms);
}
function bobNoteOnce(lang){
  if(lang==="en"){ if(BOB.noteDoneEn) return; BOB.noteDoneEn=true; bobLW("atlas-bob-note-en","1"); bobHostShow("Your device has no English voice, so Maysaloon's lines will appear as text.","note",6500); return; }
  if(BOB.noteDone) return; BOB.noteDone=true; bobLW("atlas-bob-note","1"); bobHostShow("جهازك ما عنده صوت عربي، راح تظهر العبارات مكتوبة","note",6500); }

/* ----- the speech queue ----- */
function bobUnlock(){
  if(BOB.unlocked) return; BOB.unlocked=true; const sy=bobSyn(); if(!sy) return;
  try{ if(!BOB.cur){ const u=new SpeechSynthesisUtterance(" "); u.volume=0; sy.speak(u); } }catch(e){}
  if(BOB.gate){ const it=BOB.gate; BOB.gate=null; BOB.q.unshift(it); it.ci=0; bobPump(); }
}
["pointerup","touchend","click","keydown"].forEach(ev=>document.addEventListener(ev,bobUnlock,{capture:true,passive:true}));
function bobMoodEff(){ return BOB.over||BOB.mood; }
function bobApply(){ const m=bobMoodEff(); BOB.inst.forEach(M=>{ if(M.I&&!M.fixed) M.I.mood=m; if(M.svg&&!M.fixed) M.svg.setAttribute("class","bobsvg m-"+m+(BOB.sp.on?" talk":"")); M.hot=performance.now()+800; }); bobWake(); }
function bobSetOver(m){ if(BOB.over===m) return; BOB.over=m; bobApply(); }
function bobCancel(){ BOB.tok++; const it=BOB.cur; if(it){ clearTimeout(it.wd); clearTimeout(it.ft); it.tok=0; } BOB.cur=null; BOB.sp.on=false; clearTimeout(BOB.hold); clearTimeout(BOB.capHide);
  const sy=bobSyn(); if(sy){ try{ sy.cancel(); }catch(e){} } bobSetOver(""); bobHostShow("",""); }
function bobStop(){ BOB.q.length=0; BOB.gate=null; bobCancel(); bobApply(); }
function bobSay(text,o){
  o=o||{}; try{ if(typeof ilT==="function"&&o.lang!=="ar") text=ilT(text); }catch(e){}   /* English UI: Arabic lines go through the dictionary first */
  const lang=o.lang||bobLangOf(text), t=bobSpeakable(text,lang); if(!t) return false; const now=Date.now();
  if(o.key){ const l=BOB.keys[o.key]; if(l&&now-l<(o.keyMs||8000)) return false; BOB.keys[o.key]=now; }
  const showCap=o.caption===true||typeof o.caption==="string"||bobCapEff();
  if(!BOB.v&&!showCap){ if(o.onend) setTimeout(()=>{ try{ o.onend(); }catch(e){} },0); return false; }
  const it={t,lang,chunks:bobChunks(t),ci:0,o,cap:typeof o.caption==="string"?o.caption:"",showCap,pr:o.priority==="alert"?2:o.priority==="high"?1:0,id:++BOB.id,exp:o.ttl?now+o.ttl:0};
  if(it.pr===2){ const keep=BOB.cur&&BOB.cur.pr===2?BOB.cur:null; BOB.q=BOB.q.filter(x=>x.pr===2); BOB.q.push(it); if(!keep){ bobCancel(); BOB.holdUntil=Date.now()+70; BOB.hold=setTimeout(bobPump,75); return true; } }
  else { if(o.group) BOB.q=BOB.q.filter(x=>x.o.group!==o.group); BOB.q.push(it); if(it.pr===1) BOB.q.sort((a,b)=>b.pr-a.pr||a.id-b.id); }
  bobPump(); return true;
}
function bobPump(){
  if(BOB.cur) return; if(Date.now()<BOB.holdUntil){ clearTimeout(BOB.hold); BOB.hold=setTimeout(bobPump,BOB.holdUntil-Date.now()+5); return; }
  let it=BOB.q.shift(); while(it&&it.exp&&Date.now()>it.exp){ if(it.o.onend) try{ it.o.onend(); }catch(e){} it=BOB.q.shift(); }
  if(!it){ bobSetOver(""); BOB.sp.on=false; bobApply(); if(BOB.capHide) clearTimeout(BOB.capHide); BOB.capHide=setTimeout(()=>{ if(!BOB.cur) bobHostShow("",""); },1400); return; }
  BOB.cur=it; it.ci=0; bobSetOver(it.pr===2?"alert":(it.o.mood||""));
  if(!bobCanSpeak(it.lang)&&!(it.lang==="en"?BOB.noteDoneEn:BOB.noteDone)&&it.pr<2){ bobNoteOnce(it.lang); BOB.hold=setTimeout(()=>bobChunk(it),3000); return; }   /* the friendly note first, then the line as a caption */
  bobChunk(it);
}
function bobChunk(it){
  if(BOB.cur!==it) return; if(it.ci>=it.chunks.length) return bobDone(it);
  const text=it.chunks[it.ci], sy=bobSyn(), tok=++BOB.tok, real=BOB.v&&bobCanSpeak(it.lang)&&!it.fake;
  if(it.showCap||!real) bobHostShow(it.cap||(typeof myVcShown==="function"?myVcShown(text):text),"cap",0);
  const est=Math.max(1100,text.length*72/(it.o.rate||.95));
  if(!real){ it.fake=!BOB.v||it.fake; BOB.sp.on=BOB.v||it.showCap; bobApply(); it.tok=tok; it.ft=setTimeout(()=>{ if(BOB.cur===it){ it.ci++; bobChunk(it); } },est); return; }
  let u; try{ u=new SpeechSynthesisUtterance(text); }catch(e){ it.fake=true; return bobChunk(it); }
  const en=it.lang==="en", v=en?BOB.voiceEn:BOB.voice; if(v){ u.voice=v; u.lang=v.lang||(en?"en-US":"ar-SA"); } else u.lang=en?"en-US":"ar-SA";
  const VP=(typeof myVcParams==="function")?myVcParams(it.lang,v):{rate:en?1:.95,pitch:1.1};   /* a man's register: rate .95, pitch .93 (lower when no male voice exists) */
  u.rate=Math.max(.6,Math.min(1.4,it.o.rate||VP.rate)); u.pitch=Math.max(.5,Math.min(1.8,it.o.pitch||VP.pitch)); u.volume=1; it.tok=tok;
  u.onstart=()=>{ if(it.tok!==tok) return; it.started=true; clearTimeout(it.wd); BOB.failed=0; BOB.sp.on=true; bobApply(); };
  u.onboundary=()=>{ if(it.tok!==tok) return; BOB.sp.kick=.12; };
  u.onend=()=>{ if(it.tok!==tok) return; clearTimeout(it.wd); clearTimeout(it.ft); BOB.sp.on=false; it.ci++; bobChunk(it); };
  u.onerror=e=>{ if(it.tok!==tok) return; clearTimeout(it.wd); clearTimeout(it.ft); const er=e&&e.error;
    if(er==="interrupted"||er==="canceled") return;
    if(er==="not-allowed"){ BOB.gate=it; BOB.cur=null; BOB.sp.on=false; bobHostShow(it.cap||text,"cap",3500); bobSetOver(""); return; }
    BOB.failed++; it.fake=true; BOB.sp.on=false; bobChunk(it); };
  BOB.u=u; BOB.sp.on=true; bobApply();
  /* if the voice never starts (no Arabic voice behind the API), fall back to captions for this line */
  it.wd=setTimeout(()=>{ if(it.tok===tok&&!it.started){ BOB.failed++; try{ sy.cancel(); }catch(e){} it.tok=0; it.fake=true; BOB.sp.on=false; bobChunk(it); } },4200);
  it.ft=setTimeout(()=>{ if(it.tok===tok){ try{ sy.cancel(); }catch(e){} it.tok=0; it.ci++; BOB.sp.on=false; bobChunk(it); } },est+9000);
  try{ if(sy.paused) sy.resume(); sy.speak(u); }catch(e){ BOB.failed++; it.fake=true; clearTimeout(it.wd); bobChunk(it); }
}
function bobDone(it){
  if(BOB.cur!==it) return; BOB.cur=null; BOB.sp.on=false; clearTimeout(it.wd); clearTimeout(it.ft);
  try{ if(it.o.onend) it.o.onend(); }catch(e){}
  if(BOB.q.length){ BOB.holdUntil=Date.now()+140; BOB.hold=setTimeout(bobPump,150); } else { bobSetOver(""); bobApply(); BOB.capHide=setTimeout(()=>{ if(!BOB.cur) bobHostShow("",""); },1300); }
}
function bobVoiceOn(on){ if(on!==undefined){ BOB.v=!!on; bobLW("atlas-bob-voice",BOB.v?"1":"0"); if(!BOB.v) bobStop(); bobWidgetSync(); } return BOB.v; }
function bobCapOn(on){ if(on!==undefined){ BOB.c=!!on; bobLW("atlas-bob-cap",BOB.c?"1":"0"); if(!BOB.c&&!BOB.cur) bobHostShow("",""); bobWidgetSync(); } return bobCapEff(); }
function bobMood(m,ms){ if(!BOB_EMO[m]&&m!=="talk") m="idle"; clearTimeout(BOB.moodT); if(m==="talk"){ BOB.mood="idle"; BOB.sp.on=true; BOB.moodT=setTimeout(()=>{ if(!BOB.cur){ BOB.sp.on=false; bobApply(); } },ms||2500); }
  else { BOB.mood=m; if(ms) BOB.moodT=setTimeout(()=>{ BOB.mood="idle"; bobApply(); },ms); } bobApply(); }
/* a speak/stop toggle for any button next to a text: reading the same text again stops it */
function bobReadSync(){ document.querySelectorAll(".bobspk").forEach(b=>b.setAttribute("aria-pressed","false")); if(BOB.cur&&BOB.readBtn&&BOB.readBtn.isConnected) BOB.readBtn.setAttribute("aria-pressed","true"); }
function bobRead(text,btn){
  const rl=bobLangOf(text), t=bobSpeakable(text,rl); if(!t) return;
  if(BOB.cur&&BOB.readTxt===t){ BOB.readTxt=""; bobStop(); bobReadSync(); return; }
  BOB.readTxt=t; BOB.readBtn=btn||null; bobStop(); if(!BOB.v) bobVoiceOn(true);
  bobSay(t,{priority:"high",caption:bobCapEff()?true:undefined,onend:()=>{ if(BOB.readTxt===t) BOB.readTxt=""; bobReadSync(); }}); bobReadSync();
}
const bobSpeakIcon=()=>`<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z" fill="currentColor"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>`;
const bobSpeakBtn=(label,extra)=>`<button type="button" class="bobspk" aria-pressed="false" ${extra||""}>${bobSpeakIcon()}<span>${label||"اسمعني"}</span></button>`;

/* ----- instances ----- */
let bobSvgN=0;
function bobMount(box,o){
  o=o||{}; if(!box) return null; bobSweep(); bobCss();
  const size=Math.max(40,Math.min(320,o.size||96)), dpr=Math.min(window.devicePixelRatio||1,2);
  const M={box,seen:box.isConnected,size,dpr,vis:true,hot:performance.now()+1500,lt:performance.now(),fly:!!o.fly,fixed:false,view:o.view||"full",I:null,svg:null,cv:null,ctx:null,rt:0,rect:null,io:null,dead:false};
  const wrap=document.createElement("span"); wrap.className="bobav"+(o.float?" bobfl":""); wrap.style.cssText=`width:${size}px;height:${Math.round(size*(o.view==="bust"?1:1.04))}px`; M.wrap=wrap; box.appendChild(wrap);
  const to3d=()=>{ const cv=document.createElement("canvas"); cv.className="bobcv"; cv.setAttribute("aria-hidden","true"); cv.width=Math.round(size*dpr); cv.height=Math.round(parseFloat(wrap.style.height)*dpr); wrap.appendChild(cv); M.cv=cv; M.ctx=cv.getContext("2d");
    M.I=bobInst3({view:M.view,calm:bobReduced(),variant:o.variant}); M.I.mood=bobMoodEff(); if(o.mood&&BOB_EMO[o.mood]){ M.I.mood=o.mood; M.fixed=true; } M.I.px=2.9/cv.height; };
  if(HAS3D&&!BOB.no3d&&typeof THREE!=="undefined"){ try{ to3d(); bobGLR(M.cv.width,M.cv.height); }catch(e){ console.error(e); BOB.no3d=true; if(M.cv){ M.cv.remove(); M.cv=null; } if(M.I){ bobFreeI(M.I); M.I=null; } } }
  if(!M.I){ wrap.innerHTML=bobSvg(++bobSvgN); M.svg=wrap.firstChild; M.svg.setAttribute("class","bobsvg m-"+(o.mood||bobMoodEff())); }
  BOB.inst.add(M);
  try{ if(window.IntersectionObserver){ M.io=new IntersectionObserver(es=>{ M.vis=es[es.length-1].isIntersecting; if(M.vis){ M.hot=performance.now()+800; bobWake(); } }); M.io.observe(wrap); } }catch(e){}
  bobWake(); bobListen();
  const api={el:wrap,mood:m=>{ if(!BOB_EMO[m]) m="idle"; M.fixed=true; if(M.I) M.I.mood=m; if(M.svg) M.svg.setAttribute("class","bobsvg m-"+m); M.hot=performance.now()+800; bobWake(); },
    say:(t,oo)=>bobSay(t,oo),gesture:(n)=>{ if(M.I) bobGesture(M.I,n); else bobSvgGesture(M,n); M.hot=performance.now()+2600; bobWake(); },destroy:()=>bobKill(M),M};
  M.api=api; return api;
}
function bobKill(M){
  if(!M||M.dead) return; M.dead=true; BOB.inst.delete(M); try{ if(M.io) M.io.disconnect(); }catch(e){} try{ if(M.I) bobFreeI(M.I); }catch(e){} M.I=null; try{ if(M.wrap&&M.wrap.parentNode) M.wrap.parentNode.removeChild(M.wrap); }catch(e){}
  if(!BOB.inst.size){ clearTimeout(BOB.freeT); BOB.freeT=setTimeout(()=>{ if(!BOB.inst.size) bobGLFree(); },5000); }
}
const bobSweep=()=>{ BOB.inst.forEach(M=>{ if(M.box.isConnected) M.seen=true; else if(M.seen) bobKill(M); }); };   /* only boxes that were attached once count as orphans: a box may be filled before it is added to the page */
/* avatars written into the markup as <span data-bobav="72"></span> */
function bobAvatarMount(root,o){ if(!root) return; root.querySelectorAll("[data-bobav]").forEach(e=>{ if(e.dataset.bobDone) return; e.dataset.bobDone="1"; bobMount(e,Object.assign({size:+e.dataset.bobav||72,view:e.dataset.bobview||"bust"},o||{})); }); }
const bobAvatarHTML=(sz,view)=>`<span class="bobavw" data-bobav="${sz||64}" data-bobview="${view||"bust"}"></span>`;

/* ----- the loop: one rAF drives every visible Bobby; idle ones draw slowly, active ones at ~30 fps ----- */
function bobWake(){ if(BOB.raf||document.hidden) return; BOB.last=performance.now(); BOB.raf=requestAnimationFrame(bobFrame); }
function bobListen(){ if(BOB.listen) return; BOB.listen=true;
  const mv=e=>{ BOB.px=e.clientX; BOB.py=e.clientY; BOB.pt=performance.now(); bobWake(); };
  window.addEventListener("pointermove",mv,{passive:true}); window.addEventListener("pointerdown",mv,{passive:true});
  document.addEventListener("visibilitychange",()=>{ if(!document.hidden) bobWake(); });
}
function bobSpeechStep(dt){ const s=BOB.sp; if(!s.on){ s.mo=bobSm(s.mo,0,18,dt); return; } s.nt-=dt; if(s.nt<=0){ s.nt=.09+Math.random()*.13; s.tgt=Math.random()<.18?.06:(.35+Math.random()*.65); s.w=.75+Math.random()*.45; }
  if(s.kick>0){ s.kick-=dt; s.tgt=Math.max(s.tgt,.75); } s.mo=bobSm(s.mo,s.tgt,26,dt); }
function bobFrame(ts){
  BOB.raf=0; const dt=Math.min(.1,(ts-BOB.last)/1000||.016); BOB.last=ts; bobSpeechStep(dt); const flyOn=bobFlyOn(); let any=false; const welcomeEl=(typeof BW!=="undefined"&&BW&&BW.el&&BW.el.isConnected)?BW.el:null;
  BOB.inst.forEach(M=>{
    if(M.dead) return; if(!M.box.isConnected){ if(M.seen) bobKill(M); return; } M.seen=true; if(!M.vis||M.fly!==flyOn) return;
    if(welcomeEl&&!welcomeEl.contains(M.box)) return;   /* (v36) the welcome layer covers the page: nothing behind it is drawn (a WebGL render + a copy per frame each) */
    if(!M.I) return;
    const hot=M.hot>ts||BOB.sp.on, calm=M.I.calm; if(calm&&!hot) return; any=true;
    const gap=hot?42:(ts-BOB.pt<3000?70:250); if(ts-M.lt<gap) return;   /* (v31) idle breathing at 4 fps: every frame is a WebGL render plus a copy into a 2D canvas */
    let d=Math.min(.12,(ts-M.lt)/1000); M.lt=ts;
    if(ts-M.rt>350||!M.rect){ M.rt=ts; M.rect=M.wrap.getBoundingClientRect(); }
    const r=M.rect, near=ts-BOB.pt<4500, ptr={x:near?bobCl((BOB.px-(r.left+r.width*.5))/Math.max(160,innerWidth*.45)*1.7,-1,1):0,y:near?bobCl(-(BOB.py-(r.top+r.height*.33))/Math.max(160,innerHeight*.45)*1.7,-1,1):0,idle:!near};
    let busy=false; const n=Math.ceil(d/.034); for(let i=0;i<n;i++) busy=bobAnim(M.I,d/n,BOB.sp.on?BOB.sp:null,ptr)||busy;
    try{ M.I.px=2.9/M.cv.height; bobDraw(M.I,M.ctx,M.cv.width,M.cv.height); }catch(e){ console.error(e); M.dead=true; return; }
    if(busy||near) M.hot=Math.max(M.hot,ts+450);
  });
  if(any||BOB.sp.on||BOB.sp.mo>.01) BOB.raf=requestAnimationFrame(bobFrame);
}

/* ----- 2D fallback: the same character as vector art with CSS animation (no WebGL) ----- */
function bobSvg(n){
  const k="#2b1727", u="bs"+n, NV="#1f3158", OR="#ff7a1c", HR="#241812", BR="#2a1c14", SK="#cc9567", GL="#d5dce6", HS="#39424f";
  return `<svg class="bobsvg m-idle" viewBox="0 0 200 208" role="img" aria-label="ميسلون" xmlns="http://www.w3.org/2000/svg"><defs><clipPath id="${u}v"><path d="M54 172C48 138 60 112 100 112s52 26 46 60z"/></clipPath></defs>
  <ellipse cx="100" cy="199" rx="56" ry="8" fill="#1b2150" opacity=".2"/>
  <g class="bsb"><rect x="68" y="168" width="26" height="26" rx="11" fill="${NV}" stroke="${k}" stroke-width="3"/><rect x="106" y="168" width="26" height="26" rx="11" fill="${NV}" stroke="${k}" stroke-width="3"/>
  <ellipse cx="79" cy="192" rx="21" ry="9" fill="#2f2b2e" stroke="${k}" stroke-width="3"/><ellipse cx="121" cy="192" rx="21" ry="9" fill="#2f2b2e" stroke="${k}" stroke-width="3"/>
  <path d="M48 176C42 134 58 104 100 104s58 30 52 72z" fill="${NV}" stroke="${k}" stroke-width="3"/>
  <g clip-path="url(#${u}v)"><rect x="40" y="124" width="120" height="13" fill="${OR}"/><rect x="40" y="128" width="120" height="5" fill="#fff"/><rect x="40" y="144" width="120" height="13" fill="${OR}"/><rect x="40" y="148" width="120" height="5" fill="#fff"/></g>
  <path d="M52 166c4 5 92 5 96 0v8c-4 5-92 5-96 0z" fill="#70452a"/><rect x="94" y="167" width="12" height="8" rx="2" fill="#e9d9a8"/>
  <path d="M116 104l14 22" stroke="${OR}" stroke-width="2.5" fill="none"/><path d="M96 104l30 22" stroke="${OR}" stroke-width="2.5" fill="none"/><rect x="120" y="124" width="17" height="22" rx="3" fill="#f2ecdc" stroke="${k}" stroke-width="2"/><rect x="120" y="124" width="17" height="6" rx="2" fill="${OR}"/><circle cx="128.5" cy="135" r="4.5" fill="#4a6fa5"/>
  <g class="bsal"><path d="M52 122c-14 8-18 30-12 38" fill="none" stroke="${k}" stroke-width="22" stroke-linecap="round"/><path d="M52 122c-14 8-18 30-12 38" fill="none" stroke="${NV}" stroke-width="16" stroke-linecap="round"/><path d="M48 128l-10 4" stroke="${OR}" stroke-width="7"/><circle cx="40" cy="162" r="12" fill="${GL}" stroke="${k}" stroke-width="3"/>
   <rect x="35" y="132" width="7" height="34" rx="3.5" fill="#b9c8d8" stroke="${k}" stroke-width="2.5"/><path d="M31 134a7 7 0 1 1 15 0" fill="none" stroke="#b9c8d8" stroke-width="5"/></g>
  <g class="bsar"><path d="M148 122c14 8 18 30 12 38" fill="none" stroke="${k}" stroke-width="22" stroke-linecap="round"/><path d="M148 122c14 8 18 30 12 38" fill="none" stroke="${NV}" stroke-width="16" stroke-linecap="round"/><path d="M152 128l10 4" stroke="${OR}" stroke-width="7"/><circle cx="160" cy="162" r="12" fill="${GL}" stroke="${k}" stroke-width="3"/></g></g>
  <g class="bsh"><ellipse cx="100" cy="82" rx="68" ry="58" fill="${SK}" stroke="${k}" stroke-width="3.5"/>
  <ellipse cx="62" cy="96" rx="9" ry="5.5" fill="#ff6482" opacity=".28"/><ellipse cx="138" cy="96" rx="9" ry="5.5" fill="#ff6482" opacity=".28"/>
  <path d="M34 92C36 126 62 150 100 150s64-24 66-58c-8 12-20 15-30 10-14-6-58-6-72 0-10 5-22 2-30-10z" fill="${BR}" stroke="${k}" stroke-width="3" stroke-linejoin="round"/>
  <ellipse cx="100" cy="113" rx="24" ry="12.5" fill="${SK}"/>
  <g class="bse" style="transform-origin:72px 82px"><ellipse cx="72" cy="82" rx="11" ry="14.5" fill="#21120f"/><ellipse cx="72" cy="89" rx="7.5" ry="5.5" fill="#9e5c2a" opacity=".85"/><circle cx="68.5" cy="76" r="4.2" fill="#fff"/><circle cx="76.5" cy="88" r="1.9" fill="#fff"/></g>
  <g class="bse" style="transform-origin:128px 82px"><ellipse cx="128" cy="82" rx="11" ry="14.5" fill="#21120f"/><ellipse cx="128" cy="89" rx="7.5" ry="5.5" fill="#9e5c2a" opacity=".85"/><circle cx="124.5" cy="76" r="4.2" fill="#fff"/><circle cx="132.5" cy="88" r="1.9" fill="#fff"/></g>
  <path class="bsy" d="M61 84q11-13 22 0M117 84q11-13 22 0" fill="none" stroke="#21120f" stroke-width="4.5" stroke-linecap="round"/>
  <rect class="bsw bsw1" x="56" y="54" width="29" height="8" rx="4" fill="#1d120d"/><rect class="bsw bsw2" x="115" y="54" width="29" height="8" rx="4" fill="#1d120d"/>
  <ellipse cx="100" cy="95" rx="6.5" ry="5.5" fill="#b98355"/>
  <path class="bsm" d="M87 115q13 8 26 0" fill="none" stroke="#5c1626" stroke-width="3.5" stroke-linecap="round"/>
  <g class="bso"><path d="M86 112q14 4 28 0q-2 17-14 17q-12 0-14-17z" fill="#5c1626"/><path d="M93 124q7-5 14 0q-7 5-14 0z" fill="#ea7380"/><path d="M87 113q13 4 26 0v3q-13 4-26 0z" fill="#fffaf0"/></g>
  <path d="M66 112C68 98 84 95 100 101C116 95 132 98 134 112C124 106 112 106 100 108C88 106 76 106 66 112z" fill="${BR}" stroke="${k}" stroke-width="2.5" stroke-linejoin="round"/>
  <g class="bsl"><path d="M30 82C20 38 54 12 100 12s80 26 70 70c-6-18-14-26-24-30-4 10-12 14-22 12-6 8-18 10-26 6-10 6-22 4-30-2-10 2-18-2-24-10-6 4-10 14-14 22z" fill="${HR}" stroke="${k}" stroke-width="3.5" stroke-linejoin="round"/><path d="M60 34q20-16 44-10M112 24q22 2 34 16" fill="none" stroke="#44301f" stroke-width="5" stroke-linecap="round" opacity=".75"/></g>
  <path d="M24 90C16 28 56 4 100 4s84 24 76 86" fill="none" stroke="${HS}" stroke-width="6" stroke-linecap="round"/>
  <ellipse cx="22" cy="94" rx="11" ry="18" fill="#2e3644" stroke="${k}" stroke-width="3"/><ellipse cx="178" cy="94" rx="11" ry="18" fill="#2e3644" stroke="${k}" stroke-width="3"/>
  <path d="M178 108C180 128 162 138 138 134" fill="none" stroke="${HS}" stroke-width="3.5" stroke-linecap="round"/><circle cx="135" cy="134" r="5.5" fill="#2e3644" stroke="${k}" stroke-width="2"/><circle class="bslamp" cx="135" cy="134" r="2.6" fill="#fff2b0"/></g></svg>`;
}
function bobSvgGesture(M,n){ const e=M.svg&&M.svg.querySelector(".bsar"); if(!e) return; e.classList.remove("wv"); void e.getBoundingClientRect(); e.classList.add("wv"); setTimeout(()=>e.classList.remove("wv"),2200); }

/* ----- styles (injected, so the markup owner needs nothing) ----- */
function bobCss(){
  if(BOB.cssOk) return; BOB.cssOk=true; const st=document.createElement("style"); st.id="bobcss";
  st.textContent=`.bobav{display:inline-block;position:relative;flex:none;line-height:0;vertical-align:middle}.bobcv{width:100%;height:100%;display:block;pointer-events:none}
.bobavw{display:inline-block;flex:none;line-height:0}
.bobfl{animation:bobfl 3.6s ease-in-out infinite}@keyframes bobfl{50%{transform:translateY(-4px)}}
.bobsvg{width:100%;height:100%;display:block;overflow:visible}.bobsvg .bsb,.bobsvg .bsh{transform-box:fill-box}
@media (prefers-reduced-motion:no-preference){.bobsvg .bsb{animation:bobsvgb 3.4s ease-in-out infinite;transform-origin:50% 100%}.bobsvg .bse{animation:bobsvgblink 4.6s infinite}.bobsvg.talk .bso{animation:bobsvgtalk .26s ease-in-out infinite alternate;transform-origin:100px 112px}.bobsvg .bsar.wv{animation:bobsvgwave .5s ease-in-out 4;transform-origin:148px 122px}.bobsvg.m-alert .bslamp{animation:bobsvglamp .5s steps(2) infinite}}
@keyframes bobsvgb{50%{transform:scaleY(1.015)}}@keyframes bobsvgblink{0%,92%,100%{transform:scaleY(1)}95%{transform:scaleY(.08)}}@keyframes bobsvgtalk{from{transform:scaleY(.5)}to{transform:scaleY(1.15)}}@keyframes bobsvgwave{50%{transform:rotate(-26deg)}}@keyframes bobsvglamp{50%{fill:#ff6a3a}}
.bobsvg .bso,.bobsvg .bsy{opacity:0}.bobsvg.talk .bso{opacity:1}.bobsvg.talk .bsm{opacity:0}
.bobsvg.m-happy .bsy{opacity:1}.bobsvg.m-happy .bse{opacity:0}.bobsvg.m-happy .bsm{opacity:0}.bobsvg.m-happy:not(.talk) .bso{opacity:1}
.bobsvg.m-think .bsw1{transform:translateY(-4px) rotate(-8deg);transform-origin:71px 59px}.bobsvg.m-think .bsw2{transform:rotate(9deg);transform-origin:129px 59px}.bobsvg.m-think .bsm{d:path("M90 114q10 3 20-2")}
.bobsvg.m-alert .bsw1{transform:translateY(-6px) rotate(9deg);transform-origin:71px 59px}.bobsvg.m-alert .bsw2{transform:translateY(-6px) rotate(-9deg);transform-origin:129px 59px}.bobsvg.m-alert .bsm{d:path("M90 116h20")}
.bobw{position:fixed;left:max(10px,env(safe-area-inset-left));bottom:calc(var(--bob-bottom,12px) + env(safe-area-inset-bottom));z-index:900;display:flex;flex-direction:column;align-items:flex-start;gap:6px;direction:ltr;pointer-events:none}
.bobw>*{pointer-events:auto}.bobw[hidden]{display:none}
.bobbtn{border:0;background:none;padding:0;cursor:pointer;border-radius:50%;-webkit-tap-highlight-color:transparent;filter:drop-shadow(0 4px 8px rgba(10,20,50,.22))}.bobbtn:focus-visible{outline:3px solid var(--accent,#1f5fbf);outline-offset:2px}
.bobbtn.on .bobav{transform:scale(1.04)}
.bobmenu{direction:rtl;background:var(--panel,#fff);color:var(--ink,#0e1a24);border:1px solid var(--line,#d3dce4);border-radius:16px;box-shadow:0 10px 30px rgba(10,20,50,.22);padding:6px;display:grid;gap:2px;min-width:196px;max-width:min(260px,calc(100vw - 24px))}
.bobmenu button{display:flex;align-items:center;gap:10px;border:0;background:none;color:inherit;font:inherit;font-size:14px;padding:9px 12px;min-height:40px;border-radius:10px;text-align:start;cursor:pointer}
.bobmenu button:hover,.bobmenu button:focus-visible{background:color-mix(in srgb,var(--accent,#1f5fbf) 12%,transparent)}.bobmenu button b{font-weight:600}.bobmenu button svg{flex:none;color:var(--accent,#1f5fbf)}
.bobmenu hr{border:0;border-top:1px solid var(--line,#d3dce4);margin:3px 6px}
.bobcap{position:fixed;left:max(10px,env(safe-area-inset-left));bottom:calc(var(--bob-bottom,12px) + var(--bob-h,96px) + 16px + env(safe-area-inset-bottom));z-index:901;max-width:min(300px,calc(100vw - 24px));background:var(--panel,#fff);color:var(--ink,#0e1a24);border:1px solid var(--line,#d3dce4);border-radius:16px 16px 16px 4px;padding:9px 13px;font-size:14px;line-height:1.7;box-shadow:0 8px 24px rgba(10,20,50,.2);direction:rtl;pointer-events:none}
.bobcap.bobn{background:color-mix(in srgb,var(--signal,#b8730a) 14%,var(--panel,#fff));border-color:color-mix(in srgb,var(--signal,#b8730a) 55%,var(--line,#d3dce4))}
@media (prefers-reduced-motion:no-preference){.bobcap.bobon{animation:bobpop .22s ease-out}@keyframes bobpop{from{opacity:0;transform:translateY(6px) scale(.97)}}}
.bobtab{position:fixed;left:max(8px,env(safe-area-inset-left));bottom:calc(var(--bob-bottom,12px) + env(safe-area-inset-bottom));z-index:900;width:36px;height:36px;border-radius:50%;border:1px solid var(--line,#d3dce4);background:var(--panel,#fff);color:var(--accent,#1f5fbf);font:700 16px var(--font-ar,inherit);box-shadow:0 4px 12px rgba(10,20,50,.2);cursor:pointer;display:grid;place-items:center;padding:0}.bobtab[hidden]{display:none}
.bobspk{display:inline-flex;align-items:center;gap:6px;border:1px solid var(--line,#d3dce4);background:var(--panel,#fff);color:var(--accent,#1f5fbf);border-radius:999px;padding:3px 11px;min-height:30px;font:inherit;font-size:12.5px;cursor:pointer}
.bobspk:hover{border-color:var(--accent,#1f5fbf)}.bobspk[aria-pressed="true"]{background:var(--accent,#1f5fbf);border-color:var(--accent,#1f5fbf);color:var(--accent-ink,#fff)}
.bobhd{display:flex;align-items:center;gap:12px;min-width:0}.bobhd>div{min-width:0}.bobhd b{display:block;font-size:15px}.bobhd small{display:block;color:var(--muted,#566574);font-size:12.5px;line-height:1.5}
.msg.bob>span{display:flex;align-items:center;justify-content:space-between;gap:8px}
@media (max-width:640px){.bobmenu{min-width:180px}}`;
  document.head.appendChild(st);
}

/* ----- the corner widget: Bobby, a tap menu, the caption bubble ----- */
const BOB_TIPS=["هل تعلم؟ الجناح لا يرفع الطائرة بشكله وحده، بل تزيد زاوية الهجوم الرفع أيضاً إلى حدّ معيّن.","هل تعلم؟ القلابات تزيد انحناء الجناح ومساحته، فتسمح للطائرة بالطيران بسرعة أقل عند الإقلاع والهبوط.","هل تعلم؟ السبويلر يُفسد الرفع بعد الهبوط، فيضغط وزن الطائرة على العجلات وتعمل الفرامل بفعالية أكبر.",
  "هل تعلم؟ عجلة الأنف توجّه الطائرة على الأرض، أما العجلات الرئيسية فتحمل معظم الوزن.","هل تعلم؟ في الطائرات الكبيرة أنظمة مهمة لها نسخ احتياطية، فإذا تعطّل نظام يتابع الآخر عمله.","هل تعلم؟ الفحص حول الطائرة قبل الطيران جزء أساسي من السلامة، وكل خطوة فيه لها سبب.",
  "هل تعلم؟ تُقاس السرعة في الطيران بالعقدة، ويُقاس الارتفاع بالقدم في معظم الطائرات.","هل تعلم؟ الطيار الآلي يساعد الطيار لكنه لا يحلّ محلّه، والطيار هو المسؤول دائماً.","هل تعلم؟ الجناح المائل للخلف يساعد الطائرة على الطيران بسرعات قريبة من سرعة الصوت.",
  "هل تعلم؟ المحرك النفاث يضغط الهواء ويحرقه مع الوقود، والغازات الساخنة الخارجة تدفع الطائرة إلى الأمام."];
let bobTipI=Math.floor(Math.random()*BOB_TIPS.length);
const bobIco=p=>`<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
function bobWidget(){
  if(BOB.wid) return BOB.wid; bobCss();
  const w=document.createElement("div"); w.className="bobw"; w.id="bobW"; w.hidden=BOB.hid;
  const ph=(()=>{ try{ return matchMedia("(max-width:640px)").matches; }catch(e){ return false; } })(), sz=ph?60:96;
  w.innerHTML=`<div class="bobmenu" id="bobMenu" role="menu" hidden><button type="button" role="menuitem" data-bm="ask">${bobIco('<path d="M21 12a8 8 0 0 1-11.5 7.2L4 20l1-4.6A8 8 0 1 1 21 12z"/>')}<b>اسأل ميسلون</b></button>
    <button type="button" role="menuitem" data-bm="tip">${bobIco('<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>')}<span>معلومة من ميسلون</span></button><hr>
    <button type="button" role="menuitem" data-bm="vs">${bobIco('<path d="M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3"/>')}<span>الصوت</span></button>
    <button type="button" role="menuitem" data-bm="voice" aria-pressed="true"><span data-bl="voice"></span></button>
    <button type="button" role="menuitem" data-bm="cap"><span data-bl="cap"></span></button>
    <button type="button" role="menuitem" data-bm="hide">${bobIco('<path d="M3 3l18 18M10.6 6.1A9.8 9.8 0 0 1 12 6c5 0 8.5 4 9.5 6a14 14 0 0 1-3 3.9M6.6 6.6A14 14 0 0 0 2.5 12c1 2 4.5 6 9.5 6a9.6 9.6 0 0 0 4-.9"/>')}<span>إخفاء ميسلون</span></button></div>
    <button type="button" class="bobbtn" id="bobBtn" aria-label="ميسلون، المهندس المساعد" aria-haspopup="menu" aria-expanded="false"><span data-bobwa></span></button>`;
  document.body.appendChild(w);
  const tab=document.createElement("button"); tab.type="button"; tab.className="bobtab"; tab.id="bobTab"; tab.textContent="م"; tab.setAttribute("aria-label","إظهار ميسلون"); tab.hidden=!BOB.hid; document.body.appendChild(tab);
  const cap=document.createElement("div"); cap.className="bobcap"; cap.id="bobCap"; cap.hidden=true; cap.setAttribute("aria-live","polite"); document.body.appendChild(cap);
  bobHost(cap,()=>!bobFlyOn());
  w.style.setProperty("--bob-h",sz+"px"); cap.style.setProperty("--bob-h",sz+"px");
  const slot=w.querySelector("[data-bobwa]"); BOB.wid={w,tab,cap,menu:w.querySelector("#bobMenu"),btn:w.querySelector("#bobBtn"),slot,sz,api:null,open:false};
  const W=BOB.wid; document.documentElement.style.setProperty("--bob-h",sz+"px");
  const open=on=>{ W.open=on; W.menu.hidden=!on; W.btn.setAttribute("aria-expanded",on); W.btn.classList.toggle("on",on); };
  W.btn.addEventListener("click",e=>{ e.stopPropagation(); if(W.api){ W.api.gesture("wave"); } open(!W.open); bobHostShow("",""); });
  document.addEventListener("click",e=>{ if(W.open&&!W.w.contains(e.target)) open(false); });
  document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&W.open){ open(false); W.btn.focus(); } });
  W.menu.addEventListener("click",e=>{ const b=e.target.closest("[data-bm]"); if(!b) return; const k=b.dataset.bm;
    if(k==="ask"){ open(false); try{ setTab("ask"); const p=document.getElementById("tp"); if(p&&p.scrollIntoView) p.scrollIntoView({behavior:"smooth",block:"start"}); }catch(er){} bobSay("اسألني عن أي قطعة أو عن الطيران، وأنا حاضر.",{key:"bobask",keyMs:4000}); }
    else if(k==="tip"){ open(false); bobSay(BOB_TIPS[bobTipI++%BOB_TIPS.length],{priority:"high",caption:true}); W.api&&W.api.gesture("thumbs"); }
    else if(k==="vs"){ open(false); if(typeof myVoiceSheet==="function") myVoiceSheet(); }
    else if(k==="voice"){ bobVoiceOn(!BOB.v); if(BOB.v) bobSay("تمام، سأتكلم معك.",{priority:"high",caption:bobCapEff()?true:undefined}); }
    else if(k==="cap"){ bobCapOn(!BOB.c); bobWidgetSync(); }
    else if(k==="hide"){ open(false); bobShow(false); } });
  tab.addEventListener("click",()=>{ bobShow(true); });
  W.api=bobMount(slot,{size:sz,float:false,view:ph?"bust":"full"}); bobWidgetSync();
  return W;
}
function bobWidgetSync(){
  const W=BOB.wid; if(!W) return; const vb=W.menu.querySelector('[data-bl="voice"]'), cb=W.menu.querySelector('[data-bl="cap"]');
  const forced=!bobCanSpeak(bobUiLang());
  if(vb){ vb.innerHTML=(BOB.v?bobIco('<path d="M11 5L6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>'):bobIco('<path d="M11 5L6 9H3v6h3l5 4zM22 9l-6 6M16 9l6 6"/>'))+`<span style="margin-inline-start:10px">${BOB.v?"اكتم الصوت":"فعّل الصوت"}</span>`; vb.style.cssText="display:flex;align-items:center"; }
  if(cb){ cb.innerHTML=bobIco('<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M7 11h4M13 11h4M7 15h7"/>')+`<span style="margin-inline-start:10px">${(BOB.c||forced)?"إخفاء النص المكتوب":"إظهار النص المكتوب"}</span>`; cb.style.cssText="display:flex;align-items:center"; }
}
function bobShow(on){
  on=on!==false; BOB.hid=!on; bobLW("atlas-bob-hide",on?"0":"1"); const W=bobWidget(); W.w.hidden=!on; W.tab.hidden=on; if(!on){ W.menu.hidden=true; bobHostShow("",""); } else { W.api&&W.api.gesture("wave"); } return on;
}
function bobGreet(){
  const W=bobWidget(); if(BOB.hid) return; W.api&&W.api.gesture("wave");
  const t="أهلاً بك! أنا ميسلون، مهندسك. اضغط عليّ وأنا أساعدك.";
  if(BOB.unlocked) bobSay(t,{caption:true,key:"bobgreet",keyMs:60000}); else bobHostShow(t,"cap",5200);
}
function bobInit(){
  if(window.bobAuto===false) return; try{ bobVoicesInit(); bobCss(); bobWidget(); setTimeout(()=>{ try{ if(!BOB.hid&&!bobLS("atlas-bob-seen",0)){ bobLW("atlas-bob-seen","1"); bobGreet(); } }catch(e){} },1400); }catch(e){ console.error(e); }
}
if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",()=>setTimeout(bobInit,0)); else setTimeout(bobInit,0);
