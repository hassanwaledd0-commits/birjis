/* ---------- selection and the card ---------- */
/* (v30) viewing angle [azimuth, elevation] for the main assemblies: the camera used to keep whatever angle the viewer happened to have (the main gear was framed from above) */
const MAIN_ANG={radome:[Math.PI-0.55,1.25],flightdeck:[Math.PI-0.6,1.15],fuse_fwd:[Math.PI-0.8,1.2],fuse_mid:[Math.PI-0.8,1.15],fuse_aft:[Math.PI+0.6,1.2],
  wingbox:[Math.PI-0.5,0.75],slats:[Math.PI-0.35,0.95],flaps:[Math.PI+0.55,0.95],aileron:[Math.PI+0.5,0.9],spoilers:[Math.PI-0.2,0.7],wingtip:[Math.PI-0.7,1.1],
  engine:[Math.PI-0.8,1.2],eng_inlet:[Math.PI-0.7,1.3],eng_fandoor:[Math.PI-0.8,1.25],eng_fancowl:[Math.PI-0.8,1.25],eng_tr:[Math.PI+0.7,1.25],eng_nozzle:[Math.PI+0.7,1.25],
  eng_fan:[Math.PI-0.5,1.4],eng_pylon:[Math.PI-0.5,1.4],stabilizer:[Math.PI+0.6,0.95],elevator:[Math.PI+0.6,0.95],fin:[Math.PI+0.9,1.25],
  gear_nose:[Math.PI-0.9,1.5],gear_main:[Math.PI-0.3,1.5],wheels:[Math.PI-0.3,1.5],apu:[Math.PI+0.5,1.1],doors:[Math.PI-1.2,1.3],windows:[Math.PI-1.2,1.3],
  hyd:[Math.PI-0.8,1.0],fuel:[Math.PI-0.8,0.95],packs:[Math.PI-0.7,1.1],avionics:[Math.PI-0.9,1.15]};
function focusSel(id, cam){
  const pm=meshOf(id), v=pm!==id?partLoc(id):null, det=pm===id&&typeof edHas==="function"&&edHas(id);
  GL.setMarker(v);
  if(v){ if(cam) GL.focusPoint(v); }
  else if(cam){
    if(pm==="engine") GL.focus(ENG,null,false,[Math.PI-0.12,1.28],true);   /* (v32) every engine, from the front (was the inboard engine only) */
    else {
      GL.focus(pm, null, det, det?(ED[id].cam||[Math.PI-0.7,0.95]):MAIN_ANG[pm]);   /* (the right-hand copies of an engine part are one merged mesh over both engines, so no x-range filter here) */
      if(det&&ED[id].cat==="E"&&typeof edEngines==="function"){ const es=edEngines(GL.dbg()); if(es.length){ const e=es[0]; GL.focusPoint({x:e.x,y:e.y,z:e.zf+e.r*2.4},Math.max(4.5,e.r*8)); } }   /* then close on the inboard engine: it carries the name chips */
    }
  }
}
function select(id){
  if(!PARTS[id]||!partVisible(id)) return;
  uiBeforeSelect(id);
  try{ if(GLOK&&typeof edEnsure==='function'){ const Be=GL.dbg(); if(Be) edEnsure(Be,true); } }catch(e){}   /* (ed) a detailed part has its own mesh from the first selection */
  const pm=meshOf(id);
  if(typeof edSel==="function") edSel(id);
  if(GLOK && S.sel && meshOf(S.sel)!==pm && !S.playAll) GL.setPlay(meshOf(S.sel),false);
  S.sel = id;
  if(typeof vwIntSel==="function") vwIntSel(id);   /* (vw) builds an interior part before it is focused */
  { const wantX=INT_ONLY.has(pm)||!!PARTS[id].int;   /* internal parts switch the X-ray view on by themselves, and off again when an outer part is chosen */
    if(wantX && !S.xray){ S.xray=true; S.xrayAuto=true; } else if(!wantX && S.xray && S.xrayAuto){ S.xray=false; S.xrayAuto=false; } }
  syncDock();
  if(GLOK){ focusSel(id,true); GL.sync(); GL.kick(); }
  applyFlat();
  showCard(id);
  markList();
}
function clearSel(){
  if(typeof edSel==="function") edSel(null);
  if(GLOK && S.sel){ GL.setPlay(meshOf(S.sel),false); GL.setMarker(null); }
  S.sel=null; $card.hidden=true; uiCardClosed(); $tag.hidden=true; $view.classList.remove("has-card"); layoutShift();
  if(GLOK){ GL.sync(); GL.kick(); }
  applyFlat(); markList();
}
function showCard(id){
  const p=PARTS[id], tid=thumbOf(id), v=bestView(S.ac,tid), src=partThumb(S.ac,tid,v), m=matOf(id);
  $("#cTitle").textContent = p.ar;
  $("#cEn").textContent = p.en;
  $("#cSys").innerHTML = `<i style="--c:var(--${p.sys})"></i>${esc(SYS[p.sys].ar)} · ${esc(p.ata)}`;
  if(typeof uiCardExtra==="function") uiCardExtra(id);
  $("#cFig").innerHTML = src ? `<img src="${src}" alt="${esc(p.ar)}">` : "";
  $("#cSum").textContent = p.sum;
  { const mt = m ? `المادة الغالبة: ${esc(MATLBL[m[0]])} <span class="conf ${m[1]==="مؤكد"?"ok":""}">${esc(m[1])}</span>` : "";
    $("#cMat").innerHTML = p.parent ? `قطعة فرعية تتبع <button type="button" class="lnk" data-gopar="${p.parent}">${esc(PARTS[p.parent].ar)}</button>${p.int?" · داخلية: تظهر بوضع الأشعة":""}${GLOK?" · العلامة المضيئة بالنموذج تدل على موقعها التقريبي":""}${mt?"<br>"+mt:""}` : mt; }
  const pulled = S.pull.has(id), pb=$("#cPull");
  pb.textContent = pulled ? "أعِد تركيب القطعة" : "فكّ القطعة";
  pb.setAttribute("aria-pressed", pulled);
  pb.hidden = !GLOK || !!p.parent;
  $("#cPics").href = gImgUrl(id); $("#cPicsC").href = commonsUrl(id);
  $("#cComp").innerHTML = p.comps.map(([e,a])=>`<div><dt>${esc(e)}</dt><dd>${esc(a)}</dd></div>`).join("");
  $("#cFx").innerHTML = p.fast.map(([fid,note])=>{ const f=FX[fid]; if(!f) return "";
    return `<div class="fxrow"><span class="fxi">${FXICON[fid]||""}</span><div><b class="ltr">${esc(f.en)}</b><span class="status">${esc(note)}</span></div></div>`; }).join("");
  $("#cIns").innerHTML = p.insp.map(t=>`<li>${esc(t)}</li>`).join("");
  { const k=partKey(id), st=$("#cFav"), nt=$("#cNote"); st.dataset.star=k; st.setAttribute("aria-pressed",STUDY.fav.has(k)); nt.dataset.note=k; nt.value=STUDY.notes[k]||""; $("#cNoteBox").open=!!STUDY.notes[k]; }
  uiCardOpen();
  $card.hidden = false;
  $card.scrollTop = 0;
  $view.classList.add("has-card");
  layoutShift();
  animUI();
  engUI();
  applyFlat();
}
$("#cMat").addEventListener("click",e=>{ const b=e.target.closest("[data-gopar]"); if(b) select(b.dataset.gopar); });
function markList(){ $$("#tp [data-pick]").forEach(b=>b.setAttribute("aria-pressed", b.dataset.pick===S.sel)); }

/* the card covers part of the view: move the model clear of it (sideways on desktop, upward on phones) */
function layoutShift(){
  if(!GLOK) return;
  const open=!$card.hidden, phone=matchMedia("(max-width:640px)").matches, over=phone&&($view.classList.contains("uiPeek")||fsOn());   /* on phones the sheet sits below the sticky viewer, except over a full-screen view */
  GL.setShift(open&&!phone?0.14:0, open&&over?0.2:0);
}
window.addEventListener("resize",layoutShift);
