/* ---------- setup form in the "fly" tab ---------- */
/* the sticky start bar shows the choices in one line: aircraft · airport · scenario · time · weather (each its own span so the language layer can translate them one by one) */
function flySumHTML(){
  try{ const o=FLY.opts, n={a380:"A380",b747:"747",b737:"737"}, it=[n[o.ac]||String(o.ac||""),o.apt||"ORBI",FPH_SCN[o.scn]&&FPH_SCN[o.scn].ar,FW_TIMES[o.time]&&FW_TIMES[o.time].ar,FW_WX[o.wx]&&FW_WX[o.wx].ar].filter(Boolean);
    return it.map(t=>`<span dir="auto">${esc(t)}</span>`).join(""); }catch(e){ return ""; }
}
function flySumUpdate(el){ try{ const s=el.querySelector("#flySum"); if(s) s.innerHTML=flySumHTML(); }catch(e){} }
function flyHTML(){
  const o=FLY.opts, chip=(k,v,t)=>`<button type="button" class="chip" data-fo="${k}" data-fv="${v}" aria-pressed="${String(o[k])===String(v)}">${t}</button>`;
  const tg=(k,t)=>`<button type="button" class="chip" data-ft="${k}" aria-pressed="${!!o[k]}">${t}</button>`;
  return `<div class="flysetup">
    <p class="status">قيادة الطائرة بمنظور القمرة أو من الخارج. اضبط الأجواء والمساعدات ثم ابدأ. تشتغل بالمس على الجوال (يفضّل أفقياً) أو بلوحة المفاتيح.</p>
    ${typeof fkAptHTML==="function"?fkAptHTML(o.apt):""}
    ${typeof faDestHTML==="function"?faDestHTML():""}
    <div class="fsec"><h4>الطائرة</h4><div class="chips">${chip("ac","a380","Airbus A380")}${chip("ac","b747","Boeing 747")}${chip("ac","b737","Boeing 737")}</div></div>
    <div class="fsec"><h4>السيناريو</h4><div class="fscn">${FLY_SCN.map(k=>`<button type="button" class="fsc" data-fo="scn" data-fv="${k}" aria-pressed="${o.scn===k}"><b>${FPH_SCN[k].ar}</b><small>${FPH_SCN[k].d}</small></button>`).join("")}</div></div>
    <div class="fsec"><h4>الوقت</h4><div class="chips">${Object.keys(FW_TIMES).map(k=>chip("time",k,FW_TIMES[k].ar)).join("")}</div></div>
    <div class="fsec"><h4>الحمولة</h4><div class="chips">${chip("load","pax","ركاب")}${chip("load","cargo","شحن (كارجو)")}</div>${typeof fplHTML==="function"?fplHTML():""}</div>
    <div class="fsec"><h4>الطقس</h4><div class="chips">${Object.keys(FW_WX).map(k=>chip("wx",k,FW_WX[k].ar)).join("")}</div></div>
    <div class="fsec"><h4>الرياح</h4><div class="chips">${Object.keys(FLY_WIND).map(k=>chip("wind",k,FLY_WIND[k].ar)).join("")}</div></div>
    <div class="fsec"><h4>اضطراب الهواء</h4><div class="chips">${[[0,"لا يوجد"],[0.4,"خفيف"],[1,"قوي"]].map(([v,t])=>chip("turb",v,t)).join("")}</div></div>
    ${typeof feFuelHTML==="function"?feFuelHTML(o):""}
    <div class="fsec"><h4>الجودة والحركة</h4><div class="chips">${chip("q","auto","جودة تلقائية")}${chip("q","high","جودة عالية")}${chip("q","low","جودة منخفضة")}${tg("calm","تقليل اهتزاز الكاميرا")}</div></div>
    <div class="fsec"><h4>المساعدات</h4><div class="chips">${tg("protect","حماية الطيران (تمنع الانهيار)")}${tg("assist","إعادة الجناحين للمستوى")}${tg("land","مساعد التسوية عند الهبوط")}${tg("hints","تلميحات المدرّب")}${tg("traffic","حركة جوية (طائرات أخرى بالجو)")}</div></div>
    <div class="fgo"><button type="button" class="btn pri" id="flyGo">ابدأ الطيران</button><span class="fsum" id="flySum">${flySumHTML()}</span><span class="status" id="flySt"></span></div>
    <details class="fhelpd"><summary>أزرار التحكم</summary><ul>
      <li><b>العصا:</b> اسحبها للأسفل لرفع الأنف، وللأعلى لخفضه، ولليمين ولليسار للميلان. بالكيبورد: الأسهم أو W A S D.</li>
      <li><b>الدفّة:</b> المنزلق السفلي، أو Q و E. تُستخدم لتوجيه الطائرة على المدرج ولموازنة تعطل المحرك.</li>
      <li><b>الدفع:</b> المنزلق الأيمن. بالكيبورد: Shift للزيادة وCtrl للنقصان. R لعكس الدفع بعد الهبوط.</li>
      <li><b>العجلات G، القلابات F وV، السبويلر X، الفرامل B (اضغط مطوّلاً)، الطيار الآلي A، الكاميرا 1 إلى 5، إيقاف مؤقت P.</b></li>
      <li><b>تشغيل المحركات من البوابة:</b> شغّل المنارة BCN ثم مفاتيح المحركات في القمرة (إيرباص: ENG MASTER، بوينج: START ثم FUEL إلى RUN)، أو الأرقام 1 إلى 4.</li>
      <li>القيم القياسية: السرعة بالعقدة (kt)، الارتفاع بالقدم (ft)، الاتجاه بالدرجة.</li></ul></details>
    ${typeof ffSndTestHTML==="function"?ffSndTestHTML():""}
    <p class="status">محاكاة تعليمية مبسّطة، والأرقام تقريبية، وليست أداة تدريب على أي طائرة حقيقية.</p>
  </div>`;
}
function flyMount(root){
  const el=root.querySelector(".flysetup"); if(!el) return;
  el.addEventListener("click",e=>{ const b=e.target.closest("button"); if(!b) return; setTimeout(()=>flySumUpdate(el),0);
    if(b.dataset.fo){ const k=b.dataset.fo; let v=b.dataset.fv; if(k==="turb") v=parseFloat(v); FLY.opts[k]=v; flySaveOpts(); el.querySelectorAll(`[data-fo="${k}"]`).forEach(x=>x.setAttribute("aria-pressed",x.dataset.fv===String(v))); if(k==="apt"&&typeof fkChartUpdate==="function") fkChartUpdate(el); return; }
    if(b.dataset.ft){ const k=b.dataset.ft; FLY.opts[k]=!FLY.opts[k]; flySaveOpts(); b.setAttribute("aria-pressed",!!FLY.opts[k]); return; }
    if(b.dataset.fsnd){ const q=b.dataset.fsnd.split(":"); try{ ffSndTest(q[0],q[1]); }catch(e){ console.error(e); } return; }
    if(b.id==="flyGo") flyStartSoft(); });
  try{ if(typeof feFuelMount==="function") feFuelMount(el); }catch(e){ console.error(e); }
  try{ if(typeof fplMount==="function") fplMount(el); }catch(e){ console.error(e); }   /* fpl: the cargo payload slider */
  try{ if(typeof faMount==="function") faMount(el); }catch(e){ console.error(e); }   /* fa: destination cards, route card, speed chips */   /* fe: fuel chips + slider */
  const st=el.querySelector("#flySt"); if(!GLOK||!HAS3D) { st.textContent="هذا الجهاز لا يدعم الرسوم ثلاثية الأبعاد المطلوبة للطيران."; el.querySelector("#flyGo").disabled=true; }
}
