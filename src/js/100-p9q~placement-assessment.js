/* ---------- placement assessment «تقييم» (prefix my): about ten multiple-choice questions collected AT RUN TIME from the registered lessons (LESSONS[book][i].quiz),
   so no content is duplicated. Adaptive: starts medium, a right answer makes the next one harder and a wrong one easier; topics are balanced and biased by the visitor's field.
   Result: a level (مبتدئ / متوسط / متقدّم / خبير), a score ring, bars per topic, three suggested lessons, and Maysaloon's spoken evaluation; saved in the profile (x_profile.js).
   API: myAssessOpen(), myAsPool(), myAsScore(list), myAsReport(res,name,lang), myAsRec(res,role) ---------- */
const MYAS_SKIPB={ast:1,sse:1};
const MYAS_BTOPIC={itf:"aero",foa:"aero",aaf:"aero",tof:"aero",rds:"perf",mof:"perf",str:"str",fsc:"sys",asy:"sys",prf:"perf",nav:"nav",mnt:"mnt"};
const MYAS_BBASE={itf:1,asy:1.1,prf:1.3,nav:1.2,mnt:1.3,rds:1.8,mof:2,aaf:2,foa:2.2,str:2.3,fsc:2.5,tof:2.2};
const MYAS_PROP=/محرك|دفع|نفاث|توربين|مروح|احتراق|ضاغط|عادم|propuls|engine|thrust|turbine|propeller|compressor/i;
const MYAS_VIS=/أعلاه|الرسم|الشكل|المنزلق|المنحنى|يظهر|الظاهر|اللوحة/;   /* questions that depend on a picture or slider state are left out */
const MYAS_ALL=/كل ما سبق|جميع ما|كلاهما|كلا |لا شيء مما|ما سبق/;      /* options that refer to each other keep their order */
let MYAS_POOL=null;
const MYAS={el:null,S:null,timer:false,prev:null,bob:null,tm:0,screen:"",res:null};
function myAsPool(){
  if(MYAS_POOL&&MYAS_POOL.length) return MYAS_POOL; const P=[]; if(typeof LESSONS==="undefined") return P;
  Object.keys(LESSONS).forEach(b=>{ if(MYAS_SKIPB[b]) return; const arr=LESSONS[b]||[];
    arr.forEach((l,i)=>{ if(!l||!Array.isArray(l.quiz)) return; const t=(l.ar||"")+" "+(l.en||""); let topic=MYAS_BTOPIC[b]||"aero"; if(MYAS_PROP.test(t)) topic="prop";
      const pos=arr.length>1?i/(arr.length-1):0, lvl=Math.max(1,Math.min(3,Math.round((MYAS_BBASE[b]||2)+pos*.9)));
      l.quiz.forEach((q,qi)=>{ if(!q||typeof q.q!=="string"||!Array.isArray(q.o)||q.o.length<2||typeof q.a!=="number"||q.a<0||q.a>=q.o.length||MYAS_VIS.test(q.q)) return;
        P.push({id:b+":"+i+":"+qi,b,i,qi,q:q.q,o:q.o,a:q.a,why:q.why||"",topic,lvl}); }); }); });
  return MYAS_POOL=P;
}
function myAsWeights(role){ const w={aero:1,str:1,prop:1,sys:1,perf:1,nav:1,mnt:1}, b={eng:{str:2,mnt:2,sys:1.6},tech:{mnt:2.2,sys:1.8,str:1.5},pilot:{perf:2,nav:2,aero:1.5},student:{aero:1.5}}[role]||{}; Object.keys(b).forEach(k=>{ w[k]=b[k]; }); return w; }
const myAsRnd=a=>a[Math.floor(Math.random()*a.length)];
function myAsNew(role,n){ return {n:n||10,asked:[],used:new Set(),lvl:2,role:role||"",cur:null,qn:0}; }
/* next question: the topic that is the most under-asked for its weight, then the unused question of that topic whose level is closest to the current one */
function myAsNext(S,pool){
  const w=myAsWeights(S.role), cnt={}; S.asked.forEach(a=>{ cnt[a.topic]=(cnt[a.topic]||0)+1; });
  const free=pool.filter(q=>!S.used.has(q.id)); if(!free.length) return null;
  const topics=[...new Set(free.map(q=>q.topic))].map(t=>({t,s:((cnt[t]||0)+.5)/(w[t]||1)+Math.random()*.01})).sort((a,b)=>a.s-b.s);
  const t=topics[0].t, inT=free.filter(q=>q.topic===t); let best=9, c=[]; inT.forEach(q=>{ const d=Math.abs(q.lvl-S.lvl); if(d<best){ best=d; c=[q]; } else if(d===best) c.push(q); });
  const q=myAsRnd(c), o=q.o.map((x,i)=>i), keep=q.o.some(x=>MYAS_ALL.test(x));
  if(!keep) for(let i=o.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [o[i],o[j]]=[o[j],o[i]]; }
  S.used.add(q.id); return {q,order:o,ans:o.indexOf(q.a),topic:q.topic,lvl:q.lvl};
}
/* list of {topic,lvl,ok} -> {pct (weighted by level), lvl key, topics:{t:{n,ok,pct}}} */
function myAsScore(list){
  let num=0,den=0,hard=0; const T={};
  list.forEach(a=>{ den+=a.lvl; if(a.ok){ num+=a.lvl; if(a.lvl>=3) hard++; } const t=T[a.topic]||(T[a.topic]={n:0,ok:0}); t.n++; if(a.ok) t.ok++; });
  Object.keys(T).forEach(k=>{ T[k].pct=Math.round(100*T[k].ok/T[k].n); });
  const pct=den?Math.round(100*num/den):0; let lvl=pct<35?"beg":pct<60?"mid":pct<82?"adv":"exp"; if(lvl==="exp"&&hard<2) lvl="adv";
  return {pct,lvl,topics:T,n:list.length,ok:list.filter(a=>a.ok).length};
}
/* three lessons for the weakest topics (not done yet, at or just above the level reached) */
function myAsRec(res,role){
  const pool=myAsPool(), lv={beg:1,mid:2,adv:3,exp:3}[res.lvl]||2, w=myAsWeights(role), out=[], usedB={};
  const ts=Object.keys(res.topics).map(t=>({t,p:res.topics[t].pct,w:w[t]||1})).sort((a,b)=>a.p-b.p||b.w-a.w).map(x=>x.t);
  Object.keys(w).forEach(t=>{ if(ts.indexOf(t)<0) ts.push(t); });
  const done=(b,i)=>{ try{ return typeof LDONE!=="undefined"&&LDONE.has(b+":"+i); }catch(e){ return false; } };
  for(const t of ts){ if(out.length>=3) break; const c=pool.filter(q=>q.topic===t&&q.lvl<=Math.min(3,lv+1)&&!done(q.b,q.i)); if(!c.length) continue;
    c.sort((a,b)=>Math.abs(a.lvl-lv)-Math.abs(b.lvl-lv)||(usedB[a.b]||0)-(usedB[b.b]||0)||a.i-b.i); const q=c[0]; if(out.some(x=>x.b===q.b&&x.i===q.i)) continue; out.push({b:q.b,i:q.i,topic:t}); usedB[q.b]=(usedB[q.b]||0)+1; }
  return out;
}
/* Maysaloon's spoken evaluation ({ar,en}) */
function myAsReport(res,name,lang){
  const lv=myLevelOf(res.lvl), tp=Object.keys(res.topics).map(t=>({t,p:res.topics[t].pct})).sort((a,b)=>b.p-a.p), best=tp[0], worst=tp[tp.length-1], en=lang==="en", n=name?myIso(name):"";
  const tn=t=>MY_TOPICS[t][en?"en":"ar"];
  let s=en?`Well done${n?", "+n:""}! Your level is ${lv.en.toLowerCase()}, with ${res.ok} of ${res.n} right.`:`أحسنت${n?" يا "+n:""}! مستواك ${lv.ar}، وأجبت صحيحاً عن ${res.ok} من ${res.n}.`;
  if(best&&worst&&best.t!==worst.t&&best.p>=60&&worst.p<=60) s+=en?` You are strong in ${tn(best.t)}, but ${tn(worst.t)} needs a review.`:` أنت قوي في ${tn(best.t)}، لكن ${tn(worst.t)} تحتاج مراجعة.`;
  else if(worst&&worst.p<=40) s+=en?` ${tn(worst.t)} needs a review.`:` ${tn(worst.t)} تحتاج مراجعة.`;
  else if(best&&best.p>=80) s+=en?` You are especially good in ${tn(best.t)}.`:` وأنت متميّز في ${tn(best.t)}.`;
  s+=en?" I picked a few lessons for you below.":" اخترت لك بعض الدروس أدناه.";
  return s;
}

/* ----- the overlay ----- */
function myAsCss(){
  if(document.getElementById("myAsCss")) return; const st=document.createElement("style"); st.id="myAsCss";
  st.textContent=`.myAs{position:fixed;inset:0;z-index:2500;overflow:auto;overscroll-behavior:contain;background:var(--bg,#f5f8fb);color:var(--ink,#0e1a24);padding:max(12px,env(safe-area-inset-top)) max(14px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(14px,env(safe-area-inset-left))}
.myAs[hidden]{display:none}.myAsW{max-width:640px;margin:0 auto;display:grid;gap:14px;grid-template-columns:minmax(0,1fr)}
.myAsH{display:flex;align-items:center;gap:10px}.myAsH b{font-size:16.5px;flex:1;min-width:0}.myAsN{font-size:13px;color:var(--muted,#566574);white-space:nowrap}
.myAsX{width:44px;height:44px;border:0;border-radius:50%;background:none;color:inherit;font-size:24px;line-height:1;cursor:pointer}.myAsX:hover,.myAsX:focus-visible{background:color-mix(in srgb,var(--accent,#1f5fbf) 14%,transparent);outline:none}
.myAsBar{height:6px;border-radius:99px;background:var(--line,#d3dce4);overflow:hidden}.myAsBar i{display:block;height:100%;background:var(--gold,#e8912a);transition:width .35s}
.myAsC{background:var(--panel,#fff);border:1px solid var(--line,#d3dce4);border-radius:var(--r-lg,18px);padding:16px;display:grid;gap:12px;grid-template-columns:minmax(0,1fr);box-shadow:var(--sh1,0 1px 3px rgba(10,20,50,.1))}
.myAsTp{display:flex;gap:8px;align-items:center;font-size:12.5px;color:var(--muted,#566574)}.myAsTp .myRl{min-height:24px}
.myAsQ{margin:0;font-size:17px;line-height:1.85;font-weight:600;overflow-wrap:anywhere}
.myOps{display:grid;gap:8px;grid-template-columns:minmax(0,1fr)}
.myOp{display:flex;align-items:center;gap:10px;text-align:start;min-height:48px;padding:8px 14px;border-radius:14px;border:1.5px solid var(--line,#d3dce4);background:var(--panel2,var(--panel,#fff));color:inherit;font:inherit;font-size:15px;line-height:1.7;cursor:pointer;overflow-wrap:anywhere}
.myOp:hover:not([disabled]){border-color:var(--accent,#1f5fbf)}.myOp i{flex:none;width:26px;height:26px;border-radius:50%;border:1.5px solid currentColor;display:grid;place-items:center;font-style:normal;font-size:12.5px;opacity:.75}
.myOp.ok{border-color:#1f9d55;background:color-mix(in srgb,#1f9d55 14%,var(--panel,#fff))}.myOp.no{border-color:#c0392b;background:color-mix(in srgb,#c0392b 12%,var(--panel,#fff))}.myOp[disabled]{cursor:default}
.myFb{border-radius:14px;padding:10px 14px;font-size:14px;line-height:1.8;border:1px solid var(--line,#d3dce4);background:color-mix(in srgb,var(--accent,#1f5fbf) 7%,var(--panel,#fff))}.myFb b{display:block}
.myTm{font-size:13px;color:var(--muted,#566574)}.myTm.lo{color:#c0392b;font-weight:700}
.myRs{display:grid;gap:14px;grid-template-columns:minmax(0,1fr)}
.myRsT{display:grid;grid-template-columns:96px minmax(0,1fr);gap:16px;align-items:center}.myRsT .myRg{width:96px;height:96px}.myRsT .myRg b{font-size:21px}.myRsL{font-size:22px;font-weight:700}
.myBb{display:grid;grid-template-columns:minmax(0,1fr);gap:8px}.myBr{display:grid;grid-template-columns:minmax(80px,30%) minmax(0,1fr) 54px;gap:8px;align-items:center;font-size:13.5px}
.myBr .t{height:10px;border-radius:99px;background:var(--line,#d3dce4);overflow:hidden}.myBr .t i{display:block;height:100%;border-radius:99px;background:var(--accent,#1f5fbf)}.myBr.weak .t i{background:var(--signal,#b8730a)}.myBr .v{font-size:12px;color:var(--muted,#566574);text-align:end;white-space:nowrap}
.myBk{display:grid;grid-template-columns:72px minmax(0,1fr);gap:12px;align-items:center}.myBk .bobav{flex:none}.myBkT{font-size:14.5px;line-height:1.85;overflow-wrap:anywhere}
.myRc{display:grid;gap:8px;grid-template-columns:minmax(0,1fr)}.myRc button{display:flex;justify-content:space-between;gap:10px;align-items:center;min-height:46px;padding:6px 14px;border-radius:14px;border:1px solid var(--line,#d3dce4);background:var(--panel,#fff);color:inherit;font:inherit;font-size:14.5px;text-align:start;cursor:pointer}
.myRc button:hover,.myRc button:focus-visible{border-color:var(--accent,#1f5fbf);outline:none}.myRc small{color:var(--muted,#566574);font-size:12px;white-space:nowrap}
.myAs h4{margin:0;font-size:14px}
@media (prefers-reduced-motion:reduce){.myAsBar i,.myRg .fg{transition:none}}`;
  document.head.appendChild(st);
}
const myAsLet=(i)=>(myLang()==="en"?"ABCDEFG":"أبجدهوز").charAt(i);
function myAsHead(title,n){ return `<div class="myAsH"><b id="myAsT">${myEsc2(title)}</b>${n?`<span class="myAsN">${myEsc2(n)}</span>`:""}<button type="button" class="myAsX" data-myas="close" aria-label="${myEsc2(myTx({ar:"إغلاق",en:"Close"}))}">×</button></div>`; }
function myAsIntro(){
  MYAS.screen="intro"; const nm=myName(), pool=myAsPool(), tt=myTx({ar:"تقييم المستوى",en:"Level assessment"});
  MYAS.el.querySelector(".myAsW").innerHTML=myAsHead(tt)+`<div class="myAsC"><p class="myAsQ" style="font-weight:500">${myEsc2(nm?myTx({ar:`أهلاً يا ${myIso(nm)}! `,en:`Hello, ${myIso(nm)}! `}):"")}${myEsc2(myTx({ar:"عشرة أسئلة تقريباً من دروس الموقع. تبدأ متوسطة، وتصعب إذا أجبت صحيحاً وتسهل إذا أخطأت. بعدها تقرير بمستواك ونقاط القوة والضعف ودروس مقترحة.",en:"About ten questions from the site's lessons. They start at medium difficulty, get harder when you answer correctly and easier when you don't. Then a report with your level, strengths, weaknesses and suggested lessons."}))}</p>
    <p class="myMs">${myEsc2(myTx({ar:"لا يؤثّر التقييم على تقدّمك في الدروس، ولا يغادر شيء متصفحك.",en:"The assessment does not affect your lesson progress, and nothing leaves your browser."}))}</p>
    <label class="myRow" style="gap:10px;cursor:pointer"><input type="checkbox" id="myAsTm" ${MYAS.timer?"checked":""} style="width:20px;height:20px"><span>${myEsc2(myTx({ar:"مؤقّت لكل سؤال (٤٥ ثانية)",en:"Timer for each question (45 s)"}))}</span></label>
    <div class="myRow"><button type="button" class="myBt" data-myas="start"${pool.length<4?" disabled":""}>${myEsc2(myTx({ar:"ابدأ",en:"Start"}))}</button><button type="button" class="myBt alt" data-myas="close">${myEsc2(myTx({ar:"لاحقاً",en:"Later"}))}</button></div>${pool.length<4?`<p class="myMs">${myEsc2(myTx({ar:"لا توجد أسئلة كافية في الدروس المحمّلة.",en:"There are not enough questions in the loaded lessons."}))}</p>`:""}</div>`;
  const f=MYAS.el.querySelector("[data-myas=start]"); if(f) try{ f.focus(); }catch(e){}
}
function myAsQuestion(){
  const S=MYAS.S; clearInterval(MYAS.tm); const c=myAsNext(S,myAsPool());
  if(!c||S.qn>=S.n){ return myAsResult(); }
  S.cur=c; S.qn++; MYAS.screen="q"; const w=MYAS.el.querySelector(".myAsW"), lvN=[,myTx({ar:"سهل",en:"Easy"}),myTx({ar:"متوسط",en:"Medium"}),myTx({ar:"صعب",en:"Hard"})][c.lvl];
  w.innerHTML=myAsHead(myTx({ar:"تقييم المستوى",en:"Level assessment"}),myTx({ar:`سؤال ${S.qn} من ${S.n}`,en:`Question ${S.qn} of ${S.n}`}))+`<div class="myAsBar" role="progressbar" aria-valuemin="0" aria-valuemax="${S.n}" aria-valuenow="${S.qn-1}"><i style="width:${Math.round((S.qn-1)/S.n*100)}%"></i></div>
   <div class="myAsC"><div class="myAsTp"><span class="myRl">${myEsc2(myTx(MY_TOPICS[c.topic]))}</span><span>${myEsc2(lvN)}</span>${MYAS.timer?`<span class="myTm" id="myTm" aria-hidden="true"></span>`:""}</div>
   <p class="myAsQ" id="myAsQ">${myEsc2(c.q.q)}</p>
   <div class="myOps" role="radiogroup" aria-labelledby="myAsQ">${c.order.map((oi,k)=>`<button type="button" class="myOp" role="radio" aria-checked="false" data-myop="${k}"><i aria-hidden="true">${myAsLet(k)}</i><span>${myEsc2(c.q.o[oi])}</span></button>`).join("")}</div>
   <div id="myFb" aria-live="polite"></div></div>`;
  const f=w.querySelector(".myOp"); if(f) try{ f.focus({preventScroll:true}); }catch(e){}
  if(MYAS.timer){ S.t0=Date.now(); const tick=()=>{ const left=Math.max(0,45-Math.floor((Date.now()-S.t0)/1000)), el=MYAS.el&&MYAS.el.querySelector("#myTm"); if(el){ el.textContent=left+" "+myTx({ar:"ث",en:"s"}); el.classList.toggle("lo",left<=10); } if(left<=0){ clearInterval(MYAS.tm); myAsAnswer(-1); } }; tick(); MYAS.tm=setInterval(tick,500); }
}
function myAsAnswer(k){
  const S=MYAS.S, c=S&&S.cur; if(!c||c.done) return; c.done=true; clearInterval(MYAS.tm);
  const ok=k===c.ans; S.asked.push({topic:c.topic,lvl:c.lvl,ok,id:c.q.id,b:c.q.b,i:c.q.i}); S.lvl=Math.max(1,Math.min(3,S.lvl+(ok?1:-1)));
  const w=MYAS.el.querySelector(".myAsW"); w.querySelectorAll(".myOp").forEach((b,j)=>{ b.disabled=true; b.setAttribute("aria-checked",String(j===k)); if(j===c.ans) b.classList.add("ok"); else if(j===k) b.classList.add("no"); });
  const last=S.qn>=S.n;
  w.querySelector("#myFb").innerHTML=`<div class="myFb"><b>${myEsc2(k<0?myTx({ar:"انتهى الوقت.",en:"Time is up."}):ok?myTx({ar:"صحيح!",en:"Correct!"}):myTx({ar:"غير صحيح.",en:"Not quite."}))}</b>${c.q.why?`<span>${myEsc2(c.q.why)}</span>`:""}</div><div class="myRow" style="margin-top:10px"><button type="button" class="myBt" data-myas="next">${myEsc2(last?myTx({ar:"عرض النتيجة",en:"See the result"}):myTx({ar:"التالي",en:"Next"}))}</button></div>`;
  const bar=w.querySelector(".myAsBar i"); if(bar) bar.style.width=Math.round(S.qn/S.n*100)+"%";
  const nb=w.querySelector("[data-myas=next]"); if(nb) try{ nb.focus({preventScroll:true}); nb.scrollIntoView&&nb.scrollIntoView({block:"nearest"}); }catch(e){}
  try{ if(typeof bobMood==="function") bobMood(ok?"happy":"idle",1600); }catch(e){}
}
function myAsResult(){
  const S=MYAS.S, res=myAsScore(S.asked); MYAS.res=res; MYAS.screen="result"; clearInterval(MYAS.tm);
  const lv=myLevelOf(res.lvl), p=myProfile()||{}, rec=myAsRec(res,p.role||S.role), date=new Date().toISOString();
  mySaveProfile({level:res.lvl,assess:{score:res.pct,lvl:res.lvl,date,n:res.n,ok:res.ok,topics:Object.keys(res.topics).reduce((o,t)=>{ o[t]=res.topics[t].pct; return o; },{}),rec:rec.map(x=>({b:x.b,i:x.i}))}});
  const text=myAsReport(res,p.name,myLang()), w=MYAS.el.querySelector(".myAsW"); MYAS.text=text;
  const bars=Object.keys(res.topics).sort((a,b)=>res.topics[b].pct-res.topics[a].pct).map(t=>{ const x=res.topics[t], weak=x.pct<=40; return `<div class="myBr${weak?" weak":""}"><span>${myEsc2(myTx(MY_TOPICS[t]))}</span><span class="t"><i style="width:${Math.max(4,x.pct)}%"></i></span><span class="v">${x.ok}/${x.n} · ${x.pct}%${x.pct>=75?"":""}</span></div>`; }).join("");
  const recH=rec.map(x=>{ const L=LESSONS[x.b]&&LESSONS[x.b][x.i], B=LBOOK[x.b]; return L?`<button type="button" data-myas="lesson:${x.b}:${x.i}"><span>${myEsc2(L.ar)}<br><small>${myEsc2(B?B.ar:"")} · ${myEsc2(myTx(MY_TOPICS[x.topic]))}</small></span><small>${myEsc2(myTx({ar:"افتح",en:"Open"}))}</small></button>`:""; }).join("");
  w.innerHTML=myAsHead(myTx({ar:"نتيجة التقييم",en:"Assessment result"}))+`<div class="myRs"><div class="myAsC"><div class="myRsT">${myRing(res.pct/100,res.pct+"%")}<div><div class="myRsL">${myEsc2(myTx(lv))}</div><p class="myMs">${myEsc2(myTx({ar:`${res.ok} من ${res.n} إجابة صحيحة`,en:`${res.ok} of ${res.n} answers correct`}))} · ${myEsc2(myAsDate(date))}</p></div></div></div>
    <div class="myAsC"><div class="myBk"><span id="myAsBob" aria-hidden="true"></span><div class="myBkT" id="myAsTx">${myEsc2(text)}</div></div>${typeof bobSpeakBtn==="function"?`<div>${bobSpeakBtn(myTx({ar:"اسمعني",en:"Listen"}))}</div>`:""}</div>
    <div class="myAsC"><h4>${myEsc2(myTx({ar:"نقاط القوة والضعف",en:"Strengths and weaknesses"}))}</h4><div class="myBb">${bars}</div></div>
    ${recH?`<div class="myAsC"><h4>${myEsc2(myTx({ar:"دروس مقترحة لك",en:"Suggested lessons for you"}))}</h4><div class="myRc">${recH}</div></div>`:""}
    <div class="myRow"><button type="button" class="myBt alt" data-myas="again">${myEsc2(myTx({ar:"أعد التقييم",en:"Retake"}))}</button><button type="button" class="myBt" data-myas="close">${myEsc2(myTx({ar:"إغلاق",en:"Close"}))}</button></div></div>`;
  try{ if(typeof bobMount==="function"){ if(MYAS.bob) MYAS.bob.destroy(); MYAS.bob=bobMount(w.querySelector("#myAsBob"),{size:72,view:"bust",mood:"happy"}); } }catch(e){ MYAS.bob=null; }
  try{ if(typeof bobSay==="function"){ bobStop(); bobSay(text,{lang:myLang(),priority:"high",caption:false,key:"myas",keyMs:0}); } }catch(e){}
  const f=w.querySelector(".myAsX"); if(f) try{ f.focus({preventScroll:true}); }catch(e){}
  myRefreshHome();
}
function myAssessOpen(o){
  try{
    myCssOnce(); myAsCss(); o=o||{};
    if(!MYAS.el){ const el=document.createElement("div"); el.className="myAs"; el.id="myAs"; el.hidden=true; el.setAttribute("role","dialog"); el.setAttribute("aria-modal","true"); el.setAttribute("aria-labelledby","myAsT"); el.innerHTML='<div class="myAsW"></div>'; document.body.appendChild(el); MYAS.el=el;
      el.addEventListener("click",e=>{ const sp=e.target.closest(".bobspk"); if(sp){ if(MYAS.text&&typeof bobRead==="function") bobRead(MYAS.text,sp); return; } const op=e.target.closest("[data-myop]"); if(op){ myAsAnswer(+op.dataset.myop); return; }
        const b=e.target.closest("[data-myas]"); if(!b) return; const k=b.dataset.myas.split(":");
        if(k[0]==="close") myAssessClose(); else if(k[0]==="start"){ const cb=el.querySelector("#myAsTm"); MYAS.timer=!!(cb&&cb.checked); const p=myProfile(); MYAS.S=myAsNew(p&&p.role,10); myAsQuestion(); }
        else if(k[0]==="next") myAsQuestion(); else if(k[0]==="again"){ try{ bobStop(); }catch(er){} myAsIntro(); }
        else if(k[0]==="lesson"){ myAssessClose(); try{ uiOpenLesson(k[1],k[2]); }catch(er){} } });
      el.addEventListener("keydown",e=>{
        if(e.key==="Escape"){ e.stopPropagation(); myAssessClose(); return; }
        if(MYAS.screen==="q"&&/^[1-4]$/.test(e.key)&&!e.ctrlKey&&!e.metaKey&&!e.altKey){ const b=el.querySelectorAll(".myOp")[+e.key-1]; if(b&&!b.disabled){ e.preventDefault(); b.click(); } return; }
        if(e.key==="Tab"){ const f=[...el.querySelectorAll("button:not([disabled]),input,a[href]")].filter(x=>x.offsetParent!==null); if(!f.length) return; const i=f.indexOf(document.activeElement);
          if(e.shiftKey&&i<=0){ e.preventDefault(); f[f.length-1].focus(); } else if(!e.shiftKey&&(i===f.length-1||i<0)){ e.preventDefault(); f[0].focus(); } } }); }
    MYAS.prev=document.activeElement; MYAS.S=null; MYAS.el.hidden=false; MYAS.el.scrollTop=0; document.documentElement.style.overflow="hidden";
    try{ if(typeof BW!=="undefined"&&BW.open&&typeof bwClose==="function") bwClose("assess"); }catch(e){}
    myAsIntro(); return true;
  }catch(e){ console.error(e); return false; }
}
function myAssessClose(){
  if(!MYAS.el||MYAS.el.hidden) return; clearInterval(MYAS.tm); MYAS.el.hidden=true; document.documentElement.style.overflow="";
  try{ if(MYAS.bob) MYAS.bob.destroy(); }catch(e){} MYAS.bob=null; try{ if(typeof bobStop==="function") bobStop(); }catch(e){}
  try{ if(MYAS.prev&&MYAS.prev.isConnected&&MYAS.prev.focus) MYAS.prev.focus({preventScroll:true}); }catch(e){}
  myRefreshHome();
}
document.addEventListener("il-lang",()=>{ if(MYAS.el&&!MYAS.el.hidden&&MYAS.screen==="intro") myAsIntro(); });
