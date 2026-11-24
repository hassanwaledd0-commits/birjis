/* ---------- spaced review ---------- */
const REV={q:[],i:0,ok:0,done:false,cur:null,perm:null,answered:false,mode:"due"};
function revShuffle(a){ a=a.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function revStart(mode){
  let keys;
  if(mode==="due") keys=srsDue().slice(0,10);
  else { const all=[]; Object.keys(LESSONS).forEach(b=>LESSONS[b].forEach((l,i)=>{ if(LDONE.has(b+":"+i)&&l.quiz) l.quiz.forEach((q,qi)=>all.push(b+":"+i+":"+qi)); })); keys=revShuffle(all).slice(0,8); }
  REV.q=keys; REV.i=0; REV.ok=0; REV.done=false; REV.mode=mode; revLoad();
}
function revLoad(){ const k=REV.q[REV.i]; REV.cur=k?srsQ(k):null; REV.answered=false; REV.perm=REV.cur?revShuffle(REV.cur.q.o.map((_,i)=>i)):null; if(!REV.cur) REV.done=true; }
function revHTML(){
  const due=srsDue().length, open=srsOpen().length, done=totalDone();
  if(REV.q.length&&!REV.done&&REV.cur){ const c=REV.cur, q=c.q;
    return `<div class="rev"><p class="status">سؤال ${REV.i+1} من ${REV.q.length} · ${esc(c.l.ar)}</p><div class="rq"><p>${q.q}</p><div class="rqo">${REV.perm.map((oi,pi)=>`<button type="button" class="btn" data-ro="${pi}">${q.o[oi]}</button>`).join("")}</div><p class="rqa" id="rqa" aria-live="polite"></p></div><div class="rnav"><button type="button" class="btn pri" id="rNext" hidden>${REV.i+1>=REV.q.length?"إنهاء":"التالي"}</button><button type="button" class="chip" id="rStop">إنهاء الجلسة</button></div></div>`; }
  if(REV.done&&REV.q.length){ const n=REV.q.length;
    return `<div class="rev"><div class="rsum"><h3>انتهت الجلسة</h3><p>أجبت صحيحاً على <b>${REV.ok}</b> من <b>${n}</b>.</p><p class="status">${REV.ok===n?"ممتاز. الأسئلة الصحيحة تتباعد مواعيد مراجعتها تلقائياً.":"الأسئلة التي أخطأت بها ترجع لك قريباً حتى تثبّتها."}</p><div class="rnav"><button type="button" class="btn pri" id="rBack">رجوع</button></div></div></div>`; }
  return `<div class="rev"><p>الأسئلة التي تخطئ بها داخل الدروس تدخل هنا تلقائياً، وتعود لك بمواعيد متباعدة (يوم، 3 أيام، أسبوع، أسبوعان، شهر) حتى تثبت بذاكرتك.</p>
    <div class="dtop"><div class="dcard"><div class="dring big"><b>${due}</b></div><div><b>مستحقة الآن</b><small>${open} في صندوق المراجعة</small></div></div></div>
    <div class="rnav"><button type="button" class="btn pri" id="rDue" ${due?"":"disabled"}>${due?"راجع الأسئلة المستحقة":"لا أسئلة مستحقة الآن"}</button>
    <button type="button" class="btn" id="rRand" ${done?"":"disabled"}>أسئلة عشوائية من دروسي المكتملة</button></div>
    ${done?"":`<p class="status">أكمل درساً واحداً على الأقل لتفتح الأسئلة العشوائية.</p>`}</div>`;
}
function revMount(root){
  const el=root.querySelector(".rev"); if(!el) return;
  el.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return;
    if(b.id==="rDue"){ revStart("due"); renderTab(); return; } if(b.id==="rRand"){ revStart("rand"); renderTab(); return; }
    if(b.id==="rBack"||b.id==="rStop"){ REV.q=[]; REV.done=false; renderTab(); return; }
    if(b.id==="rNext"){ REV.i++; if(REV.i>=REV.q.length) REV.done=true; else revLoad(); renderTab(); return; }
    if(b.dataset.ro!==undefined&&!REV.answered){ REV.answered=true; const c=REV.cur, q=c.q, pi=+b.dataset.ro, ok=REV.perm[pi]===q.a; if(ok) REV.ok++;
      el.querySelectorAll("[data-ro]").forEach(x=>{ const idx=REV.perm[+x.dataset.ro]; if(idx===q.a) x.classList.add("ok"); else if(x===b) x.classList.add("no"); });
      el.querySelector("#rqa").textContent=(ok?"صحيح. ":"ليس تماماً. ")+q.why; el.querySelector("#rNext").hidden=false;
      srsReview(REV.q[REV.i],ok); dayAct("r"); } });
}
