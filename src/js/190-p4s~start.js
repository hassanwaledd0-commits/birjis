/* ---------- start ---------- */
/* why the 3D view is off, in plain words, with a retry (step 3): "script" = three.js did not load, "webgl" = no WebGL here, "init" = building the model failed */
const GL_FAIL={
  script:["تعذّر تحميل محرك العرض ثلاثي الأبعاد (three.js)، غالباً بسبب انقطاع الشبكة. نعرض لك الآن الرسم ثنائي الأبعاد، وباقي الأقسام تشتغل عادي.","The 3D engine (three.js) could not be loaded, most likely because of the network. You now see the 2D drawing, and every other section works as usual."],
  webgl:["جهازك أو متصفحك لا يسمح الآن بالرسم ثلاثي الأبعاد (WebGL). نعرض لك الرسم ثنائي الأبعاد. جرّب تحديث المتصفح أو تفعيل «تسريع الرسوميات» من إعداداته.","Your device or browser does not allow 3D drawing (WebGL) right now. You see the 2D drawing instead. Try updating the browser or switching on hardware acceleration in its settings."],
  init:["تعذّر بناء المجسّم ثلاثي الأبعاد على هذا الجهاز. نعرض لك الرسم ثنائي الأبعاد، وتكدر تعيد المحاولة.","The 3D model could not be built on this device. You see the 2D drawing instead, and you can try again."],
  offline:["أنت غير متصل بالإنترنت الآن. اتصل ثم اضغط «أعد المحاولة».","You are offline right now. Connect, then press «Try again»."]
};
let glFailWhy="";
ilExtra([["العرض ثلاثي الأبعاد غير متاح الآن","The 3D view is not available right now"],["أعد المحاولة","Try again"],["أكمل بالرسم ثنائي الأبعاد","Continue with the 2D drawing"]]);
function glFailShow(why){
  glFailWhy=why; const el=document.getElementById("glFail"), t=document.getElementById("glFailT"); if(!el||!t) return;
  const m=GL_FAIL[why]||GL_FAIL.init; t.textContent=ilTA(m[0],m[1]); el.hidden=false;
}
document.addEventListener("il-lang",()=>{ const el=document.getElementById("glFail"); if(el&&!el.hidden) glFailShow(glFailWhy); });
{ const r=document.getElementById("glFailRetry"), k=document.getElementById("glFailOk");
  if(r) r.addEventListener("click",()=>{ if(navigator.onLine===false){ glFailShow("offline"); return; } location.reload(); });
  if(k) k.addEventListener("click",()=>{ const el=document.getElementById("glFail"); if(el) el.hidden=true; }); }
function no3d(why){
  GLOK=false; { const p=document.getElementById("glPoster"); if(p) p.hidden=true; }
  glFailShow(why||(!window.THREE?"script":"webgl"));
  $gl.hidden=true; $flat.hidden=false;
  $("#hint").textContent="اضغط على أي جزء";
  ["#bFlow","#bLivery","#bReset","#bExplode","#bPlayAll","#bView","#bEnv"].forEach(s=>$(s).disabled=true);
  $("#cPull").hidden=true; $("#cAnim").hidden=true; $("#cEng").hidden=true;
}
if(GLOK){
  try{
    $gl.hidden=false;
    GL.init($gl,{
      pick:id=>select(id),
      hover:()=>{ if(GLOK) GL.sync(); },
      fail:()=>{ no3d("init"); applyFlat(); },
      getState:glState,
      frame:()=>{ glFirstFrame(); updateTag(); },
      lost:glLostUI
    });
    GL.lazyHangar(true); GL.setAircraft(S.ac); GL.lazyHangar(false);   /* (v36) boot builds only what the Home stage shows; the hangar follows while the page is idle (perfWarm) */
    new IntersectionObserver(es=>{ if(es[0].isIntersecting) GL.show(); else GL.hide(); }).observe($view);
    new MutationObserver(()=>{ if(GLOK) GL.recolor(); }).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{ if(GLOK) GL.recolor(); });
    perfWarm("hangar",()=>{ if(GLOK) GL.prepHangar(); },2500);
    perfWarm("ed",()=>{ if(GLOK) GL.prepEd(); },1500);
  }catch(e){ console.error(e); no3d("init"); }
} else no3d(!window.THREE?"script":"webgl");
if(!GLOK) $flat.hidden=false;
function hudUpdate(){ const h=$("#hud"); if(!h) return; const g=GEO[S.ac], l=(typeof LAC!=="undefined")?LAC[S.ac]:null;
  h.innerHTML=`<span><b>${S.ac==="a380"?"AIRBUS A380-800":S.ac==="b747"?"BOEING 747-400":"BOEING 737-800"}</b></span><span>SPAN ${g.span} m</span><span>LENGTH ${g.L} m</span>${l?`<span>MTOW ${nf(l.mtow/1000,0)} t</span>`:""}`; }
try{ if(matchMedia("(max-width:640px)").matches) $("#q").placeholder="ابحث"; }catch(e){}
hudUpdate(); applyFlat(); setTab("home"); syncDock();
