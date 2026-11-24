/* ---------- render + events ---------- */
function uiRender(){
  const f=document.getElementById("uiPF"), b=document.getElementById("uiPB"); if(!f||!b) return;
  f.innerHTML=uiFiltHTML(); b.innerHTML=uiBodyHTML();
  const c=document.getElementById("uiPclr"); if(c) c.hidden=!UIP.q;
  S.q=UIP.q;
}
function uiSetQ(q){
  q=q||""; UIP.q=q.trim(); UIP.pg=0; S.q=UIP.q;
  const h=document.getElementById("q"), i=document.getElementById("uiPq");
  if(h&&h.value!==q) h.value=q; if(i&&i.value!==q) i.value=q;
  if(document.getElementById("uiP")) uiRender(); else setTab("parts");
}
function uiFirst(){ const r=uiResults()[0]; return r&&r.id; }
function uiOpenPar(id){ UIP.par=id; UIP.q=""; UIP.pg=0; setTab("parts"); try{ document.getElementById("tp").scrollIntoView({behavior:"smooth",block:"start"}); }catch(e){} }
function uiTop(){ const b=document.getElementById("uiP"); if(!b) return; const y=b.getBoundingClientRect().top; if(y<0) try{ b.scrollIntoView({block:"start"}); }catch(e){} }
function uiPartsMount(root){
  const P=root.querySelector("#uiP"); if(!P) return;
  uiRender();
  const inp=P.querySelector("#uiPq");
  inp.addEventListener("input",()=>{ clearTimeout(uiT); uiT=setTimeout(()=>{ uiSetQ(inp.value); },140); const c=P.querySelector("#uiPclr"); if(c) c.hidden=!inp.value; });
  inp.addEventListener("keydown",e=>{ if(e.key==="Enter"){ clearTimeout(uiT); uiSetQ(inp.value); const id=uiFirst(); if(id&&partVisible(id)) select(id); inp.blur(); } });
  P.addEventListener("click",e=>{
    const t=e.target.closest("button"); if(!t||!P.contains(t)) return;
    if(t.id==="uiPclr"){ inp.value=""; uiSetQ(""); inp.focus(); return; }
    if(t.dataset.pick){
      const id=t.dataset.pick;
      if(t.dataset.other){ (typeof setAcSoft==="function"?setAcSoft:setAc)(jbOnlyFirst(PARTS[id].only)); }
      select(id);
      try{ const r=$view.getBoundingClientRect(); if(r.bottom<60) $view.scrollIntoView({behavior:reduced()?"auto":"smooth",block:"start"}); }catch(er){}
      return; }
    if("uisys" in t.dataset){ UIP.sys=t.dataset.uisys; UIP.pg=0; uiRender(); return; }
    if("uilv" in t.dataset){ UIP.lv=+t.dataset.uilv; UIP.pg=0; uiRender(); return; }
    if(t.dataset.uitog){ const k=t.dataset.uitog; UIP[k]=!UIP[k]; UIP.pg=0; uiRender(); return; }
    if("uipar" in t.dataset){ UIP.par=""; UIP.pg=0; uiRender(); return; }
    if("uiclear" in t.dataset){ Object.assign(UIP,{q:"",sys:"",lv:0,int:false,fav:false,par:"",pg:0}); inp.value=""; const h=document.getElementById("q"); if(h) h.value=""; S.q=""; uiRender(); return; }
    if("uibrowse" in t.dataset){ UIP.mode="browse"; UIP.pg=0; uiRender(); uiTop(); return; }
    if("uihome" in t.dataset){ UIP.mode="home"; UIP.grp=""; UIP.ch=""; UIP.pg=0; uiRender(); uiTop(); return; }
    if(t.dataset.uigrp){ const g=t.dataset.uigrp; UIP.grp=UIP.grp===g?"":g; UIP.ch=""; UIP.pg=0; uiRender(); const h=P.querySelector(`[data-uigrp="${g}"]`); if(h&&UIP.grp) try{ h.scrollIntoView({block:"nearest"}); }catch(er){} return; }
    if("uich" in t.dataset){ UIP.ch=t.dataset.uich; UIP.pg=0; uiRender(); return; }
    if(t.dataset.uipg!=null){ UIP.pg=Math.max(0,+t.dataset.uipg); uiRender(); uiTop(); return; }
  });
}
