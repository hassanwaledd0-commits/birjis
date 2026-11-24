/* ---------- fpl: the cargo payload (setup form). On a cargo flight the player chooses how many tonnes the freighter carries (0 .. the most the planning max takeoff mass and the
   fuel plan allow: fphPayloadCap in p8p.js). The choice is FLY.opts.payload (tonnes, saved with the other options); the flight start passes it to fphScenario as o.payload.
   There is no centre-of-gravity model: the payload changes the mass only (said on the form). Public: fplHTML() fplMount(el) fplKg() fplCapT(). ---------- */
const fplLang=()=>(typeof fkLang==="function"?fkLang():"ar");
function fplCapT(){ const o=FLY.opts; try{ return Math.floor(fphPayloadCap(o.ac,o.scn,o.fuel===undefined?"auto":o.fuel)/1000); }catch(e){ return 0; } }
/* the chosen tonnes, kept inside the cap; the default is 80 % of the cap */
function fplT(){ const cap=fplCapT(), p=FLY.opts.payload; const t=typeof p==="number"&&isFinite(p)?p:Math.round(cap*0.8); return Math.max(0,Math.min(cap,t)); }
const fplKg=()=>fplT()*1000;
function fplHTML(){
  const en=fplLang()==="en", cap=fplCapT(), t=fplT(), hid=FLY.opts.load==="cargo"?"":" hidden";
  return `<div class="fpl" id="fplBox"${hid}><label class="status" style="display:flex;gap:10px;align-items:center;margin-top:6px"><span>${en?"Payload":"وزن الحمولة"}</span><input type="range" id="fplR" min="0" max="${cap}" step="1" value="${t}" style="flex:1" aria-label="${en?"Cargo payload in tonnes":"وزن حمولة الشحن بالطن"}"><b id="fplV" style="min-width:64px;text-align:end">${t} t</b></label>
    <span class="status" id="fplI"></span></div>`;
}
function fplInfo(el){
  const box=el.querySelector("#fplBox"); if(!box) return; const en=fplLang()==="en", cap=fplCapT(), r=el.querySelector("#fplR"), v=el.querySelector("#fplV"), i=el.querySelector("#fplI");
  box.hidden=FLY.opts.load!=="cargo"; if(r){ r.max=cap; const t=fplT(); if(+r.value!==t) r.value=t; if(v) v.textContent=t+" t"; }
  if(i) i.textContent=en?`Most this flight can carry with the chosen fuel: ${cap} t (the planning max takeoff mass). Only the mass changes; the centre of gravity is not modelled.`:`أقصى حمولة لهذي الرحلة مع الوقود المختار: ${cap} طن (حد الوزن الأقصى للإقلاع بالتخطيط). يتغيّر الوزن بس، ومركز الثقل ما يُحسب.`;
}
function fplMount(el){
  const r=el.querySelector("#fplR"); if(!r) return;
  r.addEventListener("input",()=>{ FLY.opts.payload=+r.value; flySaveOpts(); fplInfo(el); });
  el.addEventListener("click",()=>setTimeout(()=>fplInfo(el),0));   /* the cap follows the aircraft, the scenario, the fuel and the load chips */
  el.addEventListener("input",()=>setTimeout(()=>fplInfo(el),0));
  fplInfo(el);
}
