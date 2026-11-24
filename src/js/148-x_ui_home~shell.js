/* ---------- shell (prefix ui): theme switch, destinations (home / plane / learn / train / Bobby), the viewer toolbar's "more" popover,
   the part card as a bottom sheet on phones, the full-screen peek of the 3D view when a lesson shows a part, a collapsible sticky viewer ---------- */
const UIN={g:"",peek:false,vmin:false,more:false,typT:0};
const UI_ICO={
  sun:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/></svg>',
  moon:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></svg>'
};
/* ---- theme: follows the system until the user picks one ---- */
const uiThemeNow=()=>{ const t=document.documentElement.getAttribute("data-theme"); if(t==="light"||t==="dark") return t; try{ return matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"; }catch(e){ return "light"; } };
function uiThemeSync(){
  const b=document.getElementById("uiTheme"); if(!b) return; const d=uiThemeNow()==="dark";
  b.innerHTML=d?UI_ICO.sun:UI_ICO.moon; b.setAttribute("aria-label",d?"التبديل إلى الوضع الفاتح":"التبديل إلى الوضع الداكن"); b.title=d?"الوضع الفاتح":"الوضع الداكن";
  try{ const m=document.querySelector('meta[name="theme-color"]'); if(m) m.setAttribute("content",d?"#09090B":"#09090B"); }catch(e){}
}
function uiThemeToggle(){
  const n=uiThemeNow()==="dark"?"light":"dark"; document.documentElement.setAttribute("data-theme",n);
  try{ localStorage.setItem("atlas-theme",n); }catch(e){}
  uiThemeSync();
}
document.documentElement.setAttribute("data-theme","dark");   /* v28: one theme for the whole site (the Home used to be dark and the other pages light); the toggle is hidden */

/* ---- destinations: the viewer belongs to "plane" only; everything else is full-width content ---- */
function uiDest(g,name){
  const first=UIN.g!==g;
  document.body.dataset.dest=g;
  const v=document.getElementById("view"), tabs=document.getElementById("tabs");
  if(first){ UIN.g=g; if(UIN.peek) uiPeekOff(); }
  v.classList.toggle("uiOff",g!=="plane"&&!UIN.peek);
  v.classList.toggle("uiStick",g==="plane"&&(name==="parts"||name==="ctl"));
  document.body.classList.toggle("uiStickView",g==="plane"&&(name==="parts"||name==="ctl")&&!UIN.vmin);
  if(tabs) tabs.hidden=(g==="home");
  document.querySelectorAll(".tgs .tg").forEach(b=>{ const on=b.dataset.g===g; b.setAttribute("aria-pressed",on); if(on) b.setAttribute("aria-current","page"); else b.removeAttribute("aria-current"); });
  uiViewMin(UIN.vmin);
  if(first){ try{ window.scrollTo(0,0); }catch(e){} }
  if(typeof uiStageSync==="function") uiStageSync(g);
}
function uiViewMin(on){
  UIN.vmin=!!on; const v=document.getElementById("view"), s=document.getElementById("uiShowView"); if(!v) return;
  v.classList.toggle("uiMin",UIN.vmin); if(s) s.hidden=!(UIN.vmin&&document.body.dataset.dest==="plane");
  document.body.classList.toggle("uiStickView",document.body.dataset.dest==="plane"&&(S.tab==="parts"||S.tab==="ctl")&&!UIN.vmin);
}
/* a lesson (or anything outside "plane") asked to show a part: open the 3D view as a full-screen layer with a way back */
function uiPeekOn(){ UIN.peek=true; const v=document.getElementById("view"); v.classList.remove("uiOff"); v.classList.add("uiPeek"); document.body.classList.add("uiPeekOn"); try{ document.getElementById("uiPeekBack").focus({preventScroll:true}); }catch(e){} if(GLOK){ GL.kick(); } }
function uiPeekOff(){
  if(!UIN.peek) return; UIN.peek=false; const v=document.getElementById("view"); v.classList.remove("uiPeek"); document.body.classList.remove("uiPeekOn");
  v.classList.toggle("uiOff",document.body.dataset.dest!=="plane"); layoutShift();
}
function uiBeforeSelect(id){
  document.body.classList.remove("uiTyping");
  if(UIN.vmin) uiViewMin(false);
  if(document.getElementById("view").classList.contains("uiOff")) uiPeekOn();
  try{ localStorage.setItem("atlas-lastpart",id); }catch(e){}
}
/* ---- card as a bottom sheet (phones): starts as a short peek, tap the handle to read everything ---- */
function uiCardOpen(){ const c=document.getElementById("card"); if(c.hidden) c.classList.remove("uiFull"); document.body.classList.add("uiCardOn"); uiGrabSync(); }
function uiCardClosed(){ document.body.classList.remove("uiCardOn"); }
function uiGrabSync(){ const c=document.getElementById("card"), g=document.getElementById("uiGrab"); if(!g) return; const f=c.classList.contains("uiFull"); g.setAttribute("aria-expanded",f); g.querySelector("span").textContent=f?"تصغير البطاقة":"عرض كل التفاصيل"; }
function uiCardToggle(on){ const c=document.getElementById("card"); c.classList.toggle("uiFull",on==null?!c.classList.contains("uiFull"):on); uiGrabSync(); if(c.classList.contains("uiFull")) c.scrollTop=0; }

(function(){
  const $i=id=>document.getElementById(id);
  document.addEventListener("click",e=>{
    const t=e.target.closest&&e.target.closest("button"); const more=$i("uiMore");
    if(more&&!more.hidden&&!(t&&(t.id==="uiMoreBtn"||more.contains(t)))&&!more.contains(e.target)){ more.hidden=true; $i("uiMoreBtn").setAttribute("aria-expanded","false"); }
    if(!t) return;
    if(t.id==="uiTheme") uiThemeToggle();
    else if(t.id==="uiMoreBtn"){ const m=$i("uiMore"); m.hidden=!m.hidden; t.setAttribute("aria-expanded",!m.hidden); }
    else if(t.id==="uiGrab") uiCardToggle();
    else if(t.id==="uiPeekBack"){ uiPeekOff(); }
    else if(t.id==="uiHideView") uiViewMin(true);
    else if(t.id==="uiShowView") uiViewMin(false);
  });
  document.addEventListener("keydown",e=>{
    if(e.key!=="Escape") return; const m=$i("uiMore");
    if(m&&!m.hidden){ m.hidden=true; $i("uiMoreBtn").setAttribute("aria-expanded","false"); $i("uiMoreBtn").focus(); }
    else if(UIN.peek) uiPeekOff();
  });
  /* drag the sheet handle up or down; a short tap toggles */
  const g=$i("uiGrab"); let y0=null;
  if(g){ g.addEventListener("pointerdown",e=>{ y0=e.clientY; });
    g.addEventListener("pointerup",e=>{ if(y0==null) return; const d=e.clientY-y0; y0=null; if(d<-24){ uiCardToggle(true); g.dataset.sw="1"; } else if(d>24){ if($i("card").classList.contains("uiFull")) uiCardToggle(false); else clearSel(); g.dataset.sw="1"; } });
    g.addEventListener("click",e=>{ if(g.dataset.sw){ delete g.dataset.sw; e.stopPropagation(); e.preventDefault(); } },true); }
  /* while typing in the parts search on a phone the sticky viewer steps aside so the results are visible above the keyboard */
  document.addEventListener("focusin",e=>{ if(e.target&&e.target.id==="uiPq"&&matchMedia("(max-width:640px)").matches){ clearTimeout(UIN.typT); document.body.classList.add("uiTyping"); } });
  document.addEventListener("focusout",e=>{ if(e.target&&e.target.id==="uiPq"){ clearTimeout(UIN.typT); UIN.typT=setTimeout(()=>document.body.classList.remove("uiTyping"),450); } });
  /* sub-sections are a tablist: arrow keys move between the visible tabs (right = previous in RTL), Home/End jump */
  const tl=document.querySelector(".tsub");
  if(tl) tl.addEventListener("keydown",e=>{
    const k=e.key; if(["ArrowRight","ArrowLeft","Home","End"].indexOf(k)<0) return;
    const bs=[...tl.querySelectorAll('[role="tab"]:not([hidden])')], i=bs.indexOf(document.activeElement); if(i<0) return;
    const j=k==="Home"?0:k==="End"?bs.length-1:k==="ArrowRight"?Math.max(0,i-1):Math.min(bs.length-1,i+1);
    e.preventDefault(); const t=bs[j]; setTab(t.dataset.tab); try{ document.getElementById(t.id).focus(); }catch(er){}
  });
  uiThemeSync();
  try{ matchMedia("(prefers-color-scheme: dark)").addEventListener("change",uiThemeSync); }catch(e){}
})();
