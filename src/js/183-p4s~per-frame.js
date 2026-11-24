/* ---------- per-frame: the 3D label follows the part and the slider follows playback ---------- */
function updateTag(){
  if(!GLOK) return;
  try{ if(typeof edLabels==="function") edLabels(); }catch(e){}   /* (ed) layout labels of a detailed part */
  if(S.sel && ANIM[meshOf(S.sel)]){ const g=GL.getAnim(meshOf(S.sel)); if(g.play){ $("#aV").value=Math.round(g.v*100); $("#aPlay").textContent="إيقاف الحركة"; } }
  if(!$("#cEng").hidden){ ENG.forEach(id=>{ const g=GL.getAnim(id); if(g.play){ const i=document.querySelector(`#eList [data-v="${id}"]`); if(i) i.value=Math.round(g.v*100); } }); }
  if(!S.sel){ $tag.hidden=true; return; }
  const pm=meshOf(S.sel), lv=pm!==S.sel?partLoc(S.sel):null;
  let ev=null;   /* (v32) a part with several instances (engines, gear legs): the name sits on the instance whose name chips are shown, not between them */
  if(!lv&&pm===S.sel&&typeof edHas==="function"&&edHas(S.sel)&&ED[S.sel].lab&&typeof edInstances==="function"){ const B=GL.dbg(), its=B.key==="b737"?null:edInstances(B,S.sel);
    if(its&&its.length>1&&typeof edLabelInst==="function"){ try{ const it=edLabelInst(B,S.sel,its), L=ED[S.sel].lab(it.K); if(L&&L.length){ const q=it.tp(L[0][2]); ev=edV(q[0],q[1]+0.25,q[2]); } }catch(e){} } }
  const p=lv?GL.projectPoint(lv):ev?GL.projectPoint(ev):GL.project(pm==="engine"?ENG:pm);
  if(!p||!p.ok){ $tag.hidden=true; return; }
  $tag.textContent = PARTS[S.sel].ar;
  $tag.style.left = p.x+"px"; $tag.style.top = p.y+"px";
  $tag.hidden = false;
}
