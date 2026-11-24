/* ---------- Bobby in the flight simulator: the coach SPEAKS (p8f.js calls these; all of it is wrapped, the simulator works without Bobby) ----------
   bobFlightInit(overlay)  once: avatar slot (bust view, lip-syncing), voice / captions buttons, the «اسأل ميسلون» button
   bobFlightBrief()        at the start of every run: two short spoken sentences for the scenario
   bobFlightTick(s,info)   every ~120 ms: the rule engine picks the most important thing to say (alerts interrupt, instructions are phase-aware,
                           de-duplicated by key and cooldown, one queued hint at most, stale hints are dropped)
   bobFlightScore(sc,crash) a spoken comment on the landing; bobFlightAdvice(s,info) the best current advice as text (fallback of the AI question)
   Spoken lines are plain Modern Standard Arabic without Latin acronyms («الطيار الآلي»، «القلابات»); key letters live only in the caption. */
const BOBF={av:null,cap:null,vb:null,cb:null,seen:{},lastHint:0,hold:0,key:"",once:{},t0:0,css:false};
const bobfSide=(A,i)=>A.ey[i]<0?"الأيسر":"الأيمن";
/* candidate lines for the current state: {k key, t spoken text, p priority 3 alert / 2 instruction / 1 information, cd cooldown ms, c caption with the key letter, mood} */
function bobFlightCands(s,info){
  const A=s.A, sp=fphSpeeds(s), ils=fphIls(s), z=s.p.z, gnd=s.ground, ias=info.ias, agl=info.agl, ev=s.ev, ap=s.ap, c=[], scn=s.scn;
  const hdgE=((info.hdg+180)%360+360)%360-180;
  const add=(k,t,p,cd,o)=>c.push(Object.assign({k,t,p,cd:cd||20000},o||{}));
  /* alerts: they interrupt whatever Bobby is saying */
  if(ev.stall&&!gnd) add("stall","الطائرة ستفقد الرفع! أنزل الأنف وزد الدفع.",3,5500);
  if(ev.overspeed) add("ovs","سرعتك عالية جداً. خفّف الدفع.",3,8000);
  if(ev.flapWarn&&!gnd) add("flapw","سرعتك عالية على هذه القلابات. خفّف السرعة.",3,9000);
  if(agl<300&&info.vs<-2500&&!gnd) add("pull","ارفع الأنف الآن!",3,3500);
  else if(agl<1000&&info.vs<-1800&&!gnd) add("sink","معدل النزول عالٍ. ارفع الأنف وزد الدفع.",3,6500);
  if(ev.gearWarn) add("gearw","أنزل العجلات الآن!",3,6000,{c:"أنزل العجلات الآن! (G)"});
  if(ev.tail) add("tail","اخفض الأنف قليلاً، الذيل يقترب من المدرج.",3,8000);
  if(!gnd&&Math.abs(info.bank)>55&&agl<20000) add("bank","الميلان كبير جداً. سوِّ الجناحين.",3,8000);
  if(s.failDone&&s.failAt){ const sd=bobfSide(A,s.failAt.eng); add("engfail","فشل المحرك "+sd+"! ثبّت الاتجاه بالدفّة وأكمل الإقلاع.",3,1e9); }
  /* take-off and engine-out */
  if(scn==="takeoff"||scn==="engineout"){
    const failed=s.failDone&&s.failAt, leftFail=failed&&A.ey[s.failAt.eng]<0;
    if(gnd&&info.gs<8){
      if((FLY.brake||s.parkBrake||s.brake>.1)&&s.lever>=.9) add("brk","حرّر الفرامل الآن.",2,20000,{c:"حرّر الفرامل الآن. (B)"});
      else if(s.lever<.9) add("thr","ادفع الدفع إلى الأقصى.",2,20000,{c:"ادفع الدفع إلى الأقصى. (Shift)"});
    } else if(gnd){
      if(s.lever<.85&&ias<sp.vr) add("thr2","زد الدفع إلى الأقصى.",2,15000);
      if(ias<sp.vr-3){
        if(hdgE>4) add("dl","انحرفت لليمين. اضغط الدفّة لليسار.",2,6000); else if(hdgE<-4) add("dr","انحرفت لليسار. اضغط الدفّة لليمين.",2,6000);
        else add("cl","حافظ على الاتجاه بالدفّة.",1,45000);
      } else if(ias<sp.vr+25){ add("rot","الآن! اسحب العصا ببطء.",2,12000,{c:"الآن! اسحب العصا ببطء حتى يرتفع الأنف."}); if(ias>sp.vr+12&&info.pitch<4) add("rot2","اسحب العصا أكثر.",2,8000); }
    } else if(agl<4000){
      if(!BOBF.once.air&&agl>25&&info.vs>0) add("air","أحسنت، أقلعنا!",1,1e9,{mood:"happy"});
      if(failed&&agl<1500){ if(hdgE>5) add("fdl","اضغط الدفّة لليسار.",2,7000); else if(hdgE<-5) add("fdr","اضغط الدفّة لليمين.",2,7000); }
      if(s.gear>.5&&agl>12&&info.vs>200) add("gup","معدل الصعود موجب. ارفع العجلات.",2,15000,{c:"معدل الصعود موجب. ارفع العجلات. (G)"});
      if(info.pitch>18) add("pitch","الأنف مرتفع جداً. أنزله قليلاً.",2,8000);
      if(ias<sp.v2-3&&agl>35) add("slowc","السرعة منخفضة. أنزل الأنف قليلاً.",3,6000);
      if(s.flaps>.5&&agl>400&&ias>sp.v2+20) add("fup","ارفع القلابات تدريجياً.",2,20000,{c:"ارفع القلابات تدريجياً. (F)"});
      if(!ap.on&&agl>1000) add("apon","فعّل الطيار الآلي وثبّت الصعود.",1,40000,{c:"فعّل الطيار الآلي وثبّت الصعود. (A)"});
      if(agl>200&&ias>=sp.v2-3&&info.vs>300) add("steady","ممتاز. حافظ على السرعة وانظر إلى الأفق.",1,60000);
    }
  }
  /* approach and landing */
  if(scn==="approach"){
    if(!gnd){
      if(!ap.appr&&z>2500) add("appr","فعّل وضع الاقتراب في الطيار الآلي ليلتقط مسار الهبوط.",1,45000);
      if(s.flaps<1.9&&z<12500) add("f2","أنزل القلابات إلى الدرجة الثانية، وخفّف السرعة.",2,25000,{c:"أنزل القلابات إلى الدرجة الثانية. (V)"});
      if(s.flaps>=1.9&&s.flaps<2.9&&z<10000) add("f3","أنزل القلابات خطوة أخرى.",2,25000,{c:"أنزل القلابات خطوة أخرى. (V)"});
      if(s.gear<.9&&z<8500) add("gdn","أنزل العجلات.",2,15000,{c:"أنزل العجلات. (G)"});
      if(s.flaps<3.9&&z<6500&&s.gear>.9) add("ffull","أنزل القلابات الكاملة.",2,20000,{c:"أنزل القلابات الكاملة. (V)"});
      if(agl>350&&ils.valid&&z<9000){
        if(!ap.appr){
          if(ils.gs>.9) add("gshi","أنت فوق مسار الهبوط. خفّض الأنف قليلاً.",2,14000); else if(ils.gs<-.9) add("gslo","أنت تحت مسار الهبوط. أضف دفعاً وارفع الأنف قليلاً.",2,14000);
          if(ils.loc>1.2) add("locr","أنت على يمين المدرج. انعطف يساراً قليلاً.",2,14000); else if(ils.loc<-1.2) add("locl","أنت على يسار المدرج. انعطف يميناً قليلاً.",2,14000);
        }
        if(ias>sp.vref+22) add("fast","سرعتك عالية. خفّف الدفع.",2,15000); else if(ias<sp.vref-2) add("slow","سرعتك منخفضة. زد الدفع.",3,10000);
      }
      if(ap.on&&agl<260&&agl>60) add("apoff","افصل الطيار الآلي الآن وانظر إلى المدرج.",2,20000,{c:"افصل الطيار الآلي الآن وانظر إلى المدرج. (A)"});
      if(agl<55&&agl>2&&s.gear>.9&&s.flaps>=2) add("flare","اسحب العصا قليلاً، وخفّف الدفع.",2,10000);
    } else if(ev.touch&&info.gs>20) add("roll","فعّل السبويلر وعكس الدفع، واضغط الفرامل.",2,25000,{c:"فعّل السبويلر (X) وعكس الدفع (R)، واضغط الفرامل (B)."});
  }
  return c;
}
/* the best current advice as text (used when the AI is not available for «اسأل ميسلون») */
function bobFlightAdvice(s,info){
  const c=bobFlightCands(s,info).sort((a,b)=>b.p-a.p)[0]; if(c) return c.t;
  const sp=fphSpeeds(s); if(s.scn==="cruise") return "رحلة حرة. جرّب الطيار الآلي، وغيّر الارتفاع والاتجاه كما تحب.";
  return s.ground?"حافظ على الاتجاه بالدفّة وراقب السرعة.":"حافظ على السرعة فوق "+Math.round(sp.v2)+" عقدة وراقب الأفق.";
}
function bobFlightBrief(){
  const s=FLY.s; if(!s||typeof bobSay!=="function") return; BOBF.seen={}; BOBF.once={}; BOBF.lastHint=performance.now(); BOBF.hold=performance.now()+3500; BOBF.key="";
  const T={takeoff:"أهلاً، أنا ميسلون مساعدك في الإقلاع. ادفع الدفع إلى الأقصى وحرّر الفرامل، وعند سرعة الرفع اسحب العصا ببطء.",
    approach:"أنت على بعد عشرة كيلومترات من المدرج. أنزل القلابات والعجلات تدريجياً، وفعّل وضع الاقتراب لتتبع مسار الهبوط.",
    cruise:"رحلة حرة على ارتفاع عالٍ. جرّب الطيار الآلي والكاميرات، وعندما تريد الهبوط اختر سيناريو الاقتراب.",
    engineout:"في هذا الإقلاع سيتعطل أحد المحركات. ثبّت الاتجاه بالدفّة، وأكمل الإقلاع، ثم ارفع العجلات."}[s.scn];
  try{ bobStop(); }catch(e){}
  if(T&&FLY.opts.hints) bobSay(T,{priority:"high",group:"brief",mood:"idle"});
  bobFlightSync();
}
function bobFlightTick(s,info){
  const h=document.getElementById("fHint"); if(h){ if(FLY.coach.text){ h.textContent=FLY.coach.text; h.hidden=false; } else h.hidden=true; }
  bobFlightSync();
  if(!s||!FLY.opts.hints||FLY.paused||FLY.crashSeen||FLY.score||typeof bobSay!=="function") return;
  const now=performance.now(); if(now<BOBF.hold) return;
  const c=bobFlightCands(s,info).sort((a,b)=>b.p-a.p);
  for(let i=0;i<c.length;i++){ const x=c[i], last=BOBF.seen[x.k]||-1e9; if(now-last<x.cd) continue;
    if(x.p<3){ if((BOB.cur||BOB.q.length)||now-BOBF.lastHint<4200) continue; }
    BOBF.seen[x.k]=now; if(x.p<3) BOBF.lastHint=now; if(x.k==="air") BOBF.once.air=true; FLY.hint=x.t;
    const o={key:"f_"+x.k,keyMs:Math.min(x.cd,60000)};
    if(x.p===3){ o.priority="alert"; } else { o.group="hint"; o.ttl=3500; if(x.mood) o.mood=x.mood; }
    if(x.c) o.caption=x.c;
    bobSay(x.t,o); break; }
}
/* a short spoken comment on the landing */
function bobFlightScore(sc,crash){
  if(typeof bobSay!=="function") return; let t,mood="idle";
  if(crash){ const w=FLY.crashSeen; t=w==="hard"?"هبوط عنيف جداً تجاوز تحمّل العجلات. حاول مرة أخرى وخفّف معدل النزول.":w==="belly"?"لمست الطائرة المدرج وعجلاتها غير منزلة. لا تنسَ العجلات في المرة القادمة.":w==="overrun"?"خرجت الطائرة من نهاية المدرج. استخدم الفرامل وعكس الدفع مبكراً.":"تحطّمت الطائرة، لا بأس. حاول مرة أخرى."; }
  else if(sc){ const worst=sc.sink>500?"معدل نزولك عالٍ عند اللمس، فخفّف الدفع واسحب العصا قليلاً.":Math.abs(sc.off)>14?"ابتعدت عن خط المنتصف، فحاول تثبيت الاتجاه.":sc.td<150?"لمست العجلات قريباً جداً من بداية المدرج.":sc.td>1000?"لمست العجلات بعيداً عن بداية المدرج.":"";
    if(sc.st>=3){ t="هبوط ممتاز! ثلاث نجوم. أحسنت يا طيار!"; mood="happy"; } else if(sc.st===2){ t="هبوط جيد جداً، نجمتان. "+(worst||"وتقدر تتحسّن أكثر."); mood="happy"; } else if(sc.st===1) t="هبوط مقبول، نجمة واحدة. "+(worst||"حاول تخفيف معدل النزول."); else t="هبوط ثقيل. لا تقلق، التدريب يصنع الطيار. "+(worst||"حاول مرة ثانية."); }
  if(t){ try{ bobStop(); }catch(e){} bobSay(t,{priority:"high",mood:mood,key:"fscore",keyMs:2500}); }
}
/* the question button: the AI gets the real flight state and answers in two short sentences, spoken; without AI the rule-based advice is spoken */
function bobFlightPrompt(s,info,q){
  const sp=fphSpeeds(s), ils=fphIls(s), w=FLY_WIND[FLY.opts.wind]||FLY_WIND.calm;
  return `${typeof myUserCtx==="function"?myUserCtx()+"\n":""}أنت «ميسلون»، مهندس طيران ودود ومدرّب طيران على محاكٍ تعليمي مبسّط (وليس أداة تدريب حقيقية). الطائرة: ${FPH_AC[FLY.key].name}. مرحلة الطيران: ${FPH_SCN[s.scn].ar}.
الحالة الآن: الارتفاع ${Math.round(info.alt)} قدم (عن الأرض ${Math.round(info.agl)})، السرعة ${Math.round(info.ias)} عقدة (سرعة الاقتراب المرجعية ${Math.round(sp.vref)}، وسرعة الرفع ${Math.round(sp.vr)})، معدل الصعود ${Math.round(info.vs)} قدم في الدقيقة، ميلان الأنف ${info.pitch.toFixed(0)} درجة، الميلان الجانبي ${info.bank.toFixed(0)} درجة، الاتجاه ${Math.round(info.hdg)} درجة، العجلات ${s.gear>.9?"منزلة":"مرفوعة"}، القلابات ${s.A.flaps[Math.round(s.flaps)]}، الدفع ${Math.round(Math.max(0,s.lever)*100)}%، الطيار الآلي ${s.ap.on?"مفعّل":"مفصول"}، على الأرض: ${s.ground?"نعم":"لا"}، الرياح: ${w.ar}${ils.valid&&!s.ground?`، انحراف الموجّه ${ils.loc.toFixed(1)} درجة وانحراف مسار الهبوط ${ils.gs.toFixed(1)} درجة`:""}.
أحداث حديثة: ${FLY.evLog.slice(-4).join("، ")||"لا شيء"}.
${FLY.score?`نتيجة الهبوط: معدل النزول ${Math.round(FLY.score.sink)} قدم في الدقيقة، انحراف ${FLY.score.off.toFixed(1)} متر، اللمس بعد ${Math.round(FLY.score.td)} متر.\n`:""}قواعد: لا تخترع أرقاماً. أجب بجملتين قصيرتين على الأكثر، بصيغة أمر مباشر وواضحة، بالعربية الفصحى المبسّطة، بلا رموز ولا اختصارات إنجليزية ولا أرقام طويلة، لأن الجواب سيُقال بصوتك. ${q?"سؤال الطالب: "+q:"ماذا يجب أن أفعل الآن؟"}`;
}
const bobFlightTrim=t=>{ const p=(String(t||"").replace(/\s+/g," ").trim().match(/[^.!؟?\n]+[.!؟?]*/g)||[]).slice(0,2).join(" ").trim(); return p.length>230?p.slice(0,230).replace(/\s+\S*$/,"")+"…":p; };

/* ----- avatar slot, buttons, styles ----- */
function bobFlightCss(){
  if(BOBF.css) return; BOBF.css=true; const st=document.createElement("style");
  st.textContent=`.bobfly{position:absolute;left:150px;top:calc(max(8px,env(safe-area-inset-top)) + 58px);z-index:6;display:grid;gap:6px;justify-items:start;pointer-events:none;max-width:min(300px,58vw);direction:ltr}
.fly.fport .bobfly{left:10px;top:calc(max(8px,env(safe-area-inset-top)) + 192px)}
.bobfrow{display:flex;gap:6px;align-items:flex-end}.bobfav{filter:drop-shadow(0 3px 6px rgba(0,0,0,.5))}
.bobfbs{display:flex;flex-direction:column;gap:6px;pointer-events:auto}
.bobfb{width:34px;height:34px;border-radius:50%;border:1px solid rgba(255,255,255,.3);background:rgba(8,14,22,.62);color:#fff;display:grid;place-items:center;padding:0;cursor:pointer;font:700 11px/1 var(--font-mono,monospace);-webkit-backdrop-filter:blur(4px);backdrop-filter:blur(4px)}
.bobfb[aria-pressed="true"]{background:var(--accent,#63a9ff);color:var(--accent-ink,#06121f);border-color:var(--accent,#63a9ff)}
.bobfcap{background:rgba(8,14,22,.82);color:#fff;border:1px solid rgba(255,255,255,.22);border-radius:14px 14px 14px 4px;padding:7px 12px;font-size:14px;line-height:1.7;direction:rtl;max-width:100%}
.bobfcap.bobn{background:rgba(70,45,5,.88);border-color:rgba(242,176,74,.6)}.bobfcap[hidden]{display:none}
@media (max-height:430px){.bobfly .bobav{width:66px!important;height:66px!important}.bobfb{width:30px;height:30px}.bobfcap{font-size:12.5px;padding:5px 10px}}`;
  document.head.appendChild(st);
}
function bobFlightInit(o){
  if(typeof bobMount!=="function"||document.getElementById("bobFly")) return; bobFlightCss();
  const d=document.createElement("div"); d.className="bobfly"; d.id="bobFly";
  d.innerHTML=`<div class="bobfrow"><div class="bobfav" id="bobFlyAv"></div><div class="bobfbs"><button type="button" class="bobfb" id="bobFlyV" aria-label="صوت ميسلون" aria-pressed="true">${typeof bobIco==="function"?bobIco('<path d="M11 5L6 9H3v6h3l5 4zM15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>'):"V"}</button><button type="button" class="bobfb" id="bobFlyC" aria-label="النص المكتوب" aria-pressed="false">CC</button></div></div><div class="bobfcap" id="bobFlyCap" hidden aria-live="polite"></div>`;
  const before=o.querySelector("#fScore"); if(before) o.insertBefore(d,before); else o.appendChild(d);
  BOBF.av=bobMount(d.querySelector("#bobFlyAv"),{size:84,view:"bust",fly:true}); BOBF.cap=d.querySelector("#bobFlyCap"); BOBF.vb=d.querySelector("#bobFlyV"); BOBF.cb=d.querySelector("#bobFlyC");
  bobHost(BOBF.cap,()=>bobFlyOn());
  BOBF.vb.addEventListener("click",e=>{ e.stopPropagation(); bobVoiceOn(!BOB.v); bobFlightSync(); });
  BOBF.cb.addEventListener("click",e=>{ e.stopPropagation(); bobCapOn(!bobCapEff()); bobFlightSync(); });
  ["pointerdown","pointermove"].forEach(ev=>d.querySelector(".bobfbs").addEventListener(ev,e=>e.stopPropagation()));
  /* the AI question button is always there: with no AI Bobby answers from the rules */
  const cb=o.querySelector("#fCoach"); if(cb){ cb.hidden=false; cb.textContent="اسأل ميسلون"; }
  bobFlightSync();
}
function bobFlightSync(){
  if(!BOBF.vb) return; const cap=bobCapEff(), forced=!bobCanSpeak(bobUiLang());
  BOBF.vb.setAttribute("aria-pressed",String(BOB.v&&!forced)); BOBF.vb.title=BOB.v?"اكتم الصوت":"فعّل الصوت";
  BOBF.cb.setAttribute("aria-pressed",String(cap)); BOBF.cb.title=cap?"إخفاء النص المكتوب":"إظهار النص المكتوب";
}
