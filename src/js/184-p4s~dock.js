/* ---------- dock ---------- */
function syncDock(){
  $("#bXray").setAttribute("aria-pressed", S.xray);
  $("#bExplode").setAttribute("aria-pressed", S.exT>0.5);
  $("#bFlow").setAttribute("aria-pressed", S.flow);
  $("#bPlayAll").setAttribute("aria-pressed", S.playAll);
  $("#bPlayAll .bl").textContent = S.playAll ? "إيقاف كل الحركات" : "تشغيل كل الحركات"; $("#bPlayAll").title=$("#bPlayAll .bl").textContent;
  $("#bLivery").value = S.livery;
}
let exRunning=false;
function exLoop(){
  S.ex += (S.exT - S.ex) * 0.12;
  if(Math.abs(S.exT - S.ex) < 0.002) S.ex = S.exT;
  if(GLOK) GL.kick();
  if(S.ex !== S.exT){ requestAnimationFrame(exLoop); } else exRunning=false;
}
$("#bExplode").addEventListener("click",()=>{
  S.exT = S.exT>0.5 ? 0 : 1; syncDock();
  if(!exRunning){ exRunning=true; if(reduced()) S.ex=S.exT; requestAnimationFrame(exLoop); }
});
$("#bXray").addEventListener("click",()=>{ S.xray=!S.xray; S.xrayAuto=false; syncDock(); if(GLOK){ GL.sync(); GL.kick(); } applyFlat(); });
$("#bFlow").addEventListener("click",()=>{ S.flow=!S.flow; syncDock(); if(GLOK) GL.setFlow(S.flow); });
$("#bEnv").addEventListener("change",e=>{ if(GLOK){ GL.setEnv(e.target.value); GL.kick(); } });
$("#bLivery").addEventListener("change",e=>{ S.livery=e.target.value; if(GLOK){ GL.sync(); GL.kick(); } });
$("#bReset").addEventListener("click",()=>{ if(GLOK) GL.reset(); $("#bView").value="three"; });
$("#bPlayAll").addEventListener("click",()=>{
  if(!GLOK) return;
  S.playAll=!S.playAll; Object.keys(ANIM).forEach(id=>GL.setPlay(id,S.playAll));
  syncDock(); if(S.sel) animUI(); engUI(); GL.kick();
});
$("#bView").addEventListener("change",e=>{
  if(!GLOK) return;
  if(e.target.value==="engine") GL.focus(ENG, engXR()); else GL.setView(e.target.value);
  GL.kick();
});
function fsOn(){ return $view.classList.contains("fsx"); }
function fsSet(on){
  if(on){ $view.classList.add("fsx"); document.body.style.overflow="hidden"; try{ const p=$view.requestFullscreen&&$view.requestFullscreen(); if(p&&p.catch) p.catch(()=>{}); }catch(e){} }
  else { $view.classList.remove("fsx"); document.body.style.overflow=""; try{ if(document.fullscreenElement) document.exitFullscreen().catch(()=>{}); }catch(e){} }
  $("#bFull .bl").textContent = on ? "خروج من ملء الشاشة" : "ملء الشاشة"; $("#bFull").title=$("#bFull .bl").textContent;
  if(GLOK) GL.kick();
}
$("#bFull").addEventListener("click",()=>fsSet(!fsOn()));
document.addEventListener("fullscreenchange",()=>{ if(!document.fullscreenElement && fsOn()) fsSet(false); });
document.addEventListener("keydown",e=>{ if(e.key==="Escape" && fsOn()) fsSet(false); });
