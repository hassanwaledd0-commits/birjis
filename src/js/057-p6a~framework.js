/* ---------- framework ---------- */
function lrnCur(){ return LESSONS[LRN.book][LRN.i]; }
/* progress: a lesson counts as done once every quiz question in it has been answered correctly */
const LDONE=(()=>{ try{ return new Set(JSON.parse(localStorage.getItem("atlas-lrn-done")||"[]")); }catch(e){ return new Set(); } })();
function lrnDoneN(b){ return LESSONS[b].reduce((a,l,i)=>a+(LDONE.has(b+":"+i)?1:0),0); }
function arCount(n,one,two,few,many){ if(n===1) return one; if(n===2) return two; const m=n%100; if(n>=100&&m<=2) return n+" "+(m===0?one.split(" ")[0]:one.split(" ")[0]); return n+" "+(m>=3&&m<=10?few:many); }
function lrnN(n){ return arCount(n,"درس واحد","درسان","دروس","درساً"); }
function lrnBookEm(b){ const d=lrnDoneN(b), n=LESSONS[b].length; return d?`${lrnN(n)} · ${d} مكتمل`:lrnN(n); }
/* search across every lesson in every book (Arabic letters normalised so أ/ا, ة/ه, ى/ي match) */
const arNorm=s=>(s||"").toLowerCase().replace(/[\u064B-\u0652\u0640]/g,"").replace(/[أإآٱ]/g,"ا").replace(/ة/g,"ه").replace(/ى/g,"ي").replace(/ؤ/g,"و").replace(/ئ/g,"ي");
let LIDXC=null;
function lrnSearch(q){ const w=arNorm(q).trim().split(/\s+/).filter(x=>x.length>1); if(!w.length) return null;
  if(!LIDXC){ LIDXC=[]; Object.keys(LESSONS).forEach(b=>LESSONS[b].forEach((l,i)=>LIDXC.push(l._dl?dlIdxEntry(b,i):{b,i,t:arNorm(l.ar+" "+l.en),x:arNorm((l.intro||[]).join(" ")+" "+(l.alt||"")+" "+(l.ref||""))}))); }
  const out=[]; LIDXC.forEach(e=>{ let sc=0; for(const k of w){ if(e.t.includes(k)) sc+=3; else if(e.x.includes(k)) sc+=1; else return; } out.push([sc,e]); });
  return out.sort((a,b)=>b[0]-a[0]).slice(0,12).map(x=>x[1]); }
function lrnRes(q){ const box=LRN.el&&LRN.el.querySelector("#lRes"); if(!box) return; const r=lrnSearch(q);
  if(!r){ box.hidden=true; box.innerHTML=""; return; } box.hidden=false;
  box.innerHTML=r.length?`<p class="status">${r.length===12?"أفضل 12 نتيجة":"النتائج: "+r.length}</p>`+r.map(e=>{ const l=LESSONS[e.b][e.i]; return `<button type="button" data-go="${e.b}:${e.i}"><b>${l.ar}</b><small>${LBOOK[e.b].ar} · الدرس ${e.i+1}${LDONE.has(e.b+":"+e.i)?" · ✓":""}</small></button>`; }).join(""):`<p class="status">لا توجد دروس مطابقة. جرّب كلمة أقصر أو بالإنجليزية.</p>`; }
function lrnIdxScroll(){ const nav=LRN.el&&LRN.el.querySelector("#lIdx"), cur=nav&&nav.querySelector('[aria-current="true"]'); if(!cur||nav.scrollWidth<=nav.clientWidth+2) return;
  const a=cur.getBoundingClientRect(), b=nav.getBoundingClientRect(); nav.scrollLeft+=(a.left+a.width/2)-(b.left+b.width/2); }
function lrnHTML(){
  return `<div class="lrn">
    ${dlrGroups().map(([g,t])=>`<h4 class="lgh">${t}</h4><div class="lbooks" role="group" aria-label="${t}">${Object.keys(LBOOK).map((b,i)=>(LBOOK[b].grp||"ref")!==g?"":`<button type="button" class="lbk" data-book="${b}" aria-pressed="${LRN.book===b}"><span class="lbn">${i+1}</span><b>${LBOOK[b].ar}</b><small>${LBOOK[b].en}</small><em>${lrnBookEm(b)}</em></button>`).join("")}</div>`).join("")}
    <div class="lsrch" role="search"><label for="lQ">ابحث في كل الدروس</label><input id="lQ" type="search" enterkeyhint="search" autocomplete="off" placeholder="مثلاً: الرفع، المدار، Mach، القلاب"><div class="lres" id="lRes" hidden></div></div>
    <nav class="lidx" id="lIdx" aria-label="قائمة الدروس"></nav>
    <article class="lesson" id="lArt"></article>
    <p class="status">الشرح والرسوم هنا مكتوبة من جديد وتغطّي المواضيع الأساسية للكتاب أو المسار، وليست نقلاً لنصّ أي كتاب. للتعمّق ارجع إلى المرجع المذكور في كل درس.</p>
  </div>`;
}
function lrnIdx(){ return LESSONS[LRN.book].map((l,i)=>{ const dn=LDONE.has(LRN.book+":"+i); return `<button type="button" data-li="${i}" aria-current="${i===LRN.i}"${dn?' class="dn" title="مكتمل"':''}><span>${dn?"✓":i+1}</span>${l.ar}</button>`; }).join(""); }
function lrnArt(){
  const L=LESSONS[LRN.book], l=L[LRN.i], st=LRN.st;
  return `<header class="lhd"><span class="status">الدرس ${LRN.i+1} من ${L.length} · ${LBOOK[LRN.book].ar}</span><div class="lhrow"><h3>${l.ar}</h3>${starBtn(lessonKey(LRN.book,LRN.i))}</div><span class="len">${l.en}</span></header>
    ${l.intro.map(p=>`<p class="lintro">${p}</p>`).join("")}
    <div class="lcvw"><canvas class="lcv" id="lCv" role="img" aria-label="${l.alt||l.ar}"></canvas></div>
    ${(l.ctl||[]).length?`<div class="lctl">${l.ctl.map(c=>`<label class="lrow"><span>${c.ar}</span><b id="lv_${c.k}"></b><input type="range" data-k="${c.k}" min="${c.min}" max="${c.max}" step="${c.step}" value="${st[c.k]}"></label>`).join("")}</div>`:""}
    <div class="presets">
      ${(l.tog||[]).map(t=>`<button class="btn tg" type="button" data-tg="${t.k}" aria-pressed="${!!st[t.k]}">${t.ar}</button>`).join("")}
      ${(l.pre||[]).map((p,i)=>`<button class="btn" type="button" data-pre="${i}">${p.ar}</button>`).join("")}
      ${l.act?`<button class="btn" type="button" data-act="1">${l.act.ar}</button>`:""}
      <button class="btn" type="button" id="lPlay" aria-pressed="${!LRN.play}">${LRN.play?"إيقاف الحركة":"تشغيل الحركة"}</button>
    </div>
    <div class="labro" id="lRo"></div>
    <div class="lgrid">
      <section class="leq"><h4>المعادلات</h4>${l.eq.map(e=>`<div class="eq">${e}</div>`).join("")}</section>
      <section class="lnote"><h4>لاحظ</h4><ul>${l.note.map(n=>`<li>${n}</li>`).join("")}</ul></section>
    </div>
    ${tutHTML()}
    <section class="lquiz"><h4>اختبر نفسك</h4>${l.quiz.map((q,qi)=>`<div class="lq"><p>${q.q}</p><div class="lqo">${q.o.map((o,oi)=>`<button class="btn" type="button" data-q="${qi}" data-o="${oi}">${o}</button>`).join("")}</div><p class="lqa" id="lqa${qi}" aria-live="polite"></p></div>`).join("")}</section>
    ${noteBox(lessonKey(LRN.book,LRN.i))}
    <p class="lref">المرجع للتوسّع: <span dir="ltr">${LBOOK[LRN.book].dl&&LBOOK[LRN.book].refs?LBOOK[LRN.book].refs:LBOOK[LRN.book].en+(LBOOK[LRN.book].au?" — "+LBOOK[LRN.book].au:"")}</span>، ${l.ref}</p>
    <div class="lnav">
      <button class="btn" type="button" data-nav="-1" ${LRN.i===0?"disabled":""}>الدرس السابق</button>
      ${l.show?`<button class="btn pri" type="button" data-show="1">${l.show.ar}</button>`:""}
      <button class="btn" type="button" data-nav="1" ${LRN.i===L.length-1?"disabled":""}>الدرس التالي</button>
    </div>`;
}
function lrnInit(){
  const l=lrnCur(), st={}; (l.ctl||[]).forEach(c=>st[c.k]=c.v); (l.tog||[]).forEach(t=>st[t.k]=!!t.v); st.t=0;
  LRN.st=st; if(l.init) l.init(st); if(l.calc) l.calc(st);
}
function lrnOpen(b,i,scroll){
  try{ dlEnsure(b,i); }catch(e){ console.error(e); }   /* data lessons are compiled on first use (x_dl_run.js) */
  LRN.book=b; LRN.i=i; LRN.qok={}; lrnInit();
  const el=LRN.el; if(!el) return;
  el.querySelectorAll("[data-book]").forEach(x=>x.setAttribute("aria-pressed",x.dataset.book===b));
  el.querySelector("#lIdx").innerHTML=lrnIdx(); lrnIdxScroll();
  const art=el.querySelector("#lArt"); art.innerHTML=lrnArt(); art.style.animation="none"; void art.offsetWidth; art.style.animation="";
  LRN.cv=el.querySelector("#lCv"); lrnSync();
  try{ tutInit(el); }catch(e){ console.error(e); }
  try{ localStorage.setItem("atlas-lrn",JSON.stringify({b,i})); }catch(e){}
  if(scroll){ const a=el.querySelector("#lArt"); if(a&&a.scrollIntoView) a.scrollIntoView({behavior:"smooth",block:"start"}); }
}
function lrnSync(){
  const l=lrnCur(), st=LRN.st, el=LRN.el; if(!el) return;
  (l.ctl||[]).forEach(c=>{ const b=el.querySelector("#lv_"+c.k); if(b) b.textContent=c.f?c.f(st[c.k],st):nf(st[c.k],2);
    const inp=el.querySelector('input[data-k="'+c.k+'"]'); if(inp&&parseFloat(inp.value)!==st[c.k]) inp.value=st[c.k]; });
  el.querySelectorAll("[data-tg]").forEach(b=>b.setAttribute("aria-pressed",!!st[b.dataset.tg]));
  const ro=el.querySelector("#lRo"); if(ro) ro.innerHTML=l.ro(st).map(([a,b])=>`<div><span>${a}</span><b>${b}</b></div>`).join("");
}
function lrnRecalc(){ const l=lrnCur(); if(l.calc) l.calc(LRN.st); lrnSync(); }
function lrnInput(e){
  if(e.target&&e.target.id==="lQ"){ lrnRes(e.target.value); return; }
  const k=e.target&&e.target.dataset&&e.target.dataset.k; if(!k) return;
  LRN.st[k]=parseFloat(e.target.value); const l=lrnCur(); if(l.onSet) l.onSet(LRN.st,k); lrnRecalc();
}
function lrnShow(fn){
  const v=document.getElementById("view"); if(v&&v.scrollIntoView) v.scrollIntoView({behavior:"smooth",block:"start"});
  try{ fn(); }catch(err){ console.error(err); }
}
function lrnClick(e){
  const b=e.target.closest("button"); if(!b||!LRN.el||!LRN.el.contains(b)) return;
  const d=b.dataset, l=lrnCur();
  if(d.tut!==undefined){ tutAsk(d.tut); return; }
  if(d.lv){ tutLevel(d.lv); return; }
  if(d.why!==undefined){ tutWhy(+d.why,+d.o2); return; }
  if(d.go){ const p=d.go.split(":"), q=LRN.el.querySelector("#lQ"); if(q) q.value=""; lrnRes(""); lrnOpen(p[0],+p[1],true); return; }
  if(d.book){ if(d.book!==LRN.book) lrnOpen(d.book,0,false); return; }
  if(d.li!==undefined){ lrnOpen(LRN.book,+d.li,false); return; }
  if(d.nav){ const n=LRN.i+(+d.nav); if(n>=0&&n<LESSONS[LRN.book].length) lrnOpen(LRN.book,n,true); return; }
  if(d.tg){ LRN.st[d.tg]=!LRN.st[d.tg]; if(l.onSet) l.onSet(LRN.st,d.tg); lrnRecalc(); return; }
  if(d.pre!==undefined){ Object.assign(LRN.st,l.pre[+d.pre].set); if(l.onSet) l.onSet(LRN.st,"pre"); lrnRecalc(); return; }
  if(d.act){ l.act.fn(LRN.st); lrnRecalc(); return; }
  if(b.id==="lPlay"){ LRN.play=!LRN.play; b.setAttribute("aria-pressed",!LRN.play); b.textContent=LRN.play?"إيقاف الحركة":"تشغيل الحركة"; return; }
  if(d.q!==undefined){
    const q=l.quiz[+d.q], ok=(+d.o)===q.a, wrap=b.closest(".lq");
    wrap.querySelectorAll("button").forEach(x=>x.classList.remove("ok","no"));
    b.classList.add(ok?"ok":"no"); if(!ok){ const c=wrap.querySelector('[data-o="'+q.a+'"]'); if(c) c.classList.add("ok"); }
    const a=wrap.querySelector(".lqa"); if(a) a.textContent=(ok?"صحيح. ":"ليس تماماً. ")+q.why;
    { let w=wrap.querySelector(".lwhy"); if(!ok&&typeof SAMPLE!=="undefined"&&SAMPLE){ if(!w){ w=document.createElement("button"); w.type="button"; w.className="btn lwhy"; wrap.appendChild(w); } w.dataset.why=d.q; w.dataset.o2=d.o; w.textContent="اشرح لي أين أخطأت"; } else if(w) w.remove(); }
    LRN.qok=LRN.qok||{}; if(ok) LRN.qok[+d.q]=1; try{ srsAnswer(LRN.book,LRN.i,+d.q,ok); }catch(x){}
    const key=LRN.book+":"+LRN.i; if(!LDONE.has(key)&&l.quiz.every((_,qi)=>LRN.qok[qi])){ LDONE.add(key); try{ dayAct("l"); }catch(x){} try{ lvAward("l","lesson:"+key,20); }catch(x){} try{ localStorage.setItem("atlas-lrn-done",JSON.stringify([...LDONE])); }catch(e){}
      LRN.el.querySelector("#lIdx").innerHTML=lrnIdx(); const bk=LRN.el.querySelector('[data-book="'+LRN.book+'"] em'); if(bk) bk.textContent=lrnBookEm(LRN.book); }
    return;
  }
  if(d.show&&l.show){ lrnShow(l.show.fn); }
}
function lrnLoop(ts){
  if(!LRN.run) return;
  LRN.raf=requestAnimationFrame(lrnLoop);
  const dt=LRN.last?Math.min(0.05,Math.max(0,(ts-LRN.last)/1000)):0.016; LRN.last=ts;
  const cv=LRN.cv; if(!cv||!cv.isConnected||document.hidden) return;
  if(!LRN.C||ts-LRN.cT>1000){ LRN.C=lrnColors(); LRN.cT=ts; }
  let ac=null; try{ ac=S.ac; }catch(e){} if(ac!==LRN.ac){ LRN.ac=ac; lrnRecalc(); }
  const dpr=Math.min(window.devicePixelRatio||1,2), W=cv.clientWidth, H=cv.clientHeight; if(!W||!H) return;
  const pw=Math.round(W*dpr), ph=Math.round(H*dpr); if(cv.width!==pw||cv.height!==ph){ cv.width=pw; cv.height=ph; }
  const g=cv.getContext("2d"), l=lrnCur(), st=LRN.st; g.setTransform(dpr,0,0,dpr,0,0);
  try{
    if(LRN.play){ st.t+=dt; if(l.step) l.step(st,dt,W,H); }
    g.fillStyle=LRN.C.panel; g.fillRect(0,0,W,H); l.draw(g,W,H,st,LRN.C);
  }catch(err){ console.error(err); LRN.run=false; }
}
function lrnMount(root){
  const el=root.querySelector(".lrn"); if(!el) return; LRN.el=el; LRN.C=lrnColors();
  try{ const s=JSON.parse(localStorage.getItem("atlas-lrn")||"null"); if(s&&LESSONS[s.b]&&LESSONS[s.b][s.i]){ LRN.book=s.b; LRN.i=s.i; } }catch(e){}
  try{ LRN.ac=S.ac; }catch(e){}
  el.addEventListener("click",lrnClick); el.addEventListener("input",lrnInput);
  el.addEventListener("keydown",e=>{ if(e.target.id!=="lQ") return; if(e.key==="Escape"){ e.target.value=""; lrnRes(""); } else if(e.key==="Enter"){ const f=el.querySelector("#lRes [data-go]"); if(f){ e.preventDefault(); f.click(); } } });
  lrnOpen(LRN.book,LRN.i,false);
  if(LRN.pendingQ){ const q=el.querySelector("#lQ"); if(q){ q.value=LRN.pendingQ; lrnRes(LRN.pendingQ); } LRN.pendingQ=""; }
  if(!LRN.run){ LRN.run=true; LRN.last=0; LRN.raf=requestAnimationFrame(lrnLoop); }
}
function lrnStop(){ LRN.run=false; if(LRN.raf) cancelAnimationFrame(LRN.raf); LRN.raf=0; LRN.cv=null; LRN.el=null; }
/* 3D links */
function lrnSel(id,anim){ try{ select(id); if(anim!=null&&GLOK){ GL.setAnim(id,anim,false); GL.kick(); } }catch(e){ console.error(e); } }
function lrnFlowOn(){ try{ if(!S.flow){ const b=document.getElementById("bFlow"); if(b&&!b.disabled) b.click(); } }catch(e){} }

/* =====================================================================================
   Book 1 — Introduction to Flight
   ===================================================================================== */

/* 1. standard atmosphere */
LESSONS.itf.push({
  ar:"الغلاف الجوي القياسي", en:"The standard atmosphere", alt:"منحنيات الحرارة والضغط والكثافة مع الارتفاع، وعمود هواء تقل جزيئاته كلما ارتفعت",
  intro:["أداء الطائرة يعتمد على الهواء اللي تطير فيه: كثافته وضغطه وحرارته. ولأن الجو الحقيقي يتغيّر كل يوم، يستخدم المهندسون «جواً قياسياً» (ISA) كمرجع ثابت لمقارنة الطائرات والمحركات وحساب الأداء.",
         "حتى ارتفاع 11 كم تنخفض الحرارة بمعدل ثابت (6.5 درجة لكل كيلومتر)، وبعدها تثبت عند ‎−56.5°C‎ في الستراتوسفير السفلى. أما الضغط والكثافة فينخفضان بسرعة طول الطريق. حرّك الارتفاع وراقب عدد الجزيئات في نفس الحجم."],
  ctl:[{k:"h",ar:"الارتفاع",min:0,max:20000,step:100,v:11000,f:v=>nf(v/1000,1)+" km"}],
  init(st){ st.p=[]; for(let i=0;i<260;i++) st.p.push({x:Math.random(),y:Math.random(),vx:Math.random()-0.5,vy:Math.random()-0.5}); },
  calc(st){ st.a=isa(st.h); },
  step(st,dt){ st.p.forEach(q=>{ q.x+=q.vx*dt*0.3; q.y+=q.vy*dt*0.3; if(q.x<0||q.x>1) q.vx*=-1; if(q.y<0||q.y>1) q.vy*=-1; q.x=clamp(q.x,0,1); q.y=clamp(q.y,0,1); }); },
  draw(g,W,H,st,C){
    const r={x:46,y:22,w:W*0.6-56,h:H-60};
    const P=lplot(g,r,[0,1.1],[0,20],{xt:[0,0.5,1],yt:[0,5,10,15,20],yf:t=>t+" km",xl:"النسبة إلى قيمة سطح البحر",xlr:true});
    lline(g,[[r.x,P.Y(11)],[r.x+r.w,P.Y(11)]],C.muted,1,[4,4]); ltx(g,"التروبوبوز",r.x+r.w-6,P.Y(11)-9,{c:C.muted,s:10,a:"right",rtl:true});
    [["T",C.power,h=>isa(h).T/288.15,19],["p",C.ctrl,h=>isa(h).p/101325,16.5],["ρ",C.hyd,h=>isa(h).rho/1.225,14]].forEach(([n,c,f,yl])=>{
      const pts=[]; for(let h=0;h<=20000;h+=250) pts.push([P.X(f(h)),P.Y(h/1000)]); lline(g,pts,c,2.4);
      ldot(g,P.X(f(st.h)),P.Y(st.h/1000),5,c); ltx(g,n,P.X(f(yl*1000))+12,P.Y(yl),{c,s:13,w:600,m:true});
    });
    lline(g,[[r.x,P.Y(st.h/1000)],[r.x+r.w,P.Y(st.h/1000)]],C.accent,1.2);
    const cx=W*0.64, cw=W*0.32, cy=22, ch=H-60;
    g.strokeStyle=C.line; g.lineWidth=1; g.strokeRect(cx+0.5,cy+0.5,cw,ch);
    const n=Math.round(st.p.length*st.a.rho/1.225);
    for(let i=0;i<n;i++){ const q=st.p[i]; ldot(g,cx+5+q.x*(cw-10),cy+5+q.y*(ch-10),2.3,C.ctrl,0.85); }
    ltx(g,"هواء في نفس الحجم: "+n+" جزيء من 260",cx+cw/2,H-24,{c:C.muted,s:11,rtl:true});
  },
  ro(st){ const a=st.a; return [["درجة الحرارة",nf(a.T,1)+" K ("+nf(a.T-273.15,1)+"°C)"],["الضغط",nf(a.p/1000,2)+" kPa"],["الكثافة",nf(a.rho,3)+" kg/m³"],["نسبة الكثافة σ",nf(a.rho/1.225,3)],["سرعة الصوت",nf(a.a,1)+" m/s"]]; },
  eq:["T = 288.15 − 0.0065·h   (0 → 11 km)","p = p₀ (T / T₀)^5.256","T = 216.65 K ,  p = p₁₁ · e^(−g(h − 11000)/(R·T))   (11 → 20 km)","ρ = p / (R·T) ,  R = 287 J/(kg·K)","a = √(γ·R·T) ,  γ = 1.4"],
  note:["على ارتفاع التطواف (10 إلى 12 كم) كثافة الهواء حوالي ثلث قيمتها عند سطح البحر، فالطائرة تحتاج سرعة حقيقية أعلى لتولّد نفس الرفع.","سرعة الصوت تعتمد على الحرارة فقط، لذلك ثابتة في طبقة الستراتوسفير السفلى.","هذا جو «قياسي»؛ في يوم حار تقل الكثافة فتطول مسافة الإقلاع ويقل دفع المحرك."],
  quiz:[{q:"تقريباً كم تبلغ كثافة الهواء على ارتفاع 11 كم مقارنة بسطح البحر؟",o:["90%","60%","30%","5%"],a:2,why:"عند 11 كم الكثافة ≈ 0.364 kg/m³ مقابل 1.225 عند سطح البحر، أي حوالي 30%."},
        {q:"لماذا تبقى سرعة الصوت ثابتة بين 11 و20 كم في هذا النموذج؟",o:["لأن الضغط ثابت","لأن درجة الحرارة ثابتة","لأن الكثافة ثابتة"],a:1,why:"a = √(γRT) تعتمد على الحرارة فقط، والحرارة ثابتة 216.65 K في تلك الطبقة."}],
  ref:"فصل الغلاف الجوي القياسي (The Standard Atmosphere)."
});

/* 2. continuity and Bernoulli */
function vA(x,ar){ const b=(x>0.3&&x<0.7)?0.5*(1+Math.cos(2*Math.PI*(x-0.5)/0.4)):0; return 1-(1-ar)*b; }
LESSONS.itf.push({
  ar:"الاستمرارية وبرنولي", en:"Continuity and Bernoulli's equation", alt:"أنبوب فنتوري يتسارع فيه الهواء في العنق وينخفض الضغط كما تبيّنه أعمدة السائل",
  intro:["الهواء لا يختفي ولا يتكدّس: الكتلة الداخلة لأنبوب تساوي الخارجة. فإذا ضاقت المساحة لازم السرعة تزيد (معادلة الاستمرارية).",
         "وعلى طول خط الانسياب، إذا زادت السرعة نقص الضغط (معادلة برنولي). أنبوب فنتوري يوضّح الاثنين: الهواء يتسارع في العنق، وعمود السائل فوق العنق يرتفع أقل لأن الضغط هناك أقل."],
  ctl:[{k:"V1",ar:"سرعة الدخول V₁",min:10,max:80,step:1,v:30,f:v=>nf(v,0)+" m/s"},{k:"ar",ar:"نسبة مساحة العنق A₂/A₁",min:0.3,max:1,step:0.01,v:0.5,f:v=>nf(v,2)}],
  init(st){ st.p=[]; for(let i=0;i<160;i++) st.p.push({x:Math.random(),s:Math.random()*1.8-0.9}); },
  calc(st){ st.V2=st.V1/st.ar; st.dp=0.5*1.225*(st.V2*st.V2-st.V1*st.V1); st.M2=st.V2/340.3; },
  step(st,dt){ st.p.forEach(q=>{ q.x+=dt*0.09*(st.V1/30)/vA(q.x,st.ar); if(q.x>1){ q.x-=1; q.s=Math.random()*1.8-0.9; } }); },
  draw(g,W,H,st,C){
    const x0=W*0.05, x1=W*0.95, cy=H*0.7, h0=H*0.19, X=x=>x0+x*(x1-x0);
    const top=[], bot=[]; for(let i=0;i<=100;i++){ const x=i/100, A=vA(x,st.ar); top.push([X(x),cy-h0*A]); bot.push([X(x),cy+h0*A]); }
    g.fillStyle=C.bg; g.beginPath(); top.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])); bot.slice().reverse().forEach(p=>g.lineTo(p[0],p[1])); g.closePath(); g.fill();
    lline(g,top,C.ink,2); lline(g,bot,C.ink,2);
    st.p.forEach(q=>{ const A=vA(q.x,st.ar), sx=X(q.x), sy=cy+q.s*h0*A, L=4+9*(st.V1/30)/A;
      g.strokeStyle=mixC(C.ctrl,C.power,clamp(((1/A)-1)/2.3,0,1)); g.lineWidth=1.8; g.beginPath(); g.moveTo(sx-L,sy); g.lineTo(sx,sy); g.stroke(); });
    const kp=(H*0.3)/45000, hb=H*0.36;
    [[0.13,0,"1",st.V1],[0.5,st.dp,"2",st.V2]].forEach(([xx,dp,lb,V])=>{
      const sx=X(xx), wy=cy-h0*vA(xx,st.ar), hh=Math.max(4,hb-dp*kp);
      g.fillStyle=C.panel; g.strokeStyle=C.muted; g.lineWidth=1.2; g.fillRect(sx-6,H*0.06,12,wy-H*0.06); g.strokeRect(sx-6,H*0.06,12,wy-H*0.06);
      g.save(); g.globalAlpha=0.65; g.fillStyle=C.ctrl; g.fillRect(sx-5,wy-hh,10,hh); g.restore();
      ltx(g,lb,sx,cy+h0+16,{s:13,w:600,m:true}); ltx(g,"V = "+nf(V,0)+" m/s",sx,cy+h0+32,{c:C.muted,s:11,m:true});
    });
    const ya=cy-h0-hb, yb=cy-h0*st.ar-Math.max(4,hb-st.dp*kp);
    lline(g,[[X(0.13)+10,ya],[X(0.5)-10,ya]],C.muted,1,[3,3]);
    ltx(g,"Δp = "+nf(st.dp,0)+" Pa",(X(0.13)+X(0.5))/2,ya-10,{c:C.ink,s:12,m:true});
    if(yb>ya+2) larrow(g,X(0.5)+16,ya,X(0.5)+16,yb,C.power,1.5,6);
  },
  ro(st){ return [["السرعة في العنق V₂",nf(st.V2,1)+" m/s"],["فرق الضغط Δp",nf(st.dp,0)+" Pa"],["الضغط في العنق",nf((101325-st.dp)/1000,2)+" kPa"],["ماخ في العنق",nf(st.M2,2)],["افتراض عدم الانضغاط",st.M2<=0.3?"مقبول":"غير دقيق (M فوق 0.3)"]]; },
  eq:["ρ·A₁·V₁ = ρ·A₂·V₂   ⇒   V₂ = V₁·A₁/A₂","p₁ + ½ρV₁² = p₂ + ½ρV₂²","Δp = p₁ − p₂ = ½ρ(V₂² − V₁²)"],
  note:["برنولي بهذا الشكل يصلح لتدفق بطيء (ماخ أقل من 0.3 تقريباً) وبدون احتكاك وعلى نفس خط الانسياب.","بعض الطائرات الخفيفة القديمة استخدمت أنبوب فنتوري خارج الهيكل لتوليد شفط يشغّل أجهزة الجيروسكوب.","فوق الجناح يتسارع الهواء وينخفض الضغط بنفس المبدأ، لكن سبب التسارع هو شكل الجناح وزاوية الهجوم، وليس فكرة أن الجزيئات «لازم تلتقي» عند الحافة الخلفية."],
  quiz:[{q:"إذا صارت المساحة نصف ما كانت، كم تصير السرعة؟",o:["نصف","نفسها","ضعف","أربعة أضعاف"],a:2,why:"من الاستمرارية A₁V₁ = A₂V₂، فنصف المساحة يعني ضعف السرعة."},
        {q:"ماذا يحدث للضغط في عنق الأنبوب؟",o:["يرتفع","ينخفض","لا يتغيّر"],a:1,why:"السرعة أعلى في العنق، وحسب برنولي ينخفض الضغط بمقدار ½ρ(V₂² − V₁²)."}],
  ref:"فصل الديناميكا الهوائية الأساسية (Basic Aerodynamics)."
});

/* 3. pitot tube and airspeed */
const PIT={m:0.08};
function pitIn(x,y){ const ay=Math.abs(y); return ay+PIT.m*Math.atan2(ay,x)<PIT.m*Math.PI; }
function pitVel(x,y){ const r2=x*x+y*y+1e-6; return [1+PIT.m*x/r2, PIT.m*y/r2]; }
LESSONS.itf.push({
  ar:"أنبوب بيتو وقياس السرعة", en:"Pitot tube and airspeed", alt:"الهواء يتوقف عند فتحة أنبوب بيتو، ومؤشر السرعة يقرأ السرعة المؤشرة",
  intro:["الطائرة ما تقيس سرعتها مباشرة؛ تقيس فرق ضغط. فتحة أنبوب بيتو الأمامية يتوقف عندها الهواء فتحسّ «الضغط الكلي»، والفتحات الجانبية تحسّ «الضغط الساكن». الفرق بينهما مرتبط بالسرعة.",
         "لأن الفرق يعتمد على كثافة الهواء، السرعة اللي يقرأها مؤشر السرعة (IAS) على ارتفاع عالٍ أقل بكثير من السرعة الحقيقية (TAS). جرّب ترفع الارتفاع مع إبقاء السرعة الحقيقية ثابتة."],
  ctl:[{k:"V",ar:"السرعة الحقيقية TAS",min:40,max:260,step:1,v:230,f:v=>nf(v,0)+" m/s ("+nf(v*KT,0)+" kt)"},{k:"h",ar:"الارتفاع",min:0,max:13000,step:100,v:11000,f:v=>nf(v/1000,1)+" km"}],
  init(st){ st.p=[]; for(let i=0;i<170;i++) st.p.push({x:-0.9+Math.random()*2.9,y:Math.random()*1.1-0.55,h:[]}); },
  calc(st){ const a=isa(st.h); st.at=a; st.M=st.V/a.a; st.q=0.5*a.rho*st.V*st.V; st.qc=a.p*(Math.pow(1+0.2*st.M*st.M,3.5)-1);
    st.cas=340.294*Math.sqrt(5*(Math.pow(st.qc/101325+1,2/7)-1)); st.eas=st.V*Math.sqrt(a.rho/1.225); },
  step(st,dt){ const k=dt*0.55*(0.4+st.V/260);
    st.p.forEach(q=>{ const v1=pitVel(q.x,q.y), v2=pitVel(q.x+v1[0]*k/2,q.y+v1[1]*k/2); q.h.push([q.x,q.y]); if(q.h.length>7) q.h.shift();
      q.x+=v2[0]*k; q.y+=v2[1]*k; if(q.x>2||Math.abs(q.y)>0.6||pitIn(q.x,q.y)){ q.x=-0.9; q.y=Math.random()*1.1-0.55; q.h=[]; } }); },
  draw(g,W,H,st,C){
    const s=Math.min((W*0.6-16)/2.9,(H-30)/1.15), ox=8+0.9*s, oy=H/2, SX=x=>ox+x*s, SY=y=>oy-y*s;
    st.p.forEach(q=>{ if(q.h.length<2) return; lline(g,q.h.map(p=>[SX(p[0]),SY(p[1])]).concat([[SX(q.x),SY(q.y)]]),C.ctrl,1.6,null,0.7); });
    const up=[]; for(let th=0.03;th<Math.PI-0.002;th+=0.02){ const r=PIT.m*(Math.PI-th)/Math.sin(th), x=r*Math.cos(th); if(x<=2) up.push([x,r*Math.sin(th)]); }
    up.sort((a,b)=>a[0]-b[0]);
    g.fillStyle=mixC(C.panel,C.struct,0.4); g.strokeStyle=C.ink; g.lineWidth=1.5; g.beginPath();
    up.forEach((p,i)=>i?g.lineTo(SX(p[0]),SY(p[1])):g.moveTo(SX(p[0]),SY(p[1]))); up.slice().reverse().forEach(p=>g.lineTo(SX(p[0]),SY(-p[1]))); g.closePath(); g.fill(); g.stroke();
    ldot(g,SX(-PIT.m),SY(0),4,C.power); const sp=up.reduce((b,p)=>Math.abs(p[0]-1.2)<Math.abs(b[0]-1.2)?p:b,up[0]);
    ldot(g,SX(sp[0]),SY(sp[1]),3.5,C.hyd); ldot(g,SX(sp[0]),SY(-sp[1]),3.5,C.hyd);
    ltx(g,"ضغط كلي p₀",SX(-PIT.m),SY(0)-22,{c:C.power,s:11,rtl:true}); ltx(g,"ضغط ساكن p",SX(sp[0]),SY(sp[1])-14,{c:C.hyd,s:11,rtl:true});
    const dx=W*0.8, dy=H*0.47, R=Math.min(W*0.16,H*0.38);
    g.fillStyle=C.bg; g.strokeStyle=C.ink; g.lineWidth=2; g.beginPath(); g.arc(dx,dy,R,0,Math.PI*2); g.fill(); g.stroke();
    const ang=kt=>(-225+clamp(kt,0,400)/400*270)*D2R;
    for(let kt=0;kt<=400;kt+=25){ const a=ang(kt), m=kt%100===0; g.strokeStyle=C.ink; g.lineWidth=m?2:1; g.beginPath(); g.moveTo(dx+Math.cos(a)*R*(m?0.8:0.88),dy+Math.sin(a)*R*(m?0.8:0.88)); g.lineTo(dx+Math.cos(a)*R*0.96,dy+Math.sin(a)*R*0.96); g.stroke();
      if(m) ltx(g,String(kt),dx+Math.cos(a)*R*0.64,dy+Math.sin(a)*R*0.64,{s:10,m:true}); }
    const ias=st.cas*KT, a=ang(ias); larrow(g,dx,dy,dx+Math.cos(a)*R*0.82,dy+Math.sin(a)*R*0.82,C.power,3,10); ldot(g,dx,dy,4,C.ink);
    ltx(g,"IAS "+nf(ias,0)+" kt",dx,dy+R*0.38,{s:12,w:600,m:true}); ltx(g,"TAS "+nf(st.V*KT,0)+" kt",dx,dy+R+16,{c:C.muted,s:11,m:true});
  },
  ro(st){ return [["السرعة المؤشرة IAS ≈ CAS",nf(st.cas*KT,0)+" kt"],["السرعة الحقيقية TAS",nf(st.V*KT,0)+" kt"],["السرعة المكافئة EAS",nf(st.eas*KT,0)+" kt"],["ماخ",nf(st.M,3)],["الضغط الديناميكي q",nf(st.q/1000,2)+" kPa"],["p₀ − p (انضغاطي)",nf(st.qc/1000,2)+" kPa"]]; },
  eq:["p₀ − p = ½ρV²   (سرعة منخفضة)","p₀ / p = (1 + (γ−1)/2 · M²)^(γ/(γ−1))   (دون صوتي مع الانضغاط)","EAS = TAS·√σ","CAS = a₀·√(5[((p₀ − p)/p_sl + 1)^(2/7) − 1])"],
  note:["على ارتفاع 11 كم وسرعة حقيقية 230 m/s، المؤشر يقرأ حوالي 258 kt بينما الطائرة تتحرك فعلياً بحوالي 447 kt.","الرفع يعتمد على الضغط الديناميكي، فالطيار يعتمد على السرعة المؤشرة لسرعات الانهيار والهبوط بغض النظر عن الارتفاع.","انسداد فتحة بيتو (جليد أو حشرات) يعطي قراءات سرعة خاطئة، لذلك الأنابيب مدفأة وتُفحص قبل كل رحلة."],
  quiz:[{q:"على ارتفاع 11 كم والطائرة تطير 230 م/ث حقيقية، مؤشر السرعة يقرأ:",o:["أكثر من السرعة الحقيقية","نفس السرعة الحقيقية","أقل بكثير من السرعة الحقيقية"],a:2,why:"الكثافة هناك حوالي 30% من سطح البحر، فالضغط الديناميكي أصغر والمؤشر المعاير على سطح البحر يقرأ أقل."},
        {q:"لماذا يعتمد الطيار على السرعة المؤشرة لتجنب الانهيار؟",o:["لأنها تساوي السرعة الأرضية","لأنها مرتبطة بالضغط الديناميكي الذي يحدد الرفع","لأنها لا تتأثر بالارتفاع أبداً"],a:1,why:"الرفع = q·S·C_L، والسرعة المؤشرة تعكس q مباشرة، فسرعة الانهيار المؤشرة تبقى تقريباً ثابتة."}],
  ref:"فصل الديناميكا الهوائية الأساسية: قياس سرعة الهواء (Measurement of Airspeed).",
  show:{ar:"اعرض الإلكترونيات على الطائرة",fn:()=>lrnSel("avionics")}
});

/* 4. lift equation and stall */
function liftCL(st){ const f=st.fl, a0=-2, k=0.09, dc=f?0.9:0, as=f?12:14, cmax=k*(as-a0)+dc;
  const cl=st.al<=as?k*(st.al-a0)+dc:Math.max(cmax*0.62,cmax-0.07*(st.al-as)); return {cl,cmax,as,stall:st.al>as}; }
LESSONS.itf.push({
  ar:"معادلة الرفع والانهيار", en:"Lift, angle of attack and stall", alt:"طائرة جانبية مع سهم الرفع وسهم الوزن، والهواء ينفصل فوق الجناح عند الانهيار",
  intro:["الرفع يكبر مع مربع السرعة، ومع كثافة الهواء ومساحة الجناح ومعامل الرفع C_L. ومعامل الرفع يزيد مع زاوية الهجوم بشكل شبه خطي، إلى أن يصل الجناح لزاوية حرجة.",
         "بعد الزاوية الحرجة ينفصل الهواء عن السطح العلوي وينهار الرفع: هذا هو «الانهيار» (Stall). القلابات (Flaps) ترفع أقصى معامل رفع، فتخفض سرعة الانهيار للإقلاع والهبوط. القيم هنا تقريبية لجناح نقل حديث، والطائرة هي المختارة في الأعلى."],
  ctl:[{k:"V",ar:"السرعة الحقيقية",min:50,max:260,step:1,v:80,f:v=>nf(v,0)+" m/s ("+nf(v*KT,0)+" kt)"},{k:"al",ar:"زاوية الهجوم α",min:-4,max:20,step:0.5,v:6,f:v=>nf(v,1)+"°"},
       {k:"h",ar:"الارتفاع",min:0,max:13000,step:100,v:0,f:v=>nf(v/1000,1)+" km"},{k:"w",ar:"الوزن (نسبة من أقصى وزن إقلاع)",min:0.5,max:1,step:0.01,v:0.75,f:v=>nf(v*100,0)+"%"}],
  tog:[{k:"fl",ar:"القلابات منزلة",v:true}],
  init(st){ st.oy=0; },
  calc(st){ const ac=lac(), a=isa(st.h), c=liftCL(st); st.ac=ac; st.rho=a.rho; st.q=0.5*a.rho*st.V*st.V; Object.assign(st,c);
    st.L=st.q*ac.S*c.cl; st.Wt=st.w*ac.mtow*G0; st.ratio=st.L/st.Wt; st.Vs=Math.sqrt(2*st.Wt/(a.rho*ac.S*c.cmax)); },
  step(st,dt,W,H){ st.oy+=(clamp(st.ratio-1,-0.5,0.5)*H*0.3-st.oy)*dt*1.5; },
  draw(g,W,H,st,C){
    const off=(st.t*st.V*1.4)%60;
    for(let i=0;i<9;i++){ const y=H*0.1+i*H*0.1; g.save(); g.strokeStyle=C.ctrl; g.globalAlpha=0.35; g.lineWidth=1.4; g.setLineDash([26,34]); g.lineDashOffset=-off; g.beginPath(); g.moveTo(0,y); g.lineTo(W,y); g.stroke(); g.restore(); }
    const cx=W*0.45, cy=H*0.55-st.oy, sc=Math.min(W*0.62,H*1.25);
    if(st.stall){ g.save(); g.strokeStyle=C.power; g.globalAlpha=0.7; g.lineWidth=1.6;
      for(let j=0;j<5;j++){ g.beginPath(); for(let x=0;x<W*0.42;x+=6){ const y=cy-sc*0.03-j*10+Math.sin(x*0.08+st.t*9+j)*5*(1+x/120); x?g.lineTo(cx+x,y):g.moveTo(cx+x,y); } g.stroke(); } g.restore(); }
    lplane(g,cx,cy,sc,st.al,C);
    const lw=clamp(st.ratio,0,2.2)*H*0.2;
    larrow(g,cx,cy,cx,cy-lw,C.hyd,4,12); larrow(g,cx,cy,cx,cy+H*0.2,C.power,4,12);
    ltx(g,"L = "+nf(st.L/1000,0)+" kN",cx+12,cy-lw+4,{c:C.hyd,s:12,w:600,a:"left",m:true}); ltx(g,"W = "+nf(st.Wt/1000,0)+" kN",cx+12,cy+H*0.2-4,{c:C.power,s:12,w:600,a:"left",m:true});
    const s=st.stall?"انهيار: الهواء انفصل فوق الجناح":(st.ratio>1.03?"الرفع أكبر من الوزن: تصعد":(st.ratio<0.97?"الرفع أقل من الوزن: تهبط":"طيران مستوٍ: الرفع = الوزن"));
    ltx(g,s,W-12,22,{c:st.stall?C.power:C.ink,s:13,w:600,a:"right",rtl:true});
    ltx(g,st.ac.n,12,22,{c:C.muted,s:12,a:"left",m:true});
  },
  ro(st){ return [["معامل الرفع C_L",nf(st.cl,2)],["الضغط الديناميكي q",nf(st.q/1000,2)+" kPa"],["الرفع / الوزن",nf(st.ratio,2)],["أقصى C_L",nf(st.cmax,2)],["سرعة الانهيار",nf(st.Vs,0)+" m/s ("+nf(st.Vs*KT,0)+" kt)"],["زاوية الانهيار",nf(st.as,0)+"°"]]; },
  eq:["L = ½ ρ V² S C_L","C_L ≈ a (α − α_L=0)   قبل الانهيار","V_s = √(2W / (ρ S C_L,max))"],
  note:["ضاعف السرعة تجد الرفع صار أربعة أضعاف، لأن الرفع يتناسب مع V².","أنزل القلابات تلاحظ أن سرعة الانهيار تقل، لهذا تُستخدم في الإقلاع والهبوط.","عند ارتفاع أعلى تقل الكثافة فتزيد سرعة الانهيار الحقيقية، بينما سرعة الانهيار المؤشرة تبقى تقريباً نفسها."],
  quiz:[{q:"إذا تضاعفت السرعة مع بقاء كل شيء ثابتاً، الرفع يصير:",o:["ضعفين","أربعة أضعاف","نصف","نفسه"],a:1,why:"L ∝ V²، فمضاعفة السرعة تضرب الرفع في 4."},
        {q:"لماذا تُنزل القلابات عند الهبوط؟",o:["لزيادة السرعة","لرفع C_L,max وخفض سرعة الانهيار","لتقليل الوزن"],a:1,why:"القلابات تزيد انحناء الجناح ومساحته فيرتفع أقصى معامل رفع، فتطير الطائرة ببطء أكثر بأمان."}],
  ref:"فصل المقاطع والأجنحة (Airfoils, Wings, and Other Aerodynamic Shapes).",
  show:{ar:"اعرض القلابات على الطائرة",fn:()=>lrnSel("flaps",1)}
});

/* 5. finite wing and induced drag */
LESSONS.itf.push({
  ar:"الجناح المحدود والسحب المستحث", en:"Finite wings and induced drag", alt:"منظر خلفي للجناح يبيّن دوامتي الطرفين وسهام الهواء الهابط، ومنحنى السحب المستحث",
  intro:["تحت الجناح الضغط أعلى من فوقه، فيلتفّ الهواء حول الطرفين من الأسفل للأعلى ويكوّن دوامتين خلف الطائرة. هذه الدوامات تدفع الهواء خلف الجناح للأسفل (Downwash).",
         "الهواء الهابط يميل اتجاه الرفع قليلاً للخلف، فيظهر سحب إضافي اسمه «السحب المستحث». يقل كلما زادت نسبة الباع (AR)، أي الجناح الطويل النحيف، وهذا سبب أجنحة الطائرات الشراعية الطويلة."],
  ctl:[{k:"AR",ar:"نسبة الباع AR",min:4,max:30,step:0.1,v:7.5,f:v=>nf(v,1)},{k:"e",ar:"كفاءة الباع e",min:0.6,max:1,step:0.01,v:0.85,f:v=>nf(v,2)},{k:"CL",ar:"معامل الرفع C_L",min:0,max:1.5,step:0.01,v:0.5,f:v=>nf(v,2)}],
  pre:[{ar:"A380 (AR ≈ 7.5)",set:{AR:7.5}},{ar:"737-800 (AR ≈ 10.3)",set:{AR:10.3}},{ar:"طائرة شراعية (AR ≈ 25)",set:{AR:25}}],
  init(st){ st.v=[]; for(let s=-1;s<=1;s+=2) for(let i=0;i<70;i++) st.v.push({s,r:0.12+Math.random()*0.9,a:Math.random()*6.283}); },
  calc(st){ const k=1/(Math.PI*st.e*st.AR); st.CDi=st.CL*st.CL*k; st.ai=st.CL*k/D2R; st.a3=0.11/(1+57.3*0.11/(Math.PI*st.e*st.AR)); st.ref=st.CL*st.CL/(Math.PI*st.e*7.5); },
  step(st,dt){ const w=3.2*(st.CL/0.5+0.05)*(7.5/st.AR); st.v.forEach(p=>{ p.a+=p.s*dt*w/(p.r+0.25); }); },
  draw(g,W,H,st,C){
    const L=W*0.06, R=W*0.54, cy=H*0.42, cx=(L+R)/2, Rv=H*0.2;
    ltx(g,"منظر من خلف الطائرة",cx,16,{c:C.muted,s:11,rtl:true});
    lline(g,[[L,cy],[R,cy]],C.ink,4); g.fillStyle=mixC(C.panel,C.struct,0.35); g.beginPath(); g.arc(cx,cy,H*0.07,0,Math.PI*2); g.fill(); g.strokeStyle=C.ink; g.lineWidth=1.5; g.stroke();
    st.v.forEach(p=>{ const tx=p.s>0?R:L, x=tx+Math.cos(p.a)*p.r*Rv, y=cy-Math.sin(p.a)*p.r*Rv*0.85; ldot(g,x,y,2.1,C.sys,clamp(0.25+st.CL,0.25,0.95)); });
    for(let i=1;i<=5;i++){ const x=L+(R-L)*i/6; if(Math.abs(x-cx)<H*0.09) continue; larrow(g,x,cy+H*0.1,x,cy+H*0.1+clamp(st.ai*10,4,H*0.32),C.ctrl,2,7); }
    ltx(g,"هواء هابط (Downwash)",cx,H-16,{c:C.ctrl,s:11,rtl:true});
    const r={x:W*0.64,y:24,w:W*0.33,h:H-64};
    const P=lplot(g,r,[0,1.5],[0,0.12],{xt:[0,0.5,1,1.5],yt:[0,0.04,0.08,0.12],yf:t=>t.toFixed(2),xl:"C_L",yl:"C_Di"});
    const cur=[], ref=[]; for(let c=0;c<=1.5;c+=0.03){ cur.push([P.X(c),P.Y(Math.min(0.12,c*c/(Math.PI*st.e*st.AR)))]); ref.push([P.X(c),P.Y(Math.min(0.12,c*c/(Math.PI*st.e*7.5)))]); }
    lline(g,ref,C.muted,1.5,[5,4]); lline(g,cur,C.accent,2.5); ldot(g,P.X(st.CL),P.Y(Math.min(0.12,st.CDi)),5,C.accent);
    ltx(g,"منقّط: AR = 7.5",r.x+r.w-4,r.y+12,{c:C.muted,s:10,a:"right",rtl:true});
  },
  ro(st){ return [["السحب المستحث C_Di",nf(st.CDi,4)],["زاوية الهواء الهابط α_i",nf(st.ai,2)+"°"],["ميل الرفع للجناح المحدود",nf(st.a3,3)+" /°"],["مقارنة مع AR 7.5",st.ref>0?nf(st.CDi/st.ref*100,0)+"%":"—"]]; },
  eq:["C_Di = C_L² / (π e AR)","α_i = C_L / (π e AR)   (راديان)","a = a₀ / (1 + 57.3·a₀ / (π e AR))   (لكل درجة)","AR = b² / S"],
  note:["السحب المستحث أكبر ما يكون بالسرعة المنخفضة، لأن C_L عالٍ (الإقلاع والهبوط والصعود).","الجنيحات الطرفية (Winglets) تقلّل قوة الدوامة فتزيد الكفاءة الفعلية للجناح.","دوامات الطائرات الكبيرة قوية، لذلك تُفرض مسافات فصل بين الطائرات في الإقلاع والهبوط."],
  quiz:[{q:"أي جناح عنده سحب مستحث أقل عند نفس C_L ونفس e؟",o:["AR = 6","AR = 10","AR = 25"],a:2,why:"C_Di = C_L²/(π e AR)، فكلما زادت AR قلّ السحب المستحث."},
        {q:"متى يكون السحب المستحث أكبر؟",o:["بالسرعة العالية","بالسرعة المنخفضة وزاوية هجوم كبيرة","لا يتغيّر مع السرعة"],a:1,why:"بالسرعة المنخفضة يحتاج الجناح C_L كبيراً، والسحب المستحث يتناسب مع C_L²."}],
  ref:"فصل المقاطع والأجنحة: الجناح المحدود والسحب المستحث (Finite Wings, Induced Drag).",
  show:{ar:"اعرض طرف الجناح وتدفق الهواء",fn:()=>{ lrnFlowOn(); lrnSel("wingtip"); }}
});

/* 6. drag polar and thrust required */
function perfD(V,st){ const ac=st.ac, q=0.5*st.rho*V*V, CL=st.Wt/(q*ac.S), M=V/st.aa, wave=M>0.8?20*Math.pow(M-0.8,4):0;
  return {par:q*ac.S*(st.cd0+wave), ind:q*ac.S*st.k*CL*CL, CL, M}; }
LESSONS.itf.push({
  ar:"قطبية السحب والدفع المطلوب", en:"Drag polar and thrust required", alt:"منحنى الدفع المطلوب مع السرعة، والسحب الطفيلي والمستحث، وخط الدفع المتاح",
  intro:["السحب الكلي = سحب طفيلي (احتكاك وشكل) يزيد مع السرعة + سحب مستحث يقل مع السرعة. مجموعهم يرسم منحنى على شكل حوض، وأدنى نقطة فيه هي «سرعة أقل سحب» V_md، وعندها L/D أعلى ما يمكن.",
         "في الطيران المستوي الدفع المطلوب = السحب. أقصى سرعة هي اللي يتقاطع عندها الدفع المتاح مع المطلوب. قرب ماخ 0.85 يبدأ «السحب الموجي» يرتفع بسرعة، فأضفناه بصيغة تقريبية."],
  ctl:[{k:"V",ar:"السرعة الحقيقية",min:60,max:330,step:1,v:240,f:v=>nf(v,0)+" m/s"},{k:"h",ar:"الارتفاع",min:0,max:13000,step:100,v:11000,f:v=>nf(v/1000,1)+" km"},
       {k:"w",ar:"الوزن (نسبة من أقصى وزن إقلاع)",min:0.5,max:1,step:0.01,v:0.8,f:v=>nf(v*100,0)+"%"},{k:"cd0",ar:"السحب الطفيلي C_D0",min:0.014,max:0.03,step:0.0005,v:0.016,f:v=>nf(v,4)}],
  calc(st){ const ac=lac(), a=isa(st.h); st.ac=ac; st.rho=a.rho; st.aa=a.a; st.Wt=st.w*ac.mtow*G0; st.AR=ac.b*ac.b/ac.S; st.k=1/(Math.PI*ac.e*st.AR);
    st.TA=ac.T0*Math.pow(a.rho/1.225,0.75); st.LDm=1/(2*Math.sqrt(st.k*st.cd0)); st.Vmd=Math.sqrt(2*st.Wt/(a.rho*ac.S))*Math.pow(st.k/st.cd0,0.25);
    st.Vs=Math.sqrt(2*st.Wt/(a.rho*ac.S*1.45)); const d=perfD(st.V,st); st.D=d.par+d.ind; st.Mv=d.M;
    st.Vmax=null; for(let V=330;V>st.Vmd;V-=0.5){ const x=perfD(V,st); if(x.par+x.ind<=st.TA){ st.Vmax=V; break; } } },
  draw(g,W,H,st,C){
    const r={x:58,y:26,w:W-80,h:H-70}, dm=perfD(st.Vmd,st), ymax=Math.max(st.TA,dm.par+dm.ind)*1.7;
    const P=lplot(g,r,[60,330],[0,ymax],{xt:[100,150,200,250,300],yt:[0,ymax/2,ymax].map(v=>Math.round(v/1000)*1000),yf:t=>nf(t/1000,0),xl:"السرعة الحقيقية (m/s)",xlr:true,yl:"kN"});
    lclip(g,r);
    g.save(); g.globalAlpha=0.12; g.fillStyle=C.power; g.fillRect(r.x,r.y,Math.max(0,P.X(st.Vs)-r.x),r.h); g.restore();
    const par=[],ind=[],tot=[]; for(let V=60;V<=330;V+=3){ const d=perfD(V,st); par.push([P.X(V),P.Y(d.par)]); ind.push([P.X(V),P.Y(d.ind)]); tot.push([P.X(V),P.Y(d.par+d.ind)]); }
    lline(g,par,C.fuel,1.6,[5,4]); lline(g,ind,C.sys,1.6,[5,4]); lline(g,tot,C.ink,2.6);
    lline(g,[[r.x,P.Y(st.TA)],[r.x+r.w,P.Y(st.TA)]],C.hyd,2);
    lline(g,[[P.X(st.V),r.y],[P.X(st.V),r.y+r.h]],C.accent,1.4); ldot(g,P.X(st.V),P.Y(st.D),5+Math.sin(st.t*5),C.accent);
    ldot(g,P.X(st.Vmd),P.Y(dm.par+dm.ind),4,C.ink);
    g.restore();
    ltx(g,"V_md",P.X(st.Vmd),P.Y(dm.par+dm.ind)+14,{s:11,m:true});
    ltx(g,"منطقة الانهيار",r.x+6,r.y+r.h-12,{c:C.power,s:10,a:"left",rtl:true});
    const lg=[["الدفع المطلوب (السحب الكلي)",C.ink],["سحب طفيلي",C.fuel],["سحب مستحث",C.sys],["الدفع المتاح",C.hyd]];
    lg.forEach(([t,c],i)=>{ ltx(g,t,r.x+r.w-20,r.y+14+i*16,{c,s:11,a:"right",rtl:true}); lline(g,[[r.x+r.w-14,r.y+14+i*16],[r.x+r.w-4,r.y+14+i*16]],c,2.5); });
    ltx(g,st.ac.n,r.x+8,r.y+14,{c:C.muted,s:11,a:"left",m:true});
  },
  ro(st){ return [["السحب عند السرعة الحالية",nf(st.D/1000,0)+" kN"],["الدفع المتاح (تقريبي)",nf(st.TA/1000,0)+" kN"],["ماخ",nf(st.Mv,2)],["(L/D) الأعلى",nf(st.LDm,1)],["سرعة أقل سحب V_md",nf(st.Vmd,0)+" m/s"],["سرعة الانهيار (نظيف)",nf(st.Vs,0)+" m/s"],["أقصى سرعة (تقريبية)",st.Vmax?nf(st.Vmax,0)+" m/s":"الدفع لا يكفي"]]; },
  eq:["D = q S C_D0 + W² / (q S π e AR)","(L/D)max = 1 / (2√(k·C_D0)) ,  k = 1/(π e AR)","V_md = √(2W/(ρS)) · (k / C_D0)^¼","ΔC_D,wave ≈ 20 (M − M_cr)⁴   (تقريبي، M_cr = 0.80)"],
  note:["عند V_md يتساوى السحب الطفيلي والمستحث.","للمدى الأطول تطير الطائرة النفاثة أسرع من V_md بحوالي 30%، وللبقاء أطول وقت في الجو تطير قرب V_md.","الدفع المتاح يقل مع الارتفاع لأن المحرك يبلع هواء أقل كثافة؛ معامل σ^0.75 هنا تقريب شائع للتوضيح."],
  quiz:[{q:"عند سرعة أقل سحب V_md:",o:["السحب الطفيلي = السحب المستحث","السحب المستحث = صفر","السرعة = سرعة الانهيار"],a:0,why:"من اشتقاق منحنى D(V) نجد أن أدنى نقطة تكون عندما يتساوى الجزءان."},
        {q:"لماذا يرتفع السحب بسرعة قرب ماخ 0.85–0.9؟",o:["بسبب الاحتكاك فقط","بسبب ظهور موجات صدمية على الجناح (سحب موجي)","بسبب زيادة الوزن"],a:1,why:"يتسارع الهواء فوق الجناح ليتجاوز سرعة الصوت محلياً وتتكوّن صدمات تسبب السحب الموجي."}],
  ref:"فصل عناصر أداء الطائرة (Elements of Airplane Performance)."
});

/* 7. Breguet range */
function gcd(a,b){ const R=6371, f1=a[0]*D2R, f2=b[0]*D2R, dl=(b[1]-a[1])*D2R, df=f2-f1; const h=Math.sin(df/2)**2+Math.cos(f1)*Math.cos(f2)*Math.sin(dl/2)**2; return 2*R*Math.asin(Math.sqrt(h)); }
const LCITY=[["الدوحة",[25.29,51.53]],["دبي",[25.25,55.36]],["إسطنبول",[41.01,28.98]],["لندن",[51.51,-0.13]],["نيويورك",[40.71,-74.01]],["سيدني",[-33.87,151.21]]].map(([n,p])=>({n,d:gcd([33.31,44.37],p)}));
LESSONS.itf.push({
  ar:"المدى ومعادلة بريغيه", en:"Range: the Breguet equation", alt:"مسار من بغداد عليه مدن على مسافات حقيقية، وشريط المدى، وطائرة تتحرك ومؤشر وقود ينقص",
  intro:["كم تقدر الطائرة تطير؟ معادلة بريغيه تجاوب بثلاثة عوامل: كفاءة الهواء (L/D)، وكفاءة المحرك (استهلاك الوقود لكل وحدة دفع c_t)، ونسبة الوقود من الوزن. والسرعة كذلك.",
         "اللوغاريتم في المعادلة معناه أن الطائرة تخفّ وهي تحرق الوقود، فكل كيلو وقود إضافي يعطي مسافة أقل من اللي قبله. المسافات على المسار محسوبة كخط الدائرة العظمى من بغداد."],
  ctl:[{k:"LD",ar:"نسبة الرفع إلى السحب L/D",min:10,max:25,step:0.1,v:19,f:v=>nf(v,1)},{k:"c",ar:"استهلاك الوقود النوعي c_t",min:0.45,max:0.7,step:0.005,v:0.53,f:v=>nf(v,3)+" /h"},
       {k:"V",ar:"سرعة التطواف",min:200,max:260,step:1,v:250,f:v=>nf(v,0)+" m/s ("+nf(v*3.6,0)+" km/h)"},{k:"ff",ar:"نسبة الوقود من وزن الإقلاع",min:0.05,max:0.45,step:0.005,v:0.38,f:v=>nf(v*100,1)+"%"}],
  init(st){ st.tp=0; },
  calc(st){ const c=st.c/3600; st.R=(st.V/c)*st.LD*Math.log(1/(1-st.ff))/1000; st.hrs=st.R/(st.V*3.6); },
  step(st,dt){ st.tp+=dt*0.12; if(st.tp>1.25) st.tp=0; },
  draw(g,W,H,st,C){
    const Dm=17000, x0=W*0.05, x1=W*0.95, y=H*0.55, X=d=>x0+clamp(d/Dm,0,1)*(x1-x0);
    g.save(); g.lineCap="round"; g.strokeStyle=C.line; g.lineWidth=10; g.beginPath(); g.moveTo(x0,y); g.lineTo(x1,y); g.stroke();
    g.strokeStyle=C.hyd; g.globalAlpha=0.8; g.beginPath(); g.moveTo(x0,y); g.lineTo(X(st.R),y); g.stroke(); g.restore();
    for(let d=0;d<=Dm;d+=2000){ g.strokeStyle=C.muted; g.lineWidth=1; g.beginPath(); g.moveTo(X(d),y+9); g.lineTo(X(d),y+14); g.stroke(); ltx(g,nf(d/1000,0)+"k",X(d),y+24,{c:C.muted,s:10,m:true}); }
    ltx(g,"km من بغداد",x1,y+40,{c:C.muted,s:10,a:"right",rtl:true});
    LCITY.slice().sort((a,b)=>a.d-b.d).forEach((c,i)=>{ const ok=c.d<=st.R, lv=i%4, up=lv===0||lv===2, yy=up?(lv===0?y-30:y-58):(lv===1?y+52:y+80), col=ok?C.hyd:C.muted;
      lline(g,[[X(c.d),y-(up?6:-6)],[X(c.d),up?yy+8:yy-10]],col,1);
      ltx(g,c.n,X(c.d),yy-4,{c:col,s:11,w:ok?600:400,rtl:true}); ltx(g,nf(c.d,0),X(c.d),yy+9,{c:col,s:9,m:true}); });
    ldot(g,x0,y,5,C.ink); ltx(g,"بغداد",x0,y-20,{s:11,w:600,rtl:true});
    const f=clamp(st.tp,0,1), px=X(st.R*f);
    g.save(); g.translate(px,y); g.fillStyle=C.accent; g.beginPath(); g.moveTo(9,0); g.lineTo(-7,-6); g.lineTo(-4,0); g.lineTo(-7,6); g.closePath(); g.fill(); g.restore();
    const W0=1, W1=1-st.ff, Wx=W0*Math.exp(-(st.R*f*1000)*(st.c/3600)/(st.V*st.LD)), used=(W0-Wx)/(W0-W1);
    const gx=W-W*0.24, gy=18, gw=W*0.2;
    g.strokeStyle=C.line; g.strokeRect(gx+0.5,gy+0.5,gw,12); g.fillStyle=C.fuel; g.fillRect(gx+1,gy+1,(gw-1)*clamp(1-used,0,1),11);
    ltx(g,"الوقود",gx-8,gy+6,{c:C.muted,s:11,a:"right",rtl:true});
  },
  ro(st){ const n=LCITY.filter(c=>c.d<=st.R).map(c=>c.n); return [["المدى",nf(st.R,0)+" km"],["بالأميال البحرية",nf(st.R/1.852,0)+" nm"],["زمن الطيران",nf(st.hrs,1)+" h"],["مدن ضمن المدى",n.length?n.join("، "):"لا شيء"]]; },
  eq:["R = (V / c_t) · (L/D) · ln(W₀ / W₁)","W₁ = W₀ (1 − نسبة الوقود)"],
  note:["المدى يتناسب طردياً مع L/D ومع السرعة، وعكسياً مع استهلاك الوقود.","التخطيط الحقيقي يطرح وقود الاحتياط والصعود والانتظار، ويحسب الرياح؛ فالمدى الفعلي أقل من هذا الرقم.","تحسين L/D بنسبة 5% (مثل الجنيحات الطرفية) يعطي تقريباً 5% مدى إضافي."],
  quiz:[{q:"إذا تحسّنت L/D بنسبة 10% وكل شيء ثابت، المدى:",o:["يزيد حوالي 10%","يزيد حوالي 1%","لا يتغيّر"],a:0,why:"المدى يتناسب خطياً مع L/D في معادلة بريغيه."},
        {q:"لماذا يظهر اللوغاريتم في المعادلة؟",o:["لأن السرعة تتغيّر","لأن الطائرة تخفّ تدريجياً وهي تحرق الوقود","لأن الكثافة تتغيّر"],a:1,why:"الوزن يقل أثناء الرحلة، والتكامل على وزن متغيّر يعطي ln(W₀/W₁)."}],
  ref:"فصل عناصر أداء الطائرة: المدى والتحمّل (Range and Endurance)."
});

/* 8. static longitudinal stability */
LESSONS.itf.push({
  ar:"الاستقرار الطولي الساكن", en:"Static longitudinal stability", alt:"طائرة جانبية تتعرض لهبّة فترجع لوضعها إذا كان مركز الثقل أمام النقطة المحايدة",
  intro:["إذا رفعت هبّة هواء أنف الطائرة، هل ترجع وحدها؟ الجواب يعتمد على مكان مركز الثقل (CG) مقارنة بـ«النقطة المحايدة» (NP)، وهي النقطة اللي يتأثر عندها الرفع الإضافي للطائرة كلها، والذيل الأفقي هو اللي يسحبها للخلف.",
         "إذا كان مركز الثقل أمام النقطة المحايدة، الرفع الإضافي يولّد عزماً يرجّع الأنف: طائرة مستقرة. وإذا كان خلفها، العزم يزيد الانحراف: غير مستقرة. المسافة بينهما اسمها الهامش الساكن."],
  ctl:[{k:"h",ar:"موقع مركز الثقل (نسبة من الوتر المتوسط)",min:0.1,max:0.6,step:0.005,v:0.28,f:v=>nf(v*100,1)+"% MAC"},{k:"tail",ar:"حجم الذيل الأفقي (نسبي)",min:0.4,max:1.4,step:0.01,v:1,f:v=>nf(v,2)}],
  act:{ar:"هبّة رياح",fn:st=>{ st.th=0; st.w=40; st.lost=0; }},
  init(st){ st.th=0; st.w=40; st.lost=0; },
  calc(st){ st.hn=0.25+0.22*st.tail; st.sm=st.hn-st.h; st.cma=-5.0*st.sm; },
  step(st,dt){ if(st.lost>0){ st.lost-=dt; if(st.lost<=0){ st.th=0; st.w=40; } return; }
    const n=4; for(let i=0;i<n;i++){ const h=dt/n, acc=-60*st.sm*st.th-1.8*st.w; st.w+=acc*h; st.th+=st.w*h; }
    if(Math.abs(st.th)>35){ st.th=Math.sign(st.th)*35; st.lost=2.5; } },
  draw(g,W,H,st,C){
    const cx=W*0.42, cy=H*0.55, sc=Math.min(W*0.7,H*1.4), mac0=-0.1, macL=0.24;
    lline(g,[[0,cy],[W,cy]],C.line,1,[6,6]);
    lplane(g,cx,cy,sc,st.th,C,{marks:(g,s)=>{
      const xc=mac0+st.h*macL, xn=mac0+st.hn*macL;
      g.fillStyle=C.ink; g.beginPath(); g.arc(xc,0,0.016,0,Math.PI*2); g.fill(); g.fillStyle=C.panel; g.beginPath(); g.moveTo(xc,0); g.arc(xc,0,0.016,0,Math.PI/2); g.closePath(); g.fill(); g.beginPath(); g.moveTo(xc,0); g.arc(xc,0,0.016,Math.PI,Math.PI*1.5); g.closePath(); g.fill();
      g.fillStyle=C.accent; g.beginPath(); g.moveTo(xn,-0.03); g.lineTo(xn-0.014,-0.055); g.lineTo(xn+0.014,-0.055); g.closePath(); g.fill(); }});
    const rad=sc*0.05, xn=cx+(mac0+st.hn*macL)*sc*Math.cos(st.th*D2R), xc=cx+(mac0+st.h*macL)*sc*Math.cos(st.th*D2R);
    ltx(g,"CG",xc,cy+rad+16,{s:11,w:600,m:true}); ltx(g,"NP",xn,cy-rad-26,{c:C.accent,s:11,w:600,m:true});
    const v=st.sm>0.005?"مستقرة: ترجع وحدها":(st.sm<-0.005?"غير مستقرة: الانحراف يكبر":"متعادلة: لا ترجع ولا تبتعد");
    ltx(g,st.lost>0?"خرجت عن السيطرة — إعادة المحاولة":v,W-12,22,{c:st.sm>0.005?C.hyd:C.power,s:13,w:600,a:"right",rtl:true});
    const r={x:W*0.05+24,y:H*0.7,w:W*0.2,h:H*0.22};
    const P=lplot(g,r,[-10,10],[-1,1],{xl:"α",yl:"C_M"});
    lline(g,[[r.x,P.Y(0)],[r.x+r.w,P.Y(0)]],C.line,1); lline(g,[[P.X(0),r.y],[P.X(0),r.y+r.h]],C.line,1);
    const s=clamp(st.cma*0.08,-0.95,0.95); lline(g,[[P.X(-10),P.Y(-s)],[P.X(10),P.Y(s)]],st.sm>0?C.hyd:C.power,2.4);
  },
  ro(st){ return [["الهامش الساكن",nf(st.sm*100,1)+"% MAC"],["النقطة المحايدة",nf(st.hn*100,1)+"% MAC"],["C_M,α",nf(st.cma,2)+" /rad"],["الحكم",st.sm>0.005?"مستقرة":(st.sm<-0.005?"غير مستقرة":"متعادلة")]]; },
  eq:["C_M,α = −a · (h_n − h)","الهامش الساكن = h_n − h","مستقرة إذا C_M,α سالب (المنحنى نازل)"],
  note:["ذيل أكبر أو أبعد يحرّك النقطة المحايدة للخلف فيزيد الهامش.","مركز ثقل متقدم جداً يجعل الطائرة مستقرة لكن ثقيلة على الطيار وتحتاج تقليم أكثر (سحب إضافي)؛ لهذا لمركز الثقل حدود أمامية وخلفية في ورقة التحميل.","حرق الوقود ونقل الركاب والشحن يغيّر مركز الثقل أثناء الرحلة، وبعض الطائرات تنقل الوقود بين الخزانات لضبطه."],
  quiz:[{q:"إذا صار مركز الثقل خلف النقطة المحايدة:",o:["الطائرة أكثر استقراراً","الطائرة غير مستقرة ساكنياً","لا يتغيّر شيء"],a:1,why:"الهامش الساكن يصبح سالباً، فأي زيادة في زاوية الهجوم تولّد عزماً يزيدها أكثر."},
        {q:"ماذا يفعل تكبير الذيل الأفقي؟",o:["يحرّك النقطة المحايدة للخلف ويزيد الاستقرار","يحرّك مركز الثقل للأمام","يقلل الرفع الكلي إلى الصفر"],a:0,why:"الذيل يضيف رفعاً بعيداً عن مركز الثقل، فتنتقل النقطة المحايدة للخلف."}],
  ref:"فصل مبادئ الاستقرار والتحكم (Principles of Stability and Control).",
  show:{ar:"اعرض الذيل الأفقي على الطائرة",fn:()=>lrnSel("stabilizer")}
});

/* 9. jet propulsion */
LESSONS.itf.push({
  ar:"الدفع في المحركات النفاثة", en:"Jet propulsion and the thrust equation", alt:"مقطع محرك توربوفان: تيار المروحة البارد وتيار القلب الساخن، وسهم الدفع",
  intro:["المحرك يدفع الطائرة لأنه يسرّع كتلة هواء للخلف: الدفع = معدل تدفق الكتلة × الزيادة في السرعة. في محرك التوربوفان جزء صغير من الهواء يمر في القلب (احتراق وسرعة عالية)، والجزء الأكبر تدفعه المروحة حول القلب بسرعة أقل.",
         "نسبة هواء المروحة إلى هواء القلب اسمها «نسبة الالتفاف» (BPR). تحريك هواء كثير ببطء أكفأ من هواء قليل بسرعة كبيرة، وهذا سبب المراوح الضخمة في محركات A380 و737."],
  ctl:[{k:"V0",ar:"سرعة الطيران",min:0,max:260,step:1,v:0,f:v=>nf(v,0)+" m/s"},{k:"md",ar:"معدل تدفق الهواء الكلي",min:50,max:1300,step:5,v:1200,f:v=>nf(v,0)+" kg/s"},
       {k:"bpr",ar:"نسبة الالتفاف BPR",min:0,max:12,step:0.1,v:7.7,f:v=>nf(v,1)},{k:"vc",ar:"سرعة عادم القلب",min:350,max:700,step:5,v:450,f:v=>nf(v,0)+" m/s"},{k:"vf",ar:"سرعة عادم المروحة",min:180,max:400,step:5,v:250,f:v=>nf(v,0)+" m/s"}],
  pre:[{ar:"محرك A380 (تقريبي)",set:{md:1200,bpr:7.7,vc:450,vf:250}},{ar:"محرك 737-800 (تقريبي)",set:{md:355,bpr:5.1,vc:480,vf:290}},{ar:"نفاث بدون مروحة",set:{md:100,bpr:0,vc:650,vf:250}}],
  init(st){ st.p=[]; st.acc=[0,0,0]; st.ph=0; },
  calc(st){ st.mc=st.md/(1+st.bpr); st.mf=st.md-st.mc; st.Tc=st.mc*(st.vc-st.V0); st.Tf=st.mf*(st.vf-st.V0); st.T=st.Tc+st.Tf;
    const ke=st.mc*(st.vc*st.vc-st.V0*st.V0)+st.mf*(st.vf*st.vf-st.V0*st.V0); st.eta=ke>0&&st.V0>0?2*st.V0*st.T/ke:0; },
  step(st,dt,W,H){
    const k=0.5, rate=[st.mf/22, st.mc/22, 8+st.V0/10];
    for(let s=0;s<3;s++){ st.acc[s]+=rate[s]*dt; while(st.acc[s]>=1){ st.acc[s]-=1; st.p.push({s,x:s===2?-0.02:(s===0?0.31:0.33),y:Math.random()}); } }
    st.ph+=dt*(4+st.md/150);
    st.p.forEach(q=>{ const v=q.s===0?st.vf:(q.s===1?st.vc:Math.max(30,st.V0)); q.x+=dt*v*k/W*1.0*(q.s===2?1:1); if(q.s===2&&q.x>0.27){ q.dead=true; } });
    st.p=st.p.filter(q=>!q.dead&&q.x<1.02); if(st.p.length>700) st.p.splice(0,st.p.length-700);
  },
  draw(g,W,H,st,C){
    const cy=H*0.46, R=H*0.27, xf=W*0.3, xe=W*0.62, rc=R*clamp(0.35+0.65/Math.sqrt(1+st.bpr),0.3,0.95);
    g.fillStyle=mixC(C.panel,C.struct,0.3); g.strokeStyle=C.ink; g.lineWidth=1.6;
    g.beginPath(); g.moveTo(W*0.26,cy-R*1.08); g.quadraticCurveTo(W*0.28,cy-R*1.2,xf,cy-R*1.15); g.lineTo(xe,cy-R*1.02); g.lineTo(xe,cy-R*0.94); g.lineTo(xf,cy-R*1.02); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(W*0.26,cy+R*1.08); g.quadraticCurveTo(W*0.28,cy+R*1.2,xf,cy+R*1.15); g.lineTo(xe,cy+R*1.02); g.lineTo(xe,cy+R*0.94); g.lineTo(xf,cy+R*1.02); g.closePath(); g.fill(); g.stroke();
    g.fillStyle=mixC(C.panel,C.fuel,0.25); g.beginPath(); g.moveTo(xf+R*0.15,cy-rc); g.lineTo(W*0.7,cy-rc*0.55); g.lineTo(W*0.72,cy); g.lineTo(W*0.7,cy+rc*0.55); g.lineTo(xf+R*0.15,cy+rc); g.closePath(); g.fill(); g.stroke();
    for(let i=0;i<10;i++){ const y=cy+Math.sin(st.ph+i*0.628)*R*1.0; g.strokeStyle=C.ink; g.globalAlpha=0.35+0.4*Math.abs(Math.cos(st.ph+i*0.628)); g.lineWidth=2; g.beginPath(); g.moveTo(xf,y); g.lineTo(xf+R*0.12,y); g.stroke(); } g.globalAlpha=1;
    g.fillStyle=C.ink; g.beginPath(); g.ellipse(xf-R*0.05,cy,R*0.16,R*0.22,0,Math.PI/2,Math.PI*1.5); g.fill();
    st.p.forEach(q=>{ let x=q.x*W, y;
      if(q.s===2){ y=cy+(q.y*2-1)*R*1.05; ldot(g,x,y,1.8,C.muted,0.7); return; }
      if(q.s===0){ const side=q.y<0.5?-1:1, f=(q.y<0.5?q.y*2:(q.y-0.5)*2); const inner=rc*(x<xe?1:0.75), outer=x<xe?R*0.92:R*0.92+(x-xe)*0.12; y=cy+side*(inner+f*(outer-inner)); ldot(g,x,y,2,C.ctrl,0.85); }
      else { const f=q.y*2-1, rr=x<W*0.7?rc*0.8:rc*0.55+(x-W*0.7)*0.05; y=cy+f*rr; ldot(g,x,y,2,C.power,0.9); } });
    const tl=clamp(st.T/400000,0,1)*W*0.22; if(tl>4) larrow(g,W*0.25,cy,W*0.25-tl,cy,C.hyd,5,14);
    ltx(g,"الدفع "+nf(st.T/1000,0)+" kN",W*0.25-tl/2,cy-16,{c:C.hyd,s:12,w:600,rtl:true});
    ltx(g,"تيار المروحة (بارد)",W*0.84,cy-R*1.1,{c:C.ctrl,s:11,rtl:true}); ltx(g,"تيار القلب (ساخن)",W*0.86,cy+R*0.08+18,{c:C.power,s:11,rtl:true});
  },
  ro(st){ return [["الدفع الكلي",nf(st.T/1000,1)+" kN"],["من المروحة",nf(st.Tf/1000,1)+" kN"],["من القلب",nf(st.Tc/1000,1)+" kN"],["الكفاءة الدفعية η_p",st.V0>0?nf(st.eta*100,0)+"%":"— (الطائرة واقفة)"],["الدفع النوعي T/ṁ",nf(st.T/st.md,0)+" m/s"]]; },
  eq:["T = ṁ_core (V_c − V₀) + ṁ_fan (V_f − V₀)","ṁ_core = ṁ / (1 + BPR)","η_p = 2V₀·T / Σ ṁ (V_e² − V₀²)   (تيار واحد: 2 / (1 + V_e/V₀))"],
  note:["الدفع ينقص مع زيادة سرعة الطيران لأن فرق السرعة (V_e − V₀) يقل.","الكفاءة الدفعية ترتفع كلما اقتربت سرعة العادم من سرعة الطيران، لذلك المراوح الكبيرة البطيئة أكفأ وأهدأ صوتاً.","القيم الجاهزة تقريبية للتوضيح؛ الأرقام المعتمدة للمحركات موجودة في وثائق الشركة المصنّعة."],
  quiz:[{q:"لماذا للمحركات الحديثة نسبة التفاف عالية؟",o:["لزيادة سرعة العادم","لرفع الكفاءة الدفعية وخفض الضوضاء","لتصغير المروحة"],a:1,why:"دفع كتلة كبيرة بفرق سرعة صغير يضيّع طاقة حركية أقل في العادم."},
        {q:"مع زيادة سرعة الطيران وبقاء سرعات العادم ثابتة، الدفع:",o:["يزيد","ينقص","لا يتغيّر"],a:1,why:"T = ṁ(V_e − V₀)، فكلما زادت V₀ قلّ الفرق."}],
  ref:"فصل الدفع (Propulsion).",
  show:{ar:"اعرض المحرك على الطائرة",fn:()=>lrnSel("engine")}
});

/* =====================================================================================
   Book 2 — Fundamentals of Aerodynamics (original explanations and simulations)
   ===================================================================================== */
function nshock(M){ const g=GAM, m2=M*M;
  const M2=Math.sqrt((1+(g-1)/2*m2)/(g*m2-(g-1)/2)), pr=1+2*g/(g+1)*(m2-1), rr=(g+1)*m2/(2+(g-1)*m2), tr=pr/rr;
  const p0r=Math.pow(((g+1)*m2/2)/(1+(g-1)/2*m2),g/(g-1))*Math.pow(2*g/(g+1)*m2-(g-1)/(g+1),-1/(g-1));
  return {M2,pr,rr,tr,p0r}; }
function aRat(M){ return (1/M)*Math.pow((2/(GAM+1))*(1+(GAM-1)/2*M*M),(GAM+1)/(2*(GAM-1))); }
function mFromA(A,sup){ if(A<=1.000001) return 1; let lo=sup?1:1e-7, hi=sup?60:1;
  for(let i=0;i<90;i++){ const m=(lo+hi)/2, f=aRat(m)-A; if(sup){ if(f>0) hi=m; else lo=m; } else { if(f>0) lo=m; else hi=m; } } return (lo+hi)/2; }
const pIs=M=>Math.pow(1+(GAM-1)/2*M*M,-GAM/(GAM-1));
function gauss(A,b){ const n=b.length, M=A.map((r,i)=>r.concat([b[i]]));
  for(let c=0;c<n;c++){ let p=c; for(let r=c+1;r<n;r++) if(Math.abs(M[r][c])>Math.abs(M[p][c])) p=r; const t=M[c]; M[c]=M[p]; M[p]=t;
    for(let r=c+1;r<n;r++){ const f=M[r][c]/M[c][c]; for(let k=c;k<=n;k++) M[r][k]-=f*M[c][k]; } }
  const x=new Array(n).fill(0); for(let r=n-1;r>=0;r--){ let s=M[r][n]; for(let k=r+1;k<n;k++) s-=M[r][k]*x[k]; x[r]=s/M[r][r]; } return x; }

/* 1. Reynolds and Mach */
LESSONS.foa.push({
  ar:"رينولدز وماخ: معاملا التشابه", en:"Reynolds number and Mach number", alt:"هواء يمر فوق لوح مسطح يتحول من صفائحي إلى مضطرب، وشريط أنظمة ماخ",
  intro:["نفق هوائي فيه نموذج صغير، كيف نتأكد أن نتيجته تنطبق على الطائرة الحقيقية؟ نحتاج نفس الشكل، ونفس عدد رينولدز (نسبة قوى القصور إلى قوى اللزوجة)، ونفس عدد ماخ (نسبة السرعة إلى سرعة الصوت).",
         "عدد رينولدز الكبير يعني أن الطبقة الملاصقة للسطح تتحول من صفائحية منتظمة إلى مضطربة بعد مسافة قصيرة. وعدد ماخ يحدد هل الانضغاط مهم، وهل ستظهر موجات صدمية."],
  ctl:[{k:"V",ar:"السرعة",min:5,max:300,step:1,v:240,f:v=>nf(v,0)+" m/s"},{k:"c",ar:"الطول المرجعي (الوتر)",min:0.1,max:12,step:0.1,v:7,f:v=>nf(v,1)+" m"},{k:"h",ar:"الارتفاع",min:0,max:13000,step:100,v:11000,f:v=>nf(v/1000,1)+" km"}],
  pre:[{ar:"جناح A380 في التطواف",set:{V:250,c:7,h:11000}},{ar:"نموذج نفق صغير",set:{V:30,c:0.2,h:0}},{ar:"طائرة ورقية",set:{V:5,c:0.25,h:0}}],
  init(st){ st.p=[]; for(let i=0;i<150;i++) st.p.push({x:Math.random(),y:Math.random(),j:0}); },
  calc(st){ const a=isa(st.h); st.at=a; st.Re=a.rho*st.V*st.c/a.mu; st.M=st.V/a.a; st.xtr=5e5*a.mu/(a.rho*st.V); st.ftr=st.xtr/st.c; },
  step(st,dt){ const xt=0.12+Math.min(1,st.ftr)*0.76;
    st.p.forEach(q=>{ q.x+=dt*(0.05+0.2*Math.min(1,q.y*2.5))*(0.6+st.V/300);
      if(q.x>xt&&q.x>0.12&&st.ftr<1.0001&&q.y<0.45){ q.j=clamp(q.j+(Math.random()-0.5)*dt*3,-0.06,0.06); } else q.j*=0.9;
      if(q.x>1){ q.x=0; q.y=Math.random(); q.j=0; } }); },
  draw(g,W,H,st,C){
    const py=H*0.52, x0=W*0.12, x1=W*0.88, hz=H*0.4;
    st.p.forEach(q=>{ const x=q.x*W, y=py-6-(q.y+q.j)*hz, L=4+10*Math.min(1,q.y*2.5)*(0.6+st.V/300); const turb=Math.abs(q.j)>0.005;
      g.strokeStyle=turb?C.power:C.ctrl; g.globalAlpha=0.75; g.lineWidth=1.6; g.beginPath(); g.moveTo(x-L,y+(turb?q.j*30:0)); g.lineTo(x,y); g.stroke(); }); g.globalAlpha=1;
    lline(g,[[x0,py],[x1,py]],C.ink,5);
    if(st.ftr<1){ const xt=x0+st.ftr*(x1-x0); lline(g,[[xt,py-hz-6],[xt,py+8]],C.muted,1,[4,4]);
      ltx(g,"صفائحي",(x0+xt)/2,py+18,{c:C.ctrl,s:11,rtl:true}); ltx(g,"مضطرب",(xt+x1)/2,py+18,{c:C.power,s:11,rtl:true}); }
    else ltx(g,"صفائحي على طول الوتر",(x0+x1)/2,py+18,{c:C.ctrl,s:11,rtl:true});
    const bx0=W*0.06, bx1=W*0.94, by=H*0.82, Mx=m=>bx0+clamp(m/3,0,1)*(bx1-bx0);
    [[0,0.3,C.hyd,"غير انضغاطي"],[0.3,0.8,C.ctrl,"دون صوتي"],[0.8,1.2,C.fuel,"عبر صوتي"],[1.2,3,C.power,"فوق صوتي"]].forEach(([a,b,c,n])=>{
      g.save(); g.globalAlpha=0.3; g.fillStyle=c; g.fillRect(Mx(a),by-8,Mx(b)-Mx(a),16); g.restore(); ltx(g,n,(Mx(a)+Mx(b))/2,by+20,{c,s:10,rtl:true}); });
    [0,0.5,1,1.5,2,2.5,3].forEach(m=>ltx(g,String(m),Mx(m),by-16,{c:C.muted,s:9,m:true}));
    const mx=Mx(st.M); g.fillStyle=C.ink; g.beginPath(); g.moveTo(mx,by+9); g.lineTo(mx-6,by+19); g.lineTo(mx+6,by+19); g.closePath(); g.fill();
    lline(g,[[mx,by-9],[mx,by+9]],C.ink,2.5);
  },
  ro(st){ const r=st.M<0.3?"غير انضغاطي":(st.M<0.8?"دون صوتي":(st.M<1.2?"عبر صوتي":(st.M<5?"فوق صوتي":"فرط صوتي"))); return [["عدد رينولدز Re",sci(st.Re)],["عدد ماخ M",nf(st.M,3)],["النظام",r],["موقع التحول (Re_x = 5×10⁵)",st.ftr<1?nf(st.xtr,3)+" m":"بعد نهاية الوتر"],["اللزوجة الحركية ν",sci(st.at.mu/st.at.rho)+" m²/s"]]; },
  eq:["Re = ρ V c / μ","M = V / a","μ = 1.458×10⁻⁶ · T^1.5 / (T + 110.4)   (قانون ساذرلاند)","التشابه الديناميكي: نفس الشكل + نفس Re + نفس M"],
  note:["عدد رينولدز لجناح A380 في التطواف بعشرات الملايين، بينما نموذج النفق الصغير قد يكون أقل بمئة مرة؛ لذلك الأنفاق الكبيرة المضغوطة أو المبرّدة مطلوبة لمطابقة الواقع.","عدد التحول 5×10⁵ رقم شائع للوح مستوٍ أملس؛ الخشونة والاضطراب في الهواء القادم يقدّمان التحول.","تحت ماخ 0.3 تقريباً يمكن اعتبار الهواء غير قابل للانضغاط بخطأ صغير."],
  quiz:[{q:"تجربة النفق تطابق الطيران الحقيقي ديناميكياً إذا تطابق:",o:["الشكل فقط","الشكل وعدد رينولدز وعدد ماخ","السرعة فقط"],a:1,why:"التشابه الديناميكي يتطلب نفس الشكل الهندسي ونفس المعاملات عديمة الأبعاد الحاكمة."},
        {q:"ماذا يحدث لموقع التحول إلى الاضطراب عند زيادة السرعة؟",o:["يتقدّم نحو الحافة الأمامية","يتأخر نحو الحافة الخلفية","لا يتغيّر"],a:0,why:"x_tr = Re_cr·μ/(ρV)، فكلما زادت V قلّت المسافة."}],
  ref:"الفصل التمهيدي: المبادئ الأساسية والتحليل البعدي (Some Introductory Thoughts — Dimensional Analysis, Flow Similarity)."
});

/* 2. cylinder with circulation */
function cylVel(x,y,G){ const r2=x*x+y*y, r4=r2*r2; return [1-(x*x-y*y)/r4+2*G*y/r2, -(2*x*y/r4+2*G*x/r2)]; }
LESSONS.foa.push({
  ar:"التدفق الكامن والدوران: كوتا–جوكوفسكي", en:"Potential flow, circulation and the Kutta–Joukowski theorem", alt:"خطوط انسياب حول أسطوانة مع دوران، ونقطتا الركود تنزلان، والسطح ملوّن حسب الضغط",
  intro:["في نظرية التدفق الكامن نبني التدفق من قطع بسيطة: تدفق منتظم + مزدوج يعطيان تدفقاً حول أسطوانة، ونضيف دوامة فيصير حولها «دوران» Γ.",
         "مع الدوران يتسارع الهواء فوق الأسطوانة ويتباطأ تحتها، فتنزل نقطتا الركود ويظهر رفع. نظرية كوتا–جوكوفسكي تقول: الرفع لكل متر من الطول = ρ·V·Γ. هذه نفس الفكرة اللي تفسر رفع الجناح."],
  ctl:[{k:"G",ar:"شدة الدوران Γ/(4πV∞R)",min:0,max:1.4,step:0.01,v:0.4,f:v=>nf(v,2)},{k:"V",ar:"سرعة الهواء (لحساب الرفع)",min:5,max:60,step:1,v:20,f:v=>nf(v,0)+" m/s"}],
  init(st){ st.p=[]; st.rot=0; for(let i=0;i<240;i++) st.p.push({x:-3+Math.random()*6.5,y:Math.random()*3.8-1.9,h:[]}); },
  calc(st){ const R=0.5; st.Gam=st.G*4*Math.PI*st.V*R; st.L=1.225*st.V*st.Gam; st.cl=4*Math.PI*st.G;
    st.stag=st.G<=1?[-Math.asin(st.G),Math.PI+Math.asin(st.G)]:null; st.stagY=st.G>1?-st.G-Math.sqrt(st.G*st.G-1):null; },
  step(st,dt){ const k=dt*0.9; st.rot+=dt*st.G*2.5;
    st.p.forEach(q=>{ const a=cylVel(q.x,q.y,st.G), b=cylVel(q.x+a[0]*k/2,q.y+a[1]*k/2,st.G); q.h.push([q.x,q.y]); if(q.h.length>9) q.h.shift();
      q.x+=b[0]*k; q.y+=b[1]*k; if(q.x*q.x+q.y*q.y<1.0||q.x>3.5||Math.abs(q.y)>1.95||!isFinite(q.x)){ q.x=-3; q.y=Math.random()*3.8-1.9; q.h=[]; } }); },
  draw(g,W,H,st,C){
    const s=Math.min(W/6.8,(H-16)/3.9), ox=W/2-0.25*s, oy=H/2, SX=x=>ox+x*s, SY=y=>oy-y*s;
    st.p.forEach(q=>{ if(q.h.length<2) return; lline(g,q.h.map(p=>[SX(p[0]),SY(p[1])]).concat([[SX(q.x),SY(q.y)]]),C.ctrl,1.5,null,0.65); });
    g.fillStyle=mixC(C.panel,C.struct,0.3); g.beginPath(); g.arc(ox,oy,s,0,Math.PI*2); g.fill();
    const cpmin=1-Math.pow(2+2*st.G,2);
    for(let i=0;i<96;i++){ const a=i/96*Math.PI*2, b=(i+1)/96*Math.PI*2, m=(a+b)/2, cp=1-Math.pow(2*Math.sin(m)+2*st.G,2), t=(1-cp)/(1-cpmin);
      lline(g,[[SX(Math.cos(a)),SY(Math.sin(a))],[SX(Math.cos(b)),SY(Math.sin(b))]],mixC(C.power,C.ctrl,t),6); }
    for(let i=0;i<3;i++){ const a=st.rot+i*2.094; lline(g,[[ox,oy],[ox+Math.cos(a)*s*0.7,oy+Math.sin(a)*s*0.7]],C.muted,2); }
    if(st.stag) st.stag.forEach(t=>ldot(g,SX(Math.cos(t)),SY(Math.sin(t)),5,C.accent)); else ldot(g,SX(0),SY(st.stagY),5,C.accent);
    const ll=clamp(st.cl/17.6,0,1)*H*0.28; if(ll>4) larrow(g,ox,oy-s-6,ox,oy-s-6-ll,C.hyd,4,11);
    ltx(g,"أحمر = ضغط أعلى · أزرق = ضغط أقل · النقاط = نقاط الركود",W-10,H-12,{c:C.muted,s:10,a:"right",rtl:true});
  },
  ro(st){ return [["الدوران Γ",nf(st.Gam,2)+" m²/s"],["الرفع لكل متر L′",nf(st.L,1)+" N/m"],["معامل الرفع c_l",nf(st.cl,2)],["نقاط الركود",st.stag?nf(st.stag[1]/D2R,1)+"° و "+nf(st.stag[0]/D2R+360,1)+"°":"نقطة واحدة تحت الأسطوانة"],["السحب (نظرياً)","صفر"]]; },
  eq:["w(z) = V∞(z + R²/z) + (iΓ/2π)·ln z","L′ = ρ∞ V∞ Γ   (كوتا–جوكوفسكي)","C_p = 1 − (2 sin θ + Γ/(2π V∞ R))²","sin θ_stag = −Γ/(4π V∞ R)"],
  note:["في التدفق الكامن السحب صفر دائماً (مفارقة دالمبير)؛ السحب الحقيقي يأتي من اللزوجة وانفصال الطبقة المتاخمة.","عندما Γ/(4πV∞R) أكبر من 1 تنفصل نقطة الركود عن السطح وتصبح تحت الأسطوانة.","تأثير ماغنوس على كرة القدم الدوّارة وسفن «الروتور» مثال عملي على نفس المبدأ."],
  quiz:[{q:"في التدفق الكامن حول الأسطوانة الدوّارة، السحب يساوي:",o:["صفر","ρVΓ","½ρV²"],a:0,why:"التوزيع الضغطي متماثل بين الأمام والخلف، فلا ينتج سحب؛ هذه مفارقة دالمبير."},
        {q:"حسب كوتا–جوكوفسكي، الرفع لكل وحدة طول يساوي:",o:["ρ V Γ","½ ρ V² Γ","Γ / V"],a:0,why:"L′ = ρ∞ V∞ Γ، فالرفع يتناسب طردياً مع الدوران."}],
  ref:"فصل أساسيات التدفق غير اللزج وغير الانضغاطي (Fundamentals of Inviscid, Incompressible Flow)."
});

/* 3. thin airfoil theory */
function taVort(st){ const N=40, out=[]; for(let j=0;j<N;j++){ const th=(j+0.5)*Math.PI/N, x=(1-Math.cos(th))/2; out.push([x,4*st.m*x*(1-x),(st.ar*(1+Math.cos(th))+4*st.m*Math.sin(th)**2)*Math.PI/N]); } return out; }
function taVel(st,xw,yw){ const ca=Math.cos(st.ar), sa=Math.sin(st.ar), x=xw*ca-yw*sa, y=xw*sa+yw*ca; let u=ca, v=sa;
  for(const [xj,zj,G] of st.vx){ const dx=x-xj, dy=y-zj, r2=dx*dx+dy*dy+0.0004, f=G/(2*Math.PI*r2); u+=f*dy; v-=f*dx; }
  return [u*ca+v*sa,-u*sa+v*ca]; }
function taNear(st,xw,yw){ const ca=Math.cos(st.ar), sa=Math.sin(st.ar), x=xw*ca-yw*sa, y=xw*sa+yw*ca; return x>=-0.01&&x<=1.01&&Math.abs(y-4*st.m*x*(1-x))<0.014; }
LESSONS.foa.push({
  ar:"نظرية المقطع الرقيق وشرط كوتا", en:"Thin airfoil theory and the Kutta condition", alt:"مقطع جناح رقيق مكوّن من صف دوامات، وخطوط الانسياب حوله، ومنحنى فرق الضغط على طول الوتر",
  intro:["نستبدل الجناح الرقيق بصفحة من الدوامات موزعة على خط الانحناء. نختار شدتها γ بحيث لا يعبر الهواء خلال السطح، ونفرض «شرط كوتا»: الهواء يغادر الحافة الخلفية بسلاسة، فتكون γ = 0 عندها.",
         "النتيجة أنيقة: معامل الرفع يزيد بمعدل 2π لكل راديان من زاوية الهجوم، والانحناء يزيح المنحنى للأعلى. الخطوط هنا محسوبة فعلياً من 40 دوامة على الوتر."],
  ctl:[{k:"al",ar:"زاوية الهجوم α",min:-4,max:12,step:0.25,v:4,f:v=>nf(v,2)+"°"},{k:"m",ar:"أقصى انحناء (نسبة من الوتر)",min:0,max:0.06,step:0.002,v:0.02,f:v=>nf(v*100,1)+"%"}],
  init(st){ st.p=[]; for(let i=0;i<200;i++) st.p.push({x:-0.8+Math.random()*2.8,y:Math.random()*1.4-0.7,h:[]}); },
  calc(st){ st.ar=st.al*D2R; st.vx=taVort(st); st.cl=2*Math.PI*(st.ar+2*st.m); st.aL0=-2*st.m/D2R; st.cm=-Math.PI*st.m; st.xcp=Math.abs(st.cl)>1e-4?0.25+Math.PI*st.m/st.cl:null; },
  step(st,dt){ const k=dt*0.42;
    st.p.forEach(q=>{ const a=taVel(st,q.x,q.y), b=taVel(st,q.x+a[0]*k/2,q.y+a[1]*k/2); q.h.push([q.x,q.y]); if(q.h.length>9) q.h.shift();
      q.x+=b[0]*k; q.y+=b[1]*k; if(q.x>2||Math.abs(q.y)>0.72||!isFinite(q.x)||taNear(st,q.x,q.y)){ q.x=-0.8; q.y=Math.random()*1.4-0.7; q.h=[]; } }); },
  draw(g,W,H,st,C){
    const s=Math.min((W-20)/2.8,(H*0.6-10)/1.4), ox=10+0.8*s, oy=H*0.31, SX=x=>ox+x*s, SY=y=>oy-y*s, ca=Math.cos(st.ar), sa=Math.sin(st.ar);
    st.p.forEach(q=>{ if(q.h.length<2) return; lline(g,q.h.map(p=>[SX(p[0]),SY(p[1])]).concat([[SX(q.x),SY(q.y)]]),C.ctrl,1.4,null,0.6); });
    const cam=[]; for(let i=0;i<=50;i++){ const x=i/50, z=4*st.m*x*(1-x); cam.push([SX(x*ca+z*sa),SY(-x*sa+z*ca)]); } lline(g,cam,C.ink,4.5);
    st.vx.forEach(([x,z,G],j)=>{ if(j%3) return; const px=SX(x*ca+z*sa), py=SY(-x*sa+z*ca), r=2+clamp(G*120,0,7); g.strokeStyle=C.power; g.lineWidth=1.3; g.beginPath(); g.arc(px,py,r,-0.3,Math.PI*1.3); g.stroke(); });
    ltx(g,"γ = 0 عند الحافة الخلفية (شرط كوتا)",SX(ca)+6,SY(-sa)+16,{c:C.muted,s:10,a:"left",rtl:true});
    const pts=[]; let mn=0, mx=0; for(let i=1;i<=100;i++){ const x=i/100-0.005, th=Math.acos(1-2*x), v=clamp(4*(st.ar*(1+Math.cos(th))/Math.sin(th)+4*st.m*Math.sin(th)),-8,8); pts.push([x,v]); mn=Math.min(mn,v); mx=Math.max(mx,v); }
    const r={x:52,y:H*0.66,w:W-70,h:H*0.25}, yr=[Math.min(-1,Math.floor(mn)),Math.max(2,Math.ceil(mx))];
    const P=lplot(g,r,[0,1],yr,{xt:[0,0.25,0.5,0.75,1],yt:[yr[0],0,yr[1]],xl:"x / c",yl:"ΔC_p"});
    lline(g,[[r.x,P.Y(0)],[r.x+r.w,P.Y(0)]],C.line,1);
    g.save(); g.globalAlpha=0.18; g.fillStyle=C.accent; g.beginPath(); g.moveTo(P.X(pts[0][0]),P.Y(0)); pts.forEach(p=>g.lineTo(P.X(p[0]),P.Y(p[1]))); g.lineTo(P.X(1),P.Y(0)); g.closePath(); g.fill(); g.restore();
    lline(g,pts.map(p=>[P.X(p[0]),P.Y(p[1])]),C.accent,2.2);
  },
  ro(st){ return [["معامل الرفع c_l",nf(st.cl,3)],["زاوية الرفع الصفري",nf(st.aL0,2)+"°"],["c_m حول ربع الوتر",nf(st.cm,3)],["مركز الضغط x_cp/c",st.xcp==null?"—":(Math.abs(st.xcp)>3?"بعيد جداً":nf(st.xcp,3))]]; },
  eq:["γ(θ) = 2V∞ [A₀ (1 + cos θ)/sin θ + Σ Aₙ sin nθ]","c_l = 2π (α − α_L=0)","خط انحناء قطعي: α_L=0 = −2m ,  c_m,c/4 = −π m","x = (c/2)(1 − cos θ)"],
  note:["ميل الرفع 2π لكل راديان يعني حوالي 0.11 لكل درجة؛ المقاطع الحقيقية أقل قليلاً بسبب السماكة واللزوجة.","ربع الوتر هو «المركز الهوائي»: العزم حوله لا يتغير مع زاوية الهجوم.","فرق الضغط كبير جداً قرب الحافة الأمامية (قيمة نظرية لا نهائية للصفيحة الرقيقة)، والحافة المستديرة في المقاطع الحقيقية تعالج ذلك."],
  quiz:[{q:"ميل منحنى الرفع حسب نظرية المقطع الرقيق:",o:["π لكل راديان","2π لكل راديان","4π لكل راديان"],a:1,why:"c_l = 2π(α − α_L=0)، أي حوالي 0.11 لكل درجة."},
        {q:"شرط كوتا يعني:",o:["الهواء يغادر الحافة الخلفية بسلاسة و γ = 0 عندها","السرعة صفر عند الحافة الأمامية","الضغط ثابت على السطح"],a:0,why:"هذا الشرط يحدد قيمة الدوران الوحيدة المقبولة فيزيائياً."}],
  ref:"فصل التدفق غير الانضغاطي حول المقاطع (Incompressible Flow over Airfoils).",
  show:{ar:"اعرض صندوق الجناح على الطائرة",fn:()=>lrnSel("wingbox")}
});

/* 4. Prandtl lifting-line theory */
function llSolve(AR,lam,al){ const N=20, cr=2/(AR*(1+lam)), a0=2*Math.PI, aL0=-2, A=[], b=[];
  for(let i=1;i<=N;i++){ const th=i*Math.PI/(2*N), c=cr*(1-(1-lam)*Math.abs(Math.cos(th))), mu=a0*c/4, row=[];
    for(let j=1;j<=N;j++){ const n=2*j-1; row.push(Math.sin(n*th)*(Math.sin(th)+n*mu)); } A.push(row); b.push(mu*(al-aL0)*D2R*Math.sin(th)); }
  const An=gauss(A,b), A1=An[0]; let d=0; for(let j=1;j<N;j++) d+=(2*j+1)*Math.pow(An[j]/A1,2);
  const e=1/(1+d), CL=A1*Math.PI*AR; return {An,cr,CL,e,d,CDi:CL*CL/(Math.PI*e*AR),aL0}; }
function llG(An,th){ let s=0; for(let j=0;j<An.length;j++) s+=An[j]*Math.sin((2*j+1)*th); return 2*s; }
LESSONS.foa.push({
  ar:"نظرية خط الرفع لبراندتل", en:"Prandtl's lifting-line theory", alt:"توزيع الرفع على طول الجناح مقارنة بالتوزيع الإهليلجي، ومنظر علوي للجناح ودوامات خلفه",
  intro:["براندتل استبدل الجناح بخط دوامة على طول الباع، تتغيّر شدته من الجذر إلى الطرفين. كل تغيّر في الشدة يترك خلفه دوامة صغيرة، ومجموعها هو الهواء الهابط والسحب المستحث.",
         "هنا نحل المعادلة فعلياً (20 حداً من متسلسلة فورييه) لجناح مستقيم مدبّب. أقل سحب مستحث يكون عندما يأخذ الرفع شكلاً إهليلجياً، ونسبة تدبيب حوالي 0.3 إلى 0.4 تقترب منه."],
  ctl:[{k:"AR",ar:"نسبة الباع AR",min:4,max:14,step:0.1,v:8,f:v=>nf(v,1)},{k:"lam",ar:"نسبة التدبيب λ (طرف/جذر)",min:0.1,max:1,step:0.01,v:0.35,f:v=>nf(v,2)},{k:"al",ar:"زاوية الهجوم",min:0,max:10,step:0.25,v:5,f:v=>nf(v,2)+"°"}],
  pre:[{ar:"مستطيل (λ = 1)",set:{lam:1}},{ar:"تدبيب 0.35",set:{lam:0.35}},{ar:"تدبيب حاد (λ = 0.1)",set:{lam:0.1}}],
  init(st){ st.ph=0; },
  calc(st){ const r=llSolve(st.AR,st.lam,st.al); Object.assign(st,r); st.cla=st.CL/((st.al-st.aL0)); },
  step(st,dt){ st.ph+=dt*40; },
  draw(g,W,H,st,C){
    const r={x:44,y:22,w:W-64,h:H*0.38}, P=lplot(g,r,[-0.5,0.5],[0,1.4],{xt:[-0.5,0,0.5],xf:t=>t===0?"0":(t<0?"−b/2":"b/2"),yt:[0,0.5,1],yl:"Γ / Γ_e,جذر · c_l/C_L"});
    const Ge0=2*st.An[0], gam=[], ell=[], ccl=[], cr=st.cr;
    for(let i=1;i<100;i++){ const th=i*Math.PI/100, y=-0.5*Math.cos(th), G=llG(st.An,th), c=cr*(1-(1-st.lam)*Math.abs(Math.cos(th)));
      gam.push([P.X(y),P.Y(G/Ge0)]); ell.push([P.X(y),P.Y(Math.sin(th))]); ccl.push([P.X(y),P.Y(clamp((2*G/c)/st.CL,0,1.4))]); }
    g.save(); g.globalAlpha=0.2; g.fillStyle=C.accent; g.beginPath(); g.moveTo(P.X(-0.5),P.Y(0)); gam.forEach(p=>g.lineTo(p[0],p[1])); g.lineTo(P.X(0.5),P.Y(0)); g.closePath(); g.fill(); g.restore();
    lline(g,gam,C.accent,2.5); lline(g,ell,C.muted,1.5,[5,4]); lline(g,ccl,C.fuel,2);
    [["توزيع الدوران Γ",C.accent],["الإهليلجي (منقّط)",C.muted],["c_l المحلي / C_L",C.fuel]].forEach(([t,c],i)=>ltx(g,t,r.x+r.w-6,r.y+12+i*15,{c,s:10,a:"right",rtl:true}));
    const py=H*0.6, span=r.w, sc=Math.min(span,(H*0.18)/cr), Xs=y=>r.x+(y+0.5)*span;
    g.fillStyle=mixC(C.panel,C.struct,0.35); g.strokeStyle=C.ink; g.lineWidth=1.5; g.beginPath(); g.moveTo(Xs(-0.5),py); g.lineTo(Xs(0.5),py);
    g.lineTo(Xs(0.5),py+cr*st.lam*sc); g.lineTo(Xs(0),py+cr*sc); g.lineTo(Xs(-0.5),py+cr*st.lam*sc); g.closePath(); g.fill(); g.stroke();
    let gm=1e-9; const dG=[]; for(let k=0;k<=24;k++){ const y=-0.48+k*0.96/24, th=Math.acos(clamp(-2*y,-1,1)), d=Math.abs(llG(st.An,Math.acos(clamp(-2*(y+0.01),-1,1)))-llG(st.An,Math.acos(clamp(-2*(y-0.01),-1,1)))); dG.push([y,d]); gm=Math.max(gm,d); }
    dG.forEach(([y,d])=>{ const x=Xs(y), c=cr*(1-(1-st.lam)*Math.abs(2*y)), y0=py+c*sc+4; g.save(); g.strokeStyle=C.sys; g.globalAlpha=0.15+0.8*d/gm; g.lineWidth=1+3*d/gm; g.setLineDash([6,8]); g.lineDashOffset=-st.ph; g.beginPath(); g.moveTo(x,y0); g.lineTo(x,H-8); g.stroke(); g.restore(); });
    ltx(g,"الدوامات الخلفية أقوى حيث يتغيّر الدوران بسرعة",r.x+r.w/2,H-14,{c:C.sys,s:10,rtl:true});
  },
  ro(st){ return [["معامل الرفع C_L",nf(st.CL,3)],["كفاءة الباع e",nf(st.e,4)],["السحب المستحث C_Di",nf(st.CDi,5)],["ميل الرفع",nf(st.cla,4)+" /°"],["δ",nf(st.d,4)]]; },
  eq:["Γ(θ) = 2bV∞ Σ Aₙ sin nθ ,  y = −(b/2) cos θ","Σ Aₙ sin nθ (sin θ + nμ) = μ (α − α_L=0) sin θ ,  μ = a₀c/(4b)","C_L = A₁ π AR","C_Di = C_L²/(π e AR) ,  e = 1/(1 + δ) ,  δ = Σ n (Aₙ/A₁)²"],
  note:["الجناح المستطيل يحمّل الأطراف أكثر من الإهليلجي، فتقل كفاءته قليلاً.","التدبيب الحاد يجعل c_l المحلي أعلى قرب الأطراف، فتنهار الأطراف أولاً؛ لهذا تضاف «لفّة» (twist) تقلل زاوية الأطراف.","الأجنحة المتراجعة الحقيقية تحتاج نظريات أوسع (طرق الشبكة الدوامية)، لكن الفكرة نفسها."],
  quiz:[{q:"أي توزيع رفع يعطي أقل سحب مستحث لنفس الرفع ونسبة الباع؟",o:["مستطيل","إهليلجي","مثلثي"],a:1,why:"التوزيع الإهليلجي يعطي هواءً هابطاً منتظماً و e = 1."},
        {q:"لماذا تُعطى أطراف الجناح زاوية أقل (لفّة)؟",o:["لزيادة الوزن","حتى لا تنهار الأطراف قبل الجذر","لزيادة السحب"],a:1,why:"انهيار الجذر أولاً يحافظ على فعالية الجنيحات في الأطراف."}],
  ref:"فصل التدفق غير الانضغاطي حول الأجنحة المحدودة (Incompressible Flow over Finite Wings).",
  show:{ar:"اعرض الجناح وتدفق الهواء",fn:()=>{ lrnFlowOn(); lrnSel("wingbox"); }}
});

/* 5. compressibility and the Mach cone */
LESSONS.foa.push({
  ar:"الانضغاط ومخروط ماخ", en:"Compressibility and the Mach cone", alt:"مصدر صوت يتحرك ويطلق موجات دائرية، وتتجمع أمامه عند ماخ 1، وتتكون زاوية مخروط ماخ فوق سرعة الصوت",
  intro:["الطائرة «تخبر» الهواء أمامها بقدومها عبر موجات ضغط تسير بسرعة الصوت. تحت سرعة الصوت تسبقها الموجات فيتهيأ الهواء ويتحرك جانباً بهدوء.",
         "عند ماخ 1 تتراكم الموجات أمام الطائرة، وفوقه تتأخر الموجات خلفها وتشكّل مخروطاً زاويته μ. تحت ماخ 1 أيضاً يكبر تأثير الانضغاط على الضغط حسب تصحيح براندتل–غلاورت."],
  ctl:[{k:"M",ar:"عدد ماخ",min:0,max:2.5,step:0.01,v:0.7,f:v=>nf(v,2)}],
  pre:[{ar:"M = 0.5",set:{M:0.5}},{ar:"M = 1.0",set:{M:1}},{ar:"M = 2.0",set:{M:2}}],
  init(st){ st.w=[]; st.sx=null; st.te=0; },
  onSet(st){ st.w=[]; st.sx=null; },
  calc(st){ st.mu=st.M>1?Math.asin(1/st.M)/D2R:null; st.pg=st.M<0.95?1/Math.sqrt(1-st.M*st.M):null; },
  step(st,dt,W,H){ const SW=W*0.6, a=SW*0.1; if(st.sx==null){ st.sx=st.M===0?SW*0.5:SW*0.08; st.w=[]; }
    st.sx+=st.M*a*dt; st.te+=dt; if(st.te>0.18){ st.te=0; st.w.push({x:st.sx,t:st.t}); }
    if(st.sx>SW*0.92){ st.sx=SW*0.08; st.w=[]; } st.w=st.w.filter(w=>(st.t-w.t)*a<SW*1.3); st.a=a; },
  draw(g,Wf,H,st,C){
    const narrow=Wf<560, W=Wf*0.6; g.save(); g.beginPath(); g.rect(0,0,W+(narrow?6:14),H); g.clip();
    const cy=H*0.47, a=st.a||W*0.1;
    st.w.forEach(w=>{ const r=(st.t-w.t)*a; if(r<1) return; g.save(); g.strokeStyle=C.ctrl; g.globalAlpha=clamp(1-r/(W*0.9),0.08,0.9); g.lineWidth=1.4; g.beginPath(); g.arc(w.x,cy,r,0,Math.PI*2); g.stroke(); g.restore(); });
    if(st.sx!=null){ if(st.M>1){ const m=Math.asin(1/st.M), L=W*1.3; lline(g,[[st.sx,cy],[st.sx-L*Math.cos(m),cy-L*Math.sin(m)]],C.power,2.4); lline(g,[[st.sx,cy],[st.sx-L*Math.cos(m),cy+L*Math.sin(m)]],C.power,2.4);
        ltx(g,"μ = "+nf(st.mu,1)+"°",st.sx-60,cy-8,{c:C.power,s:12,w:600,m:true}); }
      ldot(g,st.sx,cy,6,C.ink); if(st.M>0) larrow(g,st.sx+8,cy,st.sx+8+30,cy,C.ink,2,7); }
    const lbl=st.M<1?"تحت سرعة الصوت: الموجات تسبق الجسم":(st.M<1.02?"ماخ 1: الموجات تتراكم أمام الجسم":"فوق سرعة الصوت: مخروط ماخ");
    ltx(g,lbl,W-6,20,{s:narrow?11:13,w:600,a:"right",rtl:true}); g.restore();
    const sl=m=>m<0.97?2*Math.PI/Math.sqrt(1-m*m):m>1.03?4/Math.sqrt(m*m-1):NaN;
    kPlot(g,{x:W+(narrow?24:46),y:H*0.12,w:Wf*0.4-(narrow?30:58),h:H*0.68},{x:[0,2.5],y:[0,16],xl:"M",yl:"dc_l/dα (1/rad)",curves:[{f:m=>m<0.97?sl(m):NaN,c:"hyd"},{f:m=>m>1.03?sl(m):NaN,c:"power"}],band:[{x0:0.8,x1:1.2,c:"fuel",a:0.2}],vl:[{x:1,c:"muted",t:narrow?"":"M = 1"}],dots:[{x:st.M,y:sl(st.M)}],leg:[{c:"hyd",t:"دون صوتي"},{c:"power",t:"فوق صوتي"}]},C);
  },
  ro(st){ const cp0=-0.43, sl=st.M<0.97?2*Math.PI/Math.sqrt(1-st.M*st.M):st.M>1.03?4/Math.sqrt(st.M*st.M-1):NaN; return [["عدد ماخ",nf(st.M,2)],["زاوية مخروط ماخ μ",st.mu==null?"لا يوجد (M ≤ 1)":nf(st.mu,1)+"°"],["معامل براندتل–غلاورت",st.pg==null?"لا يصلح قرب M = 1 وما فوق":nf(st.pg,3)],["مثال: C_p0 = −0.43 يصبح",st.pg==null?"—":nf(cp0*st.pg,3)],["ميل منحنى الرفع للمقطع",isFinite(sl)?nf(sl,2)+" /rad":"منطقة عبر صوتية: النظرية الخطية لا تصلح"]]; },
  eq:["μ = sin⁻¹(1/M)","C_p = C_p0 / √(1 − M∞²)   (براندتل–غلاورت، دون صوتي)","ميل الرفع: 2π/√(1 − M²) دون صوتي ، 4/√(M² − 1) فوق صوتي","a = √(γRT)"],
  note:["الطائرات التجارية تطير حول ماخ 0.85: السرعة العامة دون صوتية، لكن الهواء فوق الجناح يتجاوز ماخ 1 محلياً.","«ماخ الحرج» هو سرعة الطيران اللي يصل عندها الهواء في مكان ما على الجناح إلى ماخ 1.","تصحيح براندتل–غلاورت يفشل قرب ماخ 1، لأنه يتنبأ بقيم لا نهائية؛ المنطقة المظللة في المنحنى (0.8–1.2) تقريبية لهذا المدى العابر."],
  quiz:[{q:"زاوية مخروط ماخ عند M = 2:",o:["30°","45°","60°"],a:0,why:"μ = sin⁻¹(1/2) = 30°."},
        {q:"عند M = 0.7، معامل الضغط على الجناح مقارنة بالسرعات المنخفضة:",o:["أصغر بالقيمة","أكبر بالقيمة بحوالي 40%","نفسه"],a:1,why:"1/√(1 − 0.49) ≈ 1.40، فالضغوط (موجبة وسالبة) تتضخم."}],
  ref:"فصول التدفق الانضغاطي: الجوانب التمهيدية والتدفق دون الصوتي حول المقاطع (Compressible Flow: Preliminary Aspects; Subsonic Compressible Flow over Airfoils)."
});

/* 6. normal shock */
LESSONS.foa.push({
  ar:"الموجة الصدمية العمودية", en:"Normal shock waves", alt:"جزيئات تتحرك بسرعة فوق صوتية ثم تعبر موجة صدمية فتبطئ وتتكدس وتسخن، ومنحنيات النسب عبر الصدمة",
  intro:["عندما يضطر هواء فوق صوتي أن يبطئ فجأة، يحدث ذلك عبر طبقة رقيقة جداً اسمها «الموجة الصدمية». خلف الصدمة العمودية يصبح السريان دون صوتي دائماً، ويرتفع الضغط والكثافة والحرارة.",
         "لاحظ أن الجزيئات بعد الصدمة تتقارب: لأن السرعة قلّت، والكتلة المارة لازم تبقى نفسها (الاستمرارية). وتضيع جزء من الطاقة المفيدة، ويظهر ذلك كانخفاض في الضغط الكلي."],
  ctl:[{k:"M1",ar:"ماخ قبل الصدمة M₁",min:1,max:5,step:0.01,v:2,f:v=>nf(v,2)}],
  init(st){ st.p=[]; st.acc=0; },
  calc(st){ Object.assign(st,nshock(st.M1)); st.ds=-RAIR*Math.log(st.p0r); },
  step(st,dt,W,H){ const u1=150, u2=u1/st.rr, xs=W*0.5;
    if(!st.filled){ st.filled=true; for(let x=0;x<xs;x+=u1/60) st.p.push({x,y:Math.random()}); for(let x=xs;x<W;x+=u2/60) st.p.push({x,y:Math.random()}); }
    st.acc+=dt*60; while(st.acc>=1){ st.acc-=1; st.p.push({x:0,y:Math.random()}); } st.p.forEach(q=>{ q.x+=(q.x<xs?u1:u2)*dt; }); st.p=st.p.filter(q=>q.x<W); },
  draw(g,W,H,st,C){
    const y0=H*0.08, y1=H*0.48, xs=W*0.5, warm=mixC(C.ctrl,C.power,clamp((st.tr-1)/2,0,1));
    g.fillStyle=C.bg; g.fillRect(0,y0,W,y1-y0); lline(g,[[0,y0],[W,y0]],C.ink,2); lline(g,[[0,y1],[W,y1]],C.ink,2);
    st.p.forEach(q=>ldot(g,q.x,y0+6+q.y*(y1-y0-12),2.2,q.x<xs?C.ctrl:warm,0.9));
    g.save(); g.strokeStyle=C.ink; g.lineWidth=4; g.globalAlpha=0.85; g.beginPath(); g.moveTo(xs,y0); g.lineTo(xs,y1); g.stroke(); g.restore();
    ltx(g,"M₁ = "+nf(st.M1,2),xs*0.5,y1+14,{s:12,m:true}); ltx(g,"M₂ = "+nf(st.M2,3),xs*1.5,y1+14,{s:12,m:true});
    const r={x:52,y:H*0.62,w:W-70,h:H*0.28}, P=lplot(g,r,[1,5],[0.1,40],{log:true,xt:[1,2,3,4,5],yt:[0.1,1,10],yf:t=>String(t),xl:"M₁"});
    lclip(g,r);
    [["p₂/p₁",C.power,m=>nshock(m).pr],["ρ₂/ρ₁",C.hyd,m=>nshock(m).rr],["T₂/T₁",C.fuel,m=>nshock(m).tr],["p₀₂/p₀₁",C.ctrl,m=>nshock(m).p0r],["M₂",C.sys,m=>nshock(m).M2]].forEach(([n,c,f],i)=>{
      const pts=[]; for(let m=1.001;m<=5;m+=0.05) pts.push([P.X(m),P.Y(f(m))]); lline(g,pts,c,2); ldot(g,P.X(st.M1),P.Y(f(st.M1)),4,c);
      ltx(g,n,r.x+8+i*Math.min(76,r.w/5.2),r.y+12,{c,s:11,a:"left",m:true}); });
    g.restore();
    lline(g,[[P.X(st.M1),r.y],[P.X(st.M1),r.y+r.h]],C.muted,1,[3,3]);
  },
  ro(st){ return [["ماخ بعد الصدمة M₂",nf(st.M2,3)],["نسبة الضغط p₂/p₁",nf(st.pr,3)],["نسبة الكثافة ρ₂/ρ₁",nf(st.rr,3)],["نسبة الحرارة T₂/T₁",nf(st.tr,3)],["نسبة الضغط الكلي p₀₂/p₀₁",nf(st.p0r,4)],["زيادة الإنتروبيا Δs",nf(st.ds,1)+" J/(kg·K)"]]; },
  eq:["M₂² = [1 + (γ−1)/2·M₁²] / [γM₁² − (γ−1)/2]","p₂/p₁ = 1 + 2γ/(γ+1)·(M₁² − 1)","ρ₂/ρ₁ = (γ+1)M₁² / [2 + (γ−1)M₁²]","T₂/T₁ = (p₂/p₁)(ρ₁/ρ₂) ,  T₀ ثابتة عبر الصدمة","Δs = −R ln(p₀₂/p₀₁)"],
  note:["كلما زادت M₁ زادت قوة الصدمة وخسارة الضغط الكلي، لكن الكثافة لا تتجاوز 6 أضعاف مهما زادت السرعة (للهواء γ = 1.4).","مداخل الطائرات فوق الصوتية تستخدم سلسلة صدمات مائلة ضعيفة بدل صدمة عمودية واحدة لتقليل الخسارة.","الحرارة الكلية ثابتة لأن الصدمة لا تضيف ولا تأخذ حرارة؛ لكن الطاقة تتحول إلى شكل أقل فائدة."],
  quiz:[{q:"السريان خلف موجة صدمية عمودية:",o:["فوق صوتي","دون صوتي","يساوي M₁"],a:1,why:"من علاقة M₂ نجد M₂ أقل من 1 دائماً عندما M₁ أكبر من 1."},
        {q:"ما الذي يبقى ثابتاً عبر الصدمة العمودية في الغاز المثالي؟",o:["الضغط الكلي","درجة الحرارة الكلية","الكثافة"],a:1,why:"الصدمة أديباتية، فالإنثالبي الكلي ودرجة الحرارة الكلية ثابتان، بينما الضغط الكلي يقل."}],
  ref:"فصل الموجات الصدمية العمودية (Normal Shock Waves and Related Topics)."
});

/* 7. oblique shock */
function thetaBM(b,M){ return Math.atan(2/Math.tan(b)*(M*M*Math.sin(b)**2-1)/(M*M*(GAM+Math.cos(2*b))+2)); }
function oblique(M,th){ const mu=Math.asin(1/M); let bm=mu, tm=0;
  for(let b=mu;b<Math.PI/2;b+=0.0005){ const t=thetaBM(b,M); if(t>tm){ tm=t; bm=b; } }
  if(th>tm) return {det:true,tmax:tm,mu};
  let lo=mu, hi=bm; for(let i=0;i<60;i++){ const m=(lo+hi)/2; if(thetaBM(m,M)<th) lo=m; else hi=m; }
  const b=(lo+hi)/2, n=nshock(Math.max(1.0000001,M*Math.sin(b))); return {det:false,b,tmax:tm,mu,M2:n.M2/Math.sin(b-th),pr:n.pr,tr:n.tr,p0r:n.p0r}; }
LESSONS.foa.push({
  ar:"الصدمة المائلة وعلاقة θ–β–M", en:"Oblique shocks: the θ–β–M relation", alt:"هواء فوق صوتي يصطدم بإسفين فتتكون صدمة مائلة وينعطف الهواء موازياً للسطح، أو تنفصل الصدمة إذا كانت الزاوية كبيرة",
  intro:["عندما يصطدم هواء فوق صوتي بسطح مائل (مثل مقدمة إسفين أو منحدر مدخل محرك) ينعطف عبر صدمة مائلة بزاوية β. الصدمة المائلة أضعف من العمودية، والهواء بعدها غالباً يبقى فوق صوتي.",
         "لكل عدد ماخ أقصى زاوية انعطاف θ_max. إذا زادت زاوية الإسفين عليها، لا يقدر الهواء ينعطف عبر صدمة ملتصقة، فتنفصل الصدمة وتتكون «صدمة قوسية» أمام الجسم."],
  ctl:[{k:"M1",ar:"ماخ القادم M₁",min:1.2,max:5,step:0.01,v:2.5,f:v=>nf(v,2)},{k:"th",ar:"زاوية الإسفين θ",min:0,max:40,step:0.25,v:12,f:v=>nf(v,2)+"°"}],
  init(st){ st.p=[]; st.acc=0; },
  calc(st){ const o=oblique(st.M1,st.th*D2R); st.o=o; st.v21=o.det?0.4:(o.M2/st.M1)*Math.sqrt(o.tr); },
  step(st,dt,W,H){ const ax=W*0.3, by=H*0.86, top=H*0.06, u1=130, o=st.o, th=st.th*D2R;
    if(!st.filled){ st.filled=true; for(let i=0;i<260;i++){ const x=Math.random()*W, y=top+4+Math.random()*(by-top-10); if(x>ax&&y>by-(x-ax)*Math.tan(th)-3) continue; st.p.push({x,y,t:false}); } }
    st.acc+=dt*45; while(st.acc>=1){ st.acc-=1; st.p.push({x:0,y:top+4+Math.random()*(by-top-10),t:false}); }
    const kb=(W*0.4+W*0.05)/Math.pow(by-top,2);
    st.p.forEach(q=>{ const dy=by-q.y;
      if(!q.t){ const xs=o.det?ax-W*0.05+kb*dy*dy:ax+dy/Math.tan(o.b); if(q.x>=xs&&(o.det||q.x>=ax-0.5)) q.t=true; }
      if(q.t){ const u=u1*st.v21; q.x+=u*Math.cos(th)*dt; q.y-=u*Math.sin(th)*dt; } else q.x+=u1*dt; });
    st.p=st.p.filter(q=>q.x<W&&q.y>0); },
  draw(g,W,H,st,C){
    const ax=W*0.3, by=H*0.86, top=H*0.06, th=st.th*D2R, o=st.o, warm=mixC(C.ctrl,C.power,clamp(((o.tr||2)-1)/1.5,0,1));
    st.p.forEach(q=>ldot(g,q.x,q.y,2.1,q.t?warm:C.ctrl,0.9));
    g.fillStyle=mixC(C.panel,C.struct,0.45); g.strokeStyle=C.ink; g.lineWidth=2; g.beginPath(); g.moveTo(0,by); g.lineTo(ax,by); g.lineTo(W,by-(W-ax)*Math.tan(th)); g.lineTo(W,H); g.lineTo(0,H); g.closePath(); g.fill(); g.stroke();
    if(!o.det){ lline(g,[[ax,by],[ax+(by-top)/Math.tan(o.b),top]],C.power,3); ltx(g,"β = "+nf(o.b/D2R,1)+"°",ax+(by-top)/Math.tan(o.b)*0.45+40,by-(by-top)*0.45,{c:C.power,s:12,w:600,m:true}); }
    else { const kb=(W*0.4+W*0.05)/Math.pow(by-top,2), pts=[]; for(let dy=0;dy<=by-top;dy+=4) pts.push([ax-W*0.05+kb*dy*dy,by-dy]); lline(g,pts,C.power,3); ltx(g,"صدمة قوسية منفصلة",W-12,20,{c:C.power,s:13,w:600,a:"right",rtl:true}); }
    ltx(g,"θ = "+nf(st.th,1)+"°",ax+70,by-14,{s:11,m:true});
  },
  ro(st){ const o=st.o; if(o.det) return [["الحالة","الصدمة منفصلة (θ أكبر من θ_max)"],["أقصى زاوية انعطاف θ_max",nf(o.tmax/D2R,2)+"°"],["زاوية ماخ μ",nf(o.mu/D2R,2)+"°"]];
    return [["زاوية الصدمة β",nf(o.b/D2R,2)+"°"],["ماخ بعد الصدمة M₂",nf(o.M2,3)],["نسبة الضغط p₂/p₁",nf(o.pr,3)],["نسبة الحرارة T₂/T₁",nf(o.tr,3)],["نسبة الضغط الكلي",nf(o.p0r,4)],["أقصى زاوية θ_max",nf(o.tmax/D2R,2)+"°"]]; },
  eq:["tan θ = 2 cot β · (M₁² sin²β − 1) / (M₁²(γ + cos 2β) + 2)","M_n1 = M₁ sin β  ← علاقات الصدمة العمودية","M₂ = M_n2 / sin(β − θ)"],
  note:["عند θ = 0 تصبح الصدمة «موجة ماخ» ضعيفة بزاوية μ ولا تغيّر شيئاً.","يوجد حلّان رياضيان (ضعيف وقوي)، وفي الواقع يظهر الحل الضعيف عادة، وهو المحسوب هنا.","مداخل الطائرات فوق الصوتية تستعمل منحدرات تولّد صدمات مائلة لتبطئة الهواء قبل المحرك بخسارة أقل."],
  quiz:[{q:"إذا تجاوزت زاوية الإسفين θ_max:",o:["تختفي الصدمة","تنفصل الصدمة وتتكون صدمة قوسية أمام الجسم","تتحول إلى موجة تمدد"],a:1,why:"لا يوجد حل لصدمة ملتصقة، فتقف الصدمة أمام الجسم ويكون خلفها جزء دون صوتي."},
        {q:"عادةً، السريان خلف صدمة مائلة ضعيفة:",o:["فوق صوتي","دون صوتي دائماً","ساكن"],a:0,why:"المركبة العمودية فقط تصبح دون صوتية؛ المركبة الموازية للصدمة لا تتغيّر، فيبقى M₂ غالباً أكبر من 1."}],
  ref:"فصل الصدمات المائلة وموجات التمدد (Oblique Shock and Expansion Waves)."
});

/* 8. converging–diverging nozzle */
function nzA(x,e){ const xt=0.3; return x<xt?1+2*Math.pow((xt-x)/xt,2):1+(e-1)*((x-xt)/(1-xt)); }
LESSONS.foa.push({
  ar:"الفوهة المتقاربة المتباعدة", en:"Converging–diverging nozzles", alt:"فوهة ملوّنة حسب عدد ماخ، والجزيئات تتسارع، وموجة صدمية داخلها حسب ضغط الخلف، ومنحنى الضغط على طولها",
  intro:["في التدفق دون الصوتي يتسارع الغاز عندما تضيق المساحة، أما في فوق الصوتي فيتسارع عندما تتسع. لذلك نحتاج فوهة تضيق ثم تتسع: يصل الغاز لماخ 1 عند العنق ثم يتسارع فوق سرعة الصوت.",
         "خفّض ضغط الخلف تدريجياً: أولاً يتسارع الغاز ويبقى دون صوتي، ثم «تختنق» الفوهة (ماخ 1 في العنق) فلا يزيد التدفق الكتلي أكثر، ثم تظهر صدمة عمودية داخل الجزء المتباعد وتتحرك للخارج، ثم يصبح السريان فوق صوتي حتى المخرج."],
  ctl:[{k:"pb",ar:"ضغط الخلف p_b/p₀",min:0.02,max:1,step:0.005,v:0.6,f:v=>nf(v,3)},{k:"e",ar:"نسبة مساحة المخرج A_e/A_t",min:1.2,max:4,step:0.05,v:2,f:v=>nf(v,2)}],
  init(st){ st.q=[]; for(let i=0;i<180;i++) st.q.push({x:Math.random()*1.5,s:Math.random()*2-1}); },
  calc(st){ const e=st.e, pb=st.pb, N=120, xs=[], M=[], P=[]; for(let i=0;i<=N;i++) xs.push(i/N);
    const Me1=mFromA(e,false), Ms=mFromA(e,true); st.p1=pIs(Me1); st.p3=pIs(Ms); st.p2=st.p3*nshock(Ms).pr; st.sh=null; st.Ash=null; st.mrat=1; st.choked=true;
    if(pb>=0.999){ st.reg="لا تدفق: ضغط الخلف يساوي الضغط الكلي"; st.choked=false; st.mrat=0; xs.forEach(()=>{ M.push(0); P.push(1); }); st.Me=0; st.pe=1; }
    else if(pb>=st.p1){ const Me=Math.sqrt(5*(Math.pow(pb,-1/3.5)-1)), As=e/aRat(Me); st.Me=Me; st.pe=pb; st.mrat=Math.min(1,As); st.choked=As>=0.9995;
      st.reg=st.choked?"مختنقة على الحد: ماخ 1 عند العنق فقط":"دون صوتي في كل مكان (غير مختنقة)"; xs.forEach(x=>{ const m=mFromA(nzA(x,e)/As,false); M.push(m); P.push(pIs(m)); }); }
    else if(pb>=st.p2){ const pex=As=>{ const r=nshock(mFromA(As,true)).p0r, Me=mFromA(e*r,false); return r*pIs(Me); };
      let lo=1.0005, hi=e; for(let i=0;i<60;i++){ const m=(lo+hi)/2; if(pex(m)>pb) lo=m; else hi=m; }
      const Ash=(lo+hi)/2, xsh=0.3+(Ash-1)/(e-1)*0.7, r=nshock(mFromA(Ash,true)).p0r; st.sh=xsh; st.Ash=Ash;
      xs.forEach(x=>{ const A=nzA(x,e); let m,p; if(x<0.3){ m=mFromA(A,false); p=pIs(m); } else if(x<xsh){ m=mFromA(A,true); p=pIs(m); } else { m=mFromA(A*r,false); p=r*pIs(m); } M.push(m); P.push(p); });
      st.Me=M[N]; st.pe=P[N]; st.reg="مختنقة، مع صدمة عمودية داخل الجزء المتباعد"; }
    else { xs.forEach(x=>{ const A=nzA(x,e), m=x<0.3?mFromA(A,false):mFromA(A,true); M.push(m); P.push(pIs(m)); }); st.Me=Ms; st.pe=st.p3;
      st.reg=Math.abs(pb-st.p3)<0.01?"تمدد مثالي: ضغط المخرج = ضغط الخلف":(pb>st.p3?"فرط تمدد: صدمات مائلة خارج الفوهة":"نقص تمدد: موجات تمدد خارج الفوهة"); }
    st.xs=xs; st.Mx=M; st.Px=P; },
  step(st,dt){ st.q.forEach(q=>{ const i=Math.round(clamp(q.x,0,1)*120), M=q.x<=1?st.Mx[i]:st.Me, u=M/Math.sqrt(1+0.2*M*M); q.x+=dt*(st.mrat>0?0.03+0.2*u:0); if(q.x>1.5){ q.x=0; q.s=Math.random()*2-1; } }); },
  draw(g,W,H,st,C){
    const xL=W*0.06, xR=W*0.62, cy=H*0.27, rt=H*0.07, X=x=>xL+x*(xR-xL), rad=x=>rt*Math.sqrt(nzA(Math.min(x,1),st.e)), re=rad(1);
    for(let i=0;i<120;i++){ const x=i/120, m=st.Mx[i]; g.save(); g.globalAlpha=0.4; g.fillStyle=mixC(C.ctrl,C.power,m/3); g.fillRect(X(x),cy-rad(x),(xR-xL)/120+1,2*rad(x)); g.restore(); }
    const tp=[], bt=[]; for(let i=0;i<=120;i++){ const x=i/120; tp.push([X(x),cy-rad(x)]); bt.push([X(x),cy+rad(x)]); } lline(g,tp,C.ink,3); lline(g,bt,C.ink,3);
    if(st.sh!=null){ lline(g,[[X(st.sh),cy-rad(st.sh)],[X(st.sh),cy+rad(st.sh)]],C.ink,4); ltx(g,"صدمة",X(st.sh),cy-rad(st.sh)-10,{s:11,w:600,rtl:true}); }
    const sup=st.sh==null&&st.Me>1&&st.mrat>0, L=W*0.09;
    if(sup&&st.reg.indexOf("فرط")===0){ for(let k=0;k<2;k++){ const x0=xR+2*L*k, r0=re*(1-0.15*k); lline(g,[[x0,cy-r0],[x0+L,cy],[x0+2*L,cy-r0*0.85]],C.power,1.6,null,0.75); lline(g,[[x0,cy+r0],[x0+L,cy],[x0+2*L,cy+r0*0.85]],C.power,1.6,null,0.75); } }
    else if(sup&&st.reg.indexOf("نقص")===0){ lline(g,[[xR,cy-re],[xR+L,cy-re*1.4],[xR+2*L,cy-re*1.1],[xR+3*L,cy-re*1.3]],C.sys,1.6,null,0.75); lline(g,[[xR,cy+re],[xR+L,cy+re*1.4],[xR+2*L,cy+re*1.1],[xR+3*L,cy+re*1.3]],C.sys,1.6,null,0.75); }
    else if(st.mrat>0){ lline(g,[[xR,cy-re],[xR+3*L,cy-re*1.05]],C.muted,1,[4,4]); lline(g,[[xR,cy+re],[xR+3*L,cy+re*1.05]],C.muted,1,[4,4]); }
    st.q.forEach(q=>{ const x=q.x, rr=x<=1?rad(x):re; ldot(g,X(x),cy+q.s*rr*0.9,1.8,C.ink,0.75); });
    const r={x:52,y:H*0.6,w:W-70,h:H*0.3}, P=lplot(g,r,[0,1.2],[0,1],{xt:[0,0.3,1],xf:t=>t===0?"مدخل":(t===0.3?"عنق":"مخرج"),yt:[0,0.5,1],yl:"p / p₀"});
    lline(g,st.xs.map((x,i)=>[P.X(x),P.Y(st.Px[i])]),C.accent,2.4);
    lline(g,[[P.X(0),P.Y(st.pb)],[P.X(1.2),P.Y(st.pb)]],C.power,1.3,[5,4]); ltx(g,"ضغط الخلف",P.X(1.2)-4,P.Y(st.pb)-9,{c:C.power,s:10,a:"right",rtl:true});
    lline(g,[[P.X(0.3),r.y],[P.X(0.3),r.y+r.h]],C.line,1,[3,3]);
  },
  ro(st){ return [["الحالة",st.reg],["ماخ المخرج",nf(st.Me,3)],["ضغط المخرج p_e/p₀",nf(st.pe,3)],["التدفق الكتلي / الأقصى",nf(st.mrat*100,1)+"%"],["موقع الصدمة A_s/A_t",st.Ash?nf(st.Ash,3):"—"],["حدود: دون صوتي / صدمة عند المخرج / تصميم",nf(st.p1,3)+" / "+nf(st.p2,3)+" / "+nf(st.p3,3)]]; },
  eq:["A/A* = (1/M)·[(2/(γ+1))(1 + (γ−1)/2·M²)]^((γ+1)/(2(γ−1)))","p/p₀ = (1 + (γ−1)/2·M²)^(−γ/(γ−1))","dA/A = (M² − 1)·dV/V","الاختناق: M = 1 عند العنق، والتدفق الكتلي لا يزيد بعدها"],
  note:["بعد الاختناق، خفض ضغط الخلف لا يزيد الكتلة المارة؛ يغيّر فقط ما يحدث بعد العنق.","فوهات الصواريخ متقاربة متباعدة لتعطي سرعة عادم فوق صوتية عالية.","محركات الطائرات التجارية تستخدم غالباً فوهات متقاربة لأن نسبة الضغط فيها لا تحتاج جزءاً متباعداً."],
  quiz:[{q:"بعد اختناق الفوهة، خفض ضغط الخلف أكثر:",o:["يزيد معدل التدفق الكتلي","لا يغيّر معدل التدفق الكتلي","يوقف التدفق"],a:1,why:"عند الاختناق ماخ العنق = 1 والتدفق الكتلي يعتمد على ظروف الخزان ومساحة العنق فقط."},
        {q:"في السريان فوق الصوتي، لتسريع الغاز يجب أن:",o:["تضيق المساحة","تتسع المساحة","تبقى المساحة ثابتة"],a:1,why:"من dA/A = (M² − 1)dV/V، عندما M أكبر من 1 تكون زيادة المساحة مع زيادة السرعة."}],
  ref:"فصل التدفق الانضغاطي في الفوهات والناشرات والأنفاق الهوائية (Compressible Flow through Nozzles, Diffusers, and Wind Tunnels)."
});

/* 9. boundary layer */
const blU=(eta,turb)=>eta>=1?1:(turb?Math.pow(Math.max(eta,0),1/7):2*eta-2*eta**3+eta**4);
LESSONS.foa.push({
  ar:"الطبقة المتاخمة والاحتكاك", en:"Boundary layers and skin friction", alt:"لوح مسطح فوقه طبقة متاخمة تنمو مع المسافة، ومقاطع السرعة صفائحية ثم مضطربة",
  intro:["الهواء الملاصق للسطح سرعته صفر (شرط عدم الانزلاق)، وتزيد السرعة تدريجياً حتى تصل لسرعة الهواء الحر خلال طبقة رقيقة اسمها «الطبقة المتاخمة». فيها يتولد سحب الاحتكاك.",
         "في البداية تكون الطبقة صفائحية ورقيقة، وبعد مسافة تصبح مضطربة: أسمك، ومقطع السرعة فيها أكثر امتلاءً، والاحتكاك أعلى، لكنها تقاوم الانفصال أفضل. الارتفاع في الرسم مكبّر كثيراً لتظهر الطبقة."],
  ctl:[{k:"V",ar:"سرعة الهواء",min:1,max:250,step:1,v:60,f:v=>nf(v,0)+" m/s"},{k:"L",ar:"طول اللوح",min:0.1,max:10,step:0.1,v:2,f:v=>nf(v,1)+" m"},{k:"lre",ar:"رينولدز التحول (log₁₀)",min:5,max:6.5,step:0.05,v:5.7,f:v=>sci(Math.pow(10,v),1)}],
  init(st){ st.p=[]; for(let i=0;i<220;i++) st.p.push({x:Math.random(),hy:0,j:0,n:true}); },
  calc(st){ const a=isa(0); st.nu=a.mu/a.rho; st.ReL=st.V*st.L/st.nu; st.Rec=Math.pow(10,st.lre); st.xtr=st.Rec*st.nu/st.V;
    const dl=x=>{ const R=Math.max(1,st.V*x/st.nu); return x<st.xtr?5*x/Math.sqrt(R):0.37*x/Math.pow(R,0.2); }; st.dl=dl;
    st.dmax=0; for(let i=1;i<=60;i++) st.dmax=Math.max(st.dmax,dl(st.L*i/60));
    st.Cf=st.xtr>=st.L?1.328/Math.sqrt(st.ReL):0.074/Math.pow(st.ReL,0.2)-st.Rec*(0.074/Math.pow(st.Rec,0.2)-1.328/Math.sqrt(st.Rec))/st.ReL;
    st.Dp=0.5*a.rho*st.V*st.V*st.L*st.Cf; },
  step(st,dt,W,H){ const sc=(H*0.55)/st.dmax, sp=40+120*(st.V/250);
    st.p.forEach(q=>{ if(q.n){ q.hy=1+Math.pow(Math.random(),1.6)*H*0.66; q.n=false; }
      const x=q.x*st.L, d=st.dl(x)*sc, turb=x>=st.xtr, eta=d>0?q.hy/d:2;
      if(turb&&eta<1){ q.hy=clamp(q.hy+(Math.random()-0.5)*dt*90,1,H*0.7); }
      q.x+=dt*(4+sp*blU(eta,turb))/(W*0.88); if(q.x>1){ q.x=0; q.n=true; } }); },
  draw(g,W,H,st,C){
    const yw=H*0.84, x0=W*0.06, x1=W*0.94, sc=(H*0.55)/st.dmax, X=f=>x0+f*(x1-x0);
    const edge=[]; for(let i=0;i<=80;i++){ const f=i/80; edge.push([X(f),yw-st.dl(f*st.L)*sc]); }
    g.save(); g.globalAlpha=0.1; g.fillStyle=C.accent; g.beginPath(); g.moveTo(X(0),yw); edge.forEach(p=>g.lineTo(p[0],p[1])); g.lineTo(X(1),yw); g.closePath(); g.fill(); g.restore();
    lline(g,edge,C.accent,1.6,[5,4]);
    st.p.forEach(q=>{ if(q.n) return; const x=q.x*st.L, turb=x>=st.xtr; ldot(g,X(q.x),yw-q.hy,1.7,turb?C.power:C.ctrl,0.7); });
    [0.2,0.45,0.7,0.95].forEach(f=>{ const x=f*st.L, d=st.dl(x)*sc, turb=x>=st.xtr, px=X(f);
      lline(g,[[px,yw],[px,yw-d*1.1]],C.muted,1); const prof=[];
      for(let k=0;k<=10;k++){ const eta=k/10, u=blU(eta,turb), L=u*W*0.07; prof.push([px+L,yw-eta*d]); if(k%2===0&&k>0) larrow(g,px,yw-eta*d,px+L,yw-eta*d,turb?C.power:C.ctrl,1.3,5); }
      lline(g,prof,turb?C.power:C.ctrl,2); });
    lline(g,[[x0,yw],[x1,yw]],C.ink,5);
    if(st.xtr<st.L){ const xt=X(st.xtr/st.L); lline(g,[[xt,yw+6],[xt,H*0.12]],C.muted,1,[4,4]); ltx(g,"صفائحي",(x0+xt)/2,yw+16,{c:C.ctrl,s:11,rtl:true}); ltx(g,"مضطرب",(xt+x1)/2,yw+16,{c:C.power,s:11,rtl:true}); }
    else ltx(g,"صفائحي على طول اللوح",(x0+x1)/2,yw+16,{c:C.ctrl,s:11,rtl:true});
    ltx(g,"سماكة الطبقة عند النهاية: "+nf(st.dl(st.L)*1000,1)+" mm (الرسم مكبّر رأسياً)",W-10,16,{c:C.muted,s:11,a:"right",rtl:true});
  },
  ro(st){ return [["رينولدز عند النهاية Re_L",sci(st.ReL)],["موقع التحول",st.xtr<st.L?nf(st.xtr,3)+" m":"لا يحدث على اللوح"],["سماكة الطبقة عند النهاية",nf(st.dl(st.L)*1000,2)+" mm"],["معامل الاحتكاك الكلي C_f",nf(st.Cf,5)],["سحب الاحتكاك لكل متر عرض (وجه واحد)",nf(st.Dp,1)+" N/m"]]; },
  eq:["δ_lam ≈ 5.0·x / √Re_x","δ_turb ≈ 0.37·x / Re_x^0.2","C_f,lam = 1.328 / √Re_L","C_f ≈ 0.074/Re_L^0.2 − A/Re_L ,  A = Re_cr(0.074/Re_cr^0.2 − 1.328/√Re_cr)"],
  note:["الطبقة المضطربة احتكاكها أعلى، لكنها تخلط هواءً سريعاً قرب السطح فتقاوم الانفصال؛ لهذا لكرة الغولف نتوءات.","«الأجنحة ذات التدفق الصفائحي» تحاول تأخير التحول لتقليل الاحتكاك، وهي حساسة جداً للأوساخ والحشرات.","العلاقات هنا للوح مستوٍ بدون تدرج ضغط؛ على الجناح الحقيقي التدرج الضغطي يغيّر النتائج."],
  quiz:[{q:"مقارنة بالطبقة الصفائحية، الطبقة المضطربة:",o:["احتكاكها أقل","احتكاكها أكبر لكنها تقاوم الانفصال أفضل","لا فرق بينهما"],a:1,why:"الاختلاط المضطرب ينقل زخماً للسطح: احتكاك أعلى، ومقاومة أفضل لتدرج الضغط المعاكس."},
        {q:"كيف تتغيّر سماكة الطبقة الصفائحية مع المسافة x؟",o:["خطياً مع x","مع √x","تبقى ثابتة"],a:1,why:"δ = 5x/√(Vx/ν) = 5√(νx/V)، أي تتناسب مع √x."}],
  ref:"فصول التدفق اللزج والطبقات المتاخمة (Principles of Viscous Flow; Introduction to Boundary Layers)."
});

/* =====================================================================================
   Books 3–5: aircraft design, flight mechanics, aircraft structures (original lessons)
   ===================================================================================== */
function rk4(f,y,t,h){ const k1=f(t,y), y2=y.map((v,i)=>v+h/2*k1[i]), k2=f(t+h/2,y2), y3=y.map((v,i)=>v+h/2*k2[i]), k3=f(t+h/2,y3), y4=y.map((v,i)=>v+h*k3[i]), k4=f(t+h,y4);
  return y.map((v,i)=>v+h/6*(k1[i]+2*k2[i]+2*k3[i]+k4[i])); }
function lease(cur,tgt,dt,k){ return cur+(tgt-cur)*Math.min(1,dt*(k||6)); }
