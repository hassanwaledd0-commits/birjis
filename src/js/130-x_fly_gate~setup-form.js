/* ---------- setup form: destination cards, the route card (distance, heading, time, fuel) and the speed chips ---------- */
function faDestHTML(){
  const o=FLY.opts, en=fkLang()==="en", dep=o.apt||"ORBI", cur=faDestId(), A=fkAptById(dep), ts=+o.ts||1;
  if(o.atc===undefined) o.atc=true;
  const cards=FK_AIRPORTS.filter(a=>a.id!==dep).map(a=>{ const g=faGeo(A,a); return `<button type="button" class="fsc" data-fo="dest" data-fv="${a.id}" aria-pressed="${cur===a.id&&o.dest!=="none"}">${typeof fkDiagram==="function"?`<span class="fkdg">${fkDiagram(a)}</span>`:""}<b>${en?a.en:a.ar} <span dir="ltr" class="fkicao">${a.id}</span></b><small>${Math.round(g.km)} ${en?"km away":"كم"}</small><small>${en?a.cy[1]:a.cy[0]}</small></button>`; }).join("");
  const none=`<button type="button" class="fsc" data-fo="dest" data-fv="none" aria-pressed="${o.dest==="none"}"><b>${en?"No destination (local flight)":"بدون وجهة (طيران محلي)"}</b><small>${en?"Departure-only flight":"طيران من المطار نفسه"}</small></button>`;
  return `<div class="fsec"><h4>${en?"Destination":"الوجهة"}</h4><div class="fscn fkapts">${cards}${none}</div><div class="faRt" id="faRt"></div>
    <p class="status">${en?"Used with «From the gate» and «Takeoff from the runway». The route is flown by the autopilot after takeoff.":"تُستخدم مع «من البوابة» و«إقلاع من المدرج». يطير الطيار الآلي المسار بعد الإقلاع."}</p>
    <div class="fsec"><h4>${en?"Air traffic controller":"المراقب الجوي"}</h4><div class="chips"><button type="button" class="chip" data-ft="atc" aria-pressed="${o.atc!==false}">${en?"Controller on":"المراقب يعمل"}</button></div></div>
    <div class="fsec"><h4>${en?"Time speed in flight":"سرعة الزمن أثناء الرحلة"}</h4><div class="chips">${[1,4,16].map(v=>`<button type="button" class="chip" data-fo="ts" data-fv="${v}" aria-pressed="${ts===v}">×${v}</button>`).join("")}</div></div></div>`;
}
function faRouteCard(el){
  const c=el&&el.querySelector("#faRt"); if(!c) return; const o=FLY.opts, en=fkLang()==="en", dep=fkAptById(o.apt||"ORBI"), d=faDestId(), L=(a,b)=>en?a:b;
  if(!d){ c.innerHTML=`<b>${L("Local flight: no route","طيران محلي: بلا مسار")}</b>`; return; }
  const B=fkAptById(d), g=faGeo(dep,B), need=faFuelNeed(o.ac,g.km), pl=fphFuelPlan(o.ac,o.scn,o.fuel===undefined?"auto":o.fuel).kg, F=fphFuelCfg(o.ac), tm=Math.round(g.km/FA_CRUISE_KMH*60+8), ok=pl>=need;
  const pct=Math.min(100,Math.ceil(need*1.1/F.max*100/5)*5);
  c.innerHTML=`<b dir="ltr">${dep.id} → ${B.id}</b> <span>${L(B.en,B.ar)}</span><div class="faRtl">${L("Distance","المسافة")} <b>${Math.round(g.km)} ${L("km","كم")}</b> · ${L("heading","الاتجاه")} <b dir="ltr">${String(Math.round(g.brg)).padStart(3,"0")}°</b> · ${L("about","نحو")} <b dir="ltr">${faHm(tm)}</b></div>`+
    (ok?`<div class="faRtl ok">${L("Fuel is enough","الوقود يكفي")} (${L("need","المطلوب")} ≈ ${Math.round(need/10)*10} ${L("kg","كغ")})</div>`
      :`<div class="faRtl warn">${L("Fuel is short by","الوقود ينقص بنحو")} ${Math.round((need-pl)/10)*10} ${L("kg","كغ")} <button type="button" class="sec" data-faa="fuel" data-fp="${pct}">${faTx(FA_T.fuel)}</button></div>`);
}
/* the setup's route card follows every click and slider move; «أضف وقوداً» sets the fuel option to the trip's need */
function faMount(el){
  if(!el||el._faM) return; el._faM=1;
  el.addEventListener("click",e=>{ const b=e.target.closest("[data-faa]"); if(b&&b.dataset.faa==="fuel"){ FLY.opts.fuel=+b.dataset.fp||100; flySaveOpts(); el.querySelectorAll('[data-fo="fuel"]').forEach(x=>x.setAttribute("aria-pressed","false")); const r=el.querySelector("#feFuelR"); if(r) r.value=FLY.opts.fuel; try{ if(typeof feFuelInfo==="function") feFuelInfo(el); }catch(x){} } setTimeout(()=>faRouteCard(el),0); });
  el.addEventListener("input",()=>setTimeout(()=>faRouteCard(el),0));
  faRouteCard(el);
}
