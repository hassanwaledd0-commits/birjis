/* ---------- aircraft and search ---------- */
function setAc(ac){
  if(typeof acOvrApply==="function") acOvrApply(ac);   /* (v30) aircraft-specific card wording */
  S.ac=ac; S.pull=new Set(); S.exT=0; S.ex=0; S.playAll=false; $("#bView").value="three";
  if(GLOK && S.sel) GL.setPlay(meshOf(S.sel),false);
  $$(".top .seg button").forEach(b=>b.setAttribute("aria-pressed", b.dataset.ac===ac)); hudUpdate();
  if(GLOK){ GL.setAircraft(ac); GL.kick(); }
  if(S.sel && !partVisible(S.sel)) clearSel();
  else if(S.sel){ showCard(S.sel); if(GLOK) focusSel(S.sel,false); }
  applyFlat(); renderTab(); syncDock();
}
/* (v36) a click on another aircraft: if its model is not built yet (about a second on a phone, all on the main thread) the loading poster is painted first, then the build runs */
let glShown=false, glLostT=0;
function glFirstFrame(){ if(glShown) return; glShown=true; const p=document.getElementById("glPoster"); if(p) p.hidden=true; $view.removeAttribute("aria-busy"); }
function glPoster(on,txt){ const p=document.getElementById("glPoster"); if(!p) return; if(txt){ const t=document.getElementById("glPosterT"); if(t) t.textContent=txt; } p.hidden=!on; if(on){ glShown=false; $view.setAttribute("aria-busy","true"); } }
function glLostUI(lost){
  clearTimeout(glLostT); const b=document.getElementById("glPosterBtn");
  if(lost){ glPoster(true,"توقّف عرض المجسّم مؤقتاً (ضغط على ذاكرة الجهاز). جارٍ الاستعادة…"); glLostT=setTimeout(()=>{ try{ if(GL.lost()&&b) b.hidden=false; }catch(e){} },4000); }
  else { if(b) b.hidden=true; glPoster(true,"جارٍ تجهيز المجسّم…"); try{ GL.kick(); }catch(e){} }
}
function setAcSoft(ac){
  if(ac===S.ac||!GLOK||(typeof GL.hasBuild==="function"&&GL.hasBuild(ac))){ setAc(ac); return; }
  $$(".top .seg button").forEach(b=>b.setAttribute("aria-pressed", b.dataset.ac===ac));
  glPoster(true,"جارٍ تجهيز المجسّم…");
  requestAnimationFrame(()=>setTimeout(()=>{ try{ setAc(ac); }catch(e){ console.error(e); glFirstFrame(); } },20));
}
$$(".seg button").forEach(b=>b.addEventListener("click",()=>setAcSoft(b.dataset.ac)));
/* the header search box and the library's own search box share one query (x_ui_parts.js) */
$("#q").addEventListener("input",e=>{ uiSetQ(e.target.value); });
$("#q").addEventListener("keydown",e=>{
  if(e.key!=="Enter") return;
  const first = uiFirst();
  if(first) select(first);
});
function matchQ(id){
  if(!partVisible(id)) return false;
  if(!UIP.q) return true;
  const r=uiIndex().by[id]; return !!(r && uiScore(r,uiToks(UIP.q)));
}
