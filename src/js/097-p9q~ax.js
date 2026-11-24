/* ---------- ax: accessibility layer shared by every screen (prefix ax). It sits first among the x_ files on purpose: ----------
   1. <html lang>: the page shell has no <html> of its own, so the language is set before the i18n layer (x_i18n.js) records the original attributes.
   2. Focus trap for every modal dialog that has no trap of its own (level sheet, profile, voice, flight screen): Tab and Shift+Tab stay inside it.
      (#bwW and #myAs keep their own handlers.) Escape and the return of the focus are done by each dialog.
   3. Heading levels never skip (h1 -> h3 becomes level 2 for assistive technology through aria-level): the tab screens are built from many templates,
      so one pass after each change fixes all of them, including the 274 lessons, without touching every template.
   4. The 3D view gets a name (role=img + label with the aircraft), because a canvas has no text.
   5. A visible focus ring for every control that has no style of its own (specificity 0 through :where, so the site's own focus styles still win). */
try{ if(!document.documentElement.getAttribute("lang")) document.documentElement.setAttribute("lang","ar"); }catch(e){}

const AX_FOCUSABLE='a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])';
const axShown=e=>!!(e.getClientRects().length)&&!e.closest("[hidden],[inert],[aria-hidden='true']");
document.addEventListener("keydown",e=>{
  if(e.key!=="Tab"||e.defaultPrevented) return;
  const ds=[...document.querySelectorAll('[role="dialog"][aria-modal="true"]:not(#bwW):not(#myAs)')].filter(d=>!d.hidden&&d.getClientRects().length);
  const d=ds[ds.length-1]; if(!d) return;
  const f=[...d.querySelectorAll(AX_FOCUSABLE)].filter(axShown);
  if(!f.length){ e.preventDefault(); d.setAttribute("tabindex","-1"); d.focus({preventScroll:true}); return; }
  const i=f.indexOf(document.activeElement);
  if(i<0||(e.shiftKey?i===0:i===f.length-1)){ e.preventDefault(); f[e.shiftKey?f.length-1:0].focus(); }
},true);

/* heading levels: an outline stack per region (document order). A heading is one level below the nearest earlier heading that is higher in the outline,
   so skipped levels close up and sibling headings keep the same level (h1, h4, h4, h3 -> 1, 2, 2, 2). */
function axLevels(root){
  const st=[];
  root.querySelectorAll("h1,h2,h3,h4,h5,h6,[role='heading']").forEach(h=>{
    if(!axShown(h)) return;
    const own=h.hasAttribute("data-ax")?null:h.getAttribute("aria-level"), nat=own?+own:(/^H[1-6]$/.test(h.tagName)?+h.tagName[1]:2);
    while(st.length&&st[st.length-1].n>=nat) st.pop();
    const eff=st.length?st[st.length-1].e+1:nat;
    st.push({n:nat,e:eff});
    if(eff!==nat){ h.setAttribute("aria-level",String(eff)); h.setAttribute("data-ax","1"); }
    else if(h.hasAttribute("data-ax")){ h.removeAttribute("aria-level"); h.removeAttribute("data-ax"); }
  });
}
function axSweep(){
  try{
    const app=document.querySelector(".app"); if(app) axLevels(app);
    document.querySelectorAll('[role="dialog"]').forEach(d=>{ if(!d.hidden&&d.getClientRects().length) axLevels(d); });
    const cv=document.querySelector("#gl canvas");
    if(cv){ const b=document.querySelector('.seg [data-ac][aria-pressed="true"]'), nm=b?b.textContent.replace(/\s+/g," ").trim():"", en=typeof myLang==="function"&&myLang()==="en";
      cv.setAttribute("role","img"); cv.setAttribute("aria-label",(en?"3D model of the aircraft: ":"نموذج ثلاثي الأبعاد للطائرة: ")+nm); }
  }catch(e){}
}
/* throttled (not debounced): the 3D viewer, the cockpit and the flight screen change the page all the time, and a debounce would never fire there */
let AX_T=0;
const axSoon=()=>{ if(!AX_T) AX_T=setTimeout(()=>{ AX_T=0; axSweep(); },250); };
const axRelevant=recs=>recs.some(r=>{ const t=r.target.nodeType===1?r.target:r.target.parentElement; return !!t&&!(t.closest&&t.closest("#hud,#gl,#tag,.bobav,.bobw,.ckhud,svg"))||(r.type==="attributes"); });
{ const go=()=>{ axSweep();
    try{ const app=document.querySelector(".app"); if(app) new MutationObserver(r=>{ if(axRelevant(r)) axSoon(); }).observe(app,{childList:true,subtree:true,attributes:true,attributeFilter:["hidden","aria-pressed"]}); }catch(e){}
    try{ new MutationObserver(axSoon).observe(document.body,{childList:true}); }catch(e){}   /* dialogs added to the body (flight screen, sheets) */
    document.addEventListener("il-lang",axSoon);
    setInterval(()=>{ if(!document.hidden) axSweep(); },1000); };   /* safety net: whatever a mutation record missed is caught within a second (the sweep is a few headings, cheap) */
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",go); else setTimeout(go,0); }

{ const st=document.createElement("style"); st.id="axCss";
  st.textContent=':where(a[href],button,input,select,textarea,summary,[role="button"],[role="tab"],[role="link"],[tabindex]:not([tabindex="-1"])):focus-visible{outline:3px solid var(--accent,#1D4E8F);outline-offset:2px}';
  document.head.appendChild(st); }
{ const st=document.createElement("style"); st.textContent='#fly:focus,.lvSh:focus,[role="dialog"][tabindex="-1"]:focus{outline:none}'; document.head.appendChild(st); }
