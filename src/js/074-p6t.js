/* ---------- personal AI tutor inside every lesson ----------
   Uses the page's `sample` capability (getSample, p4s.js). Every call is stateless, so each one carries the lesson, the live slider values,
   the readouts, the student's level and the last turns of this lesson's conversation. The whole card stays hidden when sample is not available. */
const TUT={h:{}, busy:false, ctl:null, level:(()=>{ try{ const v=localStorage.getItem("atlas-tut-level"); return v==="easy"||v==="high"?v:"mid"; }catch(e){ return "mid"; } })()};
const TUT_LV={easy:"مبتدئ: لغة بسيطة جداً وأمثلة من الحياة اليومية، بلا اشتقاقات رياضية",mid:"متوسط: شرح واضح مع المعادلة الأساسية ومعنى كل رمز فيها",high:"متقدم: تفاصيل أعمق، وحدود النموذج المبسّط، وربطه بقرارات التصميم"};
const TUT_TASK={
  simple:"اشرح فكرة هذا الدرس بأبسط ما يمكن كأنني أراها لأول مرة، واستخدم تشبيهاً واحداً من الحياة اليومية.",
  reading:"اشرح القراءات الحالية بالأرقام المعروضة: ماذا تعني كل قراءة، ولماذا وصلت لهذه القيمة بسبب ما ضبطتُه الآن؟",
  example:"أعطني مثالاً حقيقياً من تشغيل الطائرات A380 أو 747 أو 737 يوضّح فكرة هذا الدرس.",
  experiment:"اقترح عليّ تجربة من ثلاث خطوات بالمنزلقات والأزرار الموجودة في هذا الدرس (اذكرها بأسمائها)، واذكر ماذا أتوقع أن يتغيّر في القراءات في كل خطوة.",
  quiz:"اطرح عليّ سؤال فهم واحداً جديداً (مختلفاً عن أسئلة الاختبار في الدرس) بثلاثة خيارات (أ، ب، ج)، وانتظر إجابتي، ولا تكشف الجواب الصحيح الآن.",
  pitfalls:"اذكر أهم ثلاثة أخطاء شائعة يقع فيها الطلاب في هذا الموضوع وكيف أتجنبها."
};
const TUT_CHIPS=[["simple","اشرحه ببساطة"],["reading","اشرح القراءات الآن"],["example","مثال من الواقع"],["experiment","اقترح تجربة"],["quiz","اختبرني"],["pitfalls","أخطاء شائعة"]];
const tutKey=()=>LRN.book+":"+LRN.i;
function tutPlain(h){ return String(h==null?"":h).replace(/<[^>]*>/g," ").replace(/&[a-z]+;/g," ").replace(/\s+/g," ").trim(); }
function tutAvatar(){ if(typeof bobAvatarHTML==="function") return bobAvatarHTML(60,"bust"); return `<svg viewBox="0 0 48 48" width="40" height="40" aria-hidden="true"><circle cx="24" cy="24" r="23" fill="var(--accent)" opacity=".16"/><path d="M13 30c0-6 4-11 11-11s11 5 11 11v8H13z" fill="var(--accent)"/><circle cx="24" cy="18" r="7" fill="var(--panel)" stroke="var(--accent)" stroke-width="2"/><path d="M15 15c2-6 16-6 18 0z" fill="var(--accent)"/><path d="M13 15h22" stroke="var(--signal)" stroke-width="2.4" stroke-linecap="round"/><path d="M20 38l4-5 4 5" fill="none" stroke="var(--panel)" stroke-width="2" stroke-linecap="round"/></svg>`; }
function tutHTML(){
  return `<section class="ltutor" id="lTut" hidden aria-label="المدرّس الذكي">
    <header class="tuth"><span class="tav">${tutAvatar()}</span><div><b>ميسلون، مدرّسك الذكي</b><small>يرى القيم التي تضبطها الآن ويشرح لك على قدّ مستواك، وتسمعه بصوته إن أحببت</small></div></header>
    <div class="tlv" role="group" aria-label="مستواك"><span>مستواك:</span>${[["easy","مبتدئ"],["mid","متوسط"],["high","متقدم"]].map(([k,t])=>`<button type="button" class="chip" data-lv="${k}" aria-pressed="${TUT.level===k}">${t}</button>`).join("")}</div>
    <div class="chips" role="group" aria-label="اسأل المدرّس">${TUT_CHIPS.map(([k,t])=>`<button type="button" class="chip" data-tut="${k}">${t}</button>`).join("")}</div>
    <div class="msgs tmsgs" id="tMsgs" aria-live="polite"></div>
    <form class="chform" id="tForm"><label class="sr" for="tIn">اكتب سؤالك للمدرّس</label><textarea id="tIn" rows="2" maxlength="600" placeholder="اسأل عن أي شي في هذا الدرس..."></textarea><button class="btn pri" type="submit">اسأل</button></form>
    <p class="status" id="tSt"></p>
    ${aiModeHTML()}
  </section>`;
}
function tutSnap(){
  const l=lrnCur(), st=LRN.st||{};
  const val=(c)=>{ try{ return tutPlain(c.f?c.f(st[c.k],st):nf(st[c.k],2)); }catch(e){ return String(st[c.k]); } };
  const ctl=(l.ctl||[]).map(c=>`${c.ar} = ${val(c)}`).join("، ");
  const tog=(l.tog||[]).map(t=>`${t.ar}: ${st[t.k]?"مفعّل":"متوقف"}`).join("، ");
  let ro=""; try{ ro=l.ro(st).map(([a,b])=>`${tutPlain(a)} = ${tutPlain(b)}`).join("؛ "); }catch(e){}
  return {ctl,tog,ro,eq:(l.eq||[]).map(tutPlain).join(" | "),intro:(l.intro||[]).map(tutPlain).join(" "),note:(l.note||[]).map(tutPlain).join(" • ")};
}
function tutPrompt(task){
  const l=lrnCur(), s=tutSnap(), key=tutKey(), hist=(TUT.h[key]||[]).slice(-6).filter(m=>m.text).map(m=>(m.role==="user"?"الطالب: ":"المدرّس: ")+m.text).join("\n");
  let ac=""; try{ ac=AC[S.ac].name; }catch(e){}
  const done=Object.keys(LESSONS).reduce((a,b)=>a+lrnDoneN(b),0);
  return `${typeof myUserCtx==="function"?myUserCtx()+"\n":""}أنت «ميسلون»، مهندس طيران ودود ومدرّس شخصي (شخصية كرتونية لطيفة) لطالب عربي يحلم أن يصير طياراً أو مهندس طائرات. أسلوبك ودود ومشجّع وواضح، وتشرح بالعربية الفصحى المبسّطة وتكتب المصطلح الإنجليزي بين قوسين عند الحاجة.
مستوى الطالب: ${TUT_LV[TUT.level]}.
الدرس: «${l.ar}» (${l.en}) من كتاب «${LBOOK[LRN.book].ar}». أكمل الطالب ${done} درساً حتى الآن.
مقدمة الدرس: ${s.intro}
${s.ctl?"عناصر التحكم الآن: "+s.ctl+"\n":""}${s.tog?"الخيارات: "+s.tog+"\n":""}${s.ro?"القراءات الحالية أمام الطالب: "+s.ro+"\n":""}${s.eq?"المعادلات المعروضة: "+s.eq+"\n":""}${s.note?"نقاط الدرس: "+s.note+"\n":""}${ac?"الطائرة المعروضة في الموقع: "+ac+"\n":""}
قواعد صارمة: لا تخترع أرقاماً أو معادلات أو أسماء مراجع غير موجودة في ما سبق أو في معرفتك المؤكدة، وإن لم تكن متأكداً فقلها بصراحة. عندما تشير لما يراه الطالب استعمل القيم المكتوبة أعلاه. الإجابة لا تزيد عن 150 كلمة، بجمل قصيرة وبلا جداول (فالطالب قد يسمعها بصوتك)، وتُختم بسؤال قصير أو بتجربة بسيطة يجرّبها الطالب بالمنزلقات. لا تعِد نص الدرس حرفياً. هذا للتعلّم فقط وليس إجراءً تشغيلياً أو صيانياً.
${hist?"المحادثة السابقة في هذا الدرس:\n"+hist+"\n":""}المطلوب الآن: ${task}`;
}
function tutHtmlText(t){ return esc(t||"...").replace(/\*\*(.+?)\*\*/g,"<b>$1</b>").replace(/\n/g,"<br>"); }
function tutRender(){
  const box=document.getElementById("tMsgs"); if(!box) return; const h=TUT.h[tutKey()]||[];
  const busyLast=TUT.busy;
  box.innerHTML=h.length?h.map((m,i)=>`<div class="msg ${m.role==="user"?"user":"ai bob"}"><span>${m.role==="user"?"أنت":"ميسلون"}${m.role!=="user"&&m.text&&!(busyLast&&i===h.length-1)&&typeof bobSpeakBtn==="function"?bobSpeakBtn("اسمعني",`data-bobspk="${i}"`):""}</span><p>${tutHtmlText(m.text)}</p>${m.role!=="user"&&!(busyLast&&i===h.length-1)?aiLinksHTML(m.links):""}</div>`).join(""):`<p class="status">اضغط على أحد الأزرار، أو اكتب سؤالك. المدرّس يعرف أي درس أنت فيه، وما القيم التي ضبطتها الآن.</p>`;
  box.scrollTop=box.scrollHeight;
}
function tutAbort(){ try{ if(TUT.ctl) TUT.ctl.abort(); }catch(e){} TUT.ctl=null; TUT.busy=false; }
async function tutSend(shown,task,local){
  const st=document.getElementById("tSt"), key=tutKey(); if(TUT.busy) return;
  const sm=await getSample();
  const prompt=tutPrompt(task), h=(TUT.h[key]=TUT.h[key]||[]); h.push({role:"user",text:shown}); const a={role:"ai",text:""}; h.push(a);
  TUT.busy=true; tutRender(); if(st) st.textContent="ميسلون يفكّر..."; try{ bobMood("think"); }catch(e){}
  const ctl=TUT.ctl=new AbortController();
  try{
    const r=await sm(prompt,{signal:ctl.signal,cache:false,kind:"tutor",local,onText:({text})=>{ a.text=text; if(tutKey()===key) tutRender(); }});
    a.text=r.text||a.text; if(r.links&&r.links.length) a.links=r.links;
  }catch(e){
    const c=e&&e.code;
    if(c!=="aborted"&&e&&e.name!=="AbortError"){ a.text=c==="not_granted"?"لم تتم الموافقة على استخدام Claude في هذه الصفحة.":c==="rate_limited"?"طلبات كثيرة الآن، انتظر قليلاً ثم أعد المحاولة.":(a.text||"تعذّر الحصول على إجابة الآن، حاول مرة ثانية."); try{ const L=local&&local(); const t=typeof L==="string"?L:L&&L.text; if(t){ a.text=t; a.links=L.links; } }catch(er){} }
  }finally{
    TUT.busy=false; if(TUT.ctl===ctl) TUT.ctl=null; if(!a.text) h.splice(h.indexOf(a)-1,2); try{ bobMood(a.text&&a.text.length>20?"happy":"idle",2600); }catch(e){}
    const s2=document.getElementById("tSt"); if(s2) s2.textContent=""; if(tutKey()===key) tutRender();
  }
}
function tutAsk(kind){ const t=TUT_TASK[kind]; if(!t) return; const c=TUT_CHIPS.find(x=>x[0]===kind); tutSend(c?c[1]:kind,t,()=>aiTutorLocal(kind)); }
function tutFree(q){ q=(q||"").trim(); if(q) tutSend(q,"أجب عن سؤال الطالب: "+q,()=>aiTutorLocal("free",q)); }
function tutLevel(k){ TUT.level=k; try{ localStorage.setItem("atlas-tut-level",k); }catch(e){} document.querySelectorAll("#lTut [data-lv]").forEach(b=>b.setAttribute("aria-pressed",b.dataset.lv===k)); }
/* after a wrong quiz answer: ask the tutor to explain where the confusion was */
function tutWhy(qi,oi){
  const l=lrnCur(), q=l.quiz[qi]; if(!q) return; const sec=document.getElementById("lTut"); if(sec&&sec.scrollIntoView) sec.scrollIntoView({behavior:"smooth",block:"center"});
  tutSend("لماذا إجابتي غير صحيحة في سؤال: "+tutPlain(q.q),`أجاب الطالب عن سؤال الاختبار «${tutPlain(q.q)}» بالخيار «${tutPlain(q.o[oi])}» وهو خطأ. الجواب الصحيح «${tutPlain(q.o[q.a])}» والتفسير المختصر: ${tutPlain(q.why)}. اشرح له بلطف أين وقع الالتباس على الأرجح ولماذا يصحّ الخيار الصحيح، من غير تكرار التفسير حرفياً، ثم اطرح عليه سؤالاً قصيراً يتأكد به أنه فهم.`,
    ()=>({text:ilTA("الجواب الصحيح: «","The right answer: «")+ilT(tutPlain(q.o[q.a]))+"».\n"+ilT(tutPlain(q.why))}));
}
function tutInit(el){
  const sec=el.querySelector("#lTut"); if(!sec) return; tutAbort(); tutRender(); try{ bobAvatarMount(sec); }catch(e){}
  sec.querySelector("#tMsgs").addEventListener("click",e=>{ const b=e.target.closest("[data-bobspk]"); if(!b) return; const m=(TUT.h[tutKey()]||[])[+b.dataset.bobspk]; if(m) bobRead(m.text,b); });
  const f=sec.querySelector("#tForm"), i=sec.querySelector("#tIn");
  f.addEventListener("submit",e=>{ e.preventDefault(); const v=i.value; i.value=""; tutFree(v); });
  i.addEventListener("keydown",e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); const v=i.value; i.value=""; tutFree(v); } });
  getSample().then(sm=>{ if(sm&&sec.isConnected) sec.hidden=false; aiModeSync(); });
}

/* =====================================================================================
   Lesson kit for the 100-lesson expansion. A lesson built with LK() draws a scene on the
   left and a live plot on the right, so each lesson only describes its physics.
   ===================================================================================== */
const KC=(c,C)=>(C&&C[c])||c;
function kTicks(a,b,n){ n=n||5; const span=b-a; if(!(span>0)) return [a]; const raw=span/n, p=Math.pow(10,Math.floor(Math.log10(raw))), m=raw/p, st=(m<1.5?1:m<3?2:m<7?5:10)*p;
  const out=[]; for(let v=Math.ceil(a/st-1e-9)*st; v<=b+1e-9*Math.abs(b||1); v+=st) out.push(Math.round(v/st)*st); return out; }
function kFmt(v){ const a=Math.abs(v); if(a<1e-12) return "0"; if(a>=1e4) return nf(v/1000,a>=1e5?0:1)+"k"; if(a>=100) return nf(v,0); if(a>=1) return nf(v,Math.abs(v-Math.round(v))<1e-9?0:1); return nf(v,a>=0.1?2:a>=0.01?3:4); }
const kAr=s=>/[؀-ۿ]/.test(s||"");
/* p = {x:[a,b], y:[c,d], xt, yt, xf, yf, xl, yl, log, curves:[{f,c,w,dash,n}], lines:[{pts,c,w,dash}], band:[{x0,x1,c,a}], hband:[{y0,y1,c,a}],
        vl:[{x,c,t}], hl:[{y,c,t}], dots:[{x,y,c,r,t}], leg:[{c,t,dash}] } */
function kPlot(g,r,p,C){
  const narrow=r.w<170, xt=p.xt||kTicks(p.x[0],p.x[1],narrow?3:5);
  let yt=p.yt; if(!yt){ if(p.log){ yt=[]; for(let e=Math.ceil(Math.log10(p.y[0])); e<=Math.floor(Math.log10(p.y[1])); e++) yt.push(Math.pow(10,e)); } else yt=kTicks(p.y[0],p.y[1],4); }
  const P=lplot(g,r,p.x,p.y,{xt,yt,xf:p.xf||kFmt,yf:p.yf||kFmt,xl:p.xl,xlr:kAr(p.xl),yl:p.yl,ylr:kAr(p.yl),log:p.log});
  const X=P.X, Y=P.Y;
  g.save(); g.beginPath(); g.rect(r.x,r.y,r.w,r.h); g.clip();
  (p.band||[]).forEach(b=>{ const x0=X(b.x0), x1=X(b.x1); g.fillStyle=mixC(C.panel,KC(b.c,C),b.a||0.16); g.fillRect(Math.min(x0,x1),r.y,Math.abs(x1-x0),r.h); });
  (p.hband||[]).forEach(b=>{ const y0=Y(b.y0), y1=Y(b.y1); g.fillStyle=mixC(C.panel,KC(b.c,C),b.a||0.16); g.fillRect(r.x,Math.min(y0,y1),r.w,Math.abs(y1-y0)); });
  (p.hl||[]).forEach(h=>lline(g,[[r.x,Y(h.y)],[r.x+r.w,Y(h.y)]],KC(h.c||"muted",C),1.2,h.dash||[4,4]));
  (p.vl||[]).forEach(v=>lline(g,[[X(v.x),r.y],[X(v.x),r.y+r.h]],KC(v.c||"muted",C),1.2,v.dash||[4,4]));
  (p.curves||[]).forEach(cv=>{ const n=cv.n||160, a=cv.x?cv.x[0]:p.x[0], b=cv.x?cv.x[1]:p.x[1]; let pts=[]; const flush=()=>{ if(pts.length>1) lline(g,pts,KC(cv.c||"hyd",C),cv.w||2.2,cv.dash); pts=[]; };
    for(let i=0;i<=n;i++){ const x=a+(b-a)*i/n, y=cv.f(x); if(isFinite(y)&&(!p.log||y>0)) pts.push([X(x),Y(y)]); else flush(); } flush(); });
  (p.lines||[]).forEach(l=>{ const pts=l.pts.filter(q=>isFinite(q[0])&&isFinite(q[1])&&(!p.log||q[1]>0)).map(q=>[X(q[0]),Y(q[1])]); if(l.fill){ g.fillStyle=mixC(C.panel,KC(l.fill,C),l.a||0.18); g.beginPath(); pts.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1])); g.closePath(); g.fill(); } lline(g,pts,KC(l.c||"hyd",C),l.w||2,l.dash); });
  g.restore();
  (p.vl||[]).forEach(v=>{ if(v.t) ltx(g,v.t,X(v.x),r.y-6,{c:KC(v.c||"muted",C),s:10,m:!kAr(v.t),rtl:kAr(v.t)}); });
  (p.hl||[]).forEach(h=>{ if(h.t) ltx(g,h.t,r.x+r.w-4,Y(h.y)-8,{c:KC(h.c||"muted",C),s:10,a:"right",m:!kAr(h.t),rtl:kAr(h.t)}); });
  (p.dots||[]).forEach(d=>{ if(!isFinite(d.x)||!isFinite(d.y)) return; const x=clamp(X(d.x),r.x,r.x+r.w), y=clamp(Y(d.y),r.y,r.y+r.h); ldot(g,x,y,d.r||5.5,KC(d.c||"power",C));
    if(d.t){ const right=x<r.x+r.w*0.6; ltx(g,d.t,x+(right?8:-8),y-11,{c:KC(d.c||"power",C),s:10,w:600,a:right?"left":"right",m:!kAr(d.t),rtl:kAr(d.t)}); } });
  (p.leg||[]).forEach((l,i)=>{ const y=r.y+12+i*15, x=r.x+r.w-6; lline(g,[[x-16,y],[x,y]],KC(l.c,C),2.4,l.dash); ltx(g,l.t,x-21,y,{c:C.ink,s:10,a:"right",rtl:kAr(l.t),m:!kAr(l.t)}); });
  return P;
}
/* register a kit lesson: s.scene(g,rect,st,C,W,H) and s.plot(st,C) -> plot spec */
function LK(book,s){
  if(!s.draw) s.draw=function(g,W,H,st,C){
    const narrow=W<560, pw=s.plot?(s.pw||0.42):0;
    const sr={x:W*0.02,y:H*0.04,w:W*(1-pw)-W*0.04,h:H*0.92};
    if(s.scene){ g.save(); if(s.plot){ g.beginPath(); g.rect(0,0,W*(1-pw)+(narrow?6:14),H); g.clip(); } s.scene(g,sr,st,C,W,H); g.restore(); }
    if(s.plot){ const pr={x:W*(1-pw)+(narrow?24:46),y:H*0.12,w:W*pw-(narrow?30:58),h:H*0.68}; kPlot(g,pr,s.plot(st,C),C); }
  };
  if(!s.step) s.step=()=>{};
  if(!s.init) s.init=()=>{};
  LESSONS[book].push(s);
}
/* bisection root finder on [a,b] */
function kRoot(f,a,b,it){ let fa=f(a); for(let i=0;i<(it||80);i++){ const m=(a+b)/2, fm=f(m); if((fm<0)===(fa<0)){ a=m; fa=fm; } else b=m; } return (a+b)/2; }
/* NACA 4-digit airfoil drawn with leading edge at (ox,oy), chord ch px, angle of attack aDeg (nose up), optional plain flap.
   Returns the mapping from chord coordinates to the screen. */
function kFoil(g,ox,oy,ch,aDeg,C,o){
  o=o||{}; const m=o.m==null?0.02:o.m, p=o.p||0.4, t=o.t==null?0.12:o.t, E=o.E||0, fd=(o.fd||0)*D2R, a=-aDeg*D2R;
  const yc=x=>m===0?0:(x<p?m/(p*p)*(2*p*x-x*x):m/((1-p)*(1-p))*((1-2*p)+2*p*x-x*x));
  const yt=x=>5*t*(0.2969*Math.sqrt(Math.max(x,0))-0.126*x-0.3516*x*x+0.2843*x**3-0.1036*x**4);
  const hx0=1-E, hy0=yc(hx0);
  const flap=(x,y)=>{ if(!E||x<=hx0) return [x,y]; const dx=x-hx0, dy=y-hy0, c=Math.cos(-fd), s=Math.sin(-fd); return [hx0+dx*c-dy*s, hy0+dx*s+dy*c]; };
  const P=(x,y)=>{ const q=flap(x,y); return [ox+(q[0]*Math.cos(a)-q[1]*Math.sin(a))*ch, oy-(q[0]*Math.sin(a)+q[1]*Math.cos(a))*ch]; };
  const up=[], lo=[]; for(let i=0;i<=60;i++){ const x=0.5-0.5*Math.cos(Math.PI*i/60); up.push(P(x,yc(x)+yt(x))); lo.push(P(x,yc(x)-yt(x))); }
  g.fillStyle=o.fill||mixC(C.panel,C.struct,0.4); g.strokeStyle=C.ink; g.lineWidth=1.4; g.beginPath();
  up.forEach((q,i)=>i?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1])); for(let i=lo.length-1;i>=0;i--) g.lineTo(lo[i][0],lo[i][1]); g.closePath(); g.fill(); g.stroke();
  if(o.camber){ const cl=[]; for(let i=0;i<=40;i++){ const x=i/40; cl.push(P(x,yc(x))); } lline(g,cl,C.power,1.3,[5,3]); lline(g,[P(0,0),P(1,0)],C.muted,1,[2,3]); }
  P.yc=yc; P.yt=yt; return P;
}
/* round instrument: angle sweep from a0 (deg, screen, clockwise) over sw degrees */
function kGauge(g,cx,cy,R,v,v0,v1,C,o){
  o=o||{}; const a0=(o.a0==null?135:o.a0)*D2R, sw=(o.sw==null?270:o.sw)*D2R, ang=x=>a0+sw*clamp((x-v0)/(v1-v0),0,1);
  g.fillStyle="#1d242b"; g.beginPath(); g.arc(cx,cy,R,0,Math.PI*2); g.fill(); g.strokeStyle="#5d6873"; g.lineWidth=2; g.stroke();
  (o.arcs||[]).forEach(a=>{ g.strokeStyle=KC(a.c,C); g.lineWidth=R*0.09; g.beginPath(); g.arc(cx,cy,R*0.84,ang(a.from),ang(a.to)); g.stroke(); });
  const step=o.step||(v1-v0)/10; for(let x=v0;x<=v1+1e-9;x+=step/(o.minor||2)){ const an=ang(x), major=Math.abs(((x-v0)/step)-Math.round((x-v0)/step))<1e-6;
    lline(g,[[cx+Math.cos(an)*R*(major?0.72:0.8),cy+Math.sin(an)*R*(major?0.72:0.8)],[cx+Math.cos(an)*R*0.92,cy+Math.sin(an)*R*0.92]],"#e8edf2",major?1.6:1);
    if(major&&o.labels!==false) ltx(g,o.lf?o.lf(x):kFmt(x),cx+Math.cos(an)*R*0.55,cy+Math.sin(an)*R*0.55,{c:"#e8edf2",s:Math.max(8,R*0.13),m:true}); }
  const an=ang(v); lline(g,[[cx-Math.cos(an)*R*0.12,cy-Math.sin(an)*R*0.12],[cx+Math.cos(an)*R*0.86,cy+Math.sin(an)*R*0.86]],o.nc||"#ffffff",2.6); ldot(g,cx,cy,R*0.07,"#8a97a3");
  if(o.label) ltx(g,o.label,cx,cy+R*(o.ly||0.27),{c:"#c7d0d8",s:Math.max(8,R*0.12),m:!kAr(o.label),rtl:kAr(o.label)});
  if(o.val) ltx(g,o.val,cx,cy+R+13,{c:C.ink,s:11,w:600,m:!kAr(o.val),rtl:kAr(o.val)});
}
/* a filled horizontal bar with caption, frac in 0..1 */
function kBar(g,x,y,w,h,frac,c,C,cap){ g.fillStyle=mixC(C.panel,C.ink,0.08); g.fillRect(x,y,w,h); g.fillStyle=KC(c,C); g.fillRect(x,y,w*clamp(frac,0,1),h); if(cap) ltx(g,cap,x+w,y-9,{s:11,a:"right",rtl:kAr(cap),m:!kAr(cap)}); }
/* a labelled box (block diagram, tanks, loads) */
function kBox(g,x,y,w,h,fill,C,t,o){ o=o||{}; g.fillStyle=KC(fill,C); g.fillRect(x,y,w,h); g.strokeStyle=KC(o.stroke||"ink",C); g.lineWidth=o.lw||1.2; g.strokeRect(x,y,w,h); if(t) ltx(g,t,x+w/2,y+h/2,{c:KC(o.tc||"ink",C),s:o.s||11,w:o.w||500,rtl:kAr(t),m:!kAr(t)}); }
/* map a list of [x,y] points to fit inside rect r (equal scale, y up) */
function kFit(pts,r,pad){ pad=pad||14; let x0=1e18,x1=-1e18,y0=1e18,y1=-1e18; pts.forEach(p=>{ x0=Math.min(x0,p[0]); x1=Math.max(x1,p[0]); y0=Math.min(y0,p[1]); y1=Math.max(y1,p[1]); });
  const dx=Math.max(x1-x0,1e-9), dy=Math.max(y1-y0,1e-9), s=Math.min((r.w-2*pad)/dx,(r.h-2*pad)/dy), cx=r.x+r.w/2, cy=r.y+r.h/2, mx=(x0+x1)/2, my=(y0+y1)/2;
  return p=>[cx+(p[0]-mx)*s, cy-(p[1]-my)*s]; }
