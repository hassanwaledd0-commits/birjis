/* ---------- my journey ---------- */
function totalLessons(){ return Object.keys(LESSONS).reduce((a,b)=>a+LESSONS[b].length,0); }
function totalDone(){ return Object.keys(LESSONS).reduce((a,b)=>a+lrnDoneN(b),0); }
function nextLessons(n){
  let last=null; try{ last=JSON.parse(localStorage.getItem("atlas-lrn")||"null"); }catch(e){}
  const books=Object.keys(LESSONS), out=[]; if(!books.length) return out;
  const startB=last&&LESSONS[last.b]?last.b:books[0], order=books.slice(books.indexOf(startB)).concat(books.slice(0,books.indexOf(startB)));
  for(const b of order){ const from=(b===startB&&last)?last.i:0, L=LESSONS[b];
    for(let k=0;k<L.length;k++){ const i=(from+k)%L.length; if(!LDONE.has(b+":"+i)){ out.push([b,i]); if(out.length>=n) return out; } } }
  return out;
}
function weakBooks(){ const c={}; srsOpen().forEach(k=>{ const b=k.split(":")[0]; c[b]=(c[b]||0)+1; }); return Object.keys(c).sort((a,b)=>c[b]-c[a]).slice(0,2).map(b=>[b,c[b]]); }
function ring(p,col){ const r=26, c=2*Math.PI*r; return `<svg viewBox="0 0 64 64" width="64" height="64" aria-hidden="true"><circle cx="32" cy="32" r="${r}" fill="none" stroke="var(--line)" stroke-width="7"/><circle cx="32" cy="32" r="${r}" fill="none" stroke="${col||"var(--accent)"}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${(c*Math.min(1,p)).toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 32 32)"/></svg>`; }
function dashHTML(){
  const tot=totalLessons(), dn=totalDone(), td=STUDY.days[today()]||{l:0,r:0}, due=srsDue().length, st=streak(), plan=nextLessons(Math.max(1,STUDY.goal)), weak=weakBooks();
  const books=Object.keys(LBOOK).map(b=>{ const n=LESSONS[b].length, d=lrnDoneN(b); return `<button type="button" class="dbk" data-dbook="${b}"><span><b>${LBOOK[b].ar}</b><small>${d} من ${n}</small></span><i style="--w:${n?Math.round(d/n*100):0}%"></i></button>`; }).join("");
  const favs=[...STUDY.fav].map(k=>{ const p=k.split(":"); if(p[0]==="l"&&LESSONS[p[1]]&&LESSONS[p[1]][+p[2]]) return `<button type="button" class="dfav" data-dgo="${p[1]}:${p[2]}"><span>★</span>${LESSONS[p[1]][+p[2]].ar}<small>${LBOOK[p[1]].ar}</small></button>`; if(p[0]==="p"&&PARTS[p[1]]) return `<button type="button" class="dfav" data-dpart="${p[1]}"><span>★</span>${PARTS[p[1]].ar}<small>قطعة</small></button>`; return ""; }).join("");
  const notes=Object.keys(STUDY.notes).map(k=>{ const p=k.split(":"), t=STUDY.notes[k], ttl=p[0]==="l"?(LESSONS[p[1]]&&LESSONS[p[1]][+p[2]]?LESSONS[p[1]][+p[2]].ar:""):(PARTS[p[1]]?PARTS[p[1]].ar:""); if(!ttl) return ""; return `<div class="dnote"><b>${esc(ttl)}</b><p>${esc(t.length>160?t.slice(0,160)+"…":t)}</p><button type="button" class="chip" data-${p[0]==="l"?"dgo":"dpart"}="${p[0]==="l"?p[1]+":"+p[2]:p[1]}">افتح</button> <button type="button" class="chip" data-dnoteX="${esc(k)}">احذف</button></div>`; }).join("");
  return `<div class="dash">
    <div class="dtop">
      <div class="dcard"><div class="dring">${ring(tot?dn/tot:0)}<b>${tot?Math.round(dn/tot*100):0}%</b></div><div><b>${dn} من ${tot}</b><small>درساً مكتملاً</small></div></div>
      <div class="dcard"><div class="dring">${ring(Math.min(1,td.l/Math.max(1,STUDY.goal)),"var(--signal)")}<b>${td.l}</b></div><div><b>هدف اليوم: ${STUDY.goal}</b><small>${td.l>=STUDY.goal?"أنجزته 🎉".replace(" 🎉",""):"درس مكتمل اليوم: "+td.l}</small></div></div>
      <div class="dcard"><div class="dring big"><b>${st}</b></div><div><b>${st===1?"يوم متتالٍ":st===2?"يومان متتاليان":st>2&&st<11?st+" أيام متتالية":st+" يوماً متتالياً"}</b><small>${st?"استمر على هذا":"ابدأ اليوم سلسلتك"}</small></div></div>
      <div class="dcard"><div class="dring big"><b>${due}</b></div><div><b>أسئلة تنتظر المراجعة</b><small>${due?'<button type="button" class="chip" data-dgoto="review">ابدأ المراجعة</button>':"لا شي مستحق الآن"}</small></div></div>
    </div>
    <section class="dsec"><h4>خطة اليوم</h4>
      <div class="dgoal" role="group" aria-label="هدفك اليومي">${[1,2,3,5].map(n=>`<button type="button" class="chip" data-dgoal="${n}" aria-pressed="${STUDY.goal===n}">${n===1?"درس واحد":n===2?"درسان":n+" دروس"}</button>`).join("")}</div>
      ${plan.length?`<ol class="dplan">${plan.map(([b,i])=>`<li><button type="button" data-dgo="${b}:${i}"><b>${LESSONS[b][i].ar}</b><small>${LBOOK[b].ar} · الدرس ${i+1}</small></button></li>`).join("")}</ol>`:`<p class="status">أكملت كل الدروس. ما شاء الله. راجع الأسئلة أو افتح الطيران وتدرّب.</p>`}
      ${due?`<p class="status">وبعدها راجع ${qN(due)} من أخطائك السابقة.</p>`:""}
    </section>
    ${weak.length?`<section class="dsec"><h4>نقاط تحتاج مراجعة</h4><div class="dchips">${weak.map(([b,n])=>`<button type="button" class="chip" data-dbook="${b}">${LBOOK[b].ar}: ${qN(n)}</button>`).join("")}</div></section>`:""}
    <section class="dsec"><h4>تقدّمك بكل كتاب</h4><div class="dbooks">${books}</div></section>
    <section class="dsec"><h4>مفضّلتي</h4>${favs?`<div class="dfavs">${favs}</div>`:`<p class="status">اضغط النجمة على أي درس أو قطعة لتجدها هنا.</p>`}</section>
    <section class="dsec"><h4>ملاحظاتي</h4>${notes?`<div class="dnotes">${notes}</div>`:`<p class="status">اكتب ملاحظات داخل الدروس وبطاقات القطع، وتظهر هنا.</p>`}</section>
    <p class="status"><button type="button" class="chip" id="dReset">مسح تقدّمي</button> كل هذا محفوظ في متصفحك فقط.</p>
  </div>`;
}
function dashMount(root){
  const el=root.querySelector(".dash"); if(!el) return;
  el.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return; const d=b.dataset;
    if(d.dgo){ const p=d.dgo.split(":"); try{ localStorage.setItem("atlas-lrn",JSON.stringify({b:p[0],i:+p[1]})); }catch(x){} setTab("learn"); return; }
    if(d.dbook){ try{ localStorage.setItem("atlas-lrn",JSON.stringify({b:d.dbook,i:0})); }catch(x){} setTab("learn"); return; }
    if(d.dpart){ setTab("parts"); select(d.dpart); return; }
    if(d.dgoto){ setTab(d.dgoto); return; }
    if(d.dgoal){ STUDY.goal=+d.dgoal; stSave("goal"); renderTab(); return; }
    if(d.dnoteX!==undefined){ delete STUDY.notes[d.dnoteX]; stSave("notes"); renderTab(); return; }
    if(b.id==="dReset"){ if(confirm("مسح التقدّم والأخطاء والملاحظات والمفضلة من هذا المتصفح؟")){ LDONE.clear(); try{ localStorage.removeItem("atlas-lrn-done"); }catch(x){} STUDY.fav.clear(); STUDY.notes={}; STUDY.srs={}; STUDY.days={}; ["fav","notes","srs","days"].forEach(stSave); renderTab(); } } });
}
